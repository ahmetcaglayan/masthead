import { memo, useMemo, useState } from 'react'
import { ArrowRight, ChevronDown } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { Article } from '@shared/types'
import { Button } from '@/components/ui/Button'
import { SourceLogo } from '@/components/ui/SourceLogo'
import { useNowSelect } from '@/hooks/useNow'
import { useSource } from '@/hooks/useSources'
import { useLanguage } from '@/i18n'
import { tameCaps } from '@/lib/format'
import { isBreakingNews } from '@/lib/headline'
import { clock, dayLabel, startOfDay } from '@/lib/time'
import { cn } from '@/lib/cn'
import { useLibrary } from '@/stores/library'
import { openArticle } from './actions'
import { firstSentence, startOfHour } from './utils'

interface HourGroup {
  hour: number
  articles: Article[]
}

function groupByHour(articles: readonly Article[]): HourGroup[] {
  const groups: HourGroup[] = []
  for (const article of articles) {
    const hour = startOfHour(article.publishedAt)
    const last = groups[groups.length - 1]
    if (last && last.hour === hour) last.articles.push(article)
    else groups.push({ hour, articles: [article] })
  }
  return groups
}

const TimelineItem = memo(function TimelineItem({
  article,
  queue,
  showSummary
}: {
  article: Article
  queue: readonly string[]
  showSummary: boolean
}): React.JSX.Element {
  const lang = useLanguage()
  const source = useSource(article.sourceId)
  const read = useLibrary((s) => s.readIds.has(article.id))
  const lede = showSummary ? firstSentence(article.summary) : ''
  const breaking = isBreakingNews(article)
  const title = tameCaps(article.title)

  return (
    <li data-article-id={article.id}>
      <button
        type="button"
        onClick={() => openArticle(article, queue)}
        // The row runs the full width of its column, so the focus ring goes inside it: an
        // outline drawn outside would be clipped on the left.
        className="group/item grid w-full grid-cols-[2.75rem_minmax(0,1fr)] gap-x-3 rounded-lg text-left focus-visible:[outline-offset:-2px]"
      >
        <time
          dateTime={new Date(article.publishedAt).toISOString()}
          className={cn(
            'pt-3 text-right font-ui text-[12.5px] font-semibold tabular-nums',
            breaking ? 'text-breaking' : 'text-fg-muted'
          )}
        >
          {clock(article.publishedAt, lang)}
        </time>
        <span
          className={cn(
            'relative block py-2.5 pl-4 in-data-[density=compact]:py-2',
            // Breaking news gets a thicker crimson segment of the rail.
            breaking ? '-ml-px border-l-2 border-l-breaking' : 'border-l border-line'
          )}
        >
          <span
            aria-hidden
            className={cn(
              'absolute top-[1.05rem] size-2 rounded-full ring-4 ring-canvas transition-colors duration-150',
              breaking ? '-left-[5px] bg-breaking' : '-left-[4.5px] bg-line-strong group-hover/item:bg-accent'
            )}
          />
          <span className="flex items-center gap-1.5 font-ui text-[12px] text-fg-muted">
            <SourceLogo source={source} size="xs" />
            <span className="font-semibold">{source?.name ?? article.sourceId}</span>
          </span>
          <span
            lang="tr"
            className={cn(
              'headline mt-1 block text-[15.5px] leading-snug font-medium text-pretty decoration-line-strong underline-offset-4 group-hover/item:underline',
              read ? 'text-fg-muted' : 'text-fg'
            )}
          >
            {title}
          </span>
          {lede && lede !== article.title && (
            <span
              lang="tr"
              className="mt-1 block font-ui text-[13px] leading-relaxed text-fg-muted text-pretty"
            >
              {lede}
            </span>
          )}
        </span>
      </button>
    </li>
  )
})

export interface LatestTimelineProps {
  /** Articles, newest first. */
  articles: readonly Article[]
  /** Items shown before "Show more". Default 20. */
  initialCount?: number
  /** Items added per "Show more". Default 20. */
  step?: number
  /** Show each summary's first sentence under the headline. Default true. */
  showSummary?: boolean
  /** Offer a "See all" link (e.g. to the Latest page). */
  onSeeAll?: () => void
  className?: string
}

/**
 * A vertical timeline of the newest stories grouped by hour: clock time, source
 * logo, full headline and the summary's first sentence, with "Show more".
 */
export function LatestTimeline({
  articles,
  initialCount = 20,
  step = 20,
  showSummary = true,
  onSeeAll,
  className
}: LatestTimelineProps): React.JSX.Element {
  const { t, i18n } = useTranslation('news')
  const today = useNowSelect(60_000, startOfDay)
  const [count, setCount] = useState(initialCount)
  const visible = useMemo(() => articles.slice(0, count), [articles, count])
  const groups = useMemo(() => groupByHour(visible), [visible])
  const queue = useMemo(() => articles.map((a) => a.id), [articles])

  return (
    <div className={className}>
      <ol className="flex flex-col">
        {groups.map((group) => (
          <li key={group.hour}>
            <h3 className="grid grid-cols-[2.75rem_minmax(0,1fr)] gap-x-3 font-ui text-[11px] font-semibold tracking-wider text-fg-subtle uppercase">
              <span />
              <span className="relative border-l border-line pt-3 pb-1 pl-4">
                {startOfDay(group.hour) === today
                  ? clock(group.hour, i18n.language)
                  : `${dayLabel(group.hour, i18n.language, today)} · ${clock(group.hour, i18n.language)}`}
              </span>
            </h3>
            <ol>
              {group.articles.map((article) => (
                <TimelineItem key={article.id} article={article} queue={queue} showSummary={showSummary} />
              ))}
            </ol>
          </li>
        ))}
      </ol>
      {(count < articles.length || onSeeAll) && (
        <div className="mt-3 flex flex-wrap items-center gap-2 pl-[3.5rem]">
          {count < articles.length && (
            <Button
              variant="secondary"
              size="sm"
              iconRight={ChevronDown}
              onClick={() => setCount((c) => c + step)}
            >
              {t('timeline.showMore')}
            </Button>
          )}
          {onSeeAll && (
            <Button variant="ghost" size="sm" iconRight={ArrowRight} onClick={onSeeAll}>
              {t('common:actions.seeAll')}
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
