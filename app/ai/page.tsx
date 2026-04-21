import type { Metadata } from "next"
import NotFound from "../not-found"

const title = "专题"

export const metadata: Metadata = {
  title,
}

export const revalidate = 120

/** 专题列表暂时下线，保留路由占位。 */
export default function AiTopicsPage() {
  return <NotFound />
}
