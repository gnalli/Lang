import Link from "next/link"
import type { Metadata } from "next"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

/** 与 layout 中 body pt-16、页脚高度大致对齐，避免整页出现滚动条 */
const MAIN_HEIGHT =
    "min-h-0 h-[calc(100svh-4rem-11rem)] max-h-[calc(100svh-4rem-11rem)] sm:h-[calc(100svh-4rem-10.5rem)] sm:max-h-[calc(100svh-4rem-10.5rem)]"

export const metadata: Metadata = {
    title: "页面未找到",
    description: "请求的页面不存在或链接已失效。",
    robots: { index: false, follow: true },
}

export default function NotFound() {
    return (
        <main
            id="not-found"
            className={cn(
                "mx-auto flex w-full max-w-3xl flex-col items-center justify-center overflow-hidden",
                MAIN_HEIGHT,
                "px-1 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 sm:px-2 sm:pt-4",
            )}
        >
            <div
                className={cn(
                    "flex min-h-0 w-full max-w-[min(100%,22rem)] flex-col items-center justify-center",
                    "gap-4 sm:max-w-2xl sm:gap-9",
                )}
            >
                <div
                    className={cn(
                        "w-full shrink-0 rounded-2xl border border-border/60 bg-black/90 px-4 py-3 shadow-sm",
                        "ring-1 ring-border/30 dark:bg-muted sm:px-7 sm:py-5",
                    )}
                >
                    {/*
                      用背景图而非<img>，避免部分环境下对大图产生link preload却未立刻参与绘制的控制台警告
                    */}
                    <div
                        className={cn(
                            "mx-auto flex w-full justify-center",
                            "h-[min(26svh,11rem)] sm:h-[min(30svh,24rem)]",
                        )}
                    >
                        <div
                            className="h-full w-full bg-contain bg-center bg-no-repeat"
                            style={{ backgroundImage: "url(/404.png)" }}
                            role="img"
                            aria-hidden
                        />
                    </div>
                </div>

                <header className="w-full shrink text-center">
                    <h1
                        className={cn(
                            "text-balance text-lg font-semibold tracking-tight text-foreground",
                            "sm:text-3xl sm:font-bold sm:leading-tight",
                        )}
                    >
                        找不到这个页面
                    </h1>
                    <p
                        className={cn(
                            "mx-auto mt-2 max-w-88 text-pretty text-xs leading-relaxed text-muted-foreground",
                            "sm:mt-4 sm:max-w-lg sm:text-base sm:leading-relaxed",
                        )}
                    >
                        链接可能已失效或地址有误。你可以返回首页，或在存档中浏览全部文章。
                    </p>
                </header>

                <div
                    className={cn(
                        "flex w-full max-w-xs shrink-0 flex-col gap-2.5 sm:max-w-none sm:flex-row sm:justify-center sm:gap-4",
                    )}
                >
                    <Button
                        asChild
                        size="default"
                        className="min-h-11 w-full touch-manipulation sm:min-h-9 sm:w-auto"
                    >
                        <Link href="/">返回首页</Link>
                    </Button>
                    <Button
                        asChild
                        variant="outline"
                        size="default"
                        className="min-h-11 w-full touch-manipulation sm:min-h-9 sm:w-auto"
                    >
                        <Link href="/archive">存档文章</Link>
                    </Button>
                </div>
            </div>
        </main>
    )
}
