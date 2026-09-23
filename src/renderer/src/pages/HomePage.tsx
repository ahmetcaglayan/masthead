import { useDeferredValue, useMemo } from 'react'
import { ArrowRight, Clock3, Layers } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { Article } from '@shared/types'
import { Page } from '@/components/layout/Page'
import { ArticleCard } from '@/components/news/ArticleCard'
import { BreakingTicker } from '@/components/news/BreakingTicker'
import { CategorySection } from '@/components/news/CategorySection'
import { ClusterCard } from '@/components/news/ClusterCard'
import { LatestTimeline } from '@/components/news/LatestTimeline'
import { HomeSkeleton, NewsGate } from '@/components/news/NewsGate'
import { Button } from '@/components/ui/Button'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { WeatherEar } from '@/features/weather/WeatherEar'
import { useNewsView } from '@/hooks/useArticles'
import { useNow, useNowSelect } from '@/hooks/useNow'
import { useProgressive } from '@/hooks/useProgressive'
import { localeFor } from '@/i18n'
import { buildDigest, buildHome } from '@/lib/curation'
import { formatNumber } from '@/lib/format'
import { startOfDay } from '@/lib/time'
import type { NewsView } from '@/stores/news'
import { useSettings } from '@/stores/settings'
import { useUi } from '@/stores/ui'

/** Clusters shown in the "Gündem Özeti" teaser. */
const DIGEST_TEASER = 2
/** Curation is re-run at most this often while the snapshot stays the same. */
const CURATION_TICK = 5 * 60_000

/** Keeps the page about as tall as it will be while topic sections are still being added below the fold. */
function SectionsPlaceholder({ count }: { count: number }): React.JSX.Element {
  return <div aria-hidden style={{ height: `${count * 48}rem` }} />
}

const datelineFormats = new Map<string, Intl.DateTimeFormat>()

