"use client"

import * as React from "react"
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"
import { LineChart as LineChartIcon } from "lucide-react"
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
  DrawerTrigger,
} from "@/components/ui/drawer"

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

const iconBtn =
  "size-10 rounded-xl text-foreground/85 hover:bg-accent sm:size-11 [&_svg]:size-[1.15rem] sm:[&_svg]:size-5"

export function HeaderAnalyticsDrawer() {
  const [open, setOpen] = React.useState(false)
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
    <Drawer direction="bottom" open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={iconBtn}
          aria-label="全站访问趋势"
        >
          <LineChartIcon />
        </Button>
      </DrawerTrigger>
      <DrawerContent className="mx-auto w-full max-w-6xl border-0 bg-transparent">
        <div className="rounded-2xl border border-border/60 bg-popover px-0 shadow-lg">
          <DrawerHeader className="text-left">
            <DrawerTitle className="text-base font-semibold">
              全站 PV & UV 趋势
            </DrawerTitle>
          </DrawerHeader>
          <div className="px-4 pb-2">
            {loading ? (
              <div className="flex h-[220px] items-center justify-center text-sm text-muted-foreground">
                加载中…
              </div>
            ) : showConfigureHint ? (
              <div className="flex min-h-[180px] flex-col justify-center gap-2 text-sm text-muted-foreground">
                <p>
                  统计未配置：请在服务端配置 Supabase 与有效的
                  service_role。
                </p>
              </div>
            ) : showGenericError ? (
              <div className="flex min-h-[180px] items-center text-sm text-muted-foreground">
                趋势数据暂时无法加载，请稍后重试。
              </div>
            ) : (
              <ChartContainer
                config={chartConfig}
                className="aspect-auto h-[260px] w-full [&>div]:h-full"
              >
                <LineChart
                  data={series}
                  margin={{ left: 4, right: 12, top: 8, bottom: 4 }}
                  accessibilityLayer
                >
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="label"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    width={36}
                    allowDecimals={false}
                  />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent indicator="line" />}
                  />
                  <Line
                    type="monotone"
                    dataKey="pv"
                    stroke="var(--color-pv)"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="uv"
                    stroke="var(--color-uv)"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ChartContainer>
            )}
          </div>
          <DrawerFooter className="flex-row justify-end gap-2 pt-0">
            <DrawerClose asChild>
              <Button type="button" variant="secondary">
                关闭
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
