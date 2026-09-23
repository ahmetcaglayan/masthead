import type { TFunction } from 'i18next'
import i18n, { localeFor } from '@/i18n'

const MINUTE = 60_000
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR

const translators = new Map<string, TFunction>()
const formatters = new Map<string, Intl.DateTimeFormat>()

function tFor(lang: string): TFunction {
  let t = translators.get(lang)
  if (!t) {
    t = i18n.getFixedT(lang, 'common')
    translators.set(lang, t)
  }
  return t
}

function formatter(lang: string, name: string, options: Intl.DateTimeFormatOptions): Intl.DateTimeFormat {
  const key = `${lang}|${name}`
  let f = formatters.get(key)
  if (!f) {
    f = new Intl.DateTimeFormat(localeFor(lang), options)
    formatters.set(key, f)
  }
  return f
}

/** Local midnight of the day containing `ts`. */
export function startOfDay(ts: number): number {
  const d = new Date(ts)
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

/** Whole calendar days between `ts` and `now` (0 = same day, 1 = yesterday). */
export function daysAgo(ts: number, now: number = Date.now()): number {
  return Math.round((startOfDay(now) - startOfDay(ts)) / DAY)
}

/** 24-hour clock time: `14:32`. */
export function clock(ts: number, lang: string): string {
  return formatter(lang, 'clock', { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(ts)
}

/** Short date: `21 Sep` (same year) or `21 Sep 2025`. */
export function shortDate(ts: number, lang: string, now: number = Date.now()): string {
  const sameYear = new Date(ts).getFullYear() === new Date(now).getFullYear()
  return sameYear
    ? formatter(lang, 'date', { day: 'numeric', month: 'short' }).format(ts)
    : formatter(lang, 'date-year', { day: 'numeric', month: 'short', year: 'numeric' }).format(ts)
}

/** Full date and time: `Wednesday, 23 September 2026 at 14:32` / `23 Eylül 2026 Çarşamba 14:32`. */
export function fullDate(ts: number, lang: string): string {
  return formatter(lang, 'full', { dateStyle: 'full', timeStyle: 'short', hourCycle: 'h23' }).format(ts)
}

/**
 * Compact, news-style relative time:
 * `now` · `5 min ago` · `3 h ago` · `yesterday 14:32` · `Mon 14:32` · `21 Sep`
 * (Turkish: `şimdi` · `5 dk önce` · `3 sa önce` · `dün 14:32` · `Pzt 14:32` · `21 Eyl`).
 * Future timestamps (clock skew) read as "now".
 */
export function relativeTime(ts: number, lang: string, now: number = Date.now()): string {
  const t = tFor(lang)
  const diff = now - ts
  if (diff < MINUTE) return t('time.now')
  if (diff < HOUR) return t('time.minutesAgo', { count: Math.floor(diff / MINUTE) })
  const days = daysAgo(ts, now)
  if (days === 0 || diff < 6 * HOUR) return t('time.hoursAgo', { count: Math.floor(diff / HOUR) })
  if (days === 1) return t('time.yesterdayAt', { time: clock(ts, lang) })
  if (days < 7) {
    const weekday = formatter(lang, 'weekday', { weekday: 'short' }).format(ts)
    return `${weekday} ${clock(ts, lang)}`
  }
  return shortDate(ts, lang, now)
}

/** Heading for a day group in timelines: `Today`, `Yesterday`, or `Monday, 21 September`. */
export function dayLabel(ts: number, lang: string, now: number = Date.now()): string {
  const days = daysAgo(ts, now)
  if (days === 0) return tFor(lang)('time.today')
  if (days === 1) return tFor(lang)('time.yesterday')
  const sameYear = new Date(ts).getFullYear() === new Date(now).getFullYear()
  return sameYear
    ? formatter(lang, 'day', { weekday: 'long', day: 'numeric', month: 'long' }).format(ts)
    : formatter(lang, 'day-year', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(
        ts
      )
}
