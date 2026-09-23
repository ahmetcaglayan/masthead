import { readFileSync } from 'node:fs'
import iconv from 'iconv-lite'
import { describe, expect, it, vi } from 'vitest'
import { extractArticle, extractFromHtml, MIN_TEXT_LENGTH } from '../../../src/core/reader/extract'
import { UnsafeUrlError } from '../../../src/core/reader/guard'

const FIXTURE = readFileSync(new URL('./fixtures/article.html', import.meta.url), 'utf8')
const URL_ = 'https://www.ornek-haber.example/turizm/kapadokya-balon-rekoru'
const publicLookup = async (): Promise<string[]> => ['93.184.216.34']

function htmlResponse(
  body: string | Uint8Array,
  contentType = 'text/html; charset=utf-8',
  status = 200
): Response {
  return new Response(body, { status, headers: { 'content-type': contentType } })
}

describe('extractFromHtml', () => {
  const result = extractFromHtml(FIXTURE, URL_)

  it('extracts the article with metadata read before Readability runs', () => {
    expect(result).not.toBeNull()
    expect(result).toMatchObject({
      url: URL_,
      title: "Kapadokya'da balon turları rekor kırdı",
      siteName: 'Örnek Haber',
      byline: 'Ayşe Yılmaz',
      publishedAt: Date.parse('2026-09-20T09:30:00+03:00'),
      image: 'https://www.ornek-haber.example/uploads/2026/09/balon-kapak.jpg'
    })
    expect(result!.textLength).toBeGreaterThanOrEqual(MIN_TEXT_LENGTH)
    expect(result!.html).toContain('Nevşehir')
  })

  it('keeps the lead paragraph exactly once', () => {
    const lead = 'işletmeciler yoğunluğun kasıma kadar sürmesini bekliyor.'
    expect(result!.html.split(lead)).toHaveLength(2)
  })

  it('resolves relative URLs against the page <base>', () => {
    expect(result!.html).toContain('href="https://www.ornek-haber.example/turizm/nevsehir"')
  })

  it('promotes lazy images and absolutises src and srcset', () => {
    expect(result!.html).toContain('src="https://www.ornek-haber.example/uploads/2026/09/balonlar.jpg"')
    expect(result!.html).toContain(
      'srcset="https://www.ornek-haber.example/uploads/2026/09/balonlar-640.jpg 640w, ' +
        'https://www.ornek-haber.example/uploads/2026/09/balonlar-1280.jpg 1280w"'
    )
    expect(result!.html).not.toContain('data:image')
    expect(result!.html).not.toMatch(/\sdata-[\w-]+=/)
  })

  it('removes scripts, embeds, forms, handlers and javascript: URLs', () => {
    const { html } = result!
    for (const needle of ['<script', '<style', '<iframe', '<form', '<input', '<button', '<nav', '<svg']) {
      expect(html).not.toContain(needle)
    }
    expect(html).not.toMatch(/\son\w+=/i)
    expect(html).not.toMatch(/javascript:/i)
    expect(html).not.toContain('tracker.example')
  })

  it('removes share bars, related boxes, tag lists, promos and empty paragraphs', () => {
    const { html } = result!
    for (const needle of [
      'Paylaş',
      'İlgili Haberler',
      'otel fiyatları',
      'Benzer haberler',
      'bağ bozumu',
      'Google'
    ]) {
      expect(html).not.toContain(needle)
    }
    expect(html).not.toContain('etiket/balon')
    expect(html).not.toMatch(/<p>\s*<\/p>/)
    expect(html).not.toContain('&nbsp;')
  })

  it('drops comments, which a browser may end earlier than the parser here', () => {
    const payload = '<!-- x --!><img srcset="//evil.example/share/a.jpg"> -->'
    const page = FIXTURE.replace('öneriliyor.', `öneriliyor.${payload}`)
    expect(page).toContain(payload)
    const { html } = extractFromHtml(page, URL_)!
    expect(html).toContain('öneriliyor.')
    expect(html).not.toContain('evil.example')
    expect(html).not.toContain('<!--')
  })

  it('lower-cases element names Readability creates', () => {
    expect(result!.html).not.toMatch(/<[A-Z]/)
  })

  it('returns null for pages without enough readable text', () => {
    const page =
      '<html><head><title>Kısa</title></head><body><article><p>Yalnızca bir cümle.</p></article></body></html>'
    expect(extractFromHtml(page, URL_)).toBeNull()
    expect(extractFromHtml('', URL_)).toBeNull()
  })

  it('falls back to the host name and strips the site from the headline', () => {
    const paragraphs = Array.from(
      { length: 4 },
      (_, i) => `<p>${'Uzun bir paragraf metni burada yer alıyor. '.repeat(8)} ${i}</p>`
    )
    const page = `<html><head><title>Deprem tatbikatı yapıldı | Yerel Gazete</title></head>
      <body><div class="icerik">${paragraphs.join('')}</div></body></html>`
    const content = extractFromHtml(page, 'https://www.yerelgazete.example/haber/1')
    expect(content).toMatchObject({ title: 'Deprem tatbikatı yapıldı', siteName: 'yerelgazete.example' })
    expect(content?.byline).toBeUndefined()
    expect(content?.publishedAt).toBeUndefined()
  })
})

