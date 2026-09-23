/**
 * Reader mode: download an article page and turn it into clean, self-contained HTML
 * with Mozilla Readability on a linkedom DOM.
 */
import { Readability } from '@mozilla/readability'
import { PAYWALL_TIERS, jsonLdDeclaresPaywall } from '../../shared/paywall'
import type { ReaderContent } from '../../shared/types'
import { fetchText } from '../net'
import { parseDocument, type DomDocument, type DomElement, type DomNode } from './dom'
import { createSafeFetch, type HostLookup } from './guard'

export interface ExtractOptions {
  fetch?: typeof fetch
  /** Default 20 s. */
  timeoutMs?: number
  lookup?: HostLookup
}

/** Pages with less readable text than this are not worth a reader view. */
export const MIN_TEXT_LENGTH = 400
const MAX_BYTES = 6 * 1024 * 1024

type ReadabilityDocument = ConstructorParameters<typeof Readability>[0]

/**
 * Download `url` and extract its article. Resolves null when the page is not HTML or
 * holds no readable article; rejects on network/HTTP errors, and with `UnsafeUrlError`
 * for non-http(s) URLs and private hosts.
 */
export async function extractArticle(
  url: string,
  options: ExtractOptions = {}
): Promise<ReaderContent | null> {
  const safeFetch = createSafeFetch(options.fetch ?? ((input, init) => fetch(input, init)), {
    lookup: options.lookup
  })
  const page = await fetchText(url, {
    fetch: safeFetch,
    timeoutMs: options.timeoutMs ?? 20_000,
    maxBytes: MAX_BYTES,
    accept: 'text/html,application/xhtml+xml;q=0.9,*/*;q=0.8'
  })
  if (!page.ok) throw new Error(`HTTP ${page.status}`)
  if (page.contentType && !/html|xml/i.test(page.contentType)) return null
  return extractFromHtml(page.text, page.url)
}

/** Extract the article from decoded HTML that was served from `url`. */
export function extractFromHtml(html: string, url: string): ReaderContent | null {
  const document = parseDocument(html)
  // linkedom has no document URL, so Readability resolves relative links against <base>.
  const base = setBase(document, url)
  // Metadata first: Readability rewrites the DOM while it works.
  const meta = readMetadata(document, base)
  // The publisher keeps it for subscribers: no text of it, only what the reader needs to go there.
  if (meta.paywalled) {
    const siteName = meta.siteName ?? new URL(url).hostname.replace(/^www\./, '')
    return {
      url,
      title: cleanTitle(meta.title ?? '', siteName, url),
      siteName,
      html: '',
      textLength: 0,
      image: meta.image,
      publishedAt: parseDate(meta.published),
      paywalled: true
    }
  }
  const lead = findLead(document, meta)
  promoteLazyImages(document)
  removeBoilerplate(document)

  let article: ReturnType<Readability<DomElement>['parse']>
  try {
    article = new Readability<DomElement>(document as unknown as ReadabilityDocument, {
      charThreshold: 250,
      serializer: (node) => node as DomElement
    }).parse()
  } catch {
    return null
  }
  if (!article?.content) return null
  const content = article.content.querySelector('#readability-page-1') ?? article.content

  cleanContent(content, base)
  const text = collapse(content.textContent)
  // News sites often print the lead ("spot") above the body, where Readability does not look.
  const missingLead =
    lead && !squash(text.slice(0, 2000)).includes(squash(lead).slice(0, 60)) ? lead : undefined
  const textLength = text.length + (missingLead?.length ?? 0)
  if (textLength < MIN_TEXT_LENGTH) return null

  const siteName = meta.siteName ?? tidy(article.siteName) ?? new URL(url).hostname.replace(/^www\./, '')
  const leadHtml = missingLead ? `<p><strong>${escapeHtml(missingLead)}</strong></p>\n` : ''
  return {
    url,
    title: cleanTitle(tidy(article.title) ?? meta.title ?? '', siteName, url),
    byline: pickByline(meta.author ?? tidy(article.byline), siteName),
    siteName,
    html: leadHtml + content.innerHTML.trim(),
    textLength,
    image: meta.image ?? content.querySelector('img')?.getAttribute('src') ?? undefined,
    publishedAt: parseDate(meta.published ?? tidy(article.publishedTime))
  }
}

// ---------------------------------------------------------------------------------------------
// Document preparation

