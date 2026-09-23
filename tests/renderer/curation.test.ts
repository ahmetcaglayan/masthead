import { describe, expect, it } from 'vitest'
import type { Article, StoryCluster } from '../../src/shared/types'
import { buildDigest, buildHome, pickLead, storyFor, topStories } from '../../src/renderer/src/lib/curation'

const NOW = Date.UTC(2026, 8, 23, 12, 0, 0)
const MINUTE = 60_000
const HOUR = 60 * MINUTE
let counter = 0

function article(title: string, sourceId: string, overrides: Partial<Article> = {}): Article {
  counter++
  return {
    id: `r${String(counter).padStart(4, '0')}`,
    url: `https://${sourceId}.test/${counter}`,
    title,
    summary: 'Özet.',
    hasDetail: false,
    image: `https://${sourceId}.test/${counter}.jpg`,
    publishedAt: NOW - HOUR,
    fetchedAt: NOW - HOUR,
    sourceId,
    categories: ['general'],
    isBreaking: false,
    isHeadline: false,
    provinces: [],
    regions: [],
    ...overrides
  }
}

function cluster(id: string, members: Article[], overrides: Partial<StoryCluster> = {}): StoryCluster {
  for (const member of members) member.clusterId = id
  return {
    id,
    articleIds: members.map((a) => a.id),
    leadId: members[0].id,
    sourceIds: [...new Set(members.map((a) => a.sourceId))],
    score: members.length,
    updatedAt: Math.max(...members.map((a) => a.publishedAt)),
    ...overrides
  }
}

const newestFirst = (list: Article[]): Article[] => [...list].sort((a, b) => b.publishedAt - a.publishedAt)

describe('pickLead', () => {
  it('prefers a picture, then a clean headline over a longer summary', () => {
    const cut = article("Kanarya, Beşiktaş'ı mağlup etti...", 'sabah', {
      isHeadline: true,
      summary: 'Uzun bir özet. '.repeat(20)
    })
    const clean = article("Fenerbahçe Beşiktaş'ı yenip kupayı kaldırdı", 'ntv')
    const noImage = article('Fenerbahçe kupayı müzesine götürdü', 'trt', { image: undefined })
    expect(pickLead([cut, clean, noImage], NOW)).toBe(clean)
    expect(pickLead([noImage, cut], NOW)).toBe(cut)
  })

  it('marks shouting headlines down and prefers a report inside the manşet window', () => {
    const shouting = article('FENERBAHÇE KUPAYI KALDIRDI', 'haberler', {
      summary: 'Çok daha uzun bir özet metni.'
    })
    const calm = article('Fenerbahçe kupayı kaldırdı', 'dha')
    expect(pickLead([shouting, calm], NOW)).toBe(calm)

    const stale = article('Kupa Fenerbahçe’nin', 'aa', { publishedAt: NOW - 20 * HOUR, isHeadline: true })
    const fresh = article('Kupa sahibini buldu', 'bbc', { publishedAt: NOW - 2 * HOUR })
    expect(pickLead([stale, fresh], NOW)).toBe(fresh)
  })
})

