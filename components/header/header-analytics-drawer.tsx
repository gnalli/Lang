"use client"

import * as React from "react"
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"
import { Button } from "@/components/ui/button"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
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

/** 图表区高度：竖屏上限 ~260px；横屏随视口收缩，避免顶满屏幕 */
const chartPanelClass = cn(
  "w-full [&>div]:h-full [&>div]:w-full",
  "h-[clamp(9rem,calc(100svh-12rem),16.25rem)] max-h-[45svh] min-h-[9rem]",
  "sm:h-[clamp(10rem,calc(100svh-11rem),17.5rem)] sm:max-h-[50svh]",
)

function ChartLegend() {
  return (
    <div className="flex items-center gap-4 text-xs text-muted-foreground">
      <span className="inline-flex items-center gap-1.5">
        <span className="size-2 rounded-full bg-foreground" aria-hidden />
        PV
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span className="size-2 rounded-full bg-muted-foreground" aria-hidden />
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
    <div
      className={cn(
        "rounded-xl border border-border/60 bg-muted/25 px-2 py-2 dark:bg-muted/15",
        className,
      )}
    >
      {children}
    </div>
  )
}

export function HeaderAnalyticsDrawer({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [payload, setPayload] = React.useState<TrendsPayload | null>(null)
  const [loading, setLoading] = React.useState(false)

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
        if (!cancelled)
          setPayload({ ok: false, reason: "network", series: [] })
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [open])

  const series = payload?.series ?? []
  const showConfigureHint =
    payload?.ok === false && payload.reason === "not_configured"
  const showGenericError =
    payload?.ok === false && payload.reason !== "not_configured"

  return (
    <Drawer direction="bottom" open={open} onOpenChange={onOpenChange}>
      <DrawerContent
        className={cn(
          "mx-auto w-full max-w-6xl border-0 bg-transparent p-0 before:hidden",
          "pb-[env(safe-area-inset-bottom,0px)]",
          "data-[vaul-drawer-direction=bottom]:max-h-[min(92svh,640px)]",
        )}
      >
        <div
          className={cn(
            "overflow-hidden rounded-t-2xl border border-b-0 border-border/70",
            "bg-background/95 shadow-[0_-12px_48px_-16px_rgba(0,0,0,0.28)]",
            "backdrop-blur-xl supports-backdrop-filter:bg-background/88",
          )}
        >
          <DrawerHeader className="space-y-3 border-b border-border/50 px-5 pb-4 pt-2 text-left">
            <div className="space-y-1">
              <DrawerTitle className="text-base font-semibold tracking-tight">
                全站访问趋势
              </DrawerTitle>
              <p className="text-xs leading-relaxed text-muted-foreground">
                近 14 日 PV / UV
              </p>
            </div>
            <ChartLegend />
          </DrawerHeader>

          <div className="px-4 py-3 sm:px-5 sm:py-4">
            {loading ? (
              <ChartPanel className={chartPanelClass}>
                <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                  加载中…
                </div>
              </ChartPanel>
            ) : showConfigureHint ? (
              <ChartPanel className={chartPanelClass}>
                <div className="flex h-full flex-col items-center justify-center gap-2 px-4 text-center text-sm text-muted-foreground">
                  <p>Supabase 连接失败，请检查相关配置…</p>
                </div>
              </ChartPanel>
            ) : showGenericError ? (
              <ChartPanel className={chartPanelClass}>
                <div className="flex h-full items-center justify-center px-4 text-center text-sm text-muted-foreground">
                  趋势数据暂时无法加载，请稍后重试。
                </div>
              </ChartPanel>
            ) : (
              <ChartPanel>
                <ChartContainer config={chartConfig} className={chartPanelClass}>
                  <LineChart
                    data={series}
                    margin={{ left: 0, right: 8, top: 4, bottom: 0 }}
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

          <DrawerFooter className="flex-row justify-end gap-2 border-t border-border/50 px-4 py-3 sm:px-5">
            <DrawerClose asChild>
              <Button type="button" variant="outline" size="sm" className="min-h-10 px-4">
                关闭
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
