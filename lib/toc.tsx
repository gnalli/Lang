// @ts-nocheck

import { toc } from "mdast-util-toc"
import { remark } from "remark"
import { visit } from "unist-util-visit"

// 过滤掉非文本类型的节点 文字、斜体、加粗、行内代码
const textTypes = ["text", "emphasis", "strong", "inlineCode"]

function flattenNode(node) {
  const p = []
  visit(node, (node) => {
    if (!textTypes.includes(node.type)) return
    p.push(node.value)
  })
  return p.join(``)
}

interface Item {
  title: string
  url: string
  items?: Item[]
}

interface Items {
  items?: Item[]
}

function getItems(node, current): Items {
  if (!node) {
    return {}
  }

  if (node.type === "paragraph") {
    visit(node, (item) => {
      // 如果节点类型是链接，则获取链接的标题和URL
      if (item.type === "link") {
        current.url = item.url
        current.title = flattenNode(node)
      }

      // 如果节点类型是文字，则获取文字的值
      if (item.type === "text") {
        current.title = flattenNode(node)
      }
    })

    return current
  }
  
  if (node.type === "list") {
    current.items = node.children.map((i) => getItems(i, {}))

    return current
  } else if (node.type === "listItem") {
    const heading = getItems(node.children[0], {})

    if (node.children.length > 1) {
      getItems(node.children[1], heading)
    }

    return heading
  }

  return {}
}

const getToc = () => (node, file) => {
  const table = toc(node)
  const items = getItems(table.map, {})

  file.data = items
}

export type TableOfContents = Items

export async function getTableOfContents(
  content: string
): Promise<TableOfContents> {
  const result = await remark().use(getToc).process(content)

  return result.data
}
