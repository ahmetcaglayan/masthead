import { describe, expect, it } from 'vitest'
import { currencyItem, equityItem, metalItem } from '../../src/shared/markets'
import type { Article } from '../../src/shared/types'
import { marketsNews } from '../../src/renderer/src/lib/markets'

let counter = 0
function article(title: string, overrides: Partial<Article> = {}): Article {
  counter++
  return {
    id: `m${counter}`,
    url: `https://news.test/${counter}`,
    title,
    summary: '',
    hasDetail: false,
    publishedAt: 0,
    fetchedAt: 0,
    sourceId: 'general',
    categories: ['national'],
    isBreaking: false,
    isHeadline: false,
    provinces: [],
    regions: [],
    ...overrides
  }
}

describe('marketsNews', () => {
  const items = [
    currencyItem('USD', 'tr'),
    metalItem('XAU', 'tr'),
    equityItem('Aselsan', ['Aselsan'], 'ASELS')
  ]
  const isBusiness = (id: string): boolean => id === 'bloomberg-ht'

  it('keeps economy and business stories and every story naming a watched company', () => {
    const economy = article('Enflasyon beklentisi düştü', { categories: ['economy'] })
    const business = article('Şirketler bilançolarını açıkladı', { sourceId: 'bloomberg-ht' })
    const company = article('Aselsan yeni sözleşme imzaladı')
    const other = article('Maçta gol yağmuru', { categories: ['sports'] })
    const news = marketsNews([economy, business, company, other], items, isBusiness)
    expect(news.feed).toEqual([economy, business, company])
    expect(news.byItem.get('equity:asels')).toEqual([company])
    expect(news.tags.get(company.id)).toEqual(['equity:asels'])
  })

  it('looks for currencies and metals only in economy and business stories', () => {
    const market = article('Dolar/TL ve altın güne yükselişle başladı', { categories: ['economy'] })
    const sport = article('Altın madalya kazandı, dolar/TL ödülü aldı', { categories: ['sports'] })
    const news = marketsNews([market, sport], items, isBusiness)
    expect(news.byItem.get('currency:USD')).toEqual([market])
    expect(news.byItem.get('metal:XAU')).toEqual([market])
    expect(news.tags.get(market.id)).toEqual(['currency:USD', 'metal:XAU'])
    expect(news.feed).toEqual([market])
  })
})
