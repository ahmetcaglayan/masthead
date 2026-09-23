/** URL checks for Reader-mode markup: only absolute http(s) links and images survive. */

/** The absolute http(s) URL in `value`, normalised; null for anything else (relative, protocol-relative, other schemes). */
export function httpUrl(value: string | null): string | null {
  if (!value) return null
  try {
    const url = new URL(value.trim())
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.href : null
  } catch {
    return null
  }
}

/** Width, height (future use) and pixel-density descriptors of a `srcset` candidate. */
const DESCRIPTOR = /^(?:\d+[wh]|(?:\d+|\d*\.\d+)x)$/i

/**
 * The candidates of a `srcset` whose URLs are absolute http(s), re-serialised; null when none is.
 * Split the way browsers do: a URL runs to the next whitespace (commas inside it stay, trailing
 * ones end it) and its descriptors to the next comma. A candidate with a descriptor browsers would
 * reject is dropped too.
 */
export function httpSrcset(value: string | null): string | null {
  if (!value) return null
  const candidates: string[] = []
  let pos = 0
  while (pos < value.length) {
    while (pos < value.length && /[\s,]/.test(value[pos])) pos++
    const start = pos
    while (pos < value.length && !/\s/.test(value[pos])) pos++
    let url = value.slice(start, pos)
    if (!url) break
    let descriptors: string[] = []
    if (url.endsWith(',')) {
      url = url.replace(/,+$/, '')
    } else {
      const comma = value.indexOf(',', pos)
      const end = comma < 0 ? value.length : comma
      descriptors = value.slice(pos, end).split(/\s+/).filter(Boolean)
      pos = end + 1
    }
    const href = httpUrl(url)
    if (href && descriptors.every((descriptor) => DESCRIPTOR.test(descriptor))) {
      candidates.push([href, ...descriptors].join(' '))
    }
  }
  return candidates.length > 0 ? candidates.join(', ') : null
}
