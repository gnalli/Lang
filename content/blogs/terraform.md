---
title: terraform
date: 2026-04-06
updated: 2026-04-07
keywords: "Iac"
featured: true
summary: "这篇文章介绍有关terraform的一些基础概念"
---

# Terraform介绍
Terraform是一款基础设施即代码（IaC）工具，它允许你使用声明式配置文件来定义云端和本地资源，这些配置文件可以进行版本控制、重用和共享。之后可以使用一致的工作流程来配置和管理整个基础设施的生命周期。

Terraform并不会自己创建资源，而是通过调用云厂商提供的API来操作资源。`Provider`就是Terraform用来调用这些API的插件。HashiCorp和Terraform社区已经提供了数千个Provider，用于管理各种不同类型的资源和服务。你可以在[Terraform Registry](https://registry.terraform.io/) 上找到所有公开可用的提供程序，包括AWS、Azure、GCP、Kubernetes、Helm、GitHub、Splunk、DataDog等等。Terraform的核心工作流程分为三个阶段：
- Write：使用HCL编写配置来定义基础设施
- Plan：计算当前状态与目标状态的差异，并生成执行计划
- Apply：根据执行计划调用API实际创建或修改资源
![terraform-worker](https://cdn.cnlang.net/terraform-worker.png)

Terraform会将当前基础设施的状态记录在一个状态文件（terraform.tfstate）中。该文件并不是资源的真实数据源，而是 Terraform用于跟踪资源状态的“本地记录”。Terraform会通过对比配置文件与状态文件，判断需要对基础设施执行哪些变更操作。如果状态文件与实际资源发生偏差（例如手动修改云资源），就会产生“配置漂移”（drift），Terraform在下一次执行时会尝试进行修正。

# Terraform配置
Terraform使用一种声明式配置语言（HCL）来定义基础设施。用户通过编写配置文件来告诉Terraform需要使用哪些Provider、创建哪些资源、查询哪些已有数据，以及资源之间的依赖关系。

一个Terraform配置就是一组.tf文件的集合，用来描述某一套基础设施。这些配置文件可以拆分为多个文件（如main.tf、variables.tf），且可以按目录组织（模块化）。Terraform会读取整个目录作为一个完整配置来执行。

Terraform语言本身非常简洁，其核心由以下结构组成：
```hcl
<BLOCK TYPE> "<BLOCK LABEL>" "<BLOCK LABEL>" {
  # Block主体
  <IDENTIFIER> = <EXPRESSION> # 参数
}
```
可以看到Block是Terraform配置的基本单位，通常用它来描述一个“对象”，例如resource、provider、variable等。一个Block又由三部分组成：
```hcl
resource "aws_vpc" "main" {
  cidr_block = var.base_cidr_block
}
```
- Block类型：对象名称（resource）
- Block标签：可选的标签，支持多个（aws_vpc、main）
- Block主体：包含参数和嵌套块

## Provider
上面提到过，Terraform必须通过providers插件才能和云服务商的API进行交互。每个provider都会提供一组资源类型（resource）和数据源（data）
- resource：用于创建和管理资源
- data：用于查询已有资源

provider是独立发布的插件，并不包含在Terraform本体中，大多数provider可以从Terraform Registry下载。并且provider一般维护着多个版本，在定义和使用时，建议在配置中明确指定其版本，不然可能会直接下载最新的版本，导致配置不兼容。Terraform会生成一个依赖锁文件（.terraform.lock.hcl），用于固定provider版本，确保不同环境使用一致版本。

> Terraform还支持本地缓存来减少重复下载，通过在`~/.terraformrc`配置文件中配置`plugin_cache_dir`可定义缓存的位置

如果要从私有仓库中下载provider，你可能需要提供一个通用的认证配置文件（.netrc），用于让Terraform在访问API/私有仓库时自动认证。改文件的权限必须设置为600，否则Terraform会拒绝使用。

> 使用terraform login命令认证时，会自动生成一个认证配置文件

### 配置示例
以下示例配置了阿里云的provider，并指定了provider的版本和来源
```hcl
# terraform.tf
terraform {
  required_providers {
    alicloud = {
      source  = "hashicorp/alicloud"
      version = "~> 1.275.0"
    }
  }
}
```
之后就可以在配置的根模块中使用这个provider了
```hck
# main.tf
provider "alicloud" {
  access_key = "xxxxxxxxx"
  secret_key = "xxxxxxxxxx"
  region = "cn-guangzhou"
  ecs_role_name = "lisi"
}
```
> provider配置块中之前是支持version字段的，后面弃用了

provider配置块中还支持一个alias参数，使用它可以用来定义同一个 provider的不同实例

```hcl
provider "alicloud" {
  region = "cn-guangzhou"
}

provider "alicloud" {
  alias  = "beijing"
  region = "cn-beijing"
}
```
如上，当需要在多个区域创建资源或使用多个账号的时候，一个provider就不够用了。而通过alias参数后则创建出了两个实例，第一个实例是默认使用的，第二个实例在使用时指定即可。

## Resource
resouce配置块是一个非常核心的配置，它用于描述一个具体的基础设施对象，如网络、虚拟机或对象存储。该配置块的定义如下
```hcl
resource "alicloud_instance" "demo" {
  # 参数
  instance_name              = "iZ7xvbir0stljs12r974jcZ"
  host_name                  = "web-01"
```
resource配置块支持的参数除了各大厂商provider提供的参数外，其它的可参考：
- https://developer.hashicorp.com/terraform/language/block/resource

### timeouts参数
timeouts参数可以用来控制Terraform等待资源操作完成的最长时间。当Terraform执行资源的创建、更新、删除等操作时，实际上是在调用云厂商API，然后“等待完成”。如果某些资源操作很慢，等待的时间过长，Terraform会超时报错，这时候就需要timeouts参数了
```hcl
resource "alicloud_instance" "demo" {
  instance_type = "ecs.g6.large"

  timeouts {
    create = "10m"
    delete = "5m"
    update = "10m"
  }
}
```
如上，配置了在创建、删除、更新阿里云服务器实例时，Terraform运行多长时间后超时。另外需要注意的是，不同资源类型的timeouts参数中支持不同的字段，具体看provider文档

### 销毁资源
在Terraform中，可以通过多种方式销毁不再需要的资源：
1. 从配置中删除资源：也就是直接从配置文件中删除对应的resource配置块。当apply应用时，Terraform会对比当前配置与state文件，如果发现对应资源已不存在于配置中时，就会调用云平台API进行删除
2. 全部销毁：如果需要一次性销毁所有资源，可以使用`terraform destroy`命令，该命令会删除当前目录下所有Terraform管理的资源。该命令还支持`-target`标志，用来只销毁特定的资源
3. removed配置块：该配置块可以更安全地移除资源，配合`Destroy-time provisioners`还可以在移除时执行额外操作

## Data
在Terraform中，可以将云服务厂商理解为“数据源”，而data配置块的作用就是从这些数据源中读取已有信息，而不会创建或修改任何资源。换句话说，data更像是“查询接口”，用于获取外部或已有资源的属性。
```hcl
data "alicloud_instances" "demo" {
  instance_name = "iZ7xvbir0stljs12r974jcZ"

  status = "Running"
}

output "instance_id" {
  value = data.alicloud_instances.demo.instances[0].id
}
```
如上配置中，查询了指定实例id的服务器，并将其查询结果打印了出来。

关于该配置块支持的完整参数和用法，可以参考官方文档：
- https://developer.hashicorp.com/terraform/language/block/data

## Varibles
variable配置块可以用来为模块提供输入参数，从而让模块在运行时具备更强的灵活性。默认情况下，如果在配置中写死某些值（例如实例规格、区域等），那么每次执行时都会使用相同的参数，这会导致模块难以复用。而通过变量机制，可以将这些“可能变化的值”抽离出来，由使用者在运行时传入，而无需修改模块本身。
```hcl
variable "instance_type" {
  type        = string
  description = "EC2 instance type for the web server"
  default     = "ecs.e-c1m1.large"
}

resource "alicloud_instance" "demo" {

  instance_type              = var.instance_type
  ...
}
```
以上示例定义了instance_type变量，该变量会先使用default定义的默认值，也可在运行时指定其它值。variable配置块支持的参数可参考官方文档：
- https://developer.hashicorp.com/terraform/language/values/variables

### 变量传值
在Terraform中，变量可以通过多种方式赋值，常见的变量来源有
- 命令行参数：`-var`传入单个或多个变量，`-var-file`加载变量文件传入一整组变量
- 变量文件：`terraform.tfvars`或`*.auto.tfvars`
- 环境变量：TF_VAR_xxx
- 默认值：用variable配置块中的default定义

当同一个变量从多个地方传入时，会按照优先级进行选择。优先级从高到低如下：
1. 命令行参数
2. *.auto.tfvars或*.auto.tfvars.json文件
3. terraform.tfvars.json文件
4. terraform.tfvars文件
5. 环境变量
6. variable配置块中的default

### 敏感数据
如果variable配置块中定义了一个敏感数据，可以使用sensitive参数来避免敏感值在CLI输出中明文显示
```hcl
variable "database_password" {
  type        = string
  description = "Password for the RDS database instance"
  sensitive   = true
}
```
需要注意的是，sensitive主要用于展示层的防护，但数据仍然会以明文持久化到状态文件中。此时你可以使用`ephemeral`参数，使用该参数标记的变量仅在操作内存中存在，不会写入到状态文件中
```hcl
variable "database_password" {
  type        = string
  description = "Password for the RDS database instance"
  sensitive   = true
}
```

普通的resource通常无法直接消费ephemeral变量，因为Terraform的资源状态必须是可追踪、可对比的，如果一个资源引用了不存储在状态文件中的变量，Terraform在下次执行时就无法知道这个资源当前的状态是否与配置一致。所以目前ephemeral变量主要设计用于传递给同样标记为ephemeral的数据源或资源（例如某些临时认证Token的获取）。

## Locals
Locals配置块类似于编程语言里的“函数内变量”，用于给表达式起一个名字，从而在模块内部重复使用。其核心作用是：`避免重复写表达式，提高配置的可读性和可维护性`。Locals非常灵活，可以使用任何有效的Terraform表达式
- 变量
- resource属性
- outputs输出
- 其它locals变量
```hcl
variable "environment" {
  type    = string
  default = "dev"
}

variable "project" {
  type    = string
  default = "demo"
}

locals {
  # 统一命名前缀
  name_prefix = "${var.environment}-${var.project}"

  # 通用标签
  common_tags = {
    Environment = var.environment
    Project     = var.project
  }
}

resource "alicloud_instance" "web" {
  instance_name = "${local.name_prefix}-web"

  instance_type = "ecs.t5-lc2m1.nano"

  tags = local.common_tags
}
```
如上示例，用Locals统一了命名和标签，避免每次都要重复写多次表达式

## Outputs
Outputs配置块用来把Terraform内部的值导出来。它的主要用途有：
- 用于在CLI输出中显示对应信息
- 用于子模块向父模块传递资源属性
- 用于跨Terraform项目共享（remote state），使用terraform_remote_state可以读取另一个项目的output
- 用于将Terraform的操作信息传递给自动化工具（如CI/CD流水线）
```hcl
# 导出实例的id
output "instance_id" {
  value = data.alicloud_instances.demo.instances[0].id
}
```
需要注意的是，对于敏感数据需要加上`sensitive`参数

## 模块
在Terraform中，Module是一组被一起管理的资源集合，也可以将其看作是可复用的基础设施模板。当你发现自己在反复写类似配置时（如每个服务都要创建ECS + 安全组），就应该抽象成Module。另外，Terraform模块是有层级关系的：
- 根模块：每个Terraform工作区的根目录下的配置文件，是Terraform的执行入口
- 子模块：使用module配置块配置的模块。Terraform会将子模块的资源添加到工作区，并将其作为配置的一部分进行管理

Terraform支持多种模块来源，包括本地、VCS仓库和Terraform仓库。如果模块来源于Terraform仓库，推荐使用`version`参数来约束模块版本。

### 模块输入参数
模块通常会通过variable定义输入参数，在调用模块时可以传入这些参数，从而在不修改模块源码的情况下定制模块行为
```hcl
# 子模块：modules/ecs/main.tf
variable "instance_type" {
  type = string
}

# 调用模块
module "ecs" {
  source = "./modules/ecs"

  instance_type = "ecs.g6.large"
}
```

### 模块中的元参数
module配置块支持Terraform的元参数，用于控制模块实例的创建方式
- count：用于创建多个相同配置的模块实例
- for_each：用于根据具体的配置信息创建多个模块实例，每个实例可以不同
- depends_on：某些模块可能还依赖于其它上游模块的数据，可以使用depends_on参数显式配置所依赖的模块
- providers：默认情况下，模块会继承根module的provider，但你也可以显式指定

> 需要注意的是，在同一module中，for_each和count不能同时使用

### 模块输出
模块通常也会定义output，用于导出模块创建的资源的属性值。之后可以使用`module.<MODULE-NAME>.<OUTPUT-NAME>`表达式在父模块中直接引用这些值。
```hcl
# 子模块
output "instance_id" {
  value = alicloud_instance.web.id
}

# 父模块
output "ecs_id" {
  value = module.ecs.instance_id
}
```

### 重构资源到模块
当你想把资源从根模块移到子模块时，如果不做处理，Terraform会认为“资源被删除了，需要重建”。这时候可以使用moved配置块来安全的进行迁移，它的作用就是告诉Terraform：“只是位置变了，不需要删除重建”。
```hcl
moved {
  from = alicloud_instance.web
  to   = module.ecs.alicloud_instance.web
}
```

### 模块资源重建与删除
在Terraform中，可以通过`terraform apply -replace`命令强制重新创建moudle中的某个资源（即销毁+重建）：
```shell
terraform apply -replace=module.example.alicloud_instances.demo
```

如果直接删除module配置块，会导致模块中的所有资源都被删除，对应的状态信息也会从状态文件中移除。但如果你想保留模块中的资源，只是将其脱离Terraform的管控的话，可以通过removed配置块来实现
```hcl
removed {
  from = module.example

  lifecycle {
    destroy = false
  }
}
```

## 元参数
元参数是Terraform配置语言中内置的一类参数，用于控制Terraform如何创建和管理基础架构。你可以在任何类型的资源中使用元参数。大多数元参数也可以在module、resource等块中使用。目前Terraform内置的元参数有
- count
- for_each
- depends_on
- providers
- lifecycle

前四个上面已经提到过了，现在主要讲讲lifecycle

### lifecycle
当执行`terraform apply`时，Terraform会基于配置与状态之间的差异，执行以下五类核心操作：
- 创建资源：如果配置中定义的资源在state中不存在，Terraform就会创建该资源
- 删除资源：如果state中存在，但配置中删除了，Terraform就会销毁真实的基础设施
- 原地更新：如果资源存在只是属性变了，且provider支持修改，Terraform会直接更新资源，而不重建
- 替换资源：如果属性变了，但provider不支持原地修改，Terraform会先销毁，再创建
- 执行附加动作：比如provisioner、post-condition、pre-condition、hooks，用于补充资源生命周期逻辑

lifecycle是用来改变上述行为规则的“控制器”，它不会改变资源本身，而是改变Terraform的处理方式。lifecycle支持的核心参数有四个：
1. create_before_destroy：先创建新资源，再删除旧资源。用来减少停机时间，保证服务连续性
2. prevent_destroy：防止资源被误删（安全保护）
3. ignore_changes：忽略某些字段变化，不触发更新。即使云上变了，Terraform也不会改回来
4. replace_triggered_by：当某个资源变化时，强制重建当前资源

需要注意的是，即使使用了prevent_destroy，资源仍然可能发生删除。比如你删除了resource配置块或移除了整个配置，Terraform仍然会销毁资源，因为lifecycle不能保护“已经从配置中消失的资源”

> 除了create_before_destroy，Terraform不会把lifecycle规则写入state状态文件

在Terraform中，lifecycle中还提供了precondition和postcondition，它们是用于增强校验能力的高级机制。核心作用是：在资源执行前后加入“自定义验证规则”，提高配置安全性与可靠性。
- precondition：在资源创建或更新之前进行检查，防止错误配置进入执行阶段。如果不满足条件，会直接阻止apply
```hcl
resource "alicloud_instance" "web" {
  instance_type = var.instance_type

  lifecycle {
    precondition {
      condition     = var.instance_type != ""
      error_message = "instance_type 不能为空"
    }
  }
}
```
- postcondition：在资源创建或更新之后进行验证，从而保证最终状态正确。如果不满足条件，apply会失败
```hcl
resource "alicloud_instance" "web" {
  instance_type = "ecs.g6.large"

  lifecycle {
    postcondition {
      condition     = self.instance_type == "ecs.g6.large"
      error_message = "实例类型不符合预期"
    }
  }
}
```

# Terraform backend
Terraform使用state文件来记录已创建的资源，这个文件默认是放在本地的（local backend）。但本地的state存在一些弊端：
- 不适合多人协作
- 容易丢失
- 无锁机制（容易冲突）
- 安全性差（可能包含敏感信息）

在Terraform配置中，使用backend配置块可以定义state文件存储在哪里，以及如何访问。目前支持的存储后端有多种，可以参考官方文档来进行配置：
- https://developer.hashicorp.com/terraform/language/backend/remote

# 参考文档
- https://developer.hashicorp.com/terraform