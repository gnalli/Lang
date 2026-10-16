"use client"

import * as React from "react"
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"
import { Drawer } from "vaul"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { cn } from "@/lib/utils"

type TrendPoint = {
  date: string
  label: string
  pv: number
  uv: number
}

type TrendsPayload =
  | { ok: true; series: TrendPoint[] }
  | { ok: false; reason: string; series: TrendPoint[] }

const chartConfig = {
  pv: {
    label: "PV",
    color: "var(--foreground)",
  },
  uv: {
    label: "UV",
    color: "var(--muted-foreground)",
  },
} satisfies ChartConfig

/** 紧凑档大约 31rem。vaul 的字符串吸附点按 parseInt 读像素，不能写 rem。 */
const PEEK_REM = 31

function readHeaderPx() {
  const root = getComputedStyle(document.documentElement)
  const font = Number.parseFloat(root.fontSize) || 16
  const raw = root.getPropertyValue("--site-header-height").trim()
  if (raw.endsWith("rem")) return Number.parseFloat(raw) * font
  if (raw.endsWith("px")) return Number.parseFloat(raw)
  return 4 * font
}

function readSizes() {
  const font = Number.parseFloat(getComputedStyle(document.documentElement).fontSize) || 16
  const expanded = Math.max(320, Math.round(window.innerHeight - readHeaderPx()))
  const peek = Math.min(Math.round(PEEK_REM * font), expanded - 48)
  return {
    peek: `${Math.max(240, peek)}px`,
    expanded: `${expanded}px`,
  }
}

function useSheetSizes() {
  const [sizes, setSizes] = React.useState({ peek: "496px", expanded: "736px" })

  React.useLayoutEffect(() => {
    const update = () => setSizes(readSizes())
    update()
    window.addEventListener("resize", update)
    return () => window.removeEventListener("resize", update)
  }, [])

  return sizes
}

function ChartLegend() {
  return (
    <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
      <span className="inline-flex items-center gap-1.5">
        <span className="size-1.5 rounded-full bg-foreground" aria-hidden />
        PV
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span className="size-1.5 rounded-full bg-muted-foreground" aria-hidden />
        UV
      </span>
    </div>
  )
}

function ChartPanel({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn("min-h-0 min-w-0 flex-1 overflow-hidden rounded-2xl bg-muted", className)}>
      {children}
    </div>
  )
}

function ChartStatus({ children }: { children: React.ReactNode }) {
  return (
    <ChartPanel>
      <div className="flex h-full min-h-36 items-center justify-center px-4 text-center text-xs leading-relaxed text-muted-foreground">
        {children}
      </div>
    </ChartPanel>
  )
}

