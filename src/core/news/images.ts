/**
 * Image handling: collecting `<img>`s from feed HTML, telling real photos from
 * logos and tracking pixels, picking the best candidate for an article and
 * finding a page's og:image when the feed had none.
 */
import { decodeEntities } from './text'
import { absoluteUrl } from './urls'

/** Where a candidate came from; drives its base rank. */
export type ImageSource =
  'enclosure' | 'media:content' | 'media:thumbnail' | 'itunes:image' | 'image' | 'html'

export interface ImageCandidate {
  url: string
  width?: number
  type?: string
  source: ImageSource
}

const SOURCE_RANK: Record<ImageSource, number> = {
  'media:content': 3,
  enclosure: 2.9,
  image: 2,
  'itunes:image': 1.5,
  'media:thumbnail': 1,
  html: 1
}

const JUNK_IMAGE =
  /(?:^|[/_.=-])(?:1x1|pixel\.(?:gif|png)|tracking-?pixel|spacer|blank|transparent|logo|avatar|icon|favicon|placeholder|no-?image|default-?(?:image|img|thumb)|sprite|gravatar|emoji|badge)s?(?=$|[/_.?#=&\d-])/i
const JUNK_HOST =
  /(?:^|\.)(?:feeds\.feedburner\.com|pixel\.wp\.com|stats\.wp\.com|doubleclick\.net|google-analytics\.com)$/i

/**
 * A file name cut short (Habertürk's local-news feed points at city placeholders like
 * `…/common/local-news/sakarya-` that answer 404), or a site's stock picture
 * (`…/images/default.png`, Dünya's `default-45-yil.png`).
 */
const PLACEHOLDER_FILE = /[-_]$|\/default[\w-]*\.(?:png|jpe?g|gif|webp|svg)$/i

/** Logos, avatars, icons, spacers, tracking pixels and placeholders — never an article's photo. */
export function isJunkImage(url: string): boolean {
  if (url.startsWith('data:')) return true
  try {
    const { hostname, pathname, search } = new URL(url)
    return (
      JUNK_HOST.test(hostname) ||
      PLACEHOLDER_FILE.test(pathname) ||
      JUNK_IMAGE.test(decodeURIComponent(pathname + search))
    )
  } catch {
    return true
  }
}

const SIZE_IN_NAME = /(?:^|[^\d])(\d{2,4})x(\d{2,4}|auto)(?!\d)/i
const BBC_WIDTH = /\/(?:ws|standard)\/(\d{2,4})\//
const WIDTH_HEIGHT = /[/_,]c?w(\d{2,4})h(\d{2,4})/i
const PATH_PAIR = /\/(\d{2,4})\/(\d{2,4})(?=\/)/g

/** Width encoded in an image URL (`620x350`, `/ws/240/`, `Cw1280h720`, Sabah's `/1200/675/`), if any. */
export function widthFromUrl(url: string): number | undefined {
  let path: string
  try {
    path = new URL(url).pathname
  } catch {
    return undefined
  }
  const named = SIZE_IN_NAME.exec(path) ?? WIDTH_HEIGHT.exec(path)
  if (named) return Number(named[1])
  const bbc = BBC_WIDTH.exec(path)
  if (bbc) return Number(bbc[1])
  for (const [, w, h] of path.matchAll(PATH_PAIR)) {
    const width = Number(w)
    const ratio = width / Number(h)
    if (width >= 60 && ratio >= 0.4 && ratio <= 3) return width
  }
  return undefined
}

/**
 * Verified size parameters that serve a larger rendition of the same image. The last
 * two are one CMS behind many Turkish sites (Halk TV, Yeniçağ, Oksijen, Nefes, Elele,
 * Artı Gerçek, Aydınlık, Dünya, Ekonomim, İnternethaber): its feeds ship 150×84
 * thumbnails as `/2/150/84/storage/…` or `/rcman/Cw150h84q95gc/storage/…`.
 */
const UPGRADES: [RegExp, string][] = [
  [/^(https:\/\/ichef\.bbci\.co\.uk\/(?:ace\/)?(?:ws|standard))\/(?:1\d\d|2\d\d|3\d\d)\//, '$1/800/'],
  [/^(https:\/\/[^/]+\/2)\/1\d\d\/\d\d\/(?=storage\/)/, '$1/800/450/'],
  [/^(https:\/\/[^/]+\/rcman\/)Cw1\d\dh\d\dq95gc\/(?=storage\/)/, '$1Cw1280h720q95gc/']
]

const GLUED_FILENAMES = /\/([\w-]+\.(?:jpe?g|png|webp|gif))([\w-]+\.(?:jpe?g|png|webp|gif))(?=$|[?#])/i

/**
 * Posta's feed glues a site-default filename onto the real one
 * (`…/627e…f5.jpg6ab2…49.jpg`); the real photo is the last filename.
 */
export function repairImageUrl(url: string): string {
  return url.replace(GLUED_FILENAMES, '/$2')
}

/** Swap a known thumbnail URL for a larger rendition. */
export function upgradeImageUrl(url: string): string {
  for (const [pattern, replacement] of UPGRADES) {
    if (pattern.test(url)) return url.replace(pattern, replacement)
  }
  return url
}

const IMG_TAG = /<img\b(?:[^>"']|"[^"]*"|'[^']*')*>/gi
const ATTRIBUTE = /([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+))/g

/** Attributes of one HTML tag, names lower-cased, values entity-decoded. */
export function tagAttributes(tag: string): Record<string, string> {
  const attrs: Record<string, string> = {}
  for (const m of tag.matchAll(ATTRIBUTE)) {
    const name = m[1].toLowerCase()
    if (!(name in attrs)) attrs[name] = decodeEntities(m[2] ?? m[3] ?? m[4] ?? '').trim()
  }
  return attrs
}

/** `<img>` sources in an HTML fragment (lazy-loading attributes first), comments ignored. */
export function htmlImages(html: string): { url: string; width?: number }[] {
  if (!html || !/<img/i.test(html)) return []
  const images: { url: string; width?: number }[] = []
  for (const [tag] of html.replace(/<!--[\s\S]*?(?:-->|$)/g, '').matchAll(IMG_TAG)) {
    const attrs = tagAttributes(tag)
    const url = [attrs['data-src'], attrs['data-original'], attrs['data-lazy-src'], attrs.src].find(
      (value) => value && !value.startsWith('data:')
    )
    if (!url) continue
    const width = Number.parseInt(attrs.width ?? '', 10)
    images.push({ url, width: Number.isFinite(width) && width > 0 ? width : undefined })
  }
  return images
}

/**
 * The best image among a feed item's candidates, as an absolute URL. Larger known
 * widths win, `media:content`/`enclosure` outrank thumbnails and inline `<img>`s,
 * and a URL repeated across several fields gains trust (Akşam's enclosure is
 * sometimes a broken copy of its media:content). Junk and tiny images are skipped.
 */
export function pickImage(candidates: readonly ImageCandidate[], baseUrl: string): string | undefined {
  const scored = new Map<string, { rank: number; width?: number; count: number }>()
  for (const candidate of candidates) {
    const absolute = absoluteUrl(decodeEntities(candidate.url), baseUrl)
    const url = absolute && repairImageUrl(absolute)
    if (!url || isJunkImage(url)) continue
    const width = candidate.width ?? widthFromUrl(url)
    if (width !== undefined && width < 60) continue
    const entry = scored.get(url)
    if (entry) {
      entry.count++
      entry.rank = Math.max(entry.rank, SOURCE_RANK[candidate.source])
      if (width !== undefined) entry.width = Math.max(entry.width ?? 0, width)
    } else {
      scored.set(url, { rank: SOURCE_RANK[candidate.source], width, count: 1 })
    }
  }
  let best: string | undefined
  let bestScore = -Infinity
  for (const [url, { rank, width, count }] of scored) {
    const score = rank + (width === undefined ? 1.5 : Math.min(width, 2000) / 400) + (count - 1)
    if (score > bestScore) {
      best = url
      bestScore = score
    }
  }
  return best && upgradeImageUrl(best)
}

const META_TAG = /<(?:meta|link)\b(?:[^>"']|"[^"]*"|'[^']*')*>/gi
const PAGE_IMAGE_KEYS = [
  'og:image',
  'og:image:url',
  'og:image:secure_url',
  'twitter:image',
  'twitter:image:src'
]

/**
 * The lead image of an article page: og:image (or its secure/url variants),
 * twitter:image, `link[rel=image_src]`, else the first sizeable `<img>` inside
 * `<article>`. Returns an absolute URL or null.
 */
export function extractPageImage(html: string, pageUrl: string): string | null {
  const headEnd = html.search(/<\/head>/i)
  const head = headEnd > 0 ? html.slice(0, headEnd) : html.slice(0, 300_000)
  const found = new Map<string, string>()
  for (const [tag] of head.matchAll(META_TAG)) {
    const attrs = tagAttributes(tag)
    const isLink = /^<link/i.test(tag)
    if (isLink && !/\bimage_src\b/i.test(attrs.rel ?? '')) continue
    const key = isLink ? 'image_src' : (attrs.property ?? attrs.name ?? attrs.itemprop ?? '').toLowerCase()
    const value = isLink ? attrs.href : attrs.content
    if (key && value && !found.has(key)) found.set(key, value)
  }
  for (const key of [...PAGE_IMAGE_KEYS, 'image_src']) {
    const url = absoluteUrl(found.get(key), pageUrl)
    if (url && !isJunkImage(url)) return url
  }
  const article = /<article\b[\s\S]*?<\/article>/i.exec(html)?.[0]
  if (article) {
    for (const image of htmlImages(article)) {
      const url = absoluteUrl(image.url, pageUrl)
      if (url && !isJunkImage(url) && (image.width ?? widthFromUrl(url) ?? 600) >= 300) return url
    }
  }
  return null
}
