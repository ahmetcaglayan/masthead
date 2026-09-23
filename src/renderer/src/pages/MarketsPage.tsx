import { useMemo, useState } from 'react'
import { ChartCandlestick, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Page } from '@/components/layout/Page'
import { NewsGate } from '@/components/news/NewsGate'
import { PageHeader } from '@/components/news/PageHeader'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { IconButton } from '@/components/ui/IconButton'
import { MarketsNewsList } from '@/features/markets/MarketsNewsList'
import { WatchlistPanel } from '@/features/markets/WatchlistPanel'
import { useAssetName, useLiveMarketsNews, useQuotes, useWatchlist } from '@/features/markets/hooks'
import { useNewsView } from '@/hooks/useArticles'
import { useNow } from '@/hooks/useNow'
import { useSources } from '@/hooks/useSources'
import { marketsNews } from '@/lib/markets'
import { useUi } from '@/stores/ui'

const editWatchlist = (): void => useUi.getState().navigate({ name: 'settings', section: 'markets' })

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
  const selected = items.find((item) => item.id === picked)

  const news = useMemo(
    () => marketsNews(view.articles, items, (id) => byId.get(id)?.kind === 'business'),
    [view.articles, items, byId]
  )
  const quotes = useMemo(() => new Map(report?.quotes.map((q) => [q.id, q])), [report])
  const list = selected ? (news.byItem.get(selected.id) ?? []) : news.feed

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
      />
      {/* The watchlist sits beside the news on wide windows and above it on narrower ones. */}
      <div className="grid gap-x-10 gap-y-8 lg:grid-cols-[minmax(0,1fr)_20rem] xl:gap-x-12">
        <WatchlistPanel
          items={items}
          quotes={quotes}
          byItem={news.byItem}
          selected={selected?.id ?? null}
          onSelect={setPicked}
          onEdit={editWatchlist}
          now={now}
          fetchedAt={report?.fetchedAt}
          ratesDate={report?.ratesDate ?? null}
          failed={failed}
          className="lg:sticky lg:top-6 lg:col-start-2 lg:row-start-1 lg:max-h-[calc(100vh-var(--titlebar-height)-3rem)] lg:self-start lg:overflow-y-auto"
        />
        <section aria-labelledby="markets-news" className="min-w-0 lg:col-start-1 lg:row-start-1">
          <div className="mb-3 flex min-h-8 items-center gap-2">
            <h2 id="markets-news" className="headline text-xl font-semibold text-fg">
              {selected ? t('markets.newsAbout', { name: name(selected) }) : t('markets.news')}
            </h2>
            {selected && (
              <IconButton size="sm" icon={X} label={t('markets.showAll')} onClick={() => setPicked(null)} />
            )}
          </div>
          <MarketsNewsList
            articles={list}
            tags={news.tags}
            items={items}
            now={now}
            listKey={selected?.id ?? 'all'}
          />
          <footer className="mt-10 border-t border-line pt-4 font-ui text-[11.5px] leading-relaxed text-fg-subtle">
            <p>{t('markets.sources')}</p>
            <p className="mt-1">{t('markets.disclaimer')}</p>
          </footer>
        </section>
      </div>
    </>
  )
}

/**
 * "Piyasalar": the markets news as a live wire — economy and business feeds fetched every
 * minute while the page is open, new stories coming in at the top — beside the user's
 * watchlist: currencies, metals and crypto with prices that refresh every minute, companies
 * with today's stories. A line of the watchlist narrows the news to that item.
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
