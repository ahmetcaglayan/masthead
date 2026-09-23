import { useMemo, useState } from 'react'
import { ChevronDown, History, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { HistoryEntry } from '@shared/types'
import { Page } from '@/components/layout/Page'
import { ArticleCard } from '@/components/news/ArticleCard'
import { PageHeader } from '@/components/news/PageHeader'
import { usePaged } from '@/components/news/usePaged'
import { Button } from '@/components/ui/Button'
import { ConfirmDialog } from '@/components/ui/Dialog'
import { EmptyState } from '@/components/ui/EmptyState'
import { useNowSelect } from '@/hooks/useNow'
import { useProgressive } from '@/hooks/useProgressive'
import { formatNumber } from '@/lib/format'
import { clock, dayLabel, startOfDay } from '@/lib/time'
import { useLibrary } from '@/stores/library'
import { useUi } from '@/stores/ui'

const PAGE_SIZE = 40

interface Day {
  day: number
  entries: HistoryEntry[]
}

function byDay(entries: readonly HistoryEntry[]): Day[] {
  const days: Day[] = []
  for (const entry of entries) {
    const day = startOfDay(entry.readAt)
    const last = days[days.length - 1]
    if (last && last.day === day) last.entries.push(entry)
    else days.push({ day, entries: [entry] })
  }
  return days
}

/** Everything the user opened, newest first and grouped by day, with "Clear history". */
export function HistoryPage(): React.JSX.Element {
  const { t, i18n } = useTranslation('news')
  const history = useLibrary((s) => s.library.history)
  // Day headings only change at midnight.
  const today = useNowSelect(60_000, startOfDay)
  const [confirming, setConfirming] = useState(false)
  const entries = useMemo(() => [...history].sort((a, b) => b.readAt - a.readAt), [history])
  const queue = useMemo(() => entries.map((e) => e.article.id), [entries])
  const { limit, hasMore, more, sentinelRef } = usePaged(entries.length, PAGE_SIZE)
  // Rows of a page fill in over a few frames rather than in one task.
  const rendered = useProgressive(Math.min(limit, entries.length), 12, 12)
  const days = useMemo(() => byDay(entries.slice(0, rendered)), [entries, rendered])

  return (
    <Page measure="4xl">
      <PageHeader
        kicker={t('common:nav.library')}
        icon={History}
        title={t('history.title')}
        description={t('history.description')}
        count={entries.length}
        actions={
          entries.length > 0 && (
            <Button variant="ghost" size="sm" icon={Trash2} onClick={() => setConfirming(true)}>
              {t('history.clear')}
            </Button>
          )
        }
      />
      {entries.length === 0 ? (
        <EmptyState
          icon={History}
          title={t('history.emptyTitle')}
          description={t('history.emptyBody')}
          action={
            <Button variant="outline" onClick={() => useUi.getState().navigate({ name: 'home' })}>
              {t('browse')}
            </Button>
          }
        />
      ) : (
        <div className="flex flex-col gap-12">
          {days.map(({ day, entries: items }) => (
            <section key={day} aria-labelledby={`day-${day}`}>
              <div className="mb-5 flex items-baseline gap-4">
                <h2 id={`day-${day}`} className="headline text-2xl font-semibold text-fg">
                  {dayLabel(day, i18n.language, today)}
                </h2>
                <span aria-hidden className="h-px flex-1 bg-line" />
              </div>
              <ul className="flex flex-col divide-y divide-line">
                {items.map(({ article, readAt }) => (
                  <li key={article.id} className="flex gap-4 py-5 first:pt-0 in-data-[density=compact]:py-4">
                    <time
                      dateTime={new Date(readAt).toISOString()}
                      title={t('history.readAt', { time: clock(readAt, i18n.language) })}
                      className="w-11 shrink-0 pt-1 text-right font-ui text-[12.5px] font-semibold text-fg-subtle tabular-nums"
                    >
                      {clock(readAt, i18n.language)}
                    </time>
                    <ArticleCard
                      article={article}
                      variant="row"
                      queue={queue}
                      dimRead={false}
                      className="min-w-0 flex-1"
                    />
                  </li>
                ))}
              </ul>
            </section>
          ))}
          {hasMore && rendered >= limit && (
            <div ref={sentinelRef} className="flex justify-center">
              <Button variant="outline" iconRight={ChevronDown} onClick={more}>
                {t('feed.loadMore', {
                  shown: formatNumber(limit, i18n.language),
                  total: formatNumber(entries.length, i18n.language)
                })}
              </Button>
            </div>
          )}
        </div>
      )}
      <ConfirmDialog
        open={confirming}
        onOpenChange={setConfirming}
        title={t('history.clearTitle')}
        description={t('history.clearBody')}
        confirmLabel={t('history.clearConfirm')}
        danger
        onConfirm={() => useLibrary.getState().clearHistory()}
      />
    </Page>
  )
}
