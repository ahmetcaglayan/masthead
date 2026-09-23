import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { getCountryPack } from '@shared/countries'
import { defaultWatchlist, type QuotesReport, type WatchItem } from '@shared/markets'
import { localeFor } from '@/i18n'
import { api } from '@/lib/api'
import { useSettings } from '@/stores/settings'

/** Prices and news are fetched again this often while the markets page is open. */
export const MARKETS_POLL_MS = 60_000

/** The watchlist in the settings, or the country's default one until the user changes it. */
export function useWatchlist(): WatchItem[] {
  const country = useSettings((s) => s.settings.country)
  const saved = useSettings((s) => s.settings.markets.watchlist)
  return useMemo(
    () => saved ?? defaultWatchlist(country, getCountryPack(country)?.language ?? 'en'),
    [saved, country]
  )
}

/**
 * Run `task` now (and afresh whenever `key`, what the task asks for, changes), then every
 * `ms` while the window is visible, and again as soon as it is visible once more.
 */
function usePoll(task: () => void, ms: number, key: string): void {
  const latest = useRef(task)
  useLayoutEffect(() => {
    latest.current = task
  })
  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | undefined
    const run = (): void => latest.current()
    const schedule = (): void => {
      clearInterval(timer)
      if (document.visibilityState === 'visible') timer = setInterval(run, ms)
    }
    const onVisibility = (): void => {
      if (document.visibilityState === 'visible') run()
      schedule()
    }
    run()
    schedule()
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      clearInterval(timer)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [key, ms])
}

export interface QuotesState {
  report: QuotesReport | null
  /** The last request failed; the previous prices (if any) stay. */
  failed: boolean
}

/** The watchlist's prices, fetched again every minute while the page is open and the window visible. */
export function useQuotes(items: readonly WatchItem[]): QuotesState {
  const country = useSettings((s) => s.settings.country)
  const [state, setState] = useState<QuotesState>({ report: null, failed: false })
  const key = `${country}|${items.map((item) => item.id).join(',')}`
  usePoll(
    () => {
      api.markets.quotes().then(
        (report) => setState({ report, failed: report.quotes.length === 0 && items.some(hasPrice) }),
        () => setState((s) => ({ ...s, failed: true }))
      )
    },
    MARKETS_POLL_MS,
    key
  )
  return state
}

/** Whether a watch item has a price source (equities are followed through the news only). */
export const hasPrice = (item: WatchItem): boolean => item.kind !== 'equity'

/** While the page is open: the economy and business feeds every minute (the host throttles). */
export function useLiveMarketsNews(): void {
  usePoll(() => void api.news.refreshMarkets().catch(() => undefined), MARKETS_POLL_MS, 'markets')
}

/** What to call a watch item in the interface language. */
export function useAssetName(): (item: WatchItem) => string {
  const { t, i18n } = useTranslation('news')
  return useMemo(() => {
    let currencies: Intl.DisplayNames | undefined
    try {
      currencies = new Intl.DisplayNames([localeFor(i18n.language)], { type: 'currency' })
    } catch {
      currencies = undefined
    }
    return (item: WatchItem): string => {
      switch (item.kind) {
        case 'currency':
          return currencies?.of(item.code) ?? item.code
        case 'metal':
          return t(`markets.metals.${item.code}`, { defaultValue: item.code })
        default:
          return item.name || item.code
      }
    }
  }, [t, i18n.language])
}
