import { describe, expect, it } from 'vitest'
import { foldText } from '../../src/shared/fold'
import {
  cleanWatchlist,
  cryptoItem,
  currencyItem,
  defaultWatchlist,
  keywordMatcher,
  metalItem
} from '../../src/shared/markets'
import { DEFAULT_SETTINGS, mergeSettings } from '../../src/shared/settings'

const matches = (keywords: string[], text: string): boolean =>
  keywordMatcher(keywords)?.(foldText(text)) ?? false

describe('keywordMatcher', () => {
  it('matches whole words, so "altın" is not "altında"', () => {
    expect(matches(['altın'], 'Gram altın rekor kırdı')).toBe(true)
    expect(matches(['altın'], "ALTIN'ın onsu 4.300 dolar")).toBe(true)
    expect(matches(['altın'], 'Baskı altında kalan piyasalar')).toBe(false)
  })

  it('takes inflections after a trailing star, and phrases with any spacing', () => {
    expect(matches(['sterlin*'], 'Sterlinin yükselişi sürüyor')).toBe(true)
    expect(matches(['sterlin*'], 'Sterlinden euroya geçiş')).toBe(true)
    expect(matches(['dolar/TL'], 'Dolar/TL güne 48,80 ile başladı')).toBe(true)
    expect(matches(['Türk Hava Yolları'], 'Türk  Hava Yolları yeni uçak aldı')).toBe(true)
    expect(matches(['THY'], "THY'nin yolcu sayısı arttı")).toBe(true)
    expect(matches(['S&P 500'], 'S&P 500 endeksi rekor kırdı')).toBe(true)
  })

  it('is null without keywords', () => {
    expect(keywordMatcher([])).toBeNull()
    expect(keywordMatcher(['  ', '*'])).toBeNull()
  })
})

describe('watchlist', () => {
  it('starts from the most held currencies, gold and silver, crypto and the big companies', () => {
    const list = defaultWatchlist('tr', 'tr')
    expect(list.map((item) => item.id)).toEqual([
      'currency:USD',
      'currency:EUR',
      'currency:GBP',
      'metal:XAU',
      'metal:XAG',
      'crypto:BTC',
      'crypto:ETH',
      'equity:bist',
      'equity:thyao',
      'equity:asels',
      'equity:garan',
      'equity:kchol',
      'equity:tuprs',
      'equity:bimas'
    ])
    expect(list.find((item) => item.id === 'equity:thyao')?.keywords).toEqual([
      'THY',
      'Türk Hava Yolları',
      'THYAO'
    ])
    expect(defaultWatchlist('fr', 'fr')).toEqual([])
  })

  it('finds the dollar rate, not amounts in dollars', () => {
    const usd = currencyItem('USD', 'tr').keywords
    expect(matches(usd, 'Dolar kuru güne yükselişle başladı')).toBe(true)
    expect(matches(usd, 'Merkez Bankası doları sabit tuttu')).toBe(true)
    expect(matches(usd, '2,45 milyar dolarlık plan açıklandı')).toBe(false)
    expect(matches(usd, '10 milyon dolar yatırım')).toBe(false)
  })

  it('names things in the news language', () => {
    expect(currencyItem('USD', 'tr').keywords).toContain('dolar kuru')
    expect(currencyItem('USD', 'hi').keywords).toEqual(['डॉलर', 'USD'])
    expect(currencyItem('SEK', 'de', 'Schwedische Krone').keywords).toEqual(['Schwedische Krone', 'SEK'])
    expect(metalItem('XAU', 'de').keywords).toContain('Goldpreis*')
    expect(cryptoItem('BTC', 'en').keywords).toEqual(['Bitcoin', 'BTC'])
  })

  it('keeps only valid items from settings, once each', () => {
    const list = cleanWatchlist([
      currencyItem('USD', 'tr'),
      { ...currencyItem('USD', 'tr'), keywords: ['again'] },
      { kind: 'currency', code: 'XXX', name: '', keywords: [] },
      { kind: 'metal', code: 'XAU', name: '', keywords: ['altın', '', 7] },
      { kind: 'equity', code: 'ASELS', name: '', keywords: ['Aselsan'] },
      { kind: 'bond', code: 'TR10Y' },
      null
    ])
    expect(list).toEqual([
      currencyItem('USD', 'tr'),
      { id: 'metal:XAU', kind: 'metal', code: 'XAU', name: '', keywords: ['altın'] },
      { id: 'equity:asels', kind: 'equity', code: 'ASELS', name: 'ASELS', keywords: ['Aselsan'] }
    ])
  })

  it('is part of the settings: null means the defaults, and a list survives a merge', () => {
    expect(DEFAULT_SETTINGS.markets.watchlist).toBeNull()
    const saved = mergeSettings(DEFAULT_SETTINGS, { markets: { watchlist: [currencyItem('EUR', 'tr')] } })
    expect(saved.markets.watchlist?.map((item) => item.id)).toEqual(['currency:EUR'])
    expect(mergeSettings(saved, { theme: 'dark' }).markets.watchlist).toEqual(saved.markets.watchlist)
    expect(mergeSettings(saved, { markets: { watchlist: null } }).markets.watchlist).toBeNull()
  })
})
