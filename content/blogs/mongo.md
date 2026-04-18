---
title: mongodb系列指南（一）
date: 2026-04-06
updated: 2026-04-07
keywords: "mongo"
featured: true
summary: "这篇文章介绍有关mongo的一些基础概念"
---

# 基础概念
MongoDB是一个基于分布式文件存储 的开源数据库系统，属于NoSQL中的文档型数据库。它不使用“表”和“行”，而是使用BSON格式存储数据。而且由于每一个文档的结构都可以不同，所以不需要预先定义字段（Schema-less）。

## BSON
MongoDB使用BSON格式来支持文档模型。相比JSON，BSON有以下优势：
- 使用二进制存储，更紧凑。因此存储空间利用率更高
- 支持快速跳过字段，解析速度也更快
- 数据类型更丰富
- 文档头部包含整体长度，便于快速定位

此外，MongoDB限制单个BSON文档最大为16MB，但实际工程中通常建议控制在1~2MB以内。一条BSON文档的结构可分为三部分：
1. 文档头部：用于描述整个文档的总长度
2. BSONElement列表：文档中的每个字段都按顺序存储为BSONElement，结构如下
    - Value Type：值类型
    - Key：C-String（以\0结尾，不存长度）
    - Value：按类型存储的二进制数据
3. 文档结束标记：\0

BSON是一种紧凑的顺序结构，任意字段修改都会导致重新生成整个BSON文档，不支持原地扩容或缩容。

### 序列化和反序列化
序列化就是将内存中的数据会被转换成BSON格式的二进制流，以便写入磁盘或通过网络发给数据库服务器。其过程如下：
- 预留4字节空间用于存储总长度
- 按顺序写入Value Type、Key和Value
- 写入结束符\0
- 计算总长度并回填头部

而反序列化过程则是将数据库返回的BSON二进制数据重新构建回你程序可以操作的内存对象。大致过程如下：
- 读取前4字节（小端序）得到总长度
- 根据长度确定文档边界
- 从前向后解析Value Type、Key和Value
- 通过迭代器遍历整个BSON文档

整个过程复杂度为O(N)，但由于字段带有类型信息和长度信息，因此跳跃解析效率较高。

### BSON类型比较规则
MongoDB在比较BSON时遵循严格的类型排序规则。首先比较BSON中BSONElement的大小，然后对每个BSONElement进行类型比较，如果类型一样才比较值。根据类型不同，值比较的逻辑也不相同。比如Int和Double类型比较时，要都转成Double（归一化）进行比较。因此每次比较都要解析字段类型、做类型转换和按字段顺序逐一比较。在数据量较大的情况下，这种比较方式开销较高。

## KeyString
由于BSON原生比较复杂且成本较高，MongoDB引入了KeyString结构，用于优化索引比较性能。它的核心目标是：让BSON值可以通过memcmp直接比较。

也就是说，KeyString将复杂的BSON比较规则，转换为简单的字节序比较，从而支持B+树高效索引。KeyString大致由以下部分组成：
```text
字段1类型 + 字段1值 + 字段2类型 + 字段2值 + ... + discriminator + 结束标识 + RecordId
```
- 字段值序列：按照字段顺序，依次对每个字段进行编码。每种数据类型的二进制编码逻辑各不相同
- discriminator：用于解决边界歧义问题，保证字节序比较不会误判。例如字段缺失、数组展开、字符串边界冲突等
- RecordId：用于唯一标识一条记录，支持`KeyString → BSON`的反向映射

> 由于MongoDB使用32位unsigned int表示字段排序规则，因此一个联合索引最多支持32个字段

# 索引
MongoDB是schema-free数据库，因此并不存在传统意义上的主键约束。那MongoDB的主键是什么呢？很多人直觉上会认为_id字段就是主键，但实际上这种理解并不完全准确。原因有几条：
- 虽然_id看起来像主键，但实际上它只是一个普通索引字段。当通过它查询数据仍然需要走索引再“回表”，行为上类似二级索引
- 有些表没有_id字段，比如oplog表
- 在MongoDB 5.3+版本中引入了聚簇集合的概念，允许用户显示指定按_id聚簇存储。这说明在默认情况下_id并不负责物理存储组织

MongoDB真正使用的主键索引是RecordId，它本质上是一个全局唯一的int64自增值。在MongoDB中，每个表都有独立的RecordId命名空间，在存储数据时，会为每条文档指定一个唯一的RecordId。也就是说，MongoDB以（RecordId，BSON）的KV对形式在KV存储引擎中存储数据。

## 索引格式
搞明白了主键，我们再看看索引的格式。在MongoDB中，索引是B+树结构的，以kv对的方式进行组织和存储。B+树每个节点中的key都是可比较的，所以MongoDB使用KeyString作为统一的索引编码方式。因此，索引的key由两部分组成：
- Key = KeyString(indexKey) + RecordId

其中KeyString(indexKey) 是从文档字段按索引规则提取并编码后的值，而RecordId作为后缀用于保证key唯一性。

