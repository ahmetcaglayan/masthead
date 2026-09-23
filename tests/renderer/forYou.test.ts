import { describe, expect, it } from 'vitest'
import type { CategoryId } from '../../src/shared/categories'
import type { Article, HistoryEntry, StoryCluster } from '../../src/shared/types'
import {
  EMPTY_PROFILE,
  MIN_READS,
  buildReadingProfile,
  keyness,
  rankForYou,
  type ReadingProfile
} from '../../src/renderer/src/lib/forYou'

const NOW = Date.UTC(2026, 8, 23, 12, 0, 0)
const HOUR = 3_600_000
const DAY = 24 * HOUR
let counter = 0

function article(title: string, overrides: Partial<Article> = {}): Article {
  counter++
  return {
    id: `f${String(counter).padStart(4, '0')}`,
    url: `https://news.test/${counter}`,
    title,
    summary: 'Özet.',
    hasDetail: false,
    publishedAt: NOW - HOUR,
    fetchedAt: NOW - HOUR,
    sourceId: `source${counter}`,
    categories: ['general'],
    isBreaking: false,
    isHeadline: false,
    provinces: [],
    regions: [],
    ...overrides
  }
}

const read = (a: Article, ago = DAY): HistoryEntry => ({ article: a, readAt: NOW - ago })

/** Everyday headlines: the news at large the profile is measured against. */
const everyday = (count: number, category: CategoryId = 'national'): Article[] =>
  Array.from({ length: count }, (_, i) =>
    article(`Bakanlık açıkladı: yeni düzenleme ${['mecliste', 'yarın', 'resmi', 'kabul'][i % 4]} yürürlüğe`, {
      categories: [category]
    })
  )

const settings = { interests: [] as CategoryId[], location: { provinceCode: null, regionId: null } }
const ctx = (profile: ReadingProfile = EMPTY_PROFILE) => ({
  now: NOW,
  readIds: new Set<string>(),
  clustersById: new Map<string, StoryCluster>(),
  profile
})

describe('buildReadingProfile', () => {
  it('needs a few reads before it learns anything', () => {
    const history = [read(article('Galatasaray derbiyi kazandı'))]
    const profile = buildReadingProfile(history, everyday(50), NOW)
    expect(profile.reads).toBe(1)
    expect(profile.terms).toEqual([])
    expect(MIN_READS).toBeGreaterThan(1)
  })

  it('keeps the words the reads return to far more than the news does, spelled as headlines spell them', () => {
    const history = [
      read(article("Galatasaray'ın yeni transferi İstanbul'a geldi", { categories: ['sports'] })),
      read(article('GALATASARAY DERBİDE KAZANDI', { categories: ['sports'] })),
      read(article('Galatasaray Avrupa kupasında tur atladı', { categories: ['sports'] })),
      read(article('Bakanlık açıkladı: yeni düzenleme yürürlüğe', { categories: ['national'] })),
      read(article('Bakanlık açıkladı: yeni vergi düzenlemesi', { categories: ['national'] })),
      read(article('Merkez Bankası faiz kararını açıkladı', { categories: ['economy'] }))
    ]
    const pool = [...everyday(80), article('Galatasaray maça hazırlanıyor', { categories: ['sports'] })]
    const profile = buildReadingProfile(history, pool, NOW)
    const words = profile.terms.map((t) => t.word)
    expect(words[0]).toBe('Galatasaray')
    expect(profile.terms[0].weight).toBe(1)
    // "Bakanlık açıkladı" is everywhere in the news: reading it says nothing about the reader.
    expect(words).not.toContain('Bakanlık')
    expect(words).not.toContain('açıkladı')
    expect(profile.topics.get('sports')).toBeGreaterThan(0.4)
    expect(profile.topics.has('national')).toBe(false)
  })

  it('forgets reads older than two months', () => {
    const old = Array.from({ length: 6 }, () => read(article('Galatasaray kazandı'), 70 * DAY))
    expect(buildReadingProfile(old, everyday(20), NOW).reads).toBe(0)
  })
})

