/**
 * Prices for the markets page, from free services that offer their data openly:
 *   - currencies: the ECB's euro reference rates (via Frankfurter), set once a working day;
 *   - metals: gold-api.com, live, in US dollars an ounce;
 *   - crypto: Binance's public market data (`data-api.binance.vision`), live, with 24-hour
 *     change. Gold's 24-hour change is PAX Gold's there (a token backed by an ounce of gold).
 * Equities have no such source (exchange data is licensed): they are followed through the news.
 */
import {
  METAL_UNIT_GRAMS,
  TROY_OUNCE_GRAMS,
  marketsCountry,
  type Quote,
  type QuotesReport,
  type WatchItem
} from '../shared/markets'
import type { CountryCode } from '../shared/types'
import type { Logger } from './backend'
import { Cache, fetchJson, finite, orNull } from './json-api'

const MINUTE = 60_000
/** ECB rates change once a working day, around 16:00 CET. */
const RATES_TTL = 60 * MINUTE
/** Live prices: a little under the page's one-minute poll, so every poll sees fresh ones. */
const LIVE_TTL = 50_000

export interface MarketsService {
  quotes(items: readonly WatchItem[], country: CountryCode): Promise<QuotesReport>
}

export interface MarketsOptions {
  fetch?: typeof fetch
  logger: Logger
  now?: () => number
}

interface Rates {
  /** `YYYY-MM-DD` of `latest`. */
  date: string
  /** One unit of the base currency in each other currency. */
  latest: Record<string, number>
  previous?: Record<string, number>
}

interface Ticker {
  price: number
  /** 24-hour change, percent. */
  change: number | null
}

/** `YYYY-MM-DD`, `daysAgo` days before `now` (UTC). */
const isoDay = (now: number, daysAgo: number): string =>
  new Date(now - daysAgo * 24 * 60 * MINUTE).toISOString().slice(0, 10)

/** Gold's stand-in on Binance: PAX Gold, one token per troy ounce. */
const GOLD_TOKEN = 'PAXG'

export function createMarketsService(options: MarketsOptions): MarketsService {
  const { logger } = options
  const now = options.now ?? Date.now
  const getJson = <T>(url: string): Promise<T> => fetchJson<T>(url, options.fetch)

  const rates = new Cache<Rates>(now, RATES_TTL)
  const metals = new Cache<number>(now, LIVE_TTL)
  const tickers = new Cache<Map<string, Ticker>>(now, LIVE_TTL)

  /** The reference rates from `base`, for the last two working days (a week back covers holidays). */
  function ratesFrom(base: string): Promise<Rates | null> {
    return rates.get(
      base,
      orNull('Exchange rates', logger, async () => {
        const body = await getJson<{ rates?: Record<string, Record<string, number>> }>(
          `https://api.frankfurter.dev/v1/${isoDay(now(), 10)}..?base=${base}`
        )
        const days = Object.keys(body.rates ?? {}).sort()
        const date = days.at(-1)
        if (!date || !body.rates) return null
        return {
          date,
          latest: body.rates[date],
          previous: days.length > 1 ? body.rates[days.at(-2)!] : undefined
        }
      })
    )
  }

  /** A metal's spot price in US dollars an ounce. */
  function metalPrice(code: string): Promise<number | null> {
    return metals.get(
      code,
      orNull(`${code} price`, logger, async () => {
        const body = await getJson<{ price?: number }>(`https://api.gold-api.com/price/${code}`)
        return finite(body.price) && body.price > 0 ? body.price : null
      })
    )
  }

  async function fetchTickers(codes: readonly string[]): Promise<Map<string, Ticker>> {
    const symbols = JSON.stringify(codes.map((code) => `${code}USDT`))
    const url = `https://data-api.binance.vision/api/v3/ticker/24hr?type=MINI&symbols=${encodeURIComponent(symbols)}`
    const body = await getJson<{ symbol: string; lastPrice: string; openPrice: string }[]>(url)
    const map = new Map<string, Ticker>()
    for (const row of body) {
      const price = Number(row.lastPrice)
      const open = Number(row.openPrice)
      if (!(price > 0)) continue
      map.set(row.symbol.replace(/USDT$/, ''), { price, change: open > 0 ? (price / open - 1) * 100 : null })
    }
    return map
  }

  /** Crypto prices in US dollars; one unknown ticker fails a batch, so then each is asked alone. */
  function cryptoTickers(codes: readonly string[]): Promise<Map<string, Ticker> | null> {
    const sorted = [...new Set(codes)].sort()
    return tickers.get(
      sorted.join(','),
      orNull('Crypto prices', logger, async () => {
        try {
          return await fetchTickers(sorted)
        } catch (error) {
          if (sorted.length === 1) throw error
          const each = await Promise.allSettled(sorted.map((code) => fetchTickers([code])))
          return new Map(each.flatMap((r) => (r.status === 'fulfilled' ? [...r.value] : [])))
        }
      })
    )
  }

  return {
    async quotes(items, country) {
      const market = marketsCountry(country)
      if (!market) return { quotes: [], ratesDate: null, fetchedAt: now() }
      const local = market.currency
      const currencies = items.filter((i) => i.kind === 'currency' && i.code !== local)
      const metalItems = items.filter((i) => i.kind === 'metal')
      const cryptoCodes = items.filter((i) => i.kind === 'crypto').map((i) => i.code)
      const watchesGold = metalItems.some((i) => i.code === 'XAU')
      // Metals are priced in the local currency: the dollar's rate is needed for them too.
      const needsRates = currencies.length > 0 || (metalItems.length > 0 && local !== 'USD')

      const [fx, metalPrices, crypto] = await Promise.all([
        needsRates ? ratesFrom(local) : Promise.resolve(null),
        Promise.all(metalItems.map((i) => metalPrice(i.code))),
        cryptoCodes.length > 0 || watchesGold
          ? cryptoTickers([...cryptoCodes, ...(watchesGold ? [GOLD_TOKEN] : [])])
          : Promise.resolve(null)
      ])

      /** One unit of `code` in the local currency ("one dollar is 48.8 lira"). */
      const inLocal = (table: Record<string, number> | undefined, code: string): number | null => {
        if (code === local) return 1
        const rate = table?.[code]
        return finite(rate) && rate > 0 ? 1 / rate : null
      }

      const quotes: Quote[] = []
      for (const item of items) {
        if (item.kind === 'currency') {
          const price = inLocal(fx?.latest, item.code)
          if (price === null || item.code === local) continue
          const before = inLocal(fx?.previous, item.code)
          quotes.push({
            id: item.id,
            price,
            currency: local,
            change: before ? (price / before - 1) * 100 : null
          })
        } else if (item.kind === 'metal') {
          const ounce = metalPrices[metalItems.indexOf(item)]
          const dollar = inLocal(fx?.latest, 'USD')
          if (ounce === null || dollar === null) continue
          quotes.push({
            id: item.id,
            price: ((ounce * dollar) / TROY_OUNCE_GRAMS) * METAL_UNIT_GRAMS[market.metalUnit],
            currency: local,
            change: item.code === 'XAU' ? (crypto?.get(GOLD_TOKEN)?.change ?? null) : null,
            unit: market.metalUnit
          })
        } else if (item.kind === 'crypto') {
          const ticker = crypto?.get(item.code)
          if (ticker)
            quotes.push({ id: item.id, price: ticker.price, currency: 'USD', change: ticker.change })
        }
      }
      return { quotes, ratesDate: needsRates ? (fx?.date ?? null) : null, fetchedAt: now() }
    }
  }
}
