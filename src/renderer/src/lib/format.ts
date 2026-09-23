import { localeFor } from '@/i18n'

export { tameCaps } from './headline'

const numberFormats = new Map<string, Intl.NumberFormat>()

function numberFormat(lang: string, name: string, options: Intl.NumberFormatOptions): Intl.NumberFormat {
  const key = `${lang}|${name}`
  let f = numberFormats.get(key)
  if (!f) {
    f = new Intl.NumberFormat(localeFor(lang), options)
    numberFormats.set(key, f)
  }
  return f
}

/**
 * `1234` → `1.2K` (en) / `1,2 B` (tr). Only for tight spots such as the
 * sidebar counts; everywhere else use `formatNumber`.
 */
export function compactNumber(value: number, lang: string): string {
  return numberFormat(lang, 'compact', { notation: 'compact', maximumFractionDigits: 1 }).format(value)
}

/** A plain count with the language's grouping: `3,077` (en) / `3.077` (tr). */
export function formatNumber(value: number, lang: string): string {
  return numberFormat(lang, 'plain', {}).format(value)
}

/** A ratio as a whole percentage: `1.1` → `110%` (en) / `%110` (tr). */
export function formatPercent(ratio: number, lang: string): string {
  return numberFormat(lang, 'percent', { style: 'percent', maximumFractionDigits: 0 }).format(ratio)
}

/**
 * A price in its currency, as precise as its size calls for: `85.476 $`, `48,83 ₺`,
 * `0,6512 $` — whole units from ten thousand up, four decimals below one.
 */
export function formatPrice(value: number, currency: string, lang: string): string {
  const digits = value >= 10_000 ? 0 : value >= 1 ? 2 : 4
  return numberFormat(lang, `price:${currency}:${digits}`, {
    style: 'currency',
    currency,
    minimumFractionDigits: digits,
    maximumFractionDigits: digits
  }).format(value)
}

/** A change in percent with its sign: `+0.25%` (en) / `+%0,25` (tr); `0.00%` unsigned. */
export function formatChange(percent: number, lang: string): string {
  return numberFormat(lang, 'change', {
    style: 'percent',
    signDisplay: 'exceptZero',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(percent / 100)
}

/** Bare host name of a URL without `www.`; the input itself when it is not a URL. */
export function domain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return url
  }
}

/** Estimated reading time in whole minutes (at least 1) for a text of `chars` characters. */
export function readingMinutes(chars: number): number {
  return Math.max(1, Math.round(chars / 1200))
}

/**
 * Upper-case news content with the content language's rules — Turkish needs
 * `i → İ` and `ı → I`, which plain `toUpperCase()` gets wrong.
 */
export function upperContent(text: string, locale = 'tr-TR'): string {
  return text.toLocaleUpperCase(locale)
}

/** Split a plain-text summary into paragraphs (the pipeline keeps breaks as blank lines). */
export function paragraphs(text: string): string[] {
  return text
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean)
}
