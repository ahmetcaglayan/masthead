import { describe, expect, it } from 'vitest'
import { decodeBody } from '../../../src/core/net'
import { parseFeed } from '../../../src/core/news/parse'
import { fixture, fixtureBytes } from './helpers'

describe('parseFeed — RSS 2.0', () => {
  it('reads Sabah: enclosure, media:content and the <img> in the description', () => {
    const feed = parseFeed(fixture('sabah-gundem.xml'))
    expect(feed.error).toBeUndefined()
    expect(feed.title).toBe('SABAH')
    expect(feed.items).toHaveLength(5)
    const [item] = feed.items
    expect(item.title).toBe(
      'Başkan Erdoğan\'ın konuşması sosyal medyada gündem oldu: "Adaletin Sesi Erdoğan" etiketi zirvede!'
    )
    expect(item.link).toMatch(/^https:\/\/www\.sabah\.com\.tr\/gundem\/2026\/09\/22\/baskan-erdoganin/)
    expect(item.published).toBe('Tue, 22 Sep 2026 21:23:59 +0300')
    expect(item.categories).toEqual(['Gündem'])
    expect(item.descriptionHtml).toContain('Devamı için tıklayınız')
    expect(item.imageCandidates.map((c) => c.source).sort()).toEqual(['enclosure', 'html', 'media:content'])
    expect(new Set(item.imageCandidates.map((c) => c.url)).size).toBe(1)
  })

  it('reads Sözcü: media:content with medium="image" and an entity-encoded offset', () => {
    const [item] = parseFeed(fixture('sozcu-gundem.xml')).items
    expect(item.published).toBe('Tue, 22 Sep 2026 21:56:22 +0300')
    expect(item.imageCandidates).toEqual([
      expect.objectContaining({ source: 'media:content', width: 1200, type: 'image/jpeg' })
    ])
  })

  it('reads Milliyet: link from atom:link, numeric guid, full-HTML description', () => {
    const [item] = parseFeed(fixture('milliyet-gundem.xml')).items
    expect(item.link).toBe(
      'https://www.milliyet.com.tr/dunya/iran-tahran-bagdat-ile-tahran-maskat-ucuslari-bu-gece-yarisindan-itibaren-iptal-edilecek-7665606'
    )
    expect(item.guid).toBe('7665606')
    expect(item.published).toBe('Tue, 22 Sep 2026 18:32:35 Z')
    expect(item.descriptionHtml).toMatch(/^<img src="https:\/\/image\.milimaj\.com/)
  })

  it('reads Hürriyet: full body from <text>, enclosure plus nested media:thumbnail', () => {
    const [item] = parseFeed(fixture('hurriyet-gundem.xml')).items
    expect(item.contentHtml).toContain('<p>Yangın, Samsun-Sinop kara yolu &uuml;zerinde')
    expect(item.imageCandidates.filter((c) => c.source !== 'html').map((c) => c.source)).toEqual([
      'enclosure',
      'media:content',
      'media:thumbnail',
      'media:thumbnail'
    ])
  })

  it('keeps Dünya’s mixed description (raw <img> element followed by CDATA)', () => {
    const [item] = parseFeed(fixture('dunya.xml')).items
    expect(item.title).toBe("İspanya, İsrail'in katılımı nedeniyle Eurovision'u boykot etmeye hazırlanıyor")
    expect(item.descriptionHtml).toMatch(
      /^<img style="border: navy 1px solid;" src="https:\/\/image\.dunya\.com/
    )
    expect(item.descriptionHtml).toContain('İspanya devlet televizyonu RTVE Başkanı')
    expect(item.imageCandidates).toEqual([
      expect.objectContaining({ source: 'enclosure', type: 'image/jpeg' }),
      expect.objectContaining({ source: 'html', width: 160 })
    ])
  })

  it('reads custom image tags: AA <image>, Mynet <ipimage>/<img640x360>, TRT content:encoded', () => {
    const aa = parseFeed(fixture('aa-guncel.xml'))
    expect(aa.items).toHaveLength(4)
    expect(aa.items[0].imageCandidates).toEqual([
      { url: expect.stringMatching(/^https:\/\/cdnuploads\.aa\.com\.tr\//), source: 'image' }
    ])

    const mynet = parseFeed(fixture('mynet.xml')).items[0]
    expect(mynet.title).toBe("İran heyeti Erdoğan'ı ayakta alkışladı, İsrailliler salonu terk etti")
    expect(mynet.imageCandidates.map((c) => [c.source, c.width])).toEqual([
      ['image', undefined],
      ['image', 640],
      ['image', 300]
    ])

    const trt = parseFeed(fixture('trt-gundem.xml')).items[0]
    expect(trt.contentHtml).toMatch(/^<article><header>/)
    expect(trt.author).toBe('AA')
  })

  it('decodes entities that Haberler.com escapes inside CDATA', () => {
    const [item] = parseFeed(fixture('haberler.xml')).items
    expect(item.title).toBe(
      "Dilek Kaya İmamoğlu, Turgutlu'daki okul saldırısına 'Daha ne olması bekleniyor?' dedi"
    )
    expect(item.author).toBe('Haberler')
  })
})

describe('parseFeed — Atom and RDF', () => {
  it('reads DW’s Atom feed', () => {
    const feed = parseFeed(fixture('dw-atom.xml'))
    expect(feed.items).toHaveLength(3)
    const [entry] = feed.items
    expect(entry.title).toBe("Erdoğan BM'de konuştu: Filistin devletinin sesi olacağız")
    expect(entry.link).toContain('https://www.dw.com/tr/erdoğan-bm-de-konuştu')
    expect(entry.guid).toBe('tag:dw.com,2026:79379215')
    expect(entry.published).toBe('2026-09-22T16:41:00Z')
    expect(entry.categories).toEqual(['GÜNDEM'])
    expect(entry.descriptionHtml).toContain('Filistin ve Kuzey Kıbrıs')
  })

  it('reads DW’s RDF / RSS 1.0 feed (items beside the channel, dc:date, dc:subject)', () => {
    const feed = parseFeed(fixture('dw-rdf.xml'))
    expect(feed.items).toHaveLength(3)
    const [item] = feed.items
    expect(item.title).toBe("Erdoğan BM'de konuştu: Filistin devletinin sesi olacağız")
    expect(item.link).toMatch(/maca=tur-rss-tur-all-1495-rdf$/)
    expect(item.published).toBe('2026-09-22T16:41:00Z')
    expect(item.categories).toEqual(['GÜNDEM'])
  })

  it('handles a minimal Atom entry with html content and image enclosure links', () => {
    const [entry] = parseFeed(
      '<feed xmlns="http://www.w3.org/2005/Atom"><entry><title type="html">A &amp;amp; B</title>' +
        '<link rel="enclosure" type="image/jpeg" href="https://x.test/a.jpg"/><link href="https://x.test/story"/>' +
        '<updated>2026-09-22T10:00:00+03:00</updated><author><name>Ayşe</name></author>' +
        '<content type="html">&lt;p&gt;Gövde&lt;/p&gt;</content></entry></feed>'
    ).items
    expect(entry).toMatchObject({
      title: 'A & B',
      link: 'https://x.test/story',
      published: '2026-09-22T10:00:00+03:00',
      author: 'Ayşe',
      contentHtml: '<p>Gövde</p>'
    })
    expect(entry.imageCandidates).toEqual([
      { url: 'https://x.test/a.jpg', type: 'image/jpeg', source: 'enclosure' }
    ])
  })
})

describe('parseFeed — encodings and failures', () => {
  it('parses a windows-1254 feed decoded with decodeBody (from the XML declaration or the header)', () => {
    const utf8 = parseFeed(fixture('turkiyegazetesi-dunya.xml')).items
    const bytes = fixtureBytes('turkiyegazetesi-dunya.windows-1254.xml')
    for (const contentType of ['application/xml', 'application/rss+xml; charset=iso-8859-9']) {
      const items = parseFeed(decodeBody(bytes, contentType)).items
      expect(items.map((i) => i.title)).toEqual(utf8.map((i) => i.title))
      expect(items[0].title).toBe('Trump duyurmuştu! Grönland anlaşması resmen imzalandı')
      expect(items[0].published).toBe('Sal, 22 Eyl 2026 22:08:24 +0300')
    }
  })

  it('falls back to windows-1254 for a feed that says UTF-8 but is not', () => {
    const utf8 = parseFeed(fixture('turkiyegazetesi-dunya.xml')).items
    const bytes = fixtureBytes('turkiyegazetesi-dunya.windows-1254.xml')
    const items = parseFeed(decodeBody(bytes, 'application/rss+xml; charset=utf-8')).items
    expect(items.map((i) => i.title)).toEqual(utf8.map((i) => i.title))
  })

  it('keeps a UTF-8 feed whose summaries a CMS cut in the middle of a letter', () => {
    // A byte-wise cut of "ş" (C5 9F) leaves a lone C5 at the end of each summary.
    const cut = Buffer.from([0xc5])
    const item = (n: number): Buffer[] => [
      Buffer.from(
        `<item><title>İstanbul'da yağmur ${n}</title><link>https://x.test/${n}</link><description>Özet kı`
      ),
      cut,
      Buffer.from('</description></item>')
    ]
    const bytes = Buffer.concat([
      Buffer.from('<?xml version="1.0" encoding="utf-8"?><rss version="2.0"><channel><title>Güncel</title>'),
      ...[1, 2, 3, 4, 5].flatMap(item),
      Buffer.from('</channel></rss>')
    ])
    const items = parseFeed(decodeBody(bytes, 'application/rss+xml; charset=utf-8')).items
    expect(items.map((i) => i.title)).toEqual([1, 2, 3, 4, 5].map((n) => `İstanbul'da yağmur ${n}`))
  })

  it('reports an HTML bot wall as "not a feed"', () => {
    const feed = parseFeed(fixture('ntv-bot-wall.html'))
    expect(feed.items).toEqual([])
    expect(feed.error).toMatch(/^not a feed/)
  })

  it('never throws on malformed or empty input', () => {
    for (const input of [
      '',
      '   ',
      'garbage',
      '<rss><channel><item><title>x</item>',
      '<rss>',
      '<?xml version="1.0"?>'
    ]) {
      expect(() => parseFeed(input)).not.toThrow()
    }
    expect(parseFeed('').error).toMatch(/not a feed/)
    expect(parseFeed('<Error><Code>NoSuchKey</Code></Error>').error).toBe('not a feed (<Error> document)')
    expect(parseFeed('<rss version="2.0"><channel><title>Boş</title></channel></rss>')).toEqual({
      title: 'Boş',
      items: []
    })
  })

  it('skips an unusable item without losing the rest', () => {
    const feed = parseFeed(
      '<rss><channel><item>plain text item</item><item><title>İyi</title><link>https://x.test/1</link></item></channel></rss>'
    )
    expect(feed.items.map((i) => i.title)).toEqual(['İyi'])
  })
})
