import { describe, expect, it } from 'vitest'
import type { Article, StoryCluster } from '../../src/shared/types'
import { buildStoryView } from '../../src/renderer/src/lib/storyView'

const NOW = Date.UTC(2026, 8, 23, 12, 0, 0)
const MINUTE = 60_000
let counter = 0

function article(sourceId: string, minutesAgo: number, overrides: Partial<Article> = {}): Article {
  counter++
  return {
    id: `s${counter}`,
    url: `https://${sourceId}.test/${counter}`,
    title: `Başlık ${counter}`,
    summary: 'Özet.',
    hasDetail: false,
    publishedAt: NOW - minutesAgo * MINUTE,
    fetchedAt: NOW,
    sourceId,
    categories: ['general'],
    isBreaking: false,
    isHeadline: false,
    provinces: [],
    regions: [],
    clusterId: 'c1',
    ...overrides
  }
}

function setUp(members: Article[]) {
  const cluster: StoryCluster = {
    id: 'c1',
    articleIds: members.map((a) => a.id),
    leadId: members[0].id,
    sourceIds: [...new Set(members.map((a) => a.sourceId))],
    score: 1,
    updatedAt: Math.max(...members.map((a) => a.publishedAt))
  }
  return { cluster, byId: new Map(members.map((a) => [a.id, a])) }
}

describe('buildStoryView', () => {
  it('lists each outlet once, first reporter first, with its latest headline', () => {
    const aaEarly = article('aa', 90)
    const aaLate = article('aa', 10, { title: 'AA güncel başlık' })
    const trt = article('trt', 60, { image: 'https://trt.test/1.jpg' })
    const sozcu = article('sozcu', 30)
    const { cluster, byId } = setUp([trt, aaLate, sozcu, aaEarly])
    const story = buildStoryView(cluster, byId, () => true, NOW)!
    expect(story.reports.map((r) => r.article.sourceId)).toEqual(['aa', 'trt', 'sozcu'])
    expect(story.reports[0].article.title).toBe('AA güncel başlık')
    expect(story.reports[0].firstAt).toBe(aaEarly.publishedAt)
    expect(story.firstAt).toBe(aaEarly.publishedAt)
    expect(story.updatedAt).toBe(aaLate.publishedAt)
    // The report with an image leads.
    expect(story.lead.id).toBe(trt.id)
  })

  it('leaves out reports the page must not show, and gives up when none is left', () => {
    const a = article('aa', 20)
    const b = article('bianet', 10, { title: 'Susturulan kelime içeren başlık' })
    const { cluster, byId } = setUp([a, b])
    const story = buildStoryView(cluster, byId, (x) => x.sourceId !== 'aa', NOW)!
    expect(story.reports.map((r) => r.article.sourceId)).toEqual(['bianet'])
    expect(buildStoryView(cluster, byId, () => false, NOW)).toBeNull()
    expect(buildStoryView(cluster, new Map(), () => true, NOW)).toBeNull()
  })
})
