---
title: kafka
date: 2026-04-06
updated: 2026-04-07
keywords: "kafka"
featured: true
summary: "这篇文章介绍有关kafka的一些基础概念"
---

# 介绍
Kafka是一个分布式的、基于发布/订阅模型的消息系统，同时也是一个高性能的流式数据平台，广泛应用于日志收集、异步解耦、实时计算以及事件驱动架构等场景。从设计上来看，Kafka的核心是一个基于追加日志的存储系统。它通过顺序写入磁盘和基于offset的访问方式，使得消息的读写都可以在接近O(1)的时间复杂度下完成。Kafka之所以能成为事实上的数据管道标准，核心在于它极高的吞吐能力：
- 顺序写磁盘，避免随机IO
- 利用操作系统Page Cache
- 批量读写、批量写入
- 零拷贝

在实际生产环境中：即使在普通硬件上，Kafka单机也可以轻松达到每秒数十万级别的消息吞吐量。

# 架构
kafka集群的架构大致如下图所示：
![](https://cdn.cnlang.net/kafka-arch.jpg)
- Producer：是消息的发送方，负责将数据发送到Kafka集群中的指定Topic。生产者只需要关心“往哪个主题写消息”，无需关注底层存储或消费细节
- Consumer：是消息的读取方，从Kafka Broker中拉取消息进行处理。消费者通过订阅Topic来获取数据，并按照自己的消费逻辑处理消息
- Consumer Group：消费者组。用于提高消费能力和实现水平扩展。同一个消费者组内的多个消费者会共同消费一个Topic的数据，但一个分区在同一时刻只能被组内的一个消费者消费，从而避免重复消费。不同消费者组内之间相互独立，它们可以同时消费同一Topic的数据而互不影响。
- Broker：是Kafka集群中的一个服务实例，一台机器通常对应一个Broker。一个Kafka集群由多个Broker组成，用于共同存储和处理数据。每个Broker可以存储多个Topic的分区数据，是Kafka数据存储与转发的核心节点
- Topic：可以理解为消息的分类或逻辑队列。生产者将消息发送到某个Topic，消费者从该Topic读取数据。Topic是逻辑概念，实际的数据存储是分布在多个Partition上的
- Partition：为了提升扩展性和并发能力，Kafka将一个Topic拆分为多个Partition。每个Partition是一个有序、不可变的消息队列，消息在其中按顺序追加写入。不同Partition可以分布在不同Broker上，从而实现水平扩展和并行处理
- Replica：Kafka通过副本机制实现高可用性。每个Partition都会有多个副本，其中包括一个Leader副本和多个Follower副本。副本分布在不同Broker上，用于数据冗余和容灾。Producer只向Leader写入数据，Consumer也只从Leader读取数据
- Leader：即每个分区多个副本的主副本，生产者发送数据的对象，以及消费者消费数据的对象，都是Leader
- Follower：即每个分区多个副本的从副本，会实时从Leader副本中同步数据，并保持和Leader数据的同步。Leader 发生故障时，某个Follower还会被选举并成为新 Leader , 且不能跟Leader在同一个broker上，防止崩溃数据可恢复
- Offset：是Kafka用来记录消费进度的标识。每个Consumer都会维护自己的Offset，用于标记已经消费到的位置。当消费者重启或故障恢复时，可以从上一次的Offset继续消费，避免数据丢失或重复处理
- ZooKeeper服务：在早期版本中，Kafka依赖ZooKeeper来管理集群元数据。不过在较新版本中，Kafka正逐步摆脱ZooKeeper，转向自管理的元数据机制，以简化架构

# 存储机制
在Kafka中，Topic本质上只是一个逻辑概念。Producer发送的消息，会根据分区策略被分发到不同的Partition中。每个Partition在底层都对应一个提交日志，所有消息都以`追加写`的方式写入日志末尾。一旦写入成功，消息就是不可变的。这种设计将所有写操作转化为磁盘顺序写入，极大提升了写入吞吐量。但问题也随之而来：随着时间推移，日志文件会不断变大，如果不加控制，会严重影响查询和消费效率。

为了解决这一问题，Kafka并不会让一个Partition对应一个无限增长的大文件，而是将其拆分为多个Segment（日志段）。每个Partition在磁盘上对应一个目录`topic名称-分区号`，例如：
```text
heartbeat-0
heartbeat-1
heartbeat-2
```
每个目录中包含多个Segment文件，每个Segment默认大小约为1GB（由log.segment.bytes控制），写满后会自动滚动生成新的Segment。每个Segment并不是单一文件，而是一组文件集合，通常包括：
- .log：数据文件，存储真实消息数据，以追加的形式写入，消息按offset顺序排序
- .index：索引文件，存储`offset → 物理位置`的索引
- .timeindex：时间戳索引文件，存储`timestamp → 物理位置`的索引，用于按时间清理或查询
- .snapshot：状态快照文件，用于快速恢复

这些文件通常位于同一个Segment目录下，共同构成一个完整的日志段。而且这些文件以该Segment中第一条消息的Offset命名，例如：
```text
00000000000000000000.log
00000000000000000000.index
00000000000000000000.timeindex
00000000000000000000.snapshot
```
这种命名方式可以让Kafka快速判断某个offset属于哪个Segment。

## 稀疏索引
Kafka并不会为每一条消息建立索引，而是采用稀疏索引。默认情况下，每隔约4096 bytes（可通过index.interval.bytes配置）才记录一条索引。.index索引文件中每一项记录：`逻辑offset → .log文件中的物理位置`。

索引文件本身是一个有序追加数组（offset单调递增），因此可以高效查询。在Kafka读取消息时，大致的查询流程如下：
1. 定位Segment：根据offset判断属于哪个Segment
2. 索引二分查找：在.index文件中使用二分查找定位最接近的offset，从而找到具体的.log文件
3. 顺序扫描：再从对应的.log物理位置开始顺序扫描，直到找到目标消息

这种设计的本质是：用“少量索引 + 顺序扫描”替代“全量索引”，在性能与空间之间做权衡。

## Page Cache
即使是顺序写，磁盘仍然比内存慢几个数量级。Kafka并没有自己实现缓存，而是直接利用操作系统的Page Cache。Page Cache是内核中的一块内存区域，用于缓存磁盘数据：
```text
磁盘文件 ←→ Page Cache ←→ 用户进程
```
Kafka的写入流程实际上是：
- 数据写入Page Cache（内存）
- 标记为“脏页”
- 操作系统立即返回写成功（非常快）
- 内核后台异步刷盘（flush）

Kafka默认依赖`OS Page Cache`，可以通过`log.flush.interval.ms`控制刷盘策略。这也是Kafka写入性能极高的核心原因之一。

> 很多数据库都会尽可能绕过Page Cache，自建Buffer Pool，从而避免双重缓存，精确控制内存使用。但Kafka不需要，因为其数据本质是日志文件，Page Cache就算被回收也只影响性能，不影响正确性，只需重新读取磁盘即可恢复。

## mmap
前面提到，Kafka大量依赖操作系统的Page Cache来提升读写性能。但需要注意的是，Page Cache位于内核空间，而Kafka运行在用户空间。这意味着，如果采用传统文件读取方式（如read()系统调用），数据读取过程是这样的：
```text
磁盘 → Page Cache（内核） → 用户空间缓冲区
```
也就是说，即使数据已经在Page Cache中，仍然需要一次从内核空间拷贝到用户空间的过程，这会带来额外的CPU开销和上下文切换。

为了解决这个问题，Kafka对索引文件使用了mmap（内存映射）机制。将索引文件内容直接映射到进程的虚拟地址空间，让用户进程“像访问内存一样访问文件”。映射之后，索引文件数据仍然在Page Cache中，但用户进程可以直接访问这块内存映射区域。因此，在消费过程中进行二分查找索引时，不再需要频繁系统调用，也不需要内存拷贝，使得查询性能更高。

那为什么.log文件不使用mmap呢？这是因为.log文件太大，映射大文件会占用大量虚拟地址空间，管理成本非常高。而且Kafka的访问模式是“索引随机访问，日志顺序读”。.log文件通常是顺序读取一小段数据，mmap反而可能导致频繁page fault。

## 零拷贝
当Kafka通过索引定位到目标消息后，接下来要做的事情是把数据从磁盘发送到网络，交给消费者。如果使用传统方式（read + write），数据路径如下：
```text
磁盘 → Page Cache → 用户空间 → Socket缓冲区 → 网卡
```
其过程中会发生两次CPU主导的内存拷贝和四次上下文切换：
- read()：磁盘 → Page Cache（DMA）
- read()：Page Cache → 用户空间（CPU拷贝）
- write()：用户空间 → Socket缓冲区（CPU拷贝）
- DMA：Socket缓冲区 → 网卡（NIC）


因此，Kafka使用sendfile()系统调用实现“零拷贝”。优化后的数据路径如下：
```text
磁盘 → Page Cache → Socket缓冲区 → 网卡
```
其过程中，内存拷贝次数为三次，上下文切换减少到了两次。而且由于数据始终在内核空间流动，用户态根本不参与，CPU拷贝的次数减少到了0次：
- DMA：磁盘 → Page Cache
- DMA：Page Cache → Socket缓冲区
- DMA：Socket缓冲区 → 网卡

可以看到，零拷贝的底层依赖于DMA技术。它的核心作用就是让硬件设备直接在内存之间搬运数据，而不需要CPU参与。当IO设备（磁盘/网卡）发起DMA请求时，CPU设置好源地址、目标地址、数据长度后，将总线控制权完全交给DMA控制器，由DMA控制器来完成数据搬运。传输完成后，再通过中断通知CPU。而CPU在这个过程中，可以去执行其他任务，极大提升系统整体吞吐量。

# 核心概念
## Controller控制器
在Kafka集群中，有一个非常关键的角色——`Controller`。它本质上仍然是一个普通的Broker，但会被选举出来承担“集群大脑”的职责，负责整个集群的控制平面工作，包括：
- 管理Topic、Partition以及ISR等元数据
- 负责分区Leader的选举
- 监听Broker的上下线变化
- 向整个集群广播元数据变更

在早期版本中，Kafka的Controller选举以及元数据管理完全依赖ZooKeeper。也就是说，Kafka实际上运行在“两套分布式系统之上”，这增加了系统复杂度和运维成本。为了简化架构，Kafka社区提出了KIP-500，引入了全新的KRaft模式，逐步替代ZooKeeper。在该模式下，Kafka将原本由ZooKeeper负责的元数据管理和选举机制全部内置到自身，并通过`Raft`共识协议来完成。这种变化，使得集群架构更简单，元数据一致性更强，而且集群扩展能力也变得更好。

### Controller选举
在KRaft模式里，Kafka会维护一条专门的元数据日志。集群中的topic、partition、副本分配、ISR变化、配置变更等元数据，不再写入ZooKeeper，而是作为日志记录写入这条元数据日志中。

而负责维护这条元数据日志的一组节点，就构成了metadata quorum。这组节点里会选出一个Leader，这个Leader同时也就是整个 Kafka集群当前的Controller。谁当选了元数据仲裁组的Leader，谁就拥有Controller权限，可以处理元数据变更请求，并把这些变更复制给其他quorum节点。

在KRaft集群里，并不是所有Broker都一定参与Controller选举。真正参与元数据仲裁的，是配置在`controller.quorum.voters`里的那几个节点。选举流程大致如下：
1. controller quorum中的节点初始作为Follower等待Leader心跳
2. 等待超时后，某个节点提升epoch，转为Candidate发起竞选
3. 候选人向其他节点请求投票，并带上自己的日志状态
4. 其他节点根据term和日志新旧决定是否投票
5. 获得多数票的节点成为metadata quorum的Leader
6. 这个Leader同时就是整个Kafka集群的Controller
7. 它通过持续心跳和日志复制维持领导权，失效后再触发下一轮选举

需要注意的是，KRaft主要负责的是集群元数据的变更同步。而Kafka中普通消息的副本同步，依然是Kafka自己那套分区副本机制。

> Kafka内部使用一个特殊的内部主题来持久化这些元数据：__cluster_metadata

## 分区Leader选举
为了保证数据可靠性，Kafka的每个分区都可以配置多个副本，其中包含一个Leader副本和多个Follower副本。Leader副本用于对外提供读写能力，生产者和消费者只与Leader交互。而Follower副本则从Leader同步数据，不参与读写，仅用于容灾。

一旦Leader所在的Broker挂掉，这个分区就必须尽快选出新的Leader，否则该分区就会短暂不可用。Kafka会从剩余副本中选择一个新的Leader，这个选择不是随便选，而是优先从`ISR`列表中选。也就是说，Leader宕机后，Controller只要感知到故障，就会从该分区的ISR副本中挑选新的Leader，之后其他副本继续向新Leader对齐数据。

### ISR机制
为什么不能随便选一个副本做Leader，而是从ISR列表中选呢？这是因为Kafka首先要保证数据一致性。如果某个Follower长时间同步落后，它的数据可能比原Leader少很多。假设这时直接把它提升为Leader，那么已经被生产成功确认过的消息，可能在新Leader上根本不存在。这会造成已写入的数据丢失，消费位点错乱，导致数据不一致。

而ISR列表，可以理解为“与Leader保持同步的副本集合”。它不是所有副本的列表，而是“当前同步状态合格”的副本列表。Follower会不断从Leader拉取数据。

如果某个Follower能持续跟上Leader的写入进度，其落后时间没有超过阈值，并与Leader保持正常通信，那么它就会留在ISR中。如果某个Follower同步太慢，长时间没有拉取数据，那么它就会被踢出ISR，因此ISR是一个动态变化的集合。

## HW与LEO
在解释ISR时，经常会遇到两个术语：`LEO`和`HW`。

HW表示“消费者可见的最大位移”。Kafka并不是Leader一写入消息，消费者立刻就一定能看到。通常只有当消息已经被ISR中的副本同步到一定程度后，HW才会推进，消费者才会消费到这些消息。

LEO表示某个副本当前日志末尾的位置，也就是“下一条消息将要写入的位置”。Leader和Follower都有自己的LEO，它们中最小的LEO可以用来推进HW，确保所有副本一致。

## 消费组重平衡
Kafka的Consumer一般不是单独工作的，而是以Consumer Group（消费组）的形式协作消费。同一个消费组中的多个消费者共同订阅一个Topic，Kafka会把分区分配给组内不同消费者，每个分区在同一时刻只会被组内一个消费者消费。这种模型带来了水平扩展能力，但也引出了一个重要机制：重平衡。

重平衡就是当消费组成员或订阅关系发生变化时，Kafka重新分配分区归属的过程。例如有新的消费者加入组或某个消费者宕机/退出，都会触发重平衡。在重平衡期间，消费会短暂停顿。如果系统中频繁发生重平衡，就会导致消费延迟抖动明显，严重时甚至让人误以为Kafka不稳定。

当Kafka出现重平衡时，会在消费组内会选出一个`Group Coordinator`来协调成员状态。一次典型重平衡大致会经历：
1. 消费组成员加入组并发送订阅信息
2. Coordinator感知到组成员变化
3. 暂停当前消费
4. 计算新的分区分配方案
5. 将分配结果下发给各消费者
6. 消费者根据新分配结果恢复消费

在实际项目里，重点不是“避免所有重平衡”，而是“减少不必要的重平衡”和“缩短重平衡时间”。常见做法包括：
- 保持消费者实例数量稳定，避免频繁扩缩容
- 控制单条消息处理时间，避免心跳超时
- 合理配置`session.timeout.ms`和`max.poll.interval.ms`
- 批量处理时注意不要让业务处理阻塞过久
- 优先使用更平滑的分区分配策略，比如`Cooperative Sticky Assignor`

尤其是大流量系统里，消费组抖动往往比单机性能更伤系统。