describe('extractArticle', () => {
  it('decodes windows-1254 pages declared in a meta tag', async () => {
    const legacy = FIXTURE.replace('<meta charset="utf-8" />', '<meta charset="windows-1254" />')
    const fetch = vi.fn(async () => htmlResponse(iconv.encode(legacy, 'windows-1254'), 'text/html'))
    const content = await extractArticle(URL_, { fetch, lookup: publicLookup })
    expect(content?.title).toBe("Kapadokya'da balon turları rekor kırdı")
    expect(content?.html).toContain('Rüzgârın elverişli olduğu günlerde')
  })

  it('follows redirects and uses the final URL as the base', async () => {
    const final = 'https://www.ornek-haber.example/amp/kapadokya'
    const fetch = vi.fn(async (input: string | URL | Request) =>
      String(input) === URL_
        ? new Response(null, { status: 301, headers: { location: '/amp/kapadokya' } })
        : htmlResponse(FIXTURE.replace('<base href="/turizm/" />', ''))
    )
    const content = await extractArticle(URL_, { fetch, lookup: publicLookup })
    expect(fetch).toHaveBeenCalledTimes(2)
    expect(content?.url).toBe(final)
    expect(content?.html).toContain('href="https://www.ornek-haber.example/amp/nevsehir"')
  })

  it('sends a browser-like request for HTML', async () => {
    const fetch = vi.fn(async (_input: string | URL | Request, _init?: RequestInit) => htmlResponse(FIXTURE))
    await extractArticle(URL_, { fetch, lookup: publicLookup })
    const headers = fetch.mock.calls[0][1]?.headers as Record<string, string>
    expect(headers.Accept).toContain('text/html')
    expect(headers['User-Agent']).toContain('Mozilla/5.0')
  })

  it('returns null for non-HTML responses', async () => {
    const fetch = vi.fn(async () => htmlResponse('%PDF-1.7', 'application/pdf'))
    await expect(extractArticle(URL_, { fetch, lookup: publicLookup })).resolves.toBeNull()
  })

  it('rejects on HTTP errors', async () => {
    const fetch = vi.fn(async () => htmlResponse('Bulunamadı', 'text/html', 404))
    await expect(extractArticle(URL_, { fetch, lookup: publicLookup })).rejects.toThrow('HTTP 404')
  })

  it('refuses private addresses and other schemes without fetching', async () => {
    const fetch = vi.fn(async () => htmlResponse(FIXTURE))
    await expect(extractArticle('http://127.0.0.1:8080/admin', { fetch })).rejects.toBeInstanceOf(
      UnsafeUrlError
    )
    await expect(extractArticle('file:///C:/Windows/win.ini', { fetch })).rejects.toBeInstanceOf(
      UnsafeUrlError
    )
    const privateLookup = async (): Promise<string[]> => ['192.168.1.10']
    await expect(extractArticle(URL_, { fetch, lookup: privateLookup })).rejects.toBeInstanceOf(
      UnsafeUrlError
    )
    expect(fetch).not.toHaveBeenCalled()
  })
})
