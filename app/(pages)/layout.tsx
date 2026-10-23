import type { ReactNode } from "react"
import Footer from "@/components/footer"

export default function PageLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <main className="flex-1 px-4 sm:px-6">{children}</main>
      <Footer variant="page" />
    </>
  )
}