describe('rankForYou', () => {
  it('brings in stories like the reads, with the word that matched as the reason', () => {
    const profile: ReadingProfile = {
      reads: 10,
      terms: [{ stems: ['galat'], word: 'Galatasaray', weight: 1 }],
      topics: new Map()
    }
    const match = article('Galatasaray kampa girdi', { categories: ['sports'] })
    const other = article('Hava yarın yağmurlu', { categories: ['national'] })
    const withProfile = rankForYou([match, other], settings, ctx(profile))
    expect(withProfile.articles).toEqual([match])
    expect(withProfile.reasons.get(match.id)).toEqual({ kind: 'reads', word: 'Galatasaray' })
    // Without the history (switched off), nothing qualifies.
    expect(rankForYou([match, other], settings, ctx()).articles).toEqual([])
  })

  it('names the interest, the place or the coverage that picked a story', () => {
    const economy = article('Enflasyon verisi açıklandı', { categories: ['economy'] })
    const local = article('Erzurum’da kar yağışı', { categories: ['national'], provinces: ['25'] })
    const feed = rankForYou(
      [economy, local],
      { interests: ['economy'], location: { provinceCode: '25', regionId: null } },
      ctx()
    )
    expect(feed.reasons.get(economy.id)).toEqual({ kind: 'interest', category: 'economy' })
    expect(feed.reasons.get(local.id)).toEqual({ kind: 'local', scope: 'province' })
  })

  it('sinks a story once any of its reports was read', () => {
    const fresh = article('Deprem bölgesinde son durum', { categories: ['national'], clusterId: 'c1' })
    const readReport = article('Deprem bölgesinden yeni görüntüler', {
      categories: ['national'],
      clusterId: 'c1',
      publishedAt: NOW - 2 * HOUR
    })
    const unread = article('Yeni bütçe açıklandı', { categories: ['national'], publishedAt: NOW - 3 * HOUR })
    const feed = rankForYou(
      [fresh, readReport, unread],
      { interests: ['national'], location: settings.location },
      { ...ctx(), readIds: new Set([readReport.id]) }
    )
    expect(feed.articles).toEqual([unread, fresh])
  })

  it('never puts more than two stories of one outlet in a row', () => {
    const same = Array.from({ length: 4 }, (_, i) =>
      article(`Ekonomi haberi ${i}`, { categories: ['economy'], sourceId: 'aa', isHeadline: true })
    )
    const other = article('Başka bir ekonomi haberi', { categories: ['economy'], sourceId: 'bb' })
    const feed = rankForYou([...same, other], { interests: ['economy'], location: settings.location }, ctx())
    const sources = feed.articles.map((a) => a.sourceId)
    expect(sources.slice(0, 3)).toEqual(['aa', 'aa', 'bb'])
  })
})

describe('keyness', () => {
  it('asks for more than chance: two reads of a common word are not an interest', () => {
    // 2 of 40 stories against 30 of 3,000 headlines ("istedi"): 5% against 1%, yet likely chance.
    expect(keyness(2, 40, 30, 3000)).toBeLessThan(10.83)
    // 10 of 40 stories against 50 of 3,000 ("Galatasaray" for a fan).
    expect(keyness(10, 40, 50, 3000)).toBeGreaterThan(10.83)
    // Read no more often than the news carries it.
    expect(keyness(1, 100, 30, 3000)).toBe(0)
  })
})

describe('reading profile terms', () => {
  it('joins words that always come together, and matches them only together', () => {
    const history = [
      read(article('Mansur Yavaş yeni metro hattını açtı', { categories: ['national'] })),
      read(article('Mansur Yavaş: Ankara’ya yeni park', { categories: ['national'] })),
      read(article('Mansur Yavaş bütçe sunumu yaptı', { categories: ['national'] })),
      read(article('Deprem sonrası son durum', { categories: ['national'] })),
      read(article('Deprem bölgesinde çalışmalar sürüyor', { categories: ['national'] })),
      read(article('Deprem konutları sahiplerine teslim edildi', { categories: ['national'] }))
    ]
    const profile = buildReadingProfile(history, everyday(60), NOW)
    const mansur = profile.terms.find((t) => t.stems.includes('mansu'))
    expect(mansur?.word).toBe('Mansur Yavaş')
    expect(mansur?.stems).toEqual(['mansu', 'yavas'])
    expect(profile.terms.find((t) => t.stems.includes('depre'))?.word).toBe('Deprem')

    const both = article('Mansur Yavaş kararı açıkladı', { categories: ['politics'] })
    const slow = article('Trafik yavaş ilerliyor', { categories: ['politics'] })
    const feed = rankForYou([both, slow], settings, ctx(profile))
    expect(feed.articles).toEqual([both])
    expect(feed.reasons.get(both.id)).toEqual({ kind: 'reads', word: 'Mansur Yavaş' })
  })
})
