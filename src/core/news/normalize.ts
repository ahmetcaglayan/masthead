/**
 * Raw feed item → Article (+ optional ArticleDetail): full cleaned title, canonical
 * URL and id, plain-text summary without boilerplate, best image, a trustworthy
 * publish time, unified categories and province/region tags.
 */
import { META_CATEGORIES, type CategoryId } from '../../shared/categories'
import type { CountryPack } from '../../shared/countries/types'
import type { Article, ArticleDetail, FeedDef, SourceDef } from '../../shared/types'
import { categoriesFromLabel, categoriesFromUrl } from './categories'
import { parseFeedDate, publishedFromUrl } from './dates'
import type { GeoTagger } from './geo'
import { htmlImages, isJunkImage, pickImage, upgradeImageUrl } from './images'
import type { RawItem } from './parse'
import {
  collapseWhitespace,
  foldTr,
  htmlToParagraphs,
  isShouting,
  stripBoilerplate,
  stripTrailingHashtags,
  trLower
} from './text'
import { absoluteUrl, articleId, canonicalUrl } from './urls'

export interface NormalizeContext {
  source: SourceDef
  feed: FeedDef
  pack: CountryPack
  now: number
  /** Base for relative links: the feed's URL after redirects. */
  baseUrl: string
  geo: GeoTagger
}

export interface NormalizedItem {
  article: Article
  detail?: ArticleDetail
}

/** Summary cap in characters (the UI shows the whole summary on most layouts). */
export const SUMMARY_MAX_CHARS = 1500
/** Detail body cap in characters. */
export const DETAIL_MAX_CHARS = 12_000
/** A detail is kept only when the body is at least this much longer than the summary. */
const DETAIL_MIN_EXTRA_CHARS = 200
/** Publish times further in the future than this are clock or feed bugs. */
const FUTURE_TOLERANCE_MS = 10 * 60_000
const MAX_DETAIL_IMAGES = 20

/**
 * Matched on trLower'd text, where a capital I becomes ı ("BREAKING" → "breakıng",
 * "ACIL" → "acıl"). Covers the markers of every pack's language: Turkish, English,
 * German ("Eilmeldung"), Portuguese ("URGENTE", "Plantão") and French ("ALERTE INFO",
 * "Dernière minute", "Flash info", "URGENT").
 */
const BREAKING_PREFIX =
  /^\s*(?:[🔴🚨⚡❗‼]\s*)?(?:son ?dak[iı]ka(?: haber[iı]| haberler[iı])?|fla[şs](?: haber)?|flash(?: [iı]nfo)?|ac[iı]l|break[iı]ng(?: news)?|e[iı]lmeldung|urgente?|plant[aã]o|alerte(?: [iı]nfo)?|dern[iı][eè]re m[iı]nute)(?:\s*[:|!•»›–—.…-]+\s*|\s+ı\s+)/u

/**
 * A headline without Sabah's trailing hashtags and without a "SON DAKİKA:" /
 * "Son dakika |" / "SONDAKİKA…" / "FLAŞ!" / "ACİL:" / "BREAKING:" style prefix;
 * `breaking` reports whether one was there. `locale` is the pack's locale, so the
 * first letter of the remainder is re-capitalised the way that language expects
 * (only Turkish turns `i` into `İ`).
 */
export function cleanTitle(raw: string, locale = 'tr-TR'): { title: string; breaking: boolean } {
  const title = collapseWhitespace(stripTrailingHashtags(collapseWhitespace(raw)))
  const lower = trLower(title)
  const prefix = lower.length === title.length ? BREAKING_PREFIX.exec(lower) : null
  if (!prefix) return { title, breaking: false }
  const rest = title.slice(prefix[0].length).trim()
  if (!rest) return { title, breaking: true }
  return { title: rest.charAt(0).toLocaleUpperCase(locale) + rest.slice(1), breaking: true }
}

/** URL path segments of the sections where papers publish official notices ("resmi ilanlar"). */
const NOTICE_SECTION = /^(?:resmi-?)?ilan(?:lar)?$/i
/** Wording found only in official notices, matched on folded text. */
const NOTICE_PHRASE =
  /\b(?:esas|karar|dosya) no\b|\b(?:ihale|kamulastirma|satis|tasfiye) ilani\b|\b(?:tasfiye|satis) memurlugu(?:ndan)?\b|\bicra (?:dairesi|mudurlugu)nden\b|\bicradan satilik\b|\bilanen teblig/