那索引的Value部分又是什么呢？MongoDB索引中，Value通常是空的，但也可以用来存放一个可选的字段 - `TypeBits`，该字段用于记录类型信息，它不参与字节比较，仅用于类型归一化。

另外，_id索引与普通索引的结构略有区别。由于_id本身具有唯一性，因此Key中不再需要RecordId，RecordId被存储在了Value中。结构类似：
- Key = _id，Value = RecordId

这样可以直接通过_id定位到对应BSON文档。

## 索引查询过程
MongoDB中使用索引查询数据分为两个阶段：
- 查索引：通过KeyString在B+树中定位目标RecordId
- 查数据：再通过RecordId找到对应BSON文档

整个过程可以理解为：`KeyString → RecordId → BSON`

## 数组索引膨胀
在MongoDB中，如果索引字段是数组类型，系统会自动将数组“展开”，为数组中的每个元素分别创建索引条目，这种机制称为“多键索引”。例如：
```text
文档：{ a: [1, 2, 3] }

# 索引生成3条记录
a=1 → doc
a=2 → doc
a=3 → doc
```

如果这种文档数量为N，数组长度为M，那索引规模将达到NxM，造成索引膨胀，带来显著的存储和性能开销。而且由于多条索引会命中同一文档，这会产生重复结果，必须对结果进行去重。更关键的是多键索引的扫描顺序不等于唯一文档顺序，因此在使用索引进行排序或依赖索引顺序输出结果的场景下，MongoDB必须额外保证语义正确性，而不是简单依赖索引顺序。这会导致优化器在某些情况下会判断索引排序不可完全满足语义要求，转而使用SORT stage（内存排序或外部排序）。

除此之外，当复合索引中包含多个数组字段时，会发生更严重的问题。例如：
```text
[a1, a2] × [b1, b2]
→ 生成4条索引记录
```

这会造成笛卡尔积现象，导致索引爆炸式增长。因此MongoDB直接限制：一个复合索引中最多只能有一个数组字段。

# 存储引擎
MongoDB默认使用的存储引擎是WiredTiger。从架构上看，它本质是一个通用的KV存储引擎，并不理解BSON或文档模型。它完全不知道文档、BSON、索引字段、collection是什么。而是只关心key是什么，value是什么。

也就是说，MongoDB在写入数据时，需要先将“文档模型”转换为KV结构，才能交给WiredTiger存储。在这个转换过程中，MongoDB会将数据拆解为几种基础结构：
- RecordId：作为数据表在KV引擎中的Key，用于唯一标识一条文档
- BSON文档序列化后的字符串：作为数据表在KV引擎中的Value，即完整的序列化文档内容
- KeyString：作为索引在KV引擎中存储时的Key
- TypeBits：作为索引在KV引擎中的Value

在WiredTiger层，无论是MongoDB的“表”还是“索引”，最终都会被映射为统一的数据结构：`WT Table`。但二者的存储内容不同，因此对应的KV结构也不同。

MongoDB的数据表，本质上存储的是文档数据`RecordId → BSON`，因此对应到`WT Table` schema为：
```text
key_format=q, value_format=u
```
MongoDB的索引，本质上存储的是“索引值到文档位置”的映射：
- `KeyString (+ RecordId) → TypeBits`

因此对应到`WT Table` schema为：
```text
key_format=u, value_format=u
```

WT Table除了上述的schema参数外，还有多种参数可以在建表和建索引时具体指定。