/** Insert (or replace) `<base href>` with an absolute URL and return it. */
function setBase(document: DomDocument, url: string): string {
  let base = url
  for (const element of document.querySelectorAll('base')) {
    const href = element.getAttribute('href')
    const resolved = href && base === url ? resolveUrl(href, url) : undefined
    if (resolved?.startsWith('http')) base = resolved
    element.remove()
  }
  const element = document.createElement('base')
  element.setAttribute('href', base)
  ;(document.head ?? document.documentElement).prepend(element)
  return base
}

interface PageMeta {
  title?: string
  description?: string
  siteName?: string
  author?: string
  published?: string
  image?: string
  /** The page says the article is for subscribers (see `src/shared/paywall.ts`). */
  paywalled: boolean
}

function readMetadata(document: DomDocument, base: string): PageMeta {
  const metas = new Map<string, string>()
  for (const element of document.querySelectorAll('meta[content]')) {
    const key = (
      element.getAttribute('property') ??
      element.getAttribute('name') ??
      element.getAttribute('itemprop')
    )
      ?.trim()
      .toLowerCase()
    const content = tidy(element.getAttribute('content'))
    if (key && content && !metas.has(key)) metas.set(key, content)
  }
  const meta = (...keys: string[]): string | undefined =>
    keys.map((key) => metas.get(key)).find((value) => value !== undefined)
  const ld = readJsonLd(document)
  const image =
    meta('og:image:secure_url', 'og:image', 'og:image:url', 'twitter:image', 'twitter:image:src') ??
    ld.image ??
    document.querySelector('link[rel="image_src"]')?.getAttribute('href') ??
    undefined

  return {
    title: meta('og:title', 'twitter:title') ?? tidy(document.querySelector('title')?.textContent),
    description: meta('og:description', 'description', 'twitter:description'),
    siteName: meta('og:site_name', 'application-name') ?? ld.publisher,
    author: ld.author ?? personName(meta('author', 'article:author', 'dc.creator', 'parsely-author')),
    published:
      ld.published ??
      meta(
        'article:published_time',
        'og:article:published_time',
        'datepublished',
        'pubdate',
        'publishdate',
        'publish-date',
        'dc.date.issued',
        'dc.date',
        'date'
      ) ??
      tidy(document.querySelector('time[datetime]')?.getAttribute('datetime')),
    image: image ? httpUrl(image, base) : undefined,
    paywalled:
      PAYWALL_TIERS.includes(meta('article:content_tier')?.toLowerCase() ?? '') || declaresPaywall(document)
  }
}

/** Whether any JSON-LD block on the page marks the article as not free to read. */
function declaresPaywall(document: DomDocument): boolean {
  for (const script of document.querySelectorAll('script[type="application/ld+json" i]')) {
    try {
      if (jsonLdDeclaresPaywall(JSON.parse(stripJsonWrapper(script.textContent ?? '')))) return true
    } catch {
      // A malformed block says nothing.
    }
  }
  return false
}

const LEAD_CANDIDATES =
  'h2, p, [class*="spot" i], [class*="desc" i], [class*="summary" i], [class*="lead" i], [class*="ozet" i]'

/**
 * The page's own lead paragraph: the element whose text starts like the (often truncated)
 * meta description, as long as it is not just the headline again.
 */
function findLead(document: DomDocument, meta: PageMeta): string | undefined {
  if (!meta.description || meta.description.length < 40) return undefined
  const prefix = squash(meta.description).slice(0, 40)
  const headline = squash(meta.title ?? '')
  for (const element of document.body?.querySelectorAll(LEAD_CANDIDATES) ?? []) {
    const text = collapse(element.textContent)
    if (text.length < 40 || text.length > 1000) continue
    const squashed = squash(text)
    if (squashed.startsWith(prefix) && !headline.startsWith(squashed)) return text
  }
  return undefined
}

/** JSON-LD some CMSs wrap in HTML comments or CDATA markers. */
const stripJsonWrapper = (text: string): string =>
  text.replace(/^\s*(?:<!--|\/\/\s*<!\[CDATA\[)|(?:-->|\/\/\s*\]\]>)\s*$/g, '')

interface JsonLdMeta {
  published?: string
  author?: string
  image?: string
  publisher?: string
}

const ARTICLE_TYPE = /Article|Posting|Reportage/