describe('curation', () => {
  it('leads a story with the best report, not the cluster’s stored lead, and reports when it was updated', () => {
    const cut = article("Kanarya, Beşiktaş'ı mağlup etti...", 'sabah', { publishedAt: NOW - 5 * HOUR })
    const clean = article("Fenerbahçe Beşiktaş'ı 72-59 yenerek kupayı kazandı", 'ntv', {
      publishedAt: NOW - 4 * HOUR,
      summary: "Fenerbahçe, final serisinde Beşiktaş'ı 72-59 yendi."
    })
    const latest = article('Fenerbahçe kupayı müzesine götürdü', 'trt', { publishedAt: NOW - 20 * MINUTE })
    const story = cluster('c1', [cut, clean, latest])
    const home = buildHome(
      { articles: newestFirst([cut, clean, latest]), clusters: [story] },
      { interests: [] },
      NOW
    )
    expect(home.hero?.lead).toBe(clean)
    expect(home.hero?.updatedAt).toBe(latest.publishedAt)
    expect(home.hero?.sourceCount).toBe(3)
  })

  it('ranks other outlets’ headlines by what they add and sends close paraphrases to the end', () => {
    const lead = article("Fenerbahçe Beşiktaş'ı 72-59 yenerek kupayı kazandı", 'ntv', {
      summary: 'En uzun özet metni burada yer alıyor.'
    })
    const paraphrase = article("Fenerbahçe Beşiktaş'ı yenerek kupayı kazandı", 'trt', {
      publishedAt: NOW - 10 * MINUTE
    })
    const mvp = article("Kupa Fenerbahçe'nin: MVP Shavon Shields oldu", 'hurriyet', {
      publishedAt: NOW - 3 * HOUR
    })
    const museum = article('Fenerbahçe kupayı müzesine götürdü', 'sozcu', { publishedAt: NOW - 2 * HOUR })
    const members = [lead, paraphrase, mvp, museum]
    const input = { articles: newestFirst(members), clusters: [cluster('c2', members)] }

    expect(storyFor(lead, input).related.map((a) => a.sourceId)).toEqual(['hurriyet', 'sozcu', 'trt'])
    const [digest] = buildDigest(input, NOW)
    expect(digest.lead).toBe(lead)
    expect(digest.others.map((a) => a.sourceId)).toEqual(['hurriyet', 'sozcu', 'trt'])
  })

  it('keeps routine scheduled items out of the breaking ticker', () => {
    const gazette = article(
      'Resmi Gazete kararları 23 Eylül 2026 | Bugün Resmi Gazete atamaları neler?',
      'hurriyet',
      {
        isBreaking: true,
        publishedAt: NOW - 10 * MINUTE
      }
    )
    const market = article('Borsa salı gününü düşüşle tamamladı', 'dunya', {
      isBreaking: true,
      publishedAt: NOW - 20 * MINUTE
    })
    const crash = article('Bursa’da iki otomobil çarpıştı: 1 ölü', 'sabah', {
      isBreaking: true,
      publishedAt: NOW - 30 * MINUTE
    })
    const home = buildHome({ articles: [gazette, market, crash], clusters: [] }, { interests: [] }, NOW)
    expect(home.breaking).toEqual([crash])
    expect(home.hero?.lead).toBe(crash)
  })

  it('never leads a topic with a routine item, however many desks ran it', () => {
    const close = ['d1', 'd2', 'd3', 'd4'].map((s) =>
      article('Borsa salı gününü düşüşle tamamladı', s, { categories: ['economy'] })
    )
    cluster('close', close)
    const rates = article('Merkez Bankası faizi sabit tuttu', 'e1', {
      categories: ['economy'],
      publishedAt: NOW - 3 * HOUR
    })
    const leads = topStories(newestFirst([...close, rates]), NOW, 4)
    expect(leads).toEqual([rates])
  })

  it('ranks a topic’s stories by the outlets that filed them there, not the whole cluster', () => {
    // One economy report of a seven-source world story…
    const summit = article('Erdoğan BM Genel Kurulu’nda konuştu', 's1', { categories: ['economy'] })
    const others = ['s2', 's3', 's4', 's5', 's6', 's7'].map((s) =>
      article('Erdoğan New York’ta konuştu', s, { categories: ['world'] })
    )
    cluster('world', [summit, ...others])
    // …against a story three economy desks carried.
    const rates = ['e1', 'e2', 'e3'].map((s) =>
      article('Merkez Bankası faizi sabit tuttu', s, { categories: ['economy'], publishedAt: NOW - 2 * HOUR })
    )
    cluster('rates', rates)
    const economy = newestFirst([summit, ...rates])
    const [first] = topStories(economy, NOW, 2)
    expect(first.clusterId).toBe('rates')
  })
})