export function HeaderAnalyticsDrawer({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { peek, expanded: expandedPx } = useSheetSizes()
  const sizesRef = React.useRef({ peek, expanded: expandedPx })
  const modeRef = React.useRef<"peek" | "tall">("peek")
  const [snap, setSnap] = React.useState<number | string | null>(peek)
  const [payload, setPayload] = React.useState<TrendsPayload | null>(null)
  const [loading, setLoading] = React.useState(false)
  const expanded = snap === expandedPx || snap === 1
  const sheetHeight = expanded ? expandedPx : peek

  React.useLayoutEffect(() => {
    if (!open) return
    modeRef.current = "peek"
    setSnap(sizesRef.current.peek)
  }, [open])

  React.useLayoutEffect(() => {
    sizesRef.current = { peek, expanded: expandedPx }
    setSnap(modeRef.current === "tall" ? expandedPx : peek)
  }, [peek, expandedPx])

  function handleSnap(value: number | string | null) {
    const next = sizesRef.current
    if (value === 1 || value === next.expanded) {
      modeRef.current = "tall"
      setSnap(next.expanded)
      return
    }
    modeRef.current = "peek"
    setSnap(value ?? next.peek)
  }

  React.useEffect(() => {
    if (!open) return
    let cancelled = false
    setLoading(true)
    void fetch("/api/analytics/site-trends", { credentials: "same-origin" })
      .then(async (res) => (await res.json()) as TrendsPayload)
      .then((body) => {
        if (!cancelled) setPayload(body)
      })
      .catch(() => {
        if (!cancelled) setPayload({ ok: false, reason: "network", series: [] })
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [open])

  const series = payload?.series ?? []
  const showConfigureHint = payload?.ok === false && payload.reason === "not_configured"
  const showGenericError = payload?.ok === false && payload.reason !== "not_configured"

  return (
    <Drawer.Root
      open={open}
      onOpenChange={onOpenChange}
      snapPoints={[peek, expandedPx]}
      activeSnapPoint={snap}
      setActiveSnapPoint={handleSnap}
      fadeFromIndex={1}
    >
      <Drawer.Portal>
        <Drawer.Overlay
          className="fixed inset-0 z-50 bg-foreground/15 motion-reduce:animate-none"
          onClick={() => onOpenChange(false)}
        />
        <Drawer.Content
          className={cn(
            "fixed top-0 right-3 left-3 z-50 flex h-dvh flex-col bg-transparent text-popover-foreground shadow-none outline-none",
            "motion-reduce:animate-none",
          )}
        >
          <div
            className={cn(
              "flex w-full shrink-0 flex-col overflow-hidden rounded-t-3xl border border-border bg-popover shadow-lg",
              "pb-[env(safe-area-inset-bottom,0px)]",
              "transition-[height] duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none",
            )}
            style={{ height: sheetHeight }}
          >
          <Drawer.Handle
            className="mt-3 mb-1 shrink-0"
            style={{ background: "var(--border)" }}
          />
          <div className="shrink-0 px-4 pt-1 text-center">
            <Drawer.Title className="text-sm font-semibold tracking-tight text-foreground">
              全站访问趋势
            </Drawer.Title>
            <Drawer.Description className="text-xs text-muted-foreground">
              近 14 日 PV / UV。向上拖可放大。
            </Drawer.Description>
          </div>

          <div className="shrink-0 px-4 pt-3">
            <ChartLegend />
          </div>

          <div className="flex min-h-0 flex-1 flex-col px-3 pt-3 pb-4">
            {loading ? (
              <ChartStatus>加载中…</ChartStatus>
            ) : showConfigureHint ? (
              <ChartStatus>Supabase 连接失败，请检查相关配置…</ChartStatus>
            ) : showGenericError ? (
              <ChartStatus>趋势数据暂时无法加载，请稍后重试。</ChartStatus>
            ) : (
              <ChartPanel className="px-1 py-2">
                <ChartContainer
                  config={chartConfig}
                  initialDimension={{ width: 320, height: expanded ? 360 : 200 }}
                  className="aspect-auto h-full min-h-36 w-full"
                >
                  <LineChart
                    data={series}
                    margin={{ left: 0, right: 8, top: 8, bottom: 0 }}
                    accessibilityLayer
                  >
                    <CartesianGrid
                      vertical={false}
                      stroke="var(--border)"
                      strokeOpacity={0.55}
                    />
                    <XAxis
                      dataKey="label"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      interval="preserveStartEnd"
                      tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      width={32}
                      allowDecimals={false}
                      tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                    />
                    <ChartTooltip
                      cursor={{ stroke: "var(--border)", strokeWidth: 1 }}
                      content={<ChartTooltipContent indicator="line" />}
                    />
                    <Line
                      type="monotone"
                      dataKey="pv"
                      stroke="var(--color-pv)"
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 3, strokeWidth: 0 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="uv"
                      stroke="var(--color-uv)"
                      strokeWidth={2}
                      strokeOpacity={0.85}
                      dot={false}
                      activeDot={{ r: 3, strokeWidth: 0 }}
                    />
                  </LineChart>
                </ChartContainer>
              </ChartPanel>
            )}
          </div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  )
}