function readJsonLd(document: DomDocument): JsonLdMeta {
  for (const script of document.querySelectorAll('script[type="application/ld+json" i]')) {
    let data: unknown
    try {
      data = JSON.parse(stripJsonWrapper(script.textContent ?? ''))
    } catch {
      continue
    }
    const node = findArticleNode(data, 0)
    if (!node) continue
    return {
      published: typeof node.datePublished === 'string' ? tidy(node.datePublished) : undefined,
      author: personName(node.author),
      image: imageUrl(node.image),
      publisher: personName(node.publisher)
    }
  }
  return {}
}

function findArticleNode(value: unknown, depth: number): Record<string, unknown> | undefined {
  if (depth > 4) return undefined
  if (Array.isArray(value)) {
    for (const item of value) {
      const found = findArticleNode(item, depth + 1)
      if (found) return found
    }
    return undefined
  }
  if (!isRecord(value)) return undefined
  const types = ([] as unknown[]).concat(value['@type'])
  if (types.some((type) => typeof type === 'string' && ARTICLE_TYPE.test(type))) return value
  return findArticleNode(value['@graph'], depth + 1) ?? findArticleNode(value.mainEntity, depth + 1)
}

/** A person/organisation name from a string, `{ name }`, or a list of either; URLs are not names. */
function personName(value: unknown): string | undefined {
  if (Array.isArray(value)) {
    const names = value.map(personName).filter((name): name is string => Boolean(name))
    return names.length > 0 ? names.join(', ') : undefined
  }
  const raw = isRecord(value) ? value.name : value
  const name = typeof raw === 'string' ? tidy(raw) : undefined
  return name && !/^https?:\/\//i.test(name) ? name : undefined
}

function imageUrl(value: unknown): string | undefined {
  if (Array.isArray(value)) return imageUrl(value[0])
  if (typeof value === 'string') return tidy(value)
  if (isRecord(value)) return imageUrl(value.url ?? value.contentUrl)
  return undefined
}

