import { memo, useMemo, useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { getSource } from '@shared/countries'
import type { Article } from '@shared/types'
import { ArticleImage } from '@/components/ui/ArticleImage'
import { SourceLogo } from '@/components/ui/SourceLogo'
import { useSource } from '@/hooks/useSources'
import type { DigestStory } from '@/lib/curation'
import { tameCaps } from '@/lib/format'
import { cn } from '@/lib/cn'
import { useLibrary } from '@/stores/library'
import { useSettings } from '@/stores/settings'
import { openArticle, openStory } from './actions'
import { ArticleKicker } from './ArticleKicker'
import { ArticleMeta, RelativeTime } from './ArticleMeta'
import { CardActions } from './CardActions'
import { CardTitle } from './CardTitle'
import { ExpandableSummary } from './ExpandableSummary'
import { ReportRow } from './ReportRow'
import { CARD_FOCUS_RING } from './utils'

/** Reports listed before "+N more sources" on the digest's top cards. */
const OTHERS_SHOWN = 4
/** Other outlets' headlines on the dense list cards and the home teaser. */
const OTHERS_INLINE = 3

/** Logos of the first few sources of a story, side by side so each outlet stays recognisable. */
export function SourceStack({
  articles,
  max = 4,
  className
}: {
  articles: readonly Article[]
  max?: number
  className?: string
}): React.JSX.Element {
  const country = useSettings((s) => s.settings.country)
  return (
    <span aria-hidden className={cn('flex gap-1', className)}>
      {articles.slice(0, max).map((a) => (
        <SourceLogo key={a.id} source={getSource(country, a.sourceId)} size="sm" />
      ))}
    </span>
  )
}

/** "+N more sources" / "Show less" under a story's other headlines. */
function MoreToggle({
  open,
  hidden,
  onToggle
}: {
  open: boolean
  hidden: number
  onToggle: () => void
}): React.JSX.Element {
  const { t } = useTranslation('news')
  return (
    <button
      type="button"
      aria-expanded={open}
      onClick={onToggle}
      className="relative z-10 mt-2 inline-flex items-center gap-1 self-start rounded-md font-ui text-[13px] font-semibold text-accent-ink transition-colors duration-150 hover:text-accent-hover"
    >
      {open ? t('common:actions.showLess') : t('cluster.moreSources', { count: hidden })}
      {open ? (
        <ChevronUp size={15} strokeWidth={2} aria-hidden />
      ) : (
        <ChevronDown size={15} strokeWidth={2} aria-hidden />
      )}
    </button>
  )
}

export interface ClusterCardProps {
  story: DigestStory
  /**
   * `full` for the digest's top stories, `list` for the denser rows below them,
   * `compact` for the home-page teaser.
   */
  variant?: 'full' | 'list' | 'compact'
  /** 1-based position in the digest, shown as a numeral. */
  rank?: number
  className?: string
}

/**
 * One story as several outlets told it: the lead report (image, headline,
 * summary), "Covered by N sources", and every other source's own headline,
 * each opening that source's article.
 */
export const ClusterCard = memo(function ClusterCard({
  story,
  variant = 'full',
  rank,
  className
}: ClusterCardProps): React.JSX.Element {
  const { t } = useTranslation('news')
  const { lead, others, sourceCount } = story
  const [showAll, setShowAll] = useState(false)
  const queue = useMemo(() => [lead.id, ...others.map((a) => a.id)], [lead, others])
  const read = useLibrary((s) => s.readIds.has(lead.id))
  const reporters = useMemo(() => [lead, ...others], [lead, others])
  const titleTone = read ? 'text-fg-muted' : 'text-fg'

  // Raised above the stretched headline link: it opens the story page, every outlet side by side.
  const coverage = (
    <button
      type="button"
      title={t('meta.compare', { count: sourceCount })}
      onClick={() => openStory(story.cluster.id)}
      className="group/coverage relative z-10 flex items-center gap-2 rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
    >
      <SourceStack articles={reporters} />
      <span className="font-ui text-[11px] font-semibold tracking-wider text-fg-muted uppercase decoration-line-strong underline-offset-4 group-hover/coverage:text-accent-ink group-hover/coverage:underline">
        {t('cluster.coveredBy', { count: sourceCount })}
      </span>
    </button>
  )
  const labels = (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
      {sourceCount > 1 && coverage}
      <ArticleKicker article={lead} />
    </div>
  )
  const rankBadge = rank !== undefined && (
    <span className="headline absolute top-3 left-3 flex size-9 items-center justify-center rounded-full bg-glass text-lg font-semibold text-fg tabular-nums shadow-soft backdrop-blur-md">
      {rank}
    </span>
  )

  if (variant === 'compact') {
    return (
      <article
        data-article-id={lead.id}
        className={cn(
          'group/card group relative flex flex-col overflow-hidden rounded-panel border border-line bg-surface shadow-soft transition-shadow duration-200 hover:shadow-card',
          CARD_FOCUS_RING,
          className
        )}
      >
        <ArticleImage article={lead} className="aspect-[16/9]" />
        <div className="flex flex-1 flex-col gap-2.5 p-5 in-data-[density=compact]:p-4">
          {labels}
          <CardTitle
            article={lead}
            queue={queue}
            className={cn('text-[1.2rem] leading-[1.28] font-semibold', titleTone)}
          />
          <ExpandableSummary article={lead} size="sm" queue={queue} allowDetail={false} maxSentences={2} />
          <p className="font-ui text-[12px] text-fg-subtle">
            <RelativeTime ts={story.updatedAt} updated />
          </p>
          {others.length > 0 && (
            <ul className="mt-auto space-y-2 border-t border-line pt-3">
              {others.slice(0, OTHERS_INLINE).map((a) => (
                <OtherHeadline key={a.id} article={a} queue={queue} />
              ))}
            </ul>
          )}
        </div>
      </article>
    )
  }

  if (variant === 'list') {
    const shown = showAll ? others : others.slice(0, OTHERS_INLINE)
    const hidden = others.length - OTHERS_INLINE
    return (
      <article
        data-article-id={lead.id}
        className={cn(
          'group/card group rounded-panel border border-line bg-surface p-5 shadow-soft in-data-[density=compact]:p-4',
          className
        )}
      >
        <div
          className={cn(
            'relative grid gap-5 rounded-card sm:grid-cols-[12rem_minmax(0,1fr)]',
            CARD_FOCUS_RING
          )}
        >
          <div className="relative self-start">
            <ArticleImage article={lead} className="aspect-[16/9] rounded-card" logoSize="lg" />
            {rankBadge}
          </div>
          <div className="flex min-w-0 flex-col gap-2">
            {labels}
            <CardTitle
              article={lead}
              queue={queue}
              className={cn('text-[1.3rem] leading-[1.25] font-semibold', titleTone)}
            />
            <ExpandableSummary article={lead} size="md" queue={queue} />
            <ArticleMeta article={lead} updatedAt={story.updatedAt} showProvince className="mt-0.5">
              <CardActions article={lead} tone="ghost" className="-my-1 ml-auto" />
            </ArticleMeta>
          </div>
        </div>
        {others.length > 0 && (
          <div className="mt-4 flex flex-col border-t border-line pt-3 sm:ml-[calc(12rem+1.25rem)]">
            <ul className="space-y-2">
              {shown.map((a) => (
                <OtherHeadline key={a.id} article={a} queue={queue} />
              ))}
            </ul>
            {hidden > 0 && (
              <MoreToggle open={showAll} hidden={hidden} onToggle={() => setShowAll((v) => !v)} />
            )}
          </div>
        )}
      </article>
    )
  }

  const shown = showAll ? others : others.slice(0, OTHERS_SHOWN)
  const hidden = others.length - OTHERS_SHOWN

  return (
    <article
      data-article-id={lead.id}
      className={cn(
        'group/card group rounded-panel border border-line bg-surface p-5 shadow-soft sm:p-6 in-data-[density=compact]:p-4',
        className
      )}
    >
      <div
        className={cn(
          'relative grid gap-5 rounded-card md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:gap-7',
          CARD_FOCUS_RING
        )}
      >
        <div className="relative">
          <ArticleImage article={lead} className="aspect-[4/3] rounded-card" logoSize="xl" />
          {rankBadge}
          <CardActions article={lead} className="absolute top-3 right-3" />
        </div>
        <div className="flex min-w-0 flex-col gap-2.5">
          {labels}
          <CardTitle
            article={lead}
            queue={queue}
            className={cn('text-[1.6rem] leading-[1.18] font-semibold lg:text-[1.8rem]', titleTone)}
          />
          <ExpandableSummary article={lead} size="md" queue={queue} />
          <ArticleMeta article={lead} updatedAt={story.updatedAt} showProvince className="mt-0.5" />
        </div>
      </div>

      {others.length > 0 && (
        <section className="mt-5 flex flex-col border-t border-line pt-4">
          <h4 className="font-ui text-[11px] font-semibold tracking-wider text-fg-subtle uppercase">
            {t('cluster.otherHeadlines')}
          </h4>
          <ul className="mt-1 gap-x-8 md:columns-2">
            {shown.map((a) => (
              <li key={a.id} className="break-inside-avoid border-b border-line last:border-b-0">
                <ReportRow article={a} queue={queue} />
              </li>
            ))}
          </ul>
          {hidden > 0 && <MoreToggle open={showAll} hidden={hidden} onToggle={() => setShowAll((v) => !v)} />}
        </section>
      )}
    </article>
  )
})

/** One outlet's headline in a line: logo, source name and the headline; opens that report. */
function OtherHeadline({
  article,
  queue
}: {
  article: Article
  queue: readonly string[]
}): React.JSX.Element {
  const source = useSource(article.sourceId)
  return (
    <li>
      <button
        type="button"
        onClick={() => openArticle(article, queue)}
        className="group/other relative z-10 flex w-full gap-2 rounded-md text-left font-ui text-[13px] leading-snug"
      >
        <SourceLogo source={source} size="xs" className="mt-px" />
        <span className="min-w-0 text-fg-muted">
          <span className="font-semibold text-fg">{source?.name ?? article.sourceId}</span>{' '}
          <span
            lang="tr"
            className="text-pretty decoration-line-strong underline-offset-2 group-hover/other:text-fg group-hover/other:underline"
          >
            {tameCaps(article.title)}
          </span>
        </span>
      </button>
    </li>
  )
}
