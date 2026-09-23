import { describe, expect, it } from 'vitest'
import { createMarketsService } from '../../../src/core/markets'
import {
  cryptoItem,
  currencyItem,
  defaultWatchlist,
  equityItem,
  metalItem
} from '../../../src/shared/markets'
import { fakeFetch, silentLogger as logger } from './fake-fetch'

const NOW = Date.UTC(2026, 8, 23, 12, 0, 0)

const frankfurter = () => ({
  base: 'TRY',
  rates: {
    '2026-09-19': { USD: 0.025, EUR: 0.02, GBP: 0.0175 },
    '2026-09-22': { USD: 0.02, EUR: 0.02, GBP: 0.016 }
  }
})

const binance = (url: URL) => {
  const symbols = JSON.parse(url.searchParams.get('symbols') ?? '[]') as string[]
  const book: Record<string, [string, string]> = {
    BTCUSDT: ['85000', '80000'],
    PAXGUSDT: ['4300', '4386'],
    ETHUSDT: ['2700', '2700']
  }
  if (symbols.some((s) => !book[s])) return undefined
  return symbols.map((symbol) => ({ symbol, lastPrice: book[symbol][0], openPrice: book[symbol][1] }))
}

describe('markets quotes', () => {
  it('prices currencies and gold in the local currency and crypto in dollars, with their changes', async () => {
    const { fetch, calls } = fakeFetch({
      'api.frankfurter.dev': frankfurter,
      'api.gold-api.com': () => ({ price: 3110.34768 }),
      'data-api.binance.vision': binance
    })
    const markets = createMarketsService({ fetch, logger, now: () => NOW })
    const items = [
      currencyItem('USD', 'tr'),
      currencyItem('EUR', 'tr'),
      metalItem('XAU', 'tr'),
      cryptoItem('BTC', 'tr'),
      equityItem('Aselsan', ['Aselsan'], 'ASELS')
    ]
    const report = await markets.quotes(items, 'tr')
    const byId = new Map(report.quotes.map((q) => [q.id, q]))
    expect(report.ratesDate).toBe('2026-09-22')
    expect(byId.get('currency:USD')).toMatchObject({ currency: 'TRY', price: 50 })
    expect(byId.get('currency:USD')?.change).toBeCloseTo(25)
    expect(byId.get('currency:EUR')?.change).toBeCloseTo(0)
    // $100 a gram at 50 lira to the dollar, by the gram in Türkiye; PAX Gold's 24-hour change.
    expect(byId.get('metal:XAU')).toMatchObject({ currency: 'TRY', unit: 'gram' })
    expect(byId.get('metal:XAU')?.price).toBeCloseTo(5000)
    expect(byId.get('metal:XAU')?.change).toBeCloseTo(-1.96, 1)
    expect(byId.get('crypto:BTC')).toMatchObject({ currency: 'USD', price: 85000 })
    expect(byId.get('crypto:BTC')?.change).toBeCloseTo(6.25)
    // Equities have no price source.
    expect(byId.has('equity:asels')).toBe(false)

    // Within the minute, nothing is asked again.
    const asked = calls.length
    await markets.quotes(items, 'tr')
    expect(calls.length).toBe(asked)
  })

  it('asks each crypto alone when one unknown ticker fails the batch', async () => {
    const { fetch } = fakeFetch({ 'data-api.binance.vision': binance })
    const report = await createMarketsService({ fetch, logger, now: () => NOW }).quotes(
      [cryptoItem('BTC', 'en'), cryptoItem('NOPE', 'en')],
      'us'
    )
    expect(report.quotes.map((q) => q.id)).toEqual(['crypto:BTC'])
  })

  it('quotes gold by the ounce in dollars in the US without asking for exchange rates', async () => {
    const { fetch, calls } = fakeFetch({
      'api.gold-api.com': () => ({ price: 4300 }),
      'data-api.binance.vision': binance
    })
    const report = await createMarketsService({ fetch, logger, now: () => NOW }).quotes(
      [metalItem('XAU', 'en'), metalItem('XAG', 'en')],
      'us'
    )
    expect(report.quotes[0]).toMatchObject({ price: 4300, currency: 'USD', unit: 'ounce' })
    expect(report.quotes[1].change).toBeNull()
    expect(report.ratesDate).toBeNull()
    expect(calls.some((c) => c.includes('frankfurter'))).toBe(false)
  })

  it('leaves out what a failing service would have priced', async () => {
    const { fetch } = fakeFetch({})
    const report = await createMarketsService({ fetch, logger, now: () => NOW }).quotes(
      defaultWatchlist('tr', 'tr'),
      'tr'
    )
    expect(report.quotes).toEqual([])
  })
})
