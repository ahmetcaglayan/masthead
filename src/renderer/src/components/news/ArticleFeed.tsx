import { memo, useMemo } from 'react'
import { ChevronDown, Clock3 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { CardStyle } from '@shared/settings'
import type { Article } from '@shared/types'
import { Button } from '@/components/ui/Button'
import { useNowSelect } from '@/hooks/useNow'
import { useProgressive } from '@/hooks/useProgressive'
import { useLanguage } from '@/i18n'
import { formatNumber } from '@/lib/format'
import { isBreakingNews } from '@/lib/headline'
import { clock, dayLabel, startOfDay } from '@/lib/time'
import { cn } from '@/lib/cn'
import { useSettings } from '@/stores/settings'
import { ArticleCard, type ArticleCardProps } from './ArticleCard'
import { usePaged } from './usePaged'
import { startOfHour } from './utils'

export type FeedGrouping = 'none' | 'day' | 'hour'

/** A card style, or `timeline`: clock times in a gutter beside a rail, for minute-by-minute pages. */
export type FeedLayout = CardStyle | 'timeline'

/** Card options passed through to every card of the feed. */
type CardOptions = Pick<
  ArticleCardProps,
  'highlight' | 'breakingOnly' | 'hideBreaking' | 'dimRead' | 'showProvince'
>

interface Group {
  key: number
  articles: Article[]
}

interface DayGroup extends Group {
  hours: Group[]
}

/** Consecutive runs of articles sharing a key (the list is chronological). */
function runs(articles: readonly Article[], keyOf: (a: Article) => number): Group[] {
  const groups: Group[] = []
  for (const article of articles) {
    const key = keyOf(article)
    const last = groups[groups.length - 1]
    if (last && last.key === key) last.articles.push(article)
    else groups.push({ key, articles: [article] })
  }
  return groups
}

function group(articles: readonly Article[], by: FeedGrouping): DayGroup[] {
  if (by === 'none')
    return [{ key: 0, articles: [...articles], hours: [{ key: 0, articles: [...articles] }] }]
  return runs(articles, (a) => startOfDay(a.publishedAt)).map((day) => ({
    ...day,
    hours: by === 'hour' ? runs(day.articles, (a) => startOfHour(a.publishedAt)) : [day]
  }))
}

/** Which magazine blocks open with a two-column feature. */
type Features = 'all' | 'first' | 'none'

interface BlockProps extends CardOptions {
  articles: readonly Article[]
  layout: FeedLayout
  queue: readonly string[]
  features: Features
}

/**
 * Magazine rhythm: blocks of five, a two-column feature beside a card, then
 * three cards; sides alternate. In hour-grouped feeds only the feed's first
 * block gets a feature, so every hour does not open with a big photo.
 */
function MagazineBlock({
  articles,
  queue,
  features,
  ...card
}: Omit<BlockProps, 'layout'>): React.JSX.Element {
  const blocks: Article[][] = []
  for (let i = 0; i < articles.length; i += 5) blocks.push(articles.slice(i, i + 5))
  return (
    <div className="flex flex-col gap-12 in-data-[density=compact]:gap-9">
      {blocks.map((block, b) => {
        const featured = features === 'all' || (features === 'first' && b === 0)
        return (
          <div
            key={block[0].id}
            className="grid gap-x-8 gap-y-12 md:grid-cols-2 lg:grid-cols-3 in-data-[density=compact]:gap-y-9"
          >
            {block.map((article, i) => {
              const feature = featured && i === 0 && block.length > 1
              return (
                <ArticleCard
                  key={article.id}
                  article={article}
                  variant={feature ? 'feature' : 'standard'}
                  queue={queue}
                  {...card}
                  className={cn(
                    feature && 'md:col-span-2',
                    feature && b % 2 === 1 && 'lg:col-start-2',
                    featured && i === 1 && b % 2 === 1 && 'lg:col-start-1 lg:row-start-1'
                  )}
                />
              )
            })}
          </div>
        )
      })}
    </div>
  )
}

/** One timeline entry: the clock time in the gutter, a dot on the rail, the story beside it. */
const TimelineEntry = memo(function TimelineEntry({
  article,
  queue,
  ...card
}: CardOptions & { article: Article; queue: readonly string[] }): React.JSX.Element {
  const lang = useLanguage()
  // On the Breaking page (`hideBreaking`) every entry is breaking: no need to mark each one.
  const breaking = !card.hideBreaking && isBreakingNews(article)
  return (
    <li className="group/item grid grid-cols-[3.5rem_minmax(0,1fr)] gap-x-4">
      <time
        dateTime={new Date(article.publishedAt).toISOString()}
        className={cn(
          'pt-0.5 text-right font-ui text-[13px] font-semibold tabular-nums',
          breaking ? 'text-breaking' : 'text-fg-muted'
        )}
      >
        {clock(article.publishedAt, lang)}
      </time>
      <div
        className={cn(
          'relative min-w-0 pb-9 pl-6 in-data-[density=compact]:pb-6',
          // The rail; breaking news gets a thicker crimson segment.
          breaking ? '-ml-px border-l-2 border-l-breaking' : 'border-l border-line'
        )}
      >
        <span
          aria-hidden
          className={cn(
            'absolute top-[0.45rem] size-2 rounded-full ring-4 ring-canvas transition-colors duration-150',
            breaking ? '-left-[5px] bg-breaking' : '-left-[4.5px] bg-line-strong group-hover/item:bg-accent'
          )}
        />
        <ArticleCard article={article} variant="timeline" queue={queue} {...card} />
      </div>
    </li>
  )
})

function FeedBlock({ layout, articles, queue, features, ...card }: BlockProps): React.JSX.Element {
  if (layout === 'magazine')
    return <MagazineBlock articles={articles} queue={queue} features={features} {...card} />
  if (layout === 'timeline') {
    return (
      <ol className="flex max-w-4xl flex-col">
        {articles.map((article) => (
          <TimelineEntry key={article.id} article={article} queue={queue} {...card} />
        ))}
      </ol>
    )
  }
  if (layout === 'grid') {
    return (
      <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 xl:grid-cols-3 in-data-[density=compact]:gap-y-8">
        {articles.map((article) => (
          <ArticleCard
            key={article.id}
            article={article}
            variant="standard"
            clampSummary={4}
            queue={queue}
            {...card}
          />
        ))}
      </div>
    )
  }
  return (
    <ul className="flex max-w-4xl flex-col divide-y divide-line">
      {articles.map((article) => (
        <li key={article.id} className="py-6 first:pt-0 last:pb-0 in-data-[density=compact]:py-4">
          <ArticleCard article={article} variant="row" queue={queue} {...card} />
        </li>
      ))}
    </ul>
  )
}

/**
 * A sticky hour rule: the clock icon, the hour (with the day when it is not
 * today) and a hairline. Sticks below the page's filter bar, whose height it
 * reads from `--feed-sticky-top` (set by FilterBar).
 */
function HourRule({
  hour,
  today,
  tone
}: {
  hour: number
  today: number
  tone: 'accent' | 'breaking'
}): React.JSX.Element {
  const lang = useLanguage()
  const label =
    startOfDay(hour) === today ? clock(hour, lang) : `${dayLabel(hour, lang, today)} · ${clock(hour, lang)}`
  return (
    <h3 className="sticky top-[var(--feed-sticky-top,0px)] z-10 mb-4 flex items-center gap-2.5 bg-canvas/90 py-2 font-ui text-[13px] font-semibold text-fg tabular-nums backdrop-blur">
      <Clock3
        size={15}
        strokeWidth={2}
        aria-hidden
        className={tone === 'breaking' ? 'text-breaking' : 'text-accent'}
      />
      {label}
      <span aria-hidden className="h-px flex-1 bg-line" />
    </h3>
  )
}

export interface ArticleFeedProps extends CardOptions {
  /** Articles in display order. */
  articles: readonly Article[]
  /** Card layout; defaults to the user's card style setting. */
  layout?: FeedLayout
  /** Day or day + hour headings, for chronological lists. Default `none`. */
  groupBy?: FeedGrouping
  /** Colour of the hour rules' clock: crimson on the Breaking page. Default `accent`. */
  tone?: 'accent' | 'breaking'
  /** Cards per page (more load as the reader nears the end). Default 40. */
  pageSize?: number
  /** Cards in the first frame; the rest of a page follows in slices of this size. Default 10. */
  firstPaint?: number
  /** Start again from the first page when this changes (e.g. the filters). */
  resetKey?: unknown
  className?: string
}

/**
 * A long list of articles in the user's card style — magazine (mixed feature
 * and standard cards), grid (uniform cards, summaries clamped) or list (rows) —
 * or as a timeline, rendered a page at a time as the reader scrolls, optionally
 * with day and sticky hour headings. Each page is built in small slices after
 * the first frame, so opening a feed never renders dozens of heavy cards in one
 * task.
 */
export function ArticleFeed({
  articles,
  layout,
  groupBy = 'none',
  tone = 'accent',
  pageSize = 40,
  firstPaint = 10,
  resetKey,
  className,
  ...card
}: ArticleFeedProps): React.JSX.Element {
  const { t, i18n } = useTranslation('news')
  const cardStyle = useSettings((s) => s.settings.layout.cardStyle)
  const style = layout ?? cardStyle
  // Day headings only change at midnight.
  const today = useNowSelect(60_000, startOfDay)
  const { limit, hasMore, more, sentinelRef } = usePaged(articles.length, pageSize, resetKey)
  const pageEnd = Math.min(limit, articles.length)
  const rendered = useProgressive(pageEnd, firstPaint, firstPaint, resetKey)
  const queue = useMemo(() => articles.map((a) => a.id), [articles])
  const days = useMemo(() => group(articles.slice(0, rendered), groupBy), [articles, rendered, groupBy])
  const lang = i18n.language

  return (
    <div className={className}>
      <div className="flex flex-col gap-14 in-data-[density=compact]:gap-10">
        {days.map((day, d) => (
          <section key={day.key} aria-label={groupBy === 'none' ? undefined : dayLabel(day.key, lang, today)}>
            {groupBy !== 'none' && (
              <div className="mb-6 flex items-baseline gap-4">
                <h2 className="headline text-2xl font-semibold text-fg">{dayLabel(day.key, lang, today)}</h2>
                <span aria-hidden className="h-px flex-1 bg-line" />
              </div>
            )}
            <div
              className={cn(
                'flex flex-col',
                style === 'timeline' ? 'gap-4' : 'gap-10 in-data-[density=compact]:gap-8'
              )}
            >
              {day.hours.map((hour, h) => (
                <div key={hour.key}>
                  {groupBy === 'hour' && <HourRule hour={hour.key} today={today} tone={tone} />}
                  <FeedBlock
                    layout={style}
                    articles={hour.articles}
                    queue={queue}
                    features={groupBy !== 'hour' ? 'all' : d === 0 && h === 0 ? 'first' : 'none'}
                    {...card}
                  />
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

      {rendered < pageEnd ? (
        // Room for the cards still being added, so the page does not jump while it fills in.
        <div aria-hidden style={{ height: `${(pageEnd - rendered) * 6}rem` }} />
      ) : hasMore ? (
        <div ref={sentinelRef} className="mt-12 flex justify-center">
          <Button variant="outline" iconRight={ChevronDown} onClick={more}>
            {t('feed.loadMore', {
              shown: formatNumber(limit, lang),
              total: formatNumber(articles.length, lang)
            })}
          </Button>
        </div>
      ) : (
        articles.length > pageSize && (
          <p className="mt-12 text-center font-ui text-[13px] text-fg-subtle">{t('feed.end')}</p>
        )
      )}
    </div>
  )
}
