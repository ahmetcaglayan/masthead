import { useMemo, useState } from 'react'
import { ChartCandlestick, Settings2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Page } from '@/components/layout/Page'
import { NewsGate } from '@/components/news/NewsGate'
import { PageHeader } from '@/components/news/PageHeader'
import { Button } from '@/components/ui/Button'
import { ToggleChip } from '@/components/ui/Chip'
import { EmptyState } from '@/components/ui/EmptyState'
import { MarketsNewsList } from '@/features/markets/MarketsNewsList'
import { QuoteBoard } from '@/features/markets/QuoteBoard'
import { hasPrice, useAssetName, useLiveMarketsNews, useQuotes, useWatchlist } from '@/features/markets/hooks'
import { useNewsView } from '@/hooks/useArticles'
import { useNow } from '@/hooks/useNow'
import { useSources } from '@/hooks/useSources'
import { localeFor } from '@/i18n'
import { marketsNews } from '@/lib/markets'
import { clock } from '@/lib/time'
import { useUi } from '@/stores/ui'

const DAY = 24 * 3_600_000

const editWatchlist = (): void => useUi.getState().navigate({ name: 'settings', section: 'markets' })

/** "Prices as of 14:32 · Currencies: ECB reference rate of 22 September", with a live dot. */
function PriceStatus({
  fetchedAt,
  ratesDate,
  failed
}: {
  fetchedAt?: number
  ratesDate: string | null
  failed: boolean
}): React.JSX.Element {
  const { t, i18n } = useTranslation('news')
  const date = ratesDate
    ? new Intl.DateTimeFormat(localeFor(i18n.language), {
        day: 'numeric',
        month: 'long',
        timeZone: 'UTC'
      }).format(new Date(`${ratesDate}T00:00:00Z`))
    : null
  return (
    <p
      aria-live="polite"
      className="flex flex-wrap items-center gap-x-2 gap-y-1 font-ui text-[12.5px] text-fg-muted"
    >
      <span className="inline-flex items-center gap-1.5 font-semibold text-live">
        <span aria-hidden className="size-1.5 rounded-full bg-live" />
        {t('markets.live')}
      </span>
      {failed ? (
        <span className="text-warning">{t('markets.failed')}</span>
      ) : fetchedAt ? (
        <span className="tabular-nums">
          {t('markets.updated', { time: clock(fetchedAt, i18n.language) })}
        </span>
      ) : (
        <span>{t('markets.loading')}</span>
      )}
      {date && (
        <>
          <span aria-hidden className="text-fg-subtle">
            ·
          </span>
          <span>{t('markets.ratesDate', { date })}</span>
        </>
      )}
    </p>
  )
}

function Markets(): React.JSX.Element {
  const { t } = useTranslation('news')
  const items = useWatchlist()
  const { report, failed } = useQuotes(items)
  useLiveMarketsNews()
  const view = useNewsView()
  const { byId } = useSources()
  const now = useNow(60_000)
  const name = useAssetName()
  const [picked, setPicked] = useState<string | null>(null)
  const selected = picked && items.some((item) => item.id === picked) ? picked : null

  const news = useMemo(
    () => marketsNews(view.articles, items, (id) => byId.get(id)?.kind === 'business'),
    [view.articles, items, byId]
  )
  const quotes = useMemo(() => new Map(report?.quotes.map((q) => [q.id, q])), [report])
  // Items the news talks about most today, for the chips above the list.
  const talked = useMemo(
    () =>
      items
        .map((item) => ({
          item,
          count: (news.byItem.get(item.id) ?? []).filter((a) => now - a.publishedAt <= DAY).length
        }))
        .filter(({ count }) => count > 0)
        .sort((a, b) => b.count - a.count),
    [items, news, now]
  )
  const list = selected ? (news.byItem.get(selected) ?? []) : news.feed
  const selectedItem = items.find((item) => item.id === selected)

  if (items.length === 0) {
    return (
      <EmptyState
        icon={ChartCandlestick}
        title={t('markets.emptyTitle')}
        description={t('markets.emptyBody')}
        action={
          <Button variant="primary" onClick={editWatchlist}>
            {t('markets.edit')}
          </Button>
        }
      />
    )
  }

  return (
    <>
      <PageHeader
        kicker={t('markets.kicker')}
        icon={ChartCandlestick}
        title={t('markets.title')}
        description={t('markets.description')}
        actions={
          <Button variant="outline" icon={Settings2} onClick={editWatchlist}>
            {t('markets.edit')}
          </Button>
        }
      />

      <section aria-labelledby="markets-board" className="flex flex-col gap-4">
        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
          <h2 id="markets-board" className="headline text-2xl font-semibold text-fg">
            {t('markets.watchlist')}
          </h2>
          {items.some(hasPrice) && (
            <PriceStatus
              fetchedAt={report?.fetchedAt}
              ratesDate={report?.ratesDate ?? null}
              failed={failed}
            />
          )}
        </div>
        <QuoteBoard
          items={items}
          quotes={quotes}
          byItem={news.byItem}
          selected={selected}
          onSelect={setPicked}
          now={now}
        />
      </section>

      <section aria-labelledby="markets-news" className="mt-14 in-data-[density=compact]:mt-10">
        <h2 id="markets-news" className="headline text-2xl font-semibold text-fg">
          {selectedItem ? t('markets.newsAbout', { name: name(selectedItem) }) : t('markets.news')}
        </h2>
        <div role="group" aria-label={t('markets.filter')} className="mt-4 mb-4 flex flex-wrap gap-2">
          <ToggleChip size="sm" selected={selected === null} onSelectedChange={() => setPicked(null)}>
            {t('markets.all')}
          </ToggleChip>
          {talked.map(({ item, count }) => (
            <ToggleChip
              key={item.id}
              size="sm"
              count={count}
              selected={selected === item.id}
              onSelectedChange={(on) => setPicked(on ? item.id : null)}
            >
              {name(item)}
            </ToggleChip>
          ))}
        </div>
        <MarketsNewsList
          articles={list}
          tags={news.tags}
          items={items}
          now={now}
          listKey={selected ?? 'all'}
        />
      </section>

      <footer className="mt-12 border-t border-line pt-5 font-ui text-[12px] leading-relaxed text-fg-subtle">
        <p>{t('markets.sources')}</p>
        <p className="mt-1">{t('markets.disclaimer')}</p>
      </footer>
    </>
  )
}

/**
 * "Piyasalar": the user's watchlist — currencies, metals and crypto with prices that refresh
 * every minute, companies and markets followed through the news — and the markets news as
 * a live wire: economy and business feeds are fetched every minute while the page is open,
 * and new stories come in at the top. A tile or chip narrows the news to one item.
 */
export function MarketsPage(): React.JSX.Element {
  return (
    <Page measure="6xl">
      <NewsGate>
        <Markets />
      </NewsGate>
    </Page>
  )
}