/** The issuing office that ends a notice header, possibly in the ablative ("…MAHKEMESİNDEN"). */
const OFFICE_END =
  /^(?:mahkemesi|hakimligi|baskanligi|mudurlugu|memurlugu|dairesi|noterligi|savciligi)(?:n?d[ae]n)?$/
const COURT_WORD = /\b(?:mahkeme|hakimlig|icra\b|noterlig|savcilig|memurlug)/
const OFFICIAL_PREFIX = /^t\.? ?c\b/
/** Headlines that name no story: a section or feed label. */
const PLACEHOLDER_TITLES = new Set([
  'haber',
  'haberler',
  'son dakika',
  'son dakika haberleri',
  'son haberler',
  'gundem',
  'anasayfa',
  'ana sayfa',
  'manset',
  'rss'
])

const plainKey = (text: string): string =>
  foldTr(text)
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()

/**
 * A notice header: a short, unpunctuated title that is nothing but the issuing office
 * ("T.C. KÜTAHYA 3. ASLİYE HUKUK MAHKEMESİNDEN", "Keşan 1. Asliye Hukuk Mahkemesi
 * Hakimliği", "SİLİVRİ BELEDİYE BAŞKANLIĞI").
 */
function isNoticeHeader(title: string, folded: string): boolean {
  if (/[:!?"“”'’‘]/.test(title)) return false
  const words = folded.split(/[^a-z0-9]+/).filter(Boolean)
  if (words.length === 0 || words.length > 12) return false
  const official = OFFICIAL_PREFIX.test(folded)
  if (official && isShouting(title)) return true
  if (!OFFICE_END.test(words[words.length - 1])) return false
  return official || COURT_WORD.test(folded) || isShouting(title)
}

/**
 * Items that are not news: official notices that papers publish in their feeds
 * (court summons, enforcement sales, tenders, expropriations — by their section
 * URL or their wording) and items titled only with the site's name or a section
 * label. A story that merely mentions a court is kept.
 */
export function isJunkItem(title: string, url: string, source: SourceDef): boolean {
  try {
    if (new URL(url).pathname.split('/').some((segment) => NOTICE_SECTION.test(segment))) return true
  } catch {
    return true
  }
  const folded = foldTr(title)
  if (NOTICE_PHRASE.test(folded) || isNoticeHeader(title, folded)) return true
  const key = plainKey(title)
  if (!key || PLACEHOLDER_TITLES.has(key) || key === plainKey(source.name)) return true
  try {
    return key === plainKey(new URL(source.homepage).hostname.replace(/^www\./, ''))
  } catch {
    return false
  }
}

const WORD = /[\p{L}\p{M}\p{N}]+/gu

function foldedWords(text: string): { word: string; end: number }[] {
  return [...text.matchAll(WORD)].map((m) => ({ word: foldTr(m[0]), end: m.index + m[0].length }))
}

/**
 * Drop a leading paragraph that just repeats the headline (or its first words). When
 * the headline opens a longer paragraph and is set off by punctuation, only the
 * headline is removed.
 */
function removeTitleEcho(paragraphs: string[], title: string): string[] {
  const [first, ...rest] = paragraphs
  const titleWords = foldedWords(title).map((w) => w.word)
  if (first === undefined || titleWords.length === 0) return paragraphs
  const words = foldedWords(first)
  if (words.length <= titleWords.length && words.every((w, i) => w.word === titleWords[i])) return rest
  if (words.length < titleWords.length || titleWords.some((word, i) => words[i].word !== word)) {
    return paragraphs
  }
  const end = words[titleWords.length - 1].end
  const remainder = first.slice(end).replace(/^[\s\p{P}\p{S}]+/u, '')
  if (remainder.length < 40) return rest
  const separator = first.slice(end, first.length - remainder.length)
  return /[.:;|!?–—-]/.test(separator) ? [remainder, ...rest] : paragraphs
}

/** Cut `text` to at most `max` characters at a sentence end (or else a word boundary) and add "…". */
export function truncateText(text: string, max: number): string {
  if (text.length <= max) return text
  const slice = text.slice(0, max)
  let cut = -1
  for (const m of slice.matchAll(/[.!?…]["'”’)]*(?=\s)/g)) cut = m.index + m[0].length
  if (cut < max * 0.6) cut = slice.lastIndexOf(' ')
  if (cut < max * 0.6) cut = max
  return slice.slice(0, cut).replace(/[\s\p{P}]+$/u, '') + '…'
}

function capParagraphs(paragraphs: string[], max: number): string[] {
  const out: string[] = []
  let total = 0
  for (const paragraph of paragraphs) {
    const budget = max - total
    if (paragraph.length <= budget) {
      out.push(paragraph)
      total += paragraph.length + 2
      continue
    }
    if (budget > 200) out.push(truncateText(paragraph, budget))
    break
  }
  return out
}

function cleanAuthor(raw: string, sourceName: string): string | undefined {
  const named = /\(([^)]+)\)\s*$/.exec(raw)?.[1] ?? raw
  const author = collapseWhitespace(named.replace(/\S+@\S+/g, '')).slice(0, 80)
  if (!author || foldTr(author) === foldTr(sourceName)) return undefined
  return author
}

function textLength(paragraphs: string[]): number {
  return paragraphs.reduce((sum, p) => sum + p.length + 2, 0)
}

/**
 * Normalise one raw item; null when it has no usable title or link, or is not news
 * (see `isJunkItem`). `isBreaking` only reports an explicit marker in the headline:
 * items of a breaking feed get the `breaking` category, and the service decides after
 * clustering whether they are breaking news.
 */
export function normalizeItem(raw: RawItem, ctx: NormalizeContext): NormalizedItem | null {
  const { source, feed, pack, now, baseUrl, geo } = ctx
  const { title, breaking: titleBreaking } = cleanTitle(raw.title, pack.locale)
  const url = canonicalUrl(raw.link, baseUrl)
  if (!title || !url || isJunkItem(title, url, source)) return null
  const id = articleId(url)

  const description = stripBoilerplate(htmlToParagraphs(raw.descriptionHtml))
  const content = raw.contentHtml ? stripBoilerplate(htmlToParagraphs(raw.contentHtml)) : []
  const lead = removeTitleEcho(description, title)
  const summary = truncateText(
    (lead.length ? lead : removeTitleEcho(content, title)).join('\n\n'),
    SUMMARY_MAX_CHARS
  )
  const bodyIsContent = textLength(content) > textLength(description)
  const body = removeTitleEcho(bodyIsContent ? content : description, title)

  const image = pickImage(raw.imageCandidates, url)
  let detail: ArticleDetail | undefined
  if (textLength(body) > summary.length + DETAIL_MIN_EXTRA_CHARS) {
    const images = new Set<string>()
    for (const candidate of htmlImages(bodyIsContent ? raw.contentHtml : raw.descriptionHtml)) {
      const src = absoluteUrl(candidate.url, url)
      if (!src || isJunkImage(src)) continue
      const large = upgradeImageUrl(src)
      if (large !== image && images.size < MAX_DETAIL_IMAGES) images.add(large)
    }
    detail = { id, paragraphs: capParagraphs(body, DETAIL_MAX_CHARS), images: [...images] }
  }

  const timeZone = feed.timeZone ?? pack.timeZone
  const parsed = parseFeedDate(raw.published, timeZone, feed.timeZone !== undefined)
  const publishedAt =
    parsed === null
      ? (publishedFromUrl(url, timeZone, now) ?? now)
      : parsed > now + FUTURE_TOLERANCE_MS
        ? now
        : parsed

  const categories = new Set<CategoryId>([feed.category])
  if (feed.breaking || titleBreaking) categories.add('breaking')
  if (feed.headline) categories.add('top')
  if (feed.province || feed.region) categories.add('local')
  for (const label of raw.categories) {
    for (const category of categoriesFromLabel(label, pack.language)) categories.add(category)
  }
  if (META_CATEGORIES.includes(feed.category)) {
    for (const category of categoriesFromUrl(url, pack.language)) categories.add(category)
  }

  const geoTags = geo.tag(`${title}\n${summary}`)
  const provinces = new Set(geoTags.provinces)
  const regions = new Set(geoTags.regions)
  if (feed.province) {
    provinces.add(feed.province)
    const region = geo.regionOf(feed.province)
    if (region) regions.add(region)
  }
  if (feed.region) regions.add(feed.region)

  const article: Article = {
    id,
    url,
    title,
    summary,
    hasDetail: detail !== undefined,
    publishedAt,
    fetchedAt: now,
    sourceId: source.id,
    categories: [...categories],
    isBreaking: titleBreaking,
    isHeadline: feed.headline === true,
    provinces: [...provinces],
    regions: [...regions]
  }
  if (image) article.image = image
  const author = cleanAuthor(raw.author, source.name)
  if (author) article.author = author
  return { article, detail }
}
