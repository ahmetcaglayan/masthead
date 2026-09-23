import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import type { Article } from '@shared/types'
import { ArticleImage } from '@/components/ui/ArticleImage'
import { useSource } from '@/hooks/useSources'
import { cn } from '@/lib/cn'
import { tameCaps } from '@/lib/format'
import { useLibrary } from '@/stores/library'
import { useNews } from '@/stores/news'
import { ArticleKicker } from './ArticleKicker'
import { ArticleMeta } from './ArticleMeta'
import { CardActions } from './CardActions'
import { CardTitle } from './CardTitle'
import { ExpandableSummary } from './ExpandableSummary'
import { ReportRow } from './ReportRow'
import { CARD_FOCUS_RING } from './utils'

function RelatedReports({
  articles,
  queue
}: {
  articles: readonly Article[]
  queue?: readonly string[]
}): React.JSX.Element {
  const { t } = useTranslation('news')
  return (
    <aside aria-label={t('card.alsoReporting')} className="min-w-0">
      <h3 className="font-ui text-[11px] font-semibold tracking-wider text-fg-subtle uppercase">
        {t('card.alsoReporting')}
      </h3>
      <ul className="mt-1 divide-y divide-line">
        {articles.map((article) => (
          <li key={article.id}>
            <ReportRow article={article} queue={queue} />
          </li>
        ))}
      </ul>
    </aside>
  )
}

export type ArticleCardVariant = 'hero' | 'feature' | 'standard' | 'compact' | 'row' | 'timeline' | 'text'

export interface ArticleCardProps {
  article: Article
  variant?: ArticleCardVariant
  /** Ordered ids of the list the card is in, for next/previous in the reader. Keep it referentially stable. */
  queue?: readonly string[]
  /** Distinct sources that carried the story; defaults to the article's cluster. */
  sourceCount?: number
  /** Newest report of the story (curated slots): an old lead then reads "updated 25 min ago". */
  updatedAt?: number
  /** Other outlets' headlines for the same story, listed under the hero. */
  related?: readonly Article[]
  /** Folded search terms to highlight (from `parseQuery`). */
  highlight?: readonly string[]
  /** Clamp the summary to this many lines with an inline "Full summary" (the grid card style only). */
  clampSummary?: number
  /** Cut the summary after this many sentences with an inline "Full summary" (narrow columns). */
  maxSentences?: number
  /** Load the image eagerly with high priority (above the fold). */
  priority?: boolean
  /** Only label breaking news, not the topic (e.g. on a category page). */
  breakingOnly?: boolean
  /** Label the topic even for breaking news (the Breaking page). */
  hideBreaking?: boolean
  /** Dim the card once the article was read. Default true. */
  dimRead?: boolean
  /** Show the province the story is about. */
  showProvince?: boolean
  className?: string
}

/**
 * A news card. Every variant shows the full headline and the full summary
 * (follow the news without clicking); only `clampSummary` (the grid card
 * style) or `maxSentences` shorten it, with an inline "Full summary".
 *
 * - `hero` — the manşet: big photo with the headline on it, full summary and other outlets' headlines.
 * - `feature` — large image, big headline, full summary.
 * - `standard` — grid card: image, headline, summary.
 * - `compact` — rail card: headline beside a thumbnail, then summary and byline at full width.
 * - `row` — list row: thumbnail left, full headline and summary.
 * - `timeline` — a timeline entry's body: headline and summary, thumbnail on the right.
 * - `text` — no image.
 */
