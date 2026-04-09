---
title: iptables
date: 2026-04-06
updated: 2026-04-07
keywords: "网络"
featured: true
summary: "这篇文章介绍有关iptabels、nftables相关知识"
---

# iptables
iptables是一个运行在用户空间的命令行工具，用于配置Linux内核中的网络包处理规则。它通过与内核中的netfilter框架交互，实现对数据包的过滤、修改以及地址转换等功能。

简单来说，iptables就是用来“写规则”的工具。它把规则组织成三层结构：表->链->规则。我们先看看四张表的作用：
| 表 | 作用 | 
| ---- | ---- |
| filter | 数据包过滤 |
| nat | 地址转换 | 
| mangle | 数据包修改 | 
| raw | 控制连接跟踪 | 

表按照功能进行分类，但它不是执行顺序主体。在每张表中都有相应的链，数据包会在不同阶段进入不同的链，常见的链有
- PREROUTING：在路由决策之前处理数据包，常用于DNAT
- POSTROUTING：在路由决策之后、数据包实际发出之前处理，常用于SNAT/MASQUERADE
- INPUT：主要与想要进入Linux主机的数据包有关
- OUTPUT：主要与Linux主机所要发送出去的数据包有关
- FORWORD：可以对数据包进行转发

而链中存放的是一条条的规则，规则就是过滤防火墙的语句或者其他功能的语句。当数据包进入某条链时，会从第一条规则开始，按顺序逐条匹配，直到命中为止。也就是说规则才是真正的执行逻辑，每条规则包含`匹配条件 + 动作`，例如：
```shell
# 如果是TCP 22端口则允许进入
iptables -A INPUT -p tcp --dport 22 -j ACCEPT
```
## netfilter
netfilter是Linux内核中的一个网络包处理框架，用于在协议栈中对数据包进行过滤、修改和转发等操作。它本质上是一组内核中的hook，上面提到的每条链都对应了一个hook点。netfilter会在内核中维护相关的数据结构，用于存储各类规则。而在这些hook上会注册回调函数，当数据包经过时，会触发对应链的规则匹配逻辑，并依次执行匹配到的动作。

## iptables缺陷
iptables设计虽然灵活，但在实际使用中也逐渐暴露出一些问题
- 规则匹配效率低：使用线性匹配，规则多时性能下降明显
- 规则管理复杂：不同协议需要使用不同的命令行工具。如iptables、ip6tables、ebtables、arptables
- 扩展性差：新功能需要内核模块支持，难以灵活表达复杂逻辑
- 更新规则代价高：修改规则通常需要整体替换，不支持原子更新

# nftables
nftables是Linux内核中的现代网络包过滤和分类框架，用来替代传统的iptables家族。它自Linux 3.13引入，并逐步成为大多数发行版的默认防火墙框架。

和iptables一样，nftables也是基于netfilter的，但它具有以下优势：
- 规则匹配性能更高：支持set和map等高效数据结构，避免了线性扫描。在规则数量较多时，匹配性能更加稳定，基本不会随规则数量增长而显著下降
- 统一管理：使用同一个nft工具就可以管理多种协议
- 支持原子更新：nftables同样通过netlink机制与内核通信，但与iptables不同的是，它支持一次性提交整套规则。内核在接收到这批规则后，会先进行完整性校验，并以事务的方式统一提交，要么全部成功生效，要么在出现错误时全部回滚，从而避免规则部分更新带来的不一致问题
- 拓展性更强：在内核引入了一个轻量级的虚拟机。用户空间的规则会被编译为字节码，在内核中执行，规则的执行不再强依赖具体协议解析逻辑。这意味着新增功能不需要频繁修改内核代码，只需扩展规则表达能力

另外，nftables不再内置固定的“四表五链”结构，而是采用按需创建的方式，使规则组织更加灵活。在nftables中，table是所有对象的顶级容器，用于组织规则并定义其作用范围。每个table都绑定一个地址族，例如inet（IPv4/IPv6统一）、bridge和netdev等，从而决定该table中规则所作用的协议栈。链存在于table之中，根据是否直接与内核协议栈交互，可以分为两类
- 基础链：基础链会绑定到netfilter的hook点（如PREROUTING、INPUT等），是数据包进入规则处理流程的入口。只有基础链可以直接处理经过协议栈的数据包
- 常规链：常规链不直接绑定hook点，不能主动处理数据包，而是需要通过jump或goto从其他链调用，更类似于编程中的“子函数”，用于复用规则逻辑、提高可维护性

这种设计使得nftables相比iptables更加灵活：不仅可以按需组织规则结构，还可以通过链之间的调用关系构建更复杂的处理逻辑，从而摆脱传统固定链结构的限制。

## nft命令行工具
在现代发行版（如Debian 11/12、Ubuntu 22.04+、RHEL8/9）中，内核后端默认已经是nftables，为了照顾老用户的习惯，系统提供了iptables-nft工具。当运行iptables命令时，它实际上是一个翻译层，把老命令翻译成nftables字节码在内核运行。你可以通过以下命令查看iptables是否是套壳的:
```shell
# 如果指向/usr/sbin/iptables-nft，说明后端其实是nftables
ls -l $(which iptables)
```
需要注意的是，不建议同时使用nft和iptables，因为规则是叠加执行的，但二者却彼此不可见。例如，数据包经过iptables规则后，再经过nftables规则，只要其中任意一个规则DROP，包就没了。

# 一些参考文章
- Kubernetes 1.29版本中，kube-proxy引入了nftables模式：[点击跳转](https://kubernetes.io/blog/2025/02/28/nftables-kube-proxy)
- Docker未来版本也将引入nftables：[点击跳转](https://docs.docker.com/engine/network/firewall-nftables)