/** Today's date as a newspaper dateline over a double rule, the weather (if on) and how much news there is. */
function Dateline({ view }: { view: NewsView }): React.JSX.Element {
  const { t, i18n } = useTranslation('news')
  const today = useNowSelect(60_000, startOfDay)
  let format = datelineFormats.get(i18n.language)
  if (!format) {
    format = new Intl.DateTimeFormat(localeFor(i18n.language), {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
    datelineFormats.set(i18n.language, format)
  }
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b-[3px] border-double border-line-strong pb-3">
      <p className="headline text-2xl font-semibold text-fg first-letter:uppercase">{format.format(today)}</p>
      <div className="flex flex-wrap items-center gap-x-5 gap-y-1">
        <WeatherEar />
        <p className="font-ui text-[12.5px] text-fg-subtle tabular-nums">
          {t('home.dateline', {
            stories: formatNumber(view.articles.length, i18n.language),
            count: view.bySource.size
          })}
        </p>
      </div>
    </div>
  )
}

/** The small uppercase label that opens a front-page column, so the columns' tops line up. */
function ColumnLabel({
  id,
  icon: Icon,
  action,
  children
}: {
  id?: string
  icon?: typeof Clock3
  action?: React.ReactNode
  children: React.ReactNode
}): React.JSX.Element {
  return (
    <div className="mb-3 flex h-7 items-center justify-between gap-3">
      <h2
        id={id}
        className="flex items-center gap-1.5 font-ui text-[11px] font-semibold tracking-wider text-fg-subtle uppercase"
      >
        {Icon && <Icon size={13} strokeWidth={2} aria-hidden />}
        {children}
      </h2>
      {action}
    </div>
  )
}

function FrontPage(): React.JSX.Element {
  const { t } = useTranslation('news')
  const interests = useSettings((s) => s.settings.interests)
  // A refresh re-lays out the page in the background instead of blocking the reader.
  const view = useDeferredValue(useNewsView())
  const now = useDeferredValue(useNow(CURATION_TICK))

  // Both are cached per snapshot, source selection, interests and clock tick (see lib/curation).
  const home = useMemo(() => buildHome(view, { interests }, now), [view, interests, now])
  const digest = useMemo(() => {
    const onPage = new Set([home.hero?.cluster?.id, ...home.secondary.map((a) => a.clusterId)])
    return buildDigest(view, now)
      .filter((story) => story.sourceCount >= 2 && !onPage.has(story.id))
      .slice(0, DIGEST_TEASER)
  }, [view, now, home])
  const topQueue = useMemo(
    () => [...(home.hero ? [home.hero.lead.id] : []), ...home.secondary.map((a) => a.id)],
    [home]
  )
  const updatedAt = (article: Article): number | undefined =>
    article.clusterId ? view.clustersById.get(article.clusterId)?.updatedAt : undefined
  const seeLatest = (): void => useUi.getState().navigate({ name: 'latest' })
  // The top stories paint first; the Latest column, digest teaser and topic sections follow one by one.
  const stage = useProgressive(home.sections.length + 1, 0, 1)
  const sections = home.sections.slice(0, Math.max(0, stage - 1))
  const pendingSections = home.sections.length - sections.length

  return (
    <div className="flex flex-col gap-8 in-data-[density=compact]:gap-6">
      <div className="flex flex-col gap-6 in-data-[density=compact]:gap-4">
        <Dateline view={view} />
        <BreakingTicker articles={home.breaking} />
      </div>

      {/* The manşet with "Son Haberler" beside it (PLAN §3.2); topics continue under the manşet. */}
      <div className="grid gap-x-12 gap-y-14 xl:grid-cols-[minmax(0,1fr)_340px] in-data-[density=compact]:gap-y-10">
        <section aria-labelledby="home-top" className="min-w-0 xl:col-start-1 xl:row-start-1">
          <ColumnLabel id="home-top">{t('home.topStories')}</ColumnLabel>
          {home.hero && (
            <ArticleCard
              article={home.hero.lead}
              variant="hero"
              related={home.hero.related}
              sourceCount={home.hero.sourceCount}
              updatedAt={home.hero.updatedAt}
              queue={topQueue}
              priority
              showProvince
            />
          )}
          {home.secondary.length > 0 && (
            <div className="mt-10 in-data-[density=compact]:mt-8">
              <ColumnLabel>{t('home.moreTopStories')}</ColumnLabel>
              <div className="grid gap-x-6 gap-y-10 md:grid-cols-3">
                {home.secondary.map((article) => (
                  <ArticleCard
                    key={article.id}
                    article={article}
                    variant="standard"
                    updatedAt={updatedAt(article)}
                    maxSentences={2}
                    queue={topQueue}
                  />
                ))}
              </div>
            </div>
          )}
        </section>

        {stage > 0 && (
          <aside
            aria-labelledby="home-latest"
            className="min-w-0 xl:sticky xl:top-6 xl:col-start-2 xl:row-span-2 xl:row-start-1 xl:max-h-[calc(100vh-var(--titlebar-height)-3rem)] xl:self-start xl:overflow-x-hidden xl:overflow-y-auto xl:overscroll-contain xl:pr-1 xl:[&::-webkit-scrollbar-thumb]:bg-transparent xl:hover:[&::-webkit-scrollbar-thumb]:bg-line-strong"
          >
            <ColumnLabel
              id="home-latest"
              icon={Clock3}
              action={
                <Button
                  variant="ghost"
                  size="sm"
                  iconRight={ArrowRight}
                  onClick={seeLatest}
                  className="-mr-2"
                >
                  {t('common:actions.seeAll')}
                </Button>
              }
            >
              {t('latest.title')}
            </ColumnLabel>
            {/* Headlines only, like a wire: about eight fit beside the manşet. */}
            <LatestTimeline
              articles={home.latest}
              initialCount={15}
              step={15}
              showSummary={false}
              onSeeAll={seeLatest}
            />
          </aside>
        )}

        {stage > 0 && (
          <div className="flex min-w-0 flex-col gap-14 xl:col-start-1 xl:row-start-2 in-data-[density=compact]:gap-10">
            {digest.length > 0 && (
              <section aria-labelledby="home-digest">
                <SectionHeader
                  id="home-digest"
                  kicker={t('home.digestKicker')}
                  title={t('digest.title')}
                  icon={Layers}
                  description={t('home.digestDescription')}
                  action={
                    <Button
                      variant="ghost"
                      size="sm"
                      iconRight={ArrowRight}
                      onClick={() => useUi.getState().navigate({ name: 'digest' })}
                    >
                      {t('home.digestAll')}
                    </Button>
                  }
                />
                <div className="mt-6 grid gap-6 md:grid-cols-2">
                  {digest.map((story) => (
                    <ClusterCard key={story.id} story={story} variant="compact" />
                  ))}
                </div>
              </section>
            )}
            {sections.map((section) => (
              <CategorySection
                key={section.category}
                category={section.category}
                articles={section.articles}
              />
            ))}
            {pendingSections > 0 && <SectionsPlaceholder count={pendingSections} />}
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * The front page: dateline and breaking ticker, then the manşet and the next
 * top stories beside a live "Son Haberler" column, then a "Gündem Özeti"
 * teaser and topic sections.
 */
export function HomePage(): React.JSX.Element {
  return (
    <Page>
      <NewsGate skeleton={<HomeSkeleton />}>
        <FrontPage />
      </NewsGate>
    </Page>
  )
}