const LAZY_SRC = [
  'data-src',
  'data-lazy-src',
  'data-original',
  'data-lazy',
  'data-original-src',
  'data-hi-res-src'
]
const LAZY_SRCSET = ['data-srcset', 'data-lazy-srcset', 'data-original-srcset']
const PLACEHOLDER =
  /^data:|(?:blank|spacer|placeholder|lazy|loading|transparent|pixel|1x1|dummy)[^/]*\.(?:gif|png|svg|jpe?g|webp)(?:[?#]|$)/i

/** Move lazy-loading attributes (`data-src`, …) into `src` / `srcset` when the real ones are missing or placeholders. */
function promoteLazyImages(scope: DomDocument | DomElement): void {
  for (const element of scope.querySelectorAll('img, source')) {
    const lazySrc = firstAttribute(element, LAZY_SRC)
    const src = element.getAttribute('src')?.trim()
    if (lazySrc && !/^data:|[{}]/i.test(lazySrc) && (!src || PLACEHOLDER.test(src)))
      element.setAttribute('src', lazySrc)
    const lazySrcset = firstAttribute(element, LAZY_SRCSET)
    const srcset = element.getAttribute('srcset')?.trim()
    if (lazySrcset && (!srcset || PLACEHOLDER.test(srcset))) element.setAttribute('srcset', lazySrcset)
  }
}

function firstAttribute(element: DomElement, names: string[]): string | undefined {
  for (const name of names) {
    const value = element.getAttribute(name)?.trim()
    if (value) return value
  }
  return undefined
}

/** Class/id tokens of share bars, related-story boxes, tag lists, comments and ads (English and Turkish). */
const BOILERPLATE =
  /(?:^|[\s_-])(?:share|sharing|social|paylas|paylasim|sosyal|related|ilgili|benzer|recommended|also-read|more-news|diger-haberler|newsletter|bulten|subscribe|abone|comments?|yorumlar|tags|etiketler|breadcrumbs?|advert|advertisement|reklam|sponsored)(?:$|[\s_-])/i

/** Remove boxes Readability's English-only heuristics miss, but never one holding a large part of the text. */
function removeBoilerplate(document: DomDocument): void {
  const body = document.body
  if (!body) return
  const total = paragraphTextLength(body)
  for (const element of body.querySelectorAll('[class], [id]')) {
    const tokens = `${element.getAttribute('class') ?? ''} ${element.getAttribute('id') ?? ''}`
    if (!BOILERPLATE.test(tokens) || /^(?:html|body|main|article)$/i.test(element.tagName)) continue
    if (!body.contains(element) || element.querySelector('article, main, [itemprop="articleBody"]')) continue
    if (paragraphTextLength(element) > total * 0.25) continue
    element.remove()
  }
}

function paragraphTextLength(element: DomElement): number {
  let length = 0
  for (const paragraph of element.querySelectorAll('p')) length += collapse(paragraph.textContent).length
  return length
}

// ---------------------------------------------------------------------------------------------
// Content clean-up

const STRIP =
  'script, style, noscript, iframe, frame, object, embed, form, input, button, select, textarea, link, meta, template, canvas, dialog, nav'
const URL_ATTRIBUTES = new Set([
  'href',
  'src',
  'srcset',
  'poster',
  'cite',
  'action',
  'formaction',
  'xlink:href',
  'background'
])
const SAFE_PROTOCOLS = new Set(['http:', 'https:', 'mailto:', 'tel:'])

/** Make the extracted article safe and self-contained. */
function cleanContent(root: DomElement, base: string): void {
  removeComments(root)
  for (const element of root.querySelectorAll(STRIP)) element.remove()
  for (const svg of root.querySelectorAll('svg')) {
    if (
      svg.querySelector('use') ||
      svg.getAttribute('aria-hidden') === 'true' ||
      /icon|sprite/i.test(svg.getAttribute('class') ?? '')
    ) {
      svg.remove()
    }
  }
  promoteLazyImages(root)
  for (const element of root.querySelectorAll('*')) cleanAttributes(element, base)
  for (const image of root.querySelectorAll('img')) {
    const size = `${image.getAttribute('width')}x${image.getAttribute('height')}`
    if (!image.getAttribute('src') || /^[01]x|x[01]$/.test(size)) image.remove()
    else image.setAttribute('loading', 'lazy')
  }
  removeRelatedBlocks(root)
  removeEmpty(root)
}

const COMMENT_NODE = 8

/**
 * Drop comments. Browsers end one at `--!>` where linkedom reads on to the next
 * `-->`, so markup this parser keeps as comment text, never cleaned, can be live in the app.
 */
function removeComments(root: DomNode): void {
  const pending: DomNode[] = [root]
  for (let node = pending.pop(); node; node = pending.pop()) {
    for (const child of Array.from(node.childNodes)) {
      if (child.nodeType === COMMENT_NODE) child.remove()
      else pending.push(child)
    }
  }
}

function cleanAttributes(element: DomElement, base: string): void {
  for (const { name, value } of Array.from(element.attributes)) {
    const key = name.toLowerCase()
    if (key.startsWith('on') || key.startsWith('data-') || key === 'style') {
      element.removeAttribute(name)
    } else if (URL_ATTRIBUTES.has(key)) {
      const resolved = key === 'srcset' ? resolveSrcset(value, base) : resolveUrl(value, base)
      if (resolved) element.setAttribute(name, resolved)
      else element.removeAttribute(name)
    }
  }
}

/** Absolute URL with a safe protocol; in-page `#anchors` are kept as they are. */
function resolveUrl(value: string, base: string): string | undefined {
  const trimmed = value.trim()
  if (!trimmed) return undefined
  if (trimmed.startsWith('#')) return trimmed
  try {
    const url = new URL(trimmed, base)
    return SAFE_PROTOCOLS.has(url.protocol) ? url.href : undefined
  } catch {
    return undefined
  }
}

function httpUrl(value: string, base: string): string | undefined {
  const url = resolveUrl(value, base)
  return url?.startsWith('http') ? url : undefined
}

function resolveSrcset(value: string, base: string): string | undefined {
  const candidates: string[] = []
  for (const [, url, descriptor = ''] of value.matchAll(/(\S+)(\s+[\d.]+[xw])?\s*(?:,|$)/g)) {
    const resolved = httpUrl(url, base)
    if (resolved) candidates.push(`${resolved}${descriptor}`)
  }
  return candidates.length > 0 ? candidates.join(', ') : undefined
}

const RELATED_HEADING =
  /^(?:ilgili haberler|benzer haberler|diğer haberler|(?:bunlar da )?ilginizi çekebilir|önerilen haberler|editörün seçtikleri|related(?: articles| stories| news)?|read (?:more|next|also)|more (?:from|stories|news)|you (?:may|might) also like|recommended(?: for you)?|devamını oku|haberin devamı|paylaş|share(?: this)?|etiketler|tags)\s*:?$/

/** Calls to action sites put between paragraphs ("Haberlerimizi Google'da takip edin", …). */
const PROMO =
  /google(?:['’]?d[ae])? takip|google news|google haberler|uygulama(?:mız|larımız)ı indir|bakmadan geçme|(?:whatsapp|telegram) kanal/

/** Drop "Related news" / "Share" headings with the link list that follows them, and promo lines. */
function removeRelatedBlocks(root: DomElement): void {
  for (const element of root.querySelectorAll('h2, h3, h4, h5, h6, p, div, span, strong')) {
    const text = collapse(element.textContent)
    if (text.length === 0 || text.length > 80) continue
    // Both foldings: Turkish rules for "İlgili", default rules for English "RELATED".
    const variants = [text.toLowerCase(), text.toLocaleLowerCase('tr')]
    if (variants.some((variant) => RELATED_HEADING.test(variant))) {
      const next = element.nextElementSibling
      if (next && /^(?:ul|ol|div|section|aside)$/i.test(next.tagName) && linkDensity(next) > 0.5)
        next.remove()
      element.remove()
    } else if (variants.some((variant) => PROMO.test(variant))) {
      element.remove()
    }
  }
}

function linkDensity(element: DomElement): number {
  const total = collapse(element.textContent).length
  if (total === 0) return 0
  let links = 0
  for (const link of element.querySelectorAll('a')) links += collapse(link.textContent).length
  return links / total
}

const EMPTY_CANDIDATES =
  'p, div, section, figure, figcaption, span, strong, b, em, i, a, li, ul, ol, blockquote, h2, h3, h4, h5, h6'
const MEDIA = 'img, picture, video, audio, table, hr, svg, math'

/** Remove elements left without text or media, innermost first so emptied parents go too. */
function removeEmpty(root: DomElement): void {
  for (const element of Array.from(root.querySelectorAll(EMPTY_CANDIDATES)).reverse()) {
    if (collapse(element.textContent) === '' && !element.querySelector(MEDIA)) element.remove()
  }
}

// ---------------------------------------------------------------------------------------------
// Small helpers

function collapse(text: string | null | undefined): string {
  return (text ?? '').replace(/\s+/g, ' ').trim()
}

function tidy(value: string | null | undefined): string | undefined {
  const text = collapse(value)
  return text.length > 0 ? text : undefined
}

function escapeHtml(text: string): string {
  return text.replace(/[&<>"']/g, (char) => `&#${char.charCodeAt(0)};`)
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/** Lower-cased letters and digits only, for loose comparisons of names. */
function squash(text: string): string {
  return text.toLocaleLowerCase('tr').replace(/[^\p{L}\p{N}]/gu, '')
}

/** Strip a trailing (or leading) " - Site Name" from a headline. */
function cleanTitle(title: string, siteName: string, url: string): string {
  const hostLabel = squash(new URL(url).hostname.replace(/^(?:www|m|mobile|amp)\./, '').split('.')[0])
  const site = squash(siteName)
  const isSite = (part: string): boolean => {
    const squashed = squash(part)
    return (
      squashed.length > 0 &&
      (squashed.includes(hostLabel) ||
        (site.length > 0 && (squashed.includes(site) || site.includes(squashed))))
    )
  }
  const separator = /\s+[-|–—:»·]\s+/g
  const matches = [...title.matchAll(separator)]
  const last = matches.at(-1)
  if (last?.index !== undefined && isSite(title.slice(last.index + last[0].length))) {
    const rest = title.slice(0, last.index).trim()
    if (rest.length >= 10) return rest
  }
  const first = matches[0]
  if (first?.index !== undefined && isSite(title.slice(0, first.index))) {
    const rest = title.slice(first.index + first[0].length).trim()
    if (rest.length >= 10) return rest
  }
  return title
}

/** A byline worth showing: not the site's own name, not a paragraph of junk. */
function pickByline(author: string | undefined, siteName: string): string | undefined {
  if (!author || author.length > 100) return undefined
  return squash(author) === squash(siteName) ? undefined : author
}

/** Epoch ms for an ISO-like date, if it is plausible (after 1995, not in the future). */
function parseDate(value: string | undefined): number | undefined {
  if (!value) return undefined
  const time = Date.parse(value)
  const plausible =
    Number.isFinite(time) && time > Date.UTC(1995, 0, 1) && time < Date.now() + 2 * 24 * 60 * 60 * 1000
  return plausible ? time : undefined
}
