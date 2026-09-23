import { readFileSync } from 'node:fs'
import type { WebContents } from 'electron'
import type { ReaderContent } from '@shared/types'

/** Isolated world the extraction runs in, apart from the page's scripts and the ad blocker's preload. */
const WORLD_ID = 1001
const TIMEOUT_MS = 8000
/** Below this much text the parse most likely hit a paywall or consent wall; the core extractor gets a try. */
const MIN_TEXT_LENGTH = 250

/**
 * Runs after Readability.js has defined its global: parses a clone of the live
 * DOM, then reduces the article HTML to an allowlist of tags and attributes with
 * absolute http(s) URLs. Kept as plain source so no bundler transform touches it.
 */
const EXTRACT_SCRIPT = String.raw`(() => {
  const DROP = new Set(['script', 'style', 'noscript', 'template', 'iframe', 'frame', 'frameset', 'object', 'embed',
    'form', 'input', 'button', 'textarea', 'select', 'option', 'link', 'meta', 'base', 'svg', 'math', 'canvas',
    'video', 'audio', 'dialog'])
  const KEEP = new Set(['a', 'abbr', 'article', 'b', 'blockquote', 'br', 'caption', 'cite', 'code', 'col', 'colgroup',
    'dd', 'del', 'details', 'dfn', 'div', 'dl', 'dt', 'em', 'figcaption', 'figure', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'hr', 'i', 'img', 'ins', 'kbd', 'li', 'mark', 'ol', 'p', 'picture', 'pre', 'q', 's', 'samp', 'section', 'small',
    'source', 'span', 'strong', 'sub', 'summary', 'sup', 'table', 'tbody', 'td', 'tfoot', 'th', 'thead', 'time', 'tr',
    'u', 'ul'])
  const ATTRS = new Set(['alt', 'title', 'width', 'height', 'colspan', 'rowspan', 'datetime', 'lang', 'dir', 'sizes',
    'media', 'type'])
  const absolute = (value) => {
    if (!value || !value.trim()) return null
    try {
      const url = new URL(value.trim(), document.baseURI)
      return url.protocol === 'http:' || url.protocol === 'https:' ? url.href : null
    } catch {
      return null
    }
  }
  const srcset = (value) => value.split(/,\s+/).map((candidate) => {
    const [url, descriptor] = candidate.trim().split(/\s+/)
    const resolved = url ? absolute(url) : null
    return resolved && descriptor ? resolved + ' ' + descriptor : resolved
  }).filter(Boolean).join(', ')

  const clean = (root) => {
    for (const el of [...root.querySelectorAll('*')]) {
      const tag = el.localName
      if (DROP.has(tag)) { el.remove(); continue }
      if (!KEEP.has(tag)) { el.replaceWith(...el.childNodes); continue }
      for (const { name, value } of [...el.attributes]) {
        if (name === 'href' || name === 'src' || name === 'cite') {
          const url = absolute(value)
          if (url) el.setAttribute(name, url)
          else el.removeAttribute(name)
        } else if (name === 'srcset') {
          const set = srcset(value)
          if (set) el.setAttribute(name, set)
          else el.removeAttribute(name)
        } else if (!ATTRS.has(name)) {
          el.removeAttribute(name)
        }
      }
      if (tag === 'img' && !el.hasAttribute('src') && !el.hasAttribute('srcset')) el.remove()
    }
  }

  const meta = (key) =>
    document.querySelector('meta[property="' + key + '"], meta[name="' + key + '"]')?.getAttribute('content') || ''
  const image = absolute(meta('og:image'))

  // Paywall signals (the same as src/shared/paywall.ts): an article its publisher keeps for
  // subscribers is not turned into text, whatever this page happens to show.
  const lockedOut = (data, depth) => {
    if (depth > 5 || !data || typeof data !== 'object') return false
    if (Array.isArray(data)) return data.some((item) => lockedOut(item, depth + 1))
    const free = data.isAccessibleForFree
    if (free === false || (typeof free === 'string' && free.trim().toLowerCase() === 'false')) return true
    return ['@graph', 'mainEntity', 'mainEntityOfPage', 'hasPart', 'isPartOf'].some((key) => lockedOut(data[key], depth + 1))
  }
  const tier = meta('article:content_tier').trim().toLowerCase()
  const paywalled = tier === 'locked' || tier === 'metered' ||
    [...document.querySelectorAll('script[type="application/ld+json" i]')].some((script) => {
      try {
        return lockedOut(JSON.parse(script.textContent.replace(/^\s*(?:<!--|\/\/\s*<!\[CDATA\[)|(?:-->|\/\/\s*\]\]>)\s*$/g, '')), 0)
      } catch {
        return false
      }
    })
  if (paywalled) {
    return { url: location.href, title: meta('og:title') || document.title, html: '', textLength: 0, image, paywalled: true }
  }

  const article = new Readability(document.cloneNode(true)).parse()
  if (!article || !article.content) return null
  // A parsed document is inert: nothing in it runs or loads while it is cleaned.
  const markup = '<!doctype html><html><head></head><body>' + article.content + '</body></html>'
  const body = new DOMParser().parseFromString(markup, 'text/html').body
  clean(body)

  const published = Date.parse(article.publishedTime || meta('article:published_time'))
  return {
    url: location.href,
    title: article.title || document.title,
    byline: article.byline || null,
    siteName: article.siteName || null,
    html: body.innerHTML,
    textLength: article.length || 0,
    image,
    publishedAt: Number.isFinite(published) ? published : null
  }
})()`

let readabilitySource: string | undefined

function readability(): string {
  readabilitySource ??= readFileSync(require.resolve('@mozilla/readability/Readability.js'), 'utf8')
  return readabilitySource
}

/**
 * Run Mozilla Readability inside a loaded page (the real Chromium DOM: right
 * charset, script-rendered content, consent already given). Null when the page
 * has no article or the extraction fails or times out.
 */
export async function extractFromPage(wc: WebContents): Promise<ReaderContent | null> {
  let timer: NodeJS.Timeout | undefined
  const timeout = new Promise<null>((resolve) => {
    timer = setTimeout(() => resolve(null), TIMEOUT_MS)
  })
  try {
    const run = wc.executeJavaScriptInIsolatedWorld(WORLD_ID, [
      { code: readability() },
      { code: EXTRACT_SCRIPT }
    ])
    return toReaderContent(await Promise.race([run, timeout]))
  } catch {
    return null
  } finally {
    clearTimeout(timer)
  }
}

/** Validate the page's result; it is built from page-controlled content. */
function toReaderContent(value: unknown): ReaderContent | null {
  if (!value || typeof value !== 'object') return null
  const raw = value as Record<string, unknown>
  const { url, title, html, textLength, byline, siteName, image, publishedAt } = raw
  if (typeof url !== 'string' || typeof title !== 'string' || typeof html !== 'string') return null
  // For subscribers only: nothing of the text crosses over, just where to read it.
  if (raw.paywalled === true) {
    return { url, title, html: '', textLength: 0, image: text(image), paywalled: true }
  }
  const length = finite(textLength) ?? 0
  if (length < MIN_TEXT_LENGTH) return null
  return {
    url,
    title,
    byline: text(byline),
    siteName: text(siteName),
    html,
    textLength: length,
    image: text(image),
    publishedAt: finite(publishedAt)
  }
}

const text = (value: unknown): string | undefined => (typeof value === 'string' && value ? value : undefined)

const finite = (value: unknown): number | undefined =>
  typeof value === 'number' && Number.isFinite(value) ? value : undefined
