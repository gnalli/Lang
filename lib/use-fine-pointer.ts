"use client"

import * as React from "react"

/** 是否为主指针（鼠标/触控板）；触摸端为 false */
export function useFinePointer(): boolean {
  const [fine, setFine] = React.useState(false)

  React.useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)")
    const update = () => setFine(mq.matches)
    update()
    mq.addEventListener("change", update)
    return () => mq.removeEventListener("change", update)
  }, [])

  return fine
}