export const ArticleCard = memo(function ArticleCard({
  article,
  variant = 'standard',
  queue,
  sourceCount,
  updatedAt,
  related,
  highlight,
  clampSummary,
  maxSentences,
  priority = false,
  breakingOnly = false,
  hideBreaking = false,
  dimRead = true,
  showProvince = false,
  className
}: ArticleCardProps): React.JSX.Element {
  const read = useLibrary((s) => dimRead && s.readIds.has(article.id))
  const clusterSources = useNews((s) =>
    article.clusterId ? s.clustersById.get(article.clusterId)?.sourceIds.length : undefined
  )
  const lang = useSource(article.sourceId)?.language ?? 'tr'
  const sources = sourceCount ?? clusterSources
  const titleTone = read ? 'text-fg-muted' : 'text-fg'
  const imageTone = read && 'opacity-75 saturate-[0.8]'
  const title = { article, queue, highlight, lang }
  const summary = { article, highlight, queue, clamp: clampSummary, maxSentences }
  const kicker = <ArticleKicker article={article} breakingOnly={breakingOnly} hideBreaking={hideBreaking} />
  const meta = (
    <ArticleMeta
      article={article}
      sourceCount={sources}
      updatedAt={updatedAt}
      showProvince={showProvince}
      className="mt-0.5"
    >
      {(variant === 'row' || variant === 'timeline' || variant === 'text' || variant === 'compact') && (
        <CardActions article={article} tone="ghost" className="-my-1 ml-auto" />
      )}
    </ArticleMeta>
  )

  if (variant === 'hero') {
    // The headline sits under the photo, not on it: Turkish outlets often burn their own
    // captions into lead images, which would fight an overlaid headline. Long headlines
    // run to four lines, so they are set smaller.
    const length = tameCaps(article.title).length
    return (
      <article className={cn('group/card group', className)}>
        <div className={cn('relative flex flex-col gap-3 rounded-panel', CARD_FOCUS_RING)}>
          <div className="relative mb-2">
            <ArticleImage
              article={article}
              priority={priority}
              preferResolved
              logoSize="xl"
              className={cn('aspect-[16/9] max-h-[27rem] w-full rounded-panel shadow-card', imageTone)}
            />
            <CardActions article={article} className="absolute top-4 right-4 z-20" />
          </div>
          <ArticleKicker article={article} breakingOnly={breakingOnly} hideBreaking={hideBreaking} />
          <CardTitle
            {...title}
            as="h2"
            className={cn(
              length > 80
                ? 'text-[1.625rem] sm:text-[1.875rem] xl:text-[2.125rem]'
                : length > 64
                  ? 'text-[1.75rem] sm:text-[2.125rem] xl:text-[2.4rem]'
                  : 'text-[1.875rem] sm:text-[2.375rem] xl:text-[2.75rem]',
              // After the sizes: a later font size would drop the leading (tailwind-merge).
              'leading-[1.1] font-semibold',
              titleTone
            )}
          />
          <ArticleMeta
            article={article}
            sourceCount={sources}
            updatedAt={updatedAt}
            showProvince={showProvince}
            size="md"
          />
        </div>
        <div
          className={cn(
            'mt-6 grid gap-x-10 gap-y-6',
            related && related.length > 0 && 'lg:grid-cols-[minmax(0,1fr)_minmax(0,17rem)]'
          )}
        >
          <ExpandableSummary {...summary} size="xl" className="max-w-[68ch]" />
          {related && related.length > 0 && <RelatedReports articles={related} queue={queue} />}
        </div>
      </article>
    )
  }

  if (variant === 'feature' || variant === 'standard') {
    const feature = variant === 'feature'
    return (
      <article
        className={cn(
          'group/card group relative flex flex-col rounded-card',
          feature ? 'gap-3.5' : 'gap-3 in-data-[density=compact]:gap-2',
          CARD_FOCUS_RING,
          className
        )}
      >
        <div className="relative">
          <ArticleImage
            article={article}
            priority={priority}
            preferResolved={feature}
            logoSize={feature ? 'xl' : 'lg'}
            className={cn('aspect-[16/9] rounded-card', imageTone)}
          />
          <CardActions article={article} className="absolute top-3 right-3" />
        </div>
        <div className={cn('flex flex-col', feature ? 'gap-2.5' : 'gap-2')}>
          {kicker}
          <CardTitle
            {...title}
            className={cn(
              'font-semibold',
              feature ? 'text-[1.75rem] leading-[1.15] lg:text-[2rem]' : 'text-[1.2rem] leading-[1.3]',
              titleTone
            )}
          />
          <ExpandableSummary {...summary} size={feature ? 'lg' : 'md'} />
          {meta}
        </div>
      </article>
    )
  }

  if (variant === 'compact') {
    // Headline beside the thumbnail; summary and byline below at the rail's full width.
    // The thumbnail narrows in tight columns (a container query on the card).
    return (
      <article
        className={cn('group/card group relative @container rounded-card', CARD_FOCUS_RING, className)}
      >
        <div className="grid grid-cols-[minmax(0,1fr)_5rem] gap-x-4 gap-y-1.5 @xs:grid-cols-[minmax(0,1fr)_7rem]">
          <div className="flex min-w-0 flex-col gap-1.5">
            {kicker}
            <CardTitle {...title} className={cn('text-[1.08rem] leading-snug font-semibold', titleTone)} />
          </div>
          <ArticleImage
            article={article}
            logoSize="md"
            className={cn('mt-1 aspect-[4/3] w-full self-start rounded-xl', imageTone)}
          />
          <ExpandableSummary {...summary} size="sm" className="col-span-2 mt-0.5" />
          <div className="col-span-2">{meta}</div>
        </div>
      </article>
    )
  }

  if (variant === 'row' || variant === 'timeline') {
    const row = variant === 'row'
    const image = (
      <ArticleImage
        article={article}
        collapseWhenMissing
        className={cn(
          'mt-1 aspect-[4/3] shrink-0 rounded-card',
          row ? 'w-28 sm:w-44 lg:w-52' : 'w-28 sm:w-40',
          imageTone
        )}
      />
    )
    return (
      <article
        className={cn(
          'group/card group relative flex items-start gap-5 rounded-card sm:gap-6',
          CARD_FOCUS_RING,
          className
        )}
      >
        {row && image}
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          {kicker}
          <CardTitle
            {...title}
            className={cn(
              'font-semibold',
              row
                ? 'text-[1.2rem] leading-[1.28] sm:text-[1.35rem]'
                : 'text-[1.15rem] leading-[1.3] sm:text-[1.25rem]',
              titleTone
            )}
          />
          <ExpandableSummary {...summary} size="md" />
          {meta}
        </div>
        {!row && image}
      </article>
    )
  }

  return (
    <article
      className={cn('group/card relative flex flex-col gap-2 rounded-card', CARD_FOCUS_RING, className)}
    >
      {kicker}
      <CardTitle {...title} className={cn('text-[1.25rem] leading-[1.28] font-semibold', titleTone)} />
      <ExpandableSummary {...summary} size="md" />
      {meta}
    </article>
  )
})