## WiredTiger架构
WiredTiger引擎的整体架构如下：
![](https://cdn.cnlang.net/mongo-arch2.jpg)
- Schema：定义Key/Value的格式，决定WT Table的结构。MongoDB的集合/索引都在这里映射
- Cursor：是最重要的对外操作接口。可以理解为是KV引擎的“操作句柄”
- Transactions：提供事务能力，控制数据的可见性，与Snapshot配合实现MVCC
- Snapshots：定义事务可见的数据版本，实现多版本并发控制
- BTree：使用B+Tree组织数据，所有WT Table本质都是一棵BTree
- dhandle：指向一个具体的BTree，相当于“表句柄”
- Row/Column Store：两种模式，默认是Row Store（行存）
- Cache：缓存热点数据页，减少磁盘IO
- Eviction：当cache使用达到阈值时，选择page刷盘并释放内存
- History Store：存储旧版本数据，支持长事务读取历史版本，类似于InnoDB的undolog
- Block Manager：管理磁盘上的block，负责分配空间、回收空间、文件读写
- Logging：类似WAL预写日志，保证崩溃恢复能力
- File System & OS interface：封装操作系统接口，负责文件读写、IO调度、跨平台兼容

### MongoDB数据目录结构
在实际使用MongoDB时，如果你初始化一个4.0版本的副本集实例，并在数据库db1下创建集合coll1并插入数据，那么在`dbPath`目录下可以看到一系列目录和文件。这些文件，正是MongoDB基于WiredTiger存储引擎在磁盘上的真实组织形式。
- admin：是MongoDB的核心系统库，主要用于权限与管理信息存储。不建议在admin库中存储业务数据。
- config：主要用于存储运行时状态和分布式信息。在分片集群下，还包含路由元数据
- local：是一个非常特殊的数据库。是节点私有的，不参与复制，主要用于存储副本集配置和oplog。不要在local库中存储任何业务数据
- journal：用于存储WAL日志，用于崩溃恢复，保证数据持久型
- diagnostic.data：该目录用于诊断分析
- db1：该目录对应所创建的数据库。包含集合数据文件和索引文件。本质上，每个集合和索引，都是一个独立的WT Table文件
- _mdb_catalog.wt：是MongoDB非常重要的元数据表，记录了集合与文件的映射关系、每个集合包含的索引以及索引对应的文件
- WiredTiger.wt：是WiredTiger的核心元数据表，记录每个WT Table的配置、checkpoint信息、表结构定义等信息
- WiredTiger.turtle：一个小型文本文件，用于指向WiredTiger.wt的checkpoint信息，可以理解为“元数据的入口指针”
- WiredTigerLAS.wt：用于存储历史版本数据，在MongoDB 4.2之后统一替换为History Store
- sizeStorer.wt：用于存储表的文档数量和表的逻辑大小，可以加速count和stats操作，避免全表扫描
- storage.bson：存储实例级配置。例如使用的存储引擎，是否开启directoryPerDB
- mongod.lock：锁文件，存储当前mongod进程信息
- mongod.pid：当前进程PID
- WiredTiger.lock：WiredTiger引擎锁文件
- WiredTiger：文本文件，记录WiredTiger版本信息

## WiredTiger数据页与存储机制
在MongoDB中，每个集合或索引在WiredTiger中本质上都是一棵B+树。但这棵树在内存和磁盘中的表现完全不同，而理解这种差异，是理解MongoDB存储行为、空间膨胀和性能特征的关键。

在内存中，每个表都是一颗BTree，只有leaf page存储真实数据。而且数据是未压缩、未加密的原始KV，这保证了访问效率。

而在磁盘上，每个表对应一个.wt文件，其内数据组织形式为block。内存中每个page会被写入为一个block。每个block按4KB对齐，并使用extent（offset + length）标识位置。与内存不同的是，磁盘上的数据是压缩后的，可能是加密的。因此，数据从磁盘加载到内存时，需要进行解压与格式转换。

磁盘文件中的block有不同的状态，通过三个跳表进行维护：
- allocation：当前checkpoint仍引用的block，属于“活跃数据”，不允许覆盖或回收
- available：已确认不被任何checkpoint引用，可以直接分配用于新写入。默认使用best-fit策略进行分配，尽量减少空间浪费和碎片
- discard：被新block替换掉的旧block，不属于最新版本。仍可能被旧checkpoint使用，因此不能立即回收

每个表都会维护checkpoint信息，这些信息统一存储在`WiredTiger.wt`元数据表中。checkpoint中记录了root page的位置、文件长度，以及block的分布状态（3个跳表），用于在系统重启时，快速恢复到一个“完全一致”的状态

### 写时复制
在MongoDB中，如果page发生了变化，这个page在刷盘时会写入到一个新的block中。这样做的好处是：
- 避免半页写问题：如果发生宕机，不会因为只写了部分数据而导致原来的数据页损坏，因为它不覆盖原数据
- 更简单高效的故障恢复：故障恢复时，既能快速回滚到写入前的状态（旧block），又能快速恢复到写入后的状态（旧block + wal）
- 更适合变长页：MongoDB使用的变长页，写时复制直接写入新位置即可，完全适配页大小问题。避免了复杂的页分裂机制

而这样做的代价是会造成写放大，导致空间膨胀。旧block会被标记为`discard`状态，但不能马上复用。只有等下一个checkpoint做完之后，才会被转换为`available`状态，真正变成可重用的逻辑删除状态。而checkpoint每隔一分钟1次，如果这段时间内有很多页面被修改之后刷到磁盘，那么就会有很多的临时空间膨胀。

### 变长页
传统的关系型数据库采用的是定长页。比如Mysql默认是16KB。定长页管理起来非常方便，但不好进行压缩处理，也不适合大文档。

由于JSON类数据一般都有很大的压缩空间，而且每条JSON一般都会比较大。因此MongoDB采用了变长页的设计，允许页面根据自身存储数据的实际情况进行有限度的伸缩。MongoDB在建表时，与其对应的默认schema参数有：
- allocation_size：block分配单位，默认所有写入按4KB对齐
- block_allocation：分配可复用block空间的策略。best-fit（按大小）、first-fit（按位置）
- block_compressor：压缩算法，默认为snappy，页面级压缩
- internal_page_max：非叶子节点建议大小，超过触发分裂（非硬限制）。默认4KB
- leaf_page_max：叶子节点建议大小，默认32KB
- leaf_value_max：单个value上限，超出则单独存储，默认为64MB。BSON最大16MB，因此不会触发

# 参考
- https://github.com/pengzhenyi2015/MongoDB-Kernel-Study