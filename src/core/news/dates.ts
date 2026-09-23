/**
 * Feed timestamps in the wild: RFC 822 (also with Turkish day/month names and
 * two-digit years), ISO 8601, `dd.MM.yyyy HH:mm(:ss)`, and plenty of dates with no
 * offset at all, which are read as wall-clock time in the pack's time zone.
 */
import { collapseWhitespace, decodeEntities, foldTr } from './text'

/** Month keys: the first three folded letters of English and Turkish names (`Eyl`, `Ağustos`, `Sept`). */
// prettier-ignore
const MONTHS: Record<string, number> = {
  jan: 0, oca: 0, feb: 1, sub: 1, mar: 2, apr: 3, nis: 3, may: 4, jun: 5, haz: 5,
  jul: 6, tem: 6, aug: 7, agu: 7, sep: 8, eyl: 8, oct: 9, eki: 9, nov: 10, kas: 10, dec: 11, ara: 11
}

/** Offsets in minutes for the zone abbreviations feeds actually use. */
// prettier-ignore
const ZONE_ABBREVIATIONS: Record<string, number> = {
  z: 0, ut: 0, utc: 0, gmt: 0, trt: 180, msk: 180, eet: 120, eest: 180, cet: 60, cest: 120, bst: 60,
  est: -300, edt: -240, cst: -360, cdt: -300, mst: -420, mdt: -360, pst: -480, pdt: -420
}

/** Zones without daylight saving time, resolved without Intl. */
const FIXED_ZONES: Record<string, number> = {
  'Europe/Istanbul': 180,
  'Asia/Istanbul': 180,
  UTC: 0,
  'Etc/UTC': 0,
  GMT: 0
}

const formatters = new Map<string, Intl.DateTimeFormat | null>()

function formatterFor(timeZone: string): Intl.DateTimeFormat | null {
  let formatter = formatters.get(timeZone)
  if (formatter === undefined) {
    try {
      formatter = new Intl.DateTimeFormat('en-US', {
        timeZone,
        hourCycle: 'h23',
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric'
      })
    } catch {
      formatter = null
    }
    formatters.set(timeZone, formatter)
  }
  return formatter
}

/** UTC offset of `timeZone` at instant `at`, in minutes (unknown zones count as UTC). */
export function zoneOffsetMinutes(timeZone: string, at: number): number {
  const fixed = FIXED_ZONES[timeZone]
  if (fixed !== undefined) return fixed
  const formatter = formatterFor(timeZone)
  if (!formatter) return 0
  const parts: Record<string, number> = {}
  for (const part of formatter.formatToParts(at)) parts[part.type] = Number(part.value)
  const wall = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour % 24, parts.minute, parts.second)
  return Math.round((wall - Math.floor(at / 1000) * 1000) / 60_000)
}

/** Epoch ms of a wall-clock time in `timeZone`. */
export function zonedTimeToUtc(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  second: number,
  timeZone: string
): number {
  const wall = Date.UTC(year, month, day, hour, minute, second)
  const offset = zoneOffsetMinutes(timeZone, wall)
  const utc = wall - offset * 60_000
  const corrected = zoneOffsetMinutes(timeZone, utc)
  return corrected === offset ? utc : wall - corrected * 60_000
}

/** Offset in minutes for `Z`, `+0300`, `+03:00`, `GMT+3`, `GMT`, `EEST`…; undefined when absent or unknown. */
function parseZone(value: string): number | undefined {
  const zone = value
    .trim()
    .replace(/^\((.*)\)$/, '$1')
    .toLowerCase()
  if (!zone) return undefined
  if (zone in ZONE_ABBREVIATIONS) return ZONE_ABBREVIATIONS[zone]
  const match = /^(?:gmt|utc|ut)?\s*([+-])(\d{1,2})(?::?(\d{2}))?$/.exec(zone)
  if (!match) return undefined
  const minutes = Number(match[2]) * 60 + Number(match[3] ?? 0)
  return minutes > 18 * 60 ? undefined : match[1] === '-' ? -minutes : minutes
}

const ISO =
  /^(\d{4})-(\d{1,2})-(\d{1,2})(?:(?:t|\s+)(\d{1,2}):(\d{2})(?::(\d{2})(?:[.,]\d+)?)?)?\s*(z|[+-]\d{2}(?::?\d{2})?)?$/i
const RFC =
  /^(?:[\p{L}.]+,?\s+)?(\d{1,2})[\s-]+([\p{L}.]+)[\s-]+(\d{4}|\d{2}),?(?:\s+(\d{1,2})[:.](\d{2})(?:[:.](\d{2}))?)?\s*(.*)$/u
const DAY_FIRST =
  /^(\d{1,2})[./-](\d{1,2})[./-](\d{4})(?:(?:t|\s+)(\d{1,2})[:.](\d{2})(?:[:.](\d{2}))?)?\s*(.*)$/i

interface DateParts {
  year: number
  month: number
  day: number
  hour?: number
  minute?: number
  second?: number
  offset?: number
}

function partsOf(value: string): DateParts | null {
  let m = ISO.exec(value)
  if (m) {
    return {
      year: Number(m[1]),
      month: Number(m[2]) - 1,
      day: Number(m[3]),
      hour: m[4] === undefined ? undefined : Number(m[4]),
      minute: m[5] === undefined ? undefined : Number(m[5]),
      second: Number(m[6] ?? 0),
      offset: m[7] ? parseZone(m[7]) : undefined
    }
  }
  m = RFC.exec(value)
  if (m) {
    const month = MONTHS[foldTr(m[2]).slice(0, 3)]
    if (month === undefined) return null
    const shortYear = Number(m[3])
    return {
      year: m[3].length === 2 ? shortYear + (shortYear < 70 ? 2000 : 1900) : shortYear,
      month,
      day: Number(m[1]),
      hour: m[4] === undefined ? undefined : Number(m[4]),
      minute: m[5] === undefined ? undefined : Number(m[5]),
      second: Number(m[6] ?? 0),
      offset: parseZone(m[7])
    }
  }
  m = DAY_FIRST.exec(value)
  if (m) {
    return {
      year: Number(m[3]),
      month: Number(m[2]) - 1,
      day: Number(m[1]),
      hour: m[4] === undefined ? undefined : Number(m[4]),
      minute: m[5] === undefined ? undefined : Number(m[5]),
      second: Number(m[6] ?? 0),
      offset: parseZone(m[7])
    }
  }
  return null
}

/**
 * Parse a feed date to epoch ms, or null when it is missing, unparseable or
 * implausible (before 1995). Times without an offset are read in `timeZone`; with
 * `forceZone` the declared offset is ignored too (for feeds that mislabel local
 * time as GMT). A date without a time means noon of that day.
 */
export function parseFeedDate(value: string | undefined, timeZone: string, forceZone = false): number | null {
  if (!value) return null
  const text = collapseWhitespace(decodeEntities(value))
  const parts = partsOf(text)
  if (!parts) return null
  const { year, month, day, second = 0 } = parts
  const hour = parts.hour ?? 12
  const minute = parts.minute ?? 0
  if (
    year < 1995 ||
    month < 0 ||
    month > 11 ||
    day < 1 ||
    day > 31 ||
    hour > 24 ||
    minute > 59 ||
    second > 60
  ) {
    return null
  }
  if (parts.offset === undefined || forceZone) {
    return zonedTimeToUtc(year, month, day, hour, minute, second, timeZone)
  }
  return Date.UTC(year, month, day, hour, minute, second) - parts.offset * 60_000
}
