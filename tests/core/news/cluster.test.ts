import { describe, expect, it } from 'vitest'
import type { Article } from '../../../src/shared/types'
import { clusterStories, titleFeatures } from '../../../src/core/news/cluster'
import { NOW } from './helpers'

const HOUR = 3_600_000
let counter = 0

function article(title: string, sourceId: string, overrides: Partial<Article> = {}): Article {
  counter++
  return {
    id: `a${String(counter).padStart(4, '0')}`,
    url: `https://${sourceId}.test/${counter}`,
    title,
    summary: '',
    hasDetail: false,
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

describe('titleFeatures', () => {
  it('folds, drops stop words and apostrophe suffixes, stems to six letters and keeps numbers', () => {
    const { stems, proper } = titleFeatures(
      "SON DAKİKA: Malatya'da 5,8 büyüklüğünde deprem! AFAD açıklama yaptı"
    )
    expect([...stems].sort()).toEqual(['5.8', 'afad', 'buyukl', 'deprem', 'malaty'])
    // An all-caps start does not make every word a proper noun; numbers always count.
    expect(proper.has('5.8')).toBe(true)
  })
})

describe('clusterStories', () => {
  it('groups four outlets reporting one earthquake in different words', () => {
    const quake = [
      article("Malatya'da 5,8 büyüklüğünde deprem", 'sabah', { image: 'https://sabah.test/q.jpg' }),
      article("SON DAKİKA: Malatya'da korkutan deprem! AFAD 5.8 büyüklüğünde dedi", 'hurriyet', {
        isBreaking: true
      }),
      article('Malatya Battalgazi merkezli 5,8 büyüklüğünde deprem meydana geldi', 'aa', {
        isHeadline: true,
        summary: 'AFAD, depremin 7 kilometre derinlikte olduğunu açıkladı.'
      }),
      article("AFAD duyurdu: Malatya'da 5.8'lik deprem", 'trt', { publishedAt: NOW - HOUR / 2 })
    ]
    const others = [
      article('Merkez Bankası politika faizini sabit tuttu', 'sabah'),
      article('Dolar güne yükselişle başladı', 'hurriyet')
    ]
    const { clusters, clusterOf } = clusterStories([...quake, ...others], { now: NOW })
    expect(clusters).toHaveLength(1)
    const [cluster] = clusters
    expect(cluster.articleIds.sort()).toEqual(quake.map((a) => a.id).sort())
    expect(cluster.sourceIds.sort()).toEqual(['aa', 'hurriyet', 'sabah', 'trt'])
    expect(cluster.updatedAt).toBe(NOW - HOUR / 2)
    // Lead: the one with an image beats the headline-feed copy.
    expect(cluster.leadId).toBe(quake[0].id)
    for (const a of quake) expect(clusterOf.get(a.id)).toBe(cluster.id)
    expect(clusterOf.has(others[0].id)).toBe(false)
    // 10·log2(5) + 6 (headline) + 4 (breaking) + 2 (image), half an hour old.
    expect(cluster.score).toBeCloseTo((10 * Math.log2(5) + 12) * 0.5 ** (0.5 / 6), 6)
  })

  it('keeps two different football matches apart', () => {
    const matches = [
      article("Galatasaray deplasmanda Kasımpaşa'yı 3-1 mağlup etti", 'sabah'),
      article('Galatasaray, Kasımpaşa deplasmanında 3-1 kazandı', 'fotomac'),
      article("Fenerbahçe deplasmanda Alanyaspor'u 2-0 mağlup etti", 'hurriyet'),
      article("Fenerbahçe, Alanyaspor'u 2-0 yendi", 'aspor')
    ]
    const { clusters } = clusterStories(matches, { now: NOW })
    expect(clusters.map((c) => c.articleIds.sort())).toEqual(
      expect.arrayContaining([[matches[0].id, matches[1].id].sort(), [matches[2].id, matches[3].id].sort()])
    )
    expect(clusters).toHaveLength(2)
  })

  it('does not chain loosely related headlines into one cluster', () => {
    const derby = [
      article('Fenerbahçe derbiyi 3-1 kazandı', 'aa'),
      article('Fenerbahçe derbiyi kazandı, taraftar sokağa döküldü', 'trt')
    ]
    const street = [
      article('Taraftar sokağa döküldü, polis müdahale etti', 'sabah'),
      article('Taraftar sokağa döküldü: polis müdahale etti, 12 gözaltı', 'hurriyet')
    ]
    const { clusters } = clusterStories([...derby, ...street], { now: NOW })
    expect(clusters.map((c) => c.articleIds.sort())).toEqual(
      expect.arrayContaining([derby.map((a) => a.id).sort(), street.map((a) => a.id).sort()])
    )
    expect(clusters).toHaveLength(2)
  })

  it('ignores dates shared by unrelated daily headlines', () => {
    const daily = [
      article('22 Eylül 2026 koç burcu günlük yorumu', 'korkusuz'),
      article('Bugün ne oldu? 22 Eylül 2026 haberleri', 'aa'),
      article('22 Eylül 2026 akaryakıt fiyatları', 'haberturk')
    ]
    expect(clusterStories(daily, { now: NOW }).clusters).toEqual([])
  })

  it('needs two different sources and stays inside the time window', () => {
    const sameSource = [
      article('İstanbul’da metro seferleri uzatıldı gece boyunca', 'sabah'),
      article('İstanbul’da metro seferleri gece boyunca uzatıldı', 'sabah')
    ]
    expect(clusterStories(sameSource, { now: NOW }).clusters).toEqual([])

    const old = article('Ankara’da büyük yangın kontrol altına alındı', 'aa', {
      publishedAt: NOW - 40 * HOUR
    })
    const fresh = article('Ankara’daki büyük yangın kontrol altına alındı', 'trt')
    expect(clusterStories([old, fresh], { now: NOW }).clusters).toEqual([])
    expect(clusterStories([old, fresh], { now: NOW, windowHours: 48 }).clusters).toHaveLength(1)
  })

  it('adds single-article clusters for fresh front-page stories', () => {
    const headline = article('Meclis yeni yasama yılına başladı', 'aa', { isHeadline: true })
    const staleHeadline = article('Bakanlar Kurulu toplandı', 'aa', {
      isHeadline: true,
      publishedAt: NOW - 13 * HOUR
    })
    const story = [
      article('TBMM yeni vergi paketini kabul etti', 'sabah'),
      article('Yeni vergi paketi TBMM Genel Kurulunda kabul edildi', 'hurriyet'),
      article('TBMM vergi paketini kabul etti: yeni düzenlemeler', 'dunya')
    ]
    const { clusters, clusterOf } = clusterStories([headline, staleHeadline, ...story], { now: NOW })
    // Three sources (10·log2 4 = 20) outrank one front-page report (10·log2 2 + 6 = 16).
    expect(clusters.map((c) => c.articleIds.length)).toEqual([3, 1])
    expect(clusters[1]).toMatchObject({ id: `c-${headline.id}`, leadId: headline.id, sourceIds: ['aa'] })
    expect(clusters[1].score).toBeCloseTo(16 * 0.5 ** (1 / 6), 6)
    expect(clusterOf.get(headline.id)).toBe(`c-${headline.id}`)
    expect(clusterOf.has(staleHeadline.id)).toBe(false)
  })

  it('never lets an all-caps headline lead when a member wrote the story in normal case', () => {
    const shouting = article(
      'ALEYNA ÇAKIR DAVASINDA SON DAKİKA KARARI! ÜMİTCAN UYGUN KAÇ YIL CEZA ALDI?',
      'posta',
      {
        image: 'https://posta.test/a.jpg',
        isHeadline: true,
        summary: 'Uzun bir özet '.repeat(20)
      }
    )
    const calm = article('Aleyna Çakır davasında karar: Ümitcan Uygun’a 4 yıl hapis cezası', 'takvim')
    const { clusters } = clusterStories([shouting, calm], { now: NOW })
    expect(clusters).toHaveLength(1)
    expect(clusters[0].leadId).toBe(calm.id)
    // With only shouting members the usual order applies.
    const other = article('ALEYNA ÇAKIR DAVASINDA KARAR ÇIKTI! UYGUN’A 4 YIL HAPİS', 'turkiye-gazetesi')
    expect(clusterStories([shouting, other], { now: NOW }).clusters[0].leadId).toBe(shouting.id)
  })

  it('prefers a headline the outlet did not cut short', () => {
    const cut = article(
      'Cumhurbaşkanlığı Kupası Fenerbahçe’nin! Kanarya, Beşiktaş’ı mağlup etti...',
      'sabah',
      {
        image: 'https://sabah.test/a.jpg',
        isHeadline: true
      }
    )
    const whole = article('Cumhurbaşkanlığı Kupası Fenerbahçe’nin: Beşiktaş’ı 72-59 mağlup etti', 'cnn-turk')
    expect(clusterStories([cut, whole], { now: NOW }).clusters[0].leadId).toBe(whole.id)
  })

  it('never ranks a daily service item like breaking news', () => {
    const gazette = (sourceId: string) =>
      article('SON DAKİKA Resmi Gazete kararları 23 Eylül 2026: bugünkü atamalar', sourceId, {
        isBreaking: true,
        categories: ['breaking']
      })
    const [a, b] = [gazette('hurriyet'), gazette('sabah')]
    const { breaking, clusters } = clusterStories([a, b], { now: NOW })
    expect(breaking.size).toBe(0)
    // Two sources, one hour old, weighted down as routine.
    expect(clusters[0].score).toBeCloseTo(10 * Math.log2(3) * 0.3 * 0.5 ** (1 / 6), 6)
  })

  it('names a cluster after its earliest report so the id is stable', () => {
    const first = article('Kabine toplantısı sona erdi, kararlar açıklandı', 'aa', {
      publishedAt: NOW - 3 * HOUR
    })
    const second = article('Kabine toplantısı sona erdi: kararlar açıklandı', 'trt')
    const third = article('Kabine toplantısı sona erdi, işte kararlar', 'sabah')
    const before = clusterStories([first, second], { now: NOW }).clusters[0].id
    const after = clusterStories([third, second, first], { now: NOW }).clusters[0].id
    expect(after).toBe(before)
    expect(before).toBe(`c-${first.id}`)
  })

  describe('breaking news', () => {
    const MINUTE = 60_000
    const report = (title: string, sourceId: string, minutesAgo: number, overrides: Partial<Article> = {}) =>
      article(title, sourceId, {
        publishedAt: NOW - minutesAgo * MINUTE,
        categories: ['breaking'],
        ...overrides
      })

    it('a son dakika report alone is not breaking news', () => {
      const alone = report('Boğaz’da gemi trafiği çift yönlü askıya alındı', 'sabah', 5)
      expect(clusterStories([alone], { now: NOW }).breaking.size).toBe(0)
    })

    it('a son dakika report is breaking once a second source covers the story within the hour', () => {
      const first = report('Boğaz’da gemi trafiği çift yönlü askıya alındı', 'sabah', 20)
      const second = article('Boğaz’da gemi trafiği askıya alındı', 'hurriyet', {
        publishedAt: NOW - 5 * MINUTE
      })
      const { breaking, clusters } = clusterStories([first, second], { now: NOW })
      expect([...breaking]).toEqual([first.id])
      // The breaking bonus: 10·log2(3) + 4, five minutes old.
      expect(clusters[0].score).toBeCloseTo((10 * Math.log2(3) + 4) * 0.5 ** (5 / 60 / 6), 6)
    })

    it('stops being breaking news when the report or the coverage is older than an hour', () => {
      const old = report('Boğaz’da gemi trafiği çift yönlü askıya alındı', 'sabah', 70)
      const fresh = article('Boğaz’da gemi trafiği askıya alındı', 'hurriyet', {
        publishedAt: NOW - 5 * MINUTE
      })
      expect(clusterStories([old, fresh], { now: NOW }).breaking.size).toBe(0)

      const recent = report('Kadıköy’de metro seferleri durduruldu arıza nedeniyle', 'sabah', 10)
      const early = article('Kadıköy’de metro seferleri arıza nedeniyle durduruldu', 'trt', {
        publishedAt: NOW - 90 * MINUTE
      })
      expect(clusterStories([recent, early], { now: NOW }).breaking.size).toBe(0)
    })

    it('an explicit marker makes breaking news on its own, from `marked` when given', () => {
      const marked = article('İzmir’de 4,9 büyüklüğünde deprem', 'aa', {
        isBreaking: true,
        publishedAt: NOW - 5 * HOUR
      })
      expect([...clusterStories([marked], { now: NOW }).breaking]).toEqual([marked.id])
      expect(clusterStories([marked], { now: NOW, marked: new Set() }).breaking.size).toBe(0)
      const plain = article('Ankara’da toplantı sürüyor', 'aa')
      expect([...clusterStories([plain], { now: NOW, marked: new Set([plain.id]) }).breaking]).toEqual([
        plain.id
      ])
    })
  })

  it('clusters 6000 articles quickly (inverted index, no all-pairs comparison)', () => {
    const words =
      'deprem seçim faiz dolar maç transfer yangın sel kaza zam vergi okul hastane köprü metro'.split(' ')
    const places = 'İstanbul Ankara İzmir Bursa Antalya Konya Adana Trabzon Samsun Van'.split(' ')
    const many = Array.from({ length: 6000 }, (_, i) =>
      article(
        `${places[i % places.length]} ${words[i % words.length]} ${words[(i * 7) % words.length]} haberi ${i % 997}`,
        `s${i % 40}`,
        { publishedAt: NOW - (i % 30) * HOUR }
      )
    )
    const start = performance.now()
    clusterStories(many, { now: NOW })
    expect(performance.now() - start).toBeLessThan(1500)
  })
})
