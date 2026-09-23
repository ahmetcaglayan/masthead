import { useTranslation } from 'react-i18next'
import { META_CATEGORIES, type CategoryId } from '@shared/categories'
import type { Article } from '@shared/types'
import { useNowSelect } from '@/hooks/useNow'
import { categoryLabel } from '@/lib/categories'
import { cn } from '@/lib/cn'
import { isBreakingNews } from '@/lib/headline'
import { useSettings } from '@/stores/settings'

const BREAKING_FRESH = 2 * 60 * 60 * 1000

/** The article's main topic (its first non-meta category), if any. */
function primaryCategory(article: Article): CategoryId | undefined {
  return article.categories.find((c) => !META_CATEGORIES.includes(c))
}

const KICKER = 'inline-flex items-center gap-1.5 font-ui text-[11px] font-semibold tracking-wider uppercase'

/** Breaking news is a solid crimson tag, so it never reads as one more topic label. */
const BREAKING_TAG = 'h-5 self-start rounded-[4px] bg-breaking px-1.5 text-on-breaking'

export interface ArticleKickerProps {
  article: Article
  /** On a photo: topics in light text (the breaking tag looks the same everywhere). */
  inverse?: boolean
  /** Only show the breaking label, never the topic (e.g. on a category page). */
  breakingOnly?: boolean
  /** Show the topic even for breaking news (e.g. on the Breaking page, where every story is). */
  hideBreaking?: boolean
  /** A short note after the label, in ordinary type (e.g. why "For you" picked the story). */
  note?: string
  className?: string
}

/** The label with a quiet note after it; the note alone when there is no label. */
function withNote(label: React.JSX.Element | null, note: string | undefined): React.JSX.Element | null {
  if (!note) return label
  return (
    <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
      {label}
      <span className="font-ui text-[12px] leading-5 text-fg-subtle">
        {label && (
          <span aria-hidden className="mr-2">
            ·
          </span>
        )}
        {note}
      </span>
    </span>
  )
}

/** Small uppercase label above a headline: a solid "BREAKING" tag, or the topic in the accent colour. */
export function ArticleKicker({
  article,
  inverse = false,
  breakingOnly = false,
  hideBreaking = false,
  note,
  className
}: ArticleKickerProps): React.JSX.Element | null {
  const { t } = useTranslation('news')
  const country = useSettings((s) => s.settings.country)
  const breaking = !hideBreaking && isBreakingNews(article)
  // Only flips once, two hours after publication; no re-render on the other ticks.
  const fresh = useNowSelect(60_000, (now) => breaking && now - article.publishedAt < BREAKING_FRESH)

  if (breaking) {
    return withNote(
      <span className={cn(KICKER, BREAKING_TAG, className)}>
        {fresh && <span aria-hidden className="size-1.5 rounded-full bg-on-breaking" />}
        {t('kicker.breaking')}
      </span>,
      note
    )
  }

  const category = breakingOnly ? undefined : primaryCategory(article)
  if (!category) return withNote(null, note)
  return withNote(
    <span
      // "Türkiye" is a Turkish name: upper-case it with Turkish rules (TÜRKİYE) in any UI language.
      lang={category === 'national' && country === 'tr' ? 'tr' : undefined}
      className={cn(KICKER, inverse ? 'text-on-scrim/85' : 'text-accent-ink', className)}
    >
      {categoryLabel(t, category, country)}
    </span>,
    note
  )
}
