import { ArticleBand } from "@/components/home/article-band"
import { ParticleScroll } from "@/components/home/particle-scroll"
import { WorkBand } from "@/components/home/work-band"
import { SITE_HEADER_OFFSET } from "@/lib/site-header-offset"
import { cn } from "@/lib/utils"

export type HomeSectionCard = {
  href: string
  label: string
  lead: string
  count: number
  latestTitle: string | null
}

export function HomeShelf({ sections }: { sections: HomeSectionCard[] }) {
  return (
    <div
      className={cn(
        "relative left-1/2 w-screen max-w-[100vw] -translate-x-1/2",
        "-mb-16 sm:-mb-20",
      )}
    >
      <section
        id="articles"
        aria-labelledby="home-articles-heading"
        className={cn(
          "flex min-h-svh flex-col bg-background text-foreground",
          SITE_HEADER_OFFSET.anchorScrollMargin,
        )}
      >
        <ParticleScroll className="flex min-h-svh flex-1 flex-col">
          <div className="mx-auto flex min-h-svh w-full max-w-6xl flex-1 flex-col px-4 py-14 sm:px-6 sm:py-16">
            <ArticleBand sections={sections} />
          </div>
        </ParticleScroll>
      </section>

      <section
        id="works"
        aria-labelledby="home-works-heading"
        data-home-ink=""
        className={cn(
          "flex flex-col bg-foreground text-background md:min-h-svh",
          SITE_HEADER_OFFSET.anchorScrollMargin,
        )}
      >
        <ParticleScroll className="flex flex-1 flex-col md:min-h-svh">
          <WorkBand />
        </ParticleScroll>
      </section>
    </div>
  )
}
