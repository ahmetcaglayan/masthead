import { memo } from 'react'
import { Layers, MapPin } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { getProvince } from '@shared/countries'
import type { Article } from '@shared/types'
import { SourceLogo } from '@/components/ui/SourceLogo'
import { useNowSelect } from '@/hooks/useNow'
import { useSource } from '@/hooks/useSources'
import i18n, { useLanguage } from '@/i18n'
import { fullDate, relativeTime } from '@/lib/time'
import { cn } from '@/lib/cn'
import { useSettings } from '@/stores/settings'

const MINUTE = 60_000
/** A curated lead older than this shows when its story was last updated instead. */
const STALE_LEAD = 3 * 60 * MINUTE

/**
 * A `<time>` that reads "5 min ago" / "5 dk önce", with the full date as its
 * tooltip. With `updatedAt`, a report over three hours old whose story has
 * moved on since reads "updated 25 min ago" instead, so a curated slot does not
 * look stale; `updated` always words `ts` that way. Follows the shared
 * one-minute clock but re-renders only when its label actually changes
 * (rarely, for anything older than an hour).
 */
export const RelativeTime = memo(function RelativeTime({
  ts,
  updatedAt,
  updated: always = false,
  className
}: {
  ts: number
  /** Newest report of the story (epoch ms). */
  updatedAt?: number
  /** `ts` is when the story was last updated: "updated 5 min ago". */
  updated?: boolean
  className?: string
}): React.JSX.Element {
  const lang = useLanguage()
  const moved = useNowSelect(
    60_000,
    (now) => updatedAt !== undefined && updatedAt - ts > 10 * MINUTE && now - ts > STALE_LEAD
  )
  const updated = always || moved
  const shown = moved && updatedAt !== undefined ? updatedAt : ts
  const label = useNowSelect(60_000, (now) => {
    const time = relativeTime(shown, lang, now)
    return updated ? i18n.getFixedT(lang, 'news')('meta.updated', { time }) : time
  })
  return (
    <time
      dateTime={new Date(shown).toISOString()}
      title={fullDate(shown, lang)}
      className={cn('whitespace-nowrap tabular-nums', className)}
    >
      {label}
    </time>
  )
})

/** A small "N sources" pill for stories several outlets carried. */
export function SourceCountBadge({
  count,
  inverse = false,
  className
}: {
  count: number
  inverse?: boolean
  className?: string
}): React.JSX.Element {
  const { t } = useTranslation('news')
  return (
    <span
      className={cn(
        'inline-flex h-5 shrink-0 items-center gap-1 rounded-full px-2 font-ui text-[11.5px] font-semibold whitespace-nowrap',
        inverse ? 'bg-on-scrim/15 text-on-scrim backdrop-blur-sm' : 'bg-muted text-fg-muted',
        className
      )}
    >
      <Layers size={12} strokeWidth={2} aria-hidden />
      {t('meta.sources', { count })}
    </span>
  )
}

/** Separator dot; dropped in narrow columns, where the items wrap and a dot would dangle at a line end. */
const Dot = ({ inverse }: { inverse: boolean }): React.JSX.Element => (
  <span aria-hidden className={cn('@max-[18rem]:hidden', inverse ? 'text-on-scrim/50' : 'text-fg-subtle')}>
    ·
  </span>
)

export interface ArticleMetaProps {
  article: Article
  /** Distinct sources that carried the story; a badge appears from 2. */
  sourceCount?: number
  /** Newest report of the story, for curated slots: an old lead then reads "updated 25 min ago". */
  updatedAt?: number
  /** Show the first province the story is about. */
  showProvince?: boolean
  /** Light text for copy set on a photo. */
  inverse?: boolean
  size?: 'sm' | 'md'
  className?: string
  /** Trailing content, e.g. card actions. */
  children?: React.ReactNode
}

/** Source logo and name, relative time, optional province and "N sources" badge. */
export function ArticleMeta({
  article,
  sourceCount,
  updatedAt,
  showProvince = false,
  inverse = false,
  size = 'sm',
  className,
  children
}: ArticleMetaProps): React.JSX.Element {
  const source = useSource(article.sourceId)
  const country = useSettings((s) => s.settings.country)
  const province =
    showProvince && article.provinces.length > 0 ? getProvince(country, article.provinces[0]) : undefined

  return (
    // A size container, so the row can drop its separator dots when it is narrow.
    <div className={cn('@container', className)}>
      <div
        className={cn(
          'flex flex-wrap items-center gap-x-2 gap-y-1 font-ui',
          size === 'sm' ? 'text-[12.5px]' : 'text-[13.5px]',
          inverse ? 'text-on-scrim/80' : 'text-fg-muted'
        )}
      >
        <span className="inline-flex items-center gap-1.5">
          <SourceLogo source={source} size={size === 'sm' ? 'xs' : 'sm'} />
          <span className={cn('font-semibold whitespace-nowrap', inverse ? 'text-on-scrim' : 'text-fg')}>
            {source?.name ?? article.sourceId}
          </span>
        </span>
        <Dot inverse={inverse} />
        <RelativeTime ts={article.publishedAt} updatedAt={updatedAt} />
        {province && (
          <>
            <Dot inverse={inverse} />
            <span className="inline-flex items-center gap-1 whitespace-nowrap">
              <MapPin size={13} strokeWidth={1.75} aria-hidden />
              {province.name}
            </span>
          </>
        )}
        {sourceCount !== undefined && sourceCount > 1 && (
          <SourceCountBadge count={sourceCount} inverse={inverse} className="ml-0.5" />
        )}
        {children}
      </div>
    </div>
  )
}
