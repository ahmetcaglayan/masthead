import type { LucideIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { useNowSelect } from '@/hooks/useNow'
import { formatNumber } from '@/lib/format'
import { relativeTime } from '@/lib/time'
import { cn } from '@/lib/cn'
import { useNews } from '@/stores/news'

export interface PageHeaderProps {
  title: React.ReactNode
  /** Small uppercase label above the title. */
  kicker?: React.ReactNode
  kickerTone?: 'accent' | 'breaking' | 'muted'
  icon?: LucideIcon
  /** Stories on the page; shown as "1,204 stories" / "1.204 haber". */
  count?: number
  /** Add "Updated 5 min ago" from the last refresh. */
  showUpdated?: boolean
  /** More short facts for the subtitle line, before the count. */
  details?: readonly string[]
  /** Subtitle under the title; the facts (count, freshness) follow on the same line. */
  description?: React.ReactNode
  /** Right-aligned buttons. */
  actions?: React.ReactNode
  className?: string
}

/** A news page's title block: kicker, large serif title, one subtitle line with count and freshness, actions. */
export function PageHeader({
  title,
  kicker,
  kickerTone,
  icon,
  count,
  showUpdated = false,
  details = [],
  description,
  actions,
  className
}: PageHeaderProps): React.JSX.Element {
  const { t, i18n } = useTranslation('news')
  const updatedAt = useNews((s) => s.status.lastCompletedAt || s.snapshot?.updatedAt || 0)
  // Re-renders only when the label changes, not on every tick of the shared clock.
  const updated = useNowSelect(60_000, (now) =>
    !showUpdated || !updatedAt
      ? ''
      : now - updatedAt < 60_000
        ? t('common:titlebar.updatedJustNow')
        : t('common:titlebar.updated', { time: relativeTime(updatedAt, i18n.language, now) })
  )

  const facts = [
    ...details,
    count !== undefined
      ? t('header.stories', { count, formatted: formatNumber(count, i18n.language) })
      : null,
    updated || null
  ].filter((f): f is string => f !== null)

  // One line: the description, then the facts in smaller type (a sentence ends with its own stop).
  const joiner = typeof description === 'string' && /[.!?…]$/.test(description) ? ' ' : ' · '
  const subtitle =
    description || facts.length > 0 ? (
      <>
        {description}
        {description && facts.length > 0 && joiner}
        {facts.length > 0 && (
          <span className="font-ui text-[13px] whitespace-nowrap text-fg-subtle">{facts.join(' · ')}</span>
        )}
      </>
    ) : undefined

  return (
    <SectionHeader
      size="lg"
      title={title}
      kicker={kicker}
      kickerTone={kickerTone}
      icon={icon}
      description={subtitle}
      action={actions}
      className={cn('mb-5 flex-wrap in-data-[density=compact]:mb-4', className)}
    />
  )
}
