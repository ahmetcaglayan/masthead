/** URL helpers: absolute http(s) URLs, canonical article URLs without tracking noise, stable ids. */
import { createHash } from 'node:crypto'

/**
 * Query parameters that only track the click: campaign tags, ad click ids, BBC's
 * `at_*`, DW's `maca`, AT Internet's `xtor`, comScore's `ns_*`.
 */
const TRACKING_PARAM =
  /^(?:utm_\w+|fbclid|gclid|dclid|gbraid|wbraid|msclkid|yclid|igshid|mc_cid|mc_eid|cmpid|_ga|_gl|ns_\w+|at_\w+|maca|xtor|ocid)$/i

/** Resolve `href` against `base`; null unless the result is an http(s) URL. */
export function absoluteUrl(href: string | undefined, base?: string): string | null {
  const value = href?.trim()
  if (!value) return null
  try {
    const url = new URL(value.startsWith('//') ? `https:${value}` : value, base)
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.href : null
  } catch {
    return null
  }
}

/** Absolute article URL without the fragment and tracking parameters (other parameters keep their encoding). */
export function canonicalUrl(href: string | undefined, base?: string): string | null {
  const absolute = absoluteUrl(href, base)
  if (!absolute) return null
  const url = new URL(absolute)
  url.hash = ''
  if (url.search) {
    const kept = url.search
      .slice(1)
      .split('&')
      .filter((pair) => {
        if (!pair) return false
        const key = pair.split('=', 1)[0]
        try {
          return !TRACKING_PARAM.test(decodeURIComponent(key))
        } catch {
          return true
        }
      })
    url.search = kept.length ? `?${kept.join('&')}` : ''
  }
  return url.href
}

/** Stable article id: the first 16 hex characters of the SHA-1 of the canonical URL. */
export function articleId(canonical: string): string {
  return createHash('sha1').update(canonical).digest('hex').slice(0, 16)
}
