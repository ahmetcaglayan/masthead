/**
 * Checks the country packs' feeds against the live sites.
 *
 *   node scripts/verify-feeds.ts              default-enabled sources of every pack + 3 feeds per local source
 *   node scripts/verify-feeds.ts de br        only those countries
 *   node scripts/verify-feeds.ts --all        every feed of every pack
 *   node scripts/verify-feeds.ts sozcu dunya  every feed of the named sources
 *
 * Fetches with 8 requests in flight (2 per host) and a 15 s timeout. A feed fails
 * on a network error, a non-2xx status, a body that is not RSS/Atom or zero
 * items, twice in a row; it is reported as stale when its newest item is older
 * than three days. Exits with code 1 when more than 10% of the checked feeds fail.
 *
 * Plain Node 24 (type stripping): no enums, namespaces or parameter properties.
 */
import type { CountryCode, FeedDef, SourceDef } from '../src/shared/types'
import { COUNTRY_OPTIONS, getCountryPack } from '../src/shared/countries/index.ts'

const CONCURRENCY = 8
const PER_HOST = 2
const TIMEOUT_MS = 15_000
const RETRY_DELAY_MS = 3_000
const STALE_MS = 3 * 24 * 60 * 60 * 1000
const FAIL_RATIO = 0.1
const LOCAL_SAMPLES = 3
const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36'

interface Job {
  country: CountryCode
  source: SourceDef
  feed: FeedDef
}

interface Result extends Job {
  status: 'ok' | 'stale' | 'fail'
  items: number
  /** Age of the newest item in ms; undefined when no date could be parsed. */
  age?: number
  charset: string
  bytes: number
  ms: number
  error?: string
}

const SHIPPED = COUNTRY_OPTIONS.filter((o) => o.available).map((o) => o.code)

function selectJobs(args: string[]): Job[] {
  const all = args.includes('--all')
  const named = args.filter((a) => !a.startsWith('--'))
  const codes = named.filter((a) => SHIPPED.includes(a as CountryCode)) as CountryCode[]
  const ids = named.filter((a) => !codes.includes(a as CountryCode))
  const packs = (codes.length ? codes : SHIPPED).map((code) => getCountryPack(code)!)
  const unknown = ids.filter((id) => !packs.some((pack) => pack.sources.some((s) => s.id === id)))
  if (unknown.length) throw new Error(`Unknown country or source id: ${unknown.join(', ')}`)

  const jobs: Job[] = []
  for (const pack of packs) {
    for (const source of pack.sources) {
      let feeds = source.feeds
      if (ids.length) {
        if (!ids.includes(source.id)) continue
      } else if (!all) {
        if (source.defaultEnabled === false) continue
        if (source.kind === 'local') feeds = sample(feeds, LOCAL_SAMPLES)
      }
      for (const feed of feeds) jobs.push({ country: pack.code, source, feed })
    }
  }
  return jobs
}

/** Evenly spaced picks with a daily offset, so repeated runs rotate through all 81 cities. */
function sample<T>(items: T[], count: number): T[] {
  if (items.length <= count) return items
  const offset = Math.floor(Date.now() / 86_400_000) % items.length
  const step = items.length / count
  return Array.from({ length: count }, (_, i) => items[(offset + Math.floor(i * step)) % items.length])
}

const TURKISH_MONTHS: Record<string, string> = {
  oca: 'Jan',
  şub: 'Feb',
  mar: 'Mar',
  nis: 'Apr',
  may: 'May',
  haz: 'Jun',
  tem: 'Jul',
  ağu: 'Aug',
  eyl: 'Sep',
  eki: 'Oct',
  kas: 'Nov',
  ara: 'Dec'
}

/** RFC 822 / ISO 8601, plus Turkish month names and `dd.MM.yyyy HH:mm`. Returns NaN when unparseable. */
function parseDate(raw: string): number {
  const text = raw.trim()
  const direct = Date.parse(text)
  if (!Number.isNaN(direct)) return direct
  const dotted = /^(\d{1,2})\.(\d{1,2})\.(\d{4})(?:\s+(\d{1,2}):(\d{2}))?/.exec(text)
  if (dotted) {
    const [, d, m, y, hh = '0', mm = '0'] = dotted
    return Date.parse(
      `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}T${hh.padStart(2, '0')}:${mm}:00+03:00`
    )
  }
  const english = text
    .replace(/^[^\d,]+,\s*/, '')
    .replace(/\p{L}+/gu, (word) => TURKISH_MONTHS[word.slice(0, 3).toLocaleLowerCase('tr-TR')] ?? word)
  return Date.parse(english)
}

/** Override → Content-Type charset → XML declaration → UTF-8, like the app's decodeBody. */
function decode(
  bytes: Uint8Array,
  contentType: string,
  override?: string
): { text: string; charset: string } {
  const head = new TextDecoder('latin1').decode(bytes.subarray(0, 1024))
  const declared =
    override ??
    /charset=["']?([\w-]+)/i.exec(contentType)?.[1] ??
    /<\?xml[^>]*encoding=["']([\w-]+)["']/i.exec(head)?.[1]
  const charset = (declared ?? 'utf-8').toLowerCase()
  try {
    return { text: new TextDecoder(charset).decode(bytes), charset }
  } catch {
    return { text: new TextDecoder().decode(bytes), charset: `${charset}?` }
  }
}

async function check(job: Job): Promise<Result> {
  const started = Date.now()
  const result: Result = { ...job, status: 'fail', items: 0, charset: '', bytes: 0, ms: 0 }
  try {
    // Same request shape as the app's fetchText (src/core/net.ts).
    const res = await fetch(job.feed.url, {
      headers: {
        'User-Agent': USER_AGENT,
        Accept: '*/*',
        'Accept-Language': 'tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7'
      },
      redirect: 'follow',
      signal: AbortSignal.timeout(TIMEOUT_MS)
    })
    const bytes = new Uint8Array(await res.arrayBuffer())
    result.bytes = bytes.byteLength
    const { text, charset } = decode(bytes, res.headers.get('content-type') ?? '', job.feed.encoding)
    // A trailing "!" marks UTF-8 that does not decode cleanly: the feed needs an `encoding` override.
    const broken = charset.startsWith('utf') && (text.match(/\uFFFD/g) ?? []).length > 3
    result.charset = broken ? `${charset}!` : charset
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    if (!/<(rss|feed|rdf:RDF)[\s>]/.test(text)) throw new Error('not RSS/Atom')

    result.items = (text.match(/<(item|entry)[\s>]/g) ?? []).length
    if (!result.items) throw new Error('no items')

    // Item dates only: channel/feed-level dates are often just the build time.
    const body = text.slice(text.search(/<(item|entry)[\s>]/))
    const now = Date.now()
    const dates = [...body.matchAll(/<(?:pubDate|published|updated|dc:date)>\s*(?:<!\[CDATA\[)?([^<\]]+)/g)]
      .map((m) => parseDate(m[1]))
      .filter((t) => !Number.isNaN(t) && t < now + 60 * 60 * 1000 && t > Date.UTC(2000, 0, 1))
    if (dates.length) result.age = Math.max(0, now - Math.max(...dates))
    result.status = result.age !== undefined && result.age > STALE_MS ? 'stale' : 'ok'
  } catch (error) {
    const reason =
      error instanceof Error ? (error.cause instanceof Error ? error.cause.message : error.message) : ''
    result.error = reason || String(error)
  }
  result.ms = Date.now() - started
  return result
}

/** A failed feed gets one more try after a pause: some CDNs reject bursts (Euronews answers 406). */
async function checkWithRetry(job: Job): Promise<Result> {
  const first = await check(job)
  if (first.status !== 'fail') return first
  await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS))
  return check(job)
}

/** Runs the checks with a global concurrency limit and at most PER_HOST requests to one host at a time. */
async function runAll(jobs: Job[], onDone: (done: number) => void): Promise<Result[]> {
  const results: Result[] = new Array(jobs.length)
  const hosts = jobs.map((job) => new URL(job.feed.url).hostname)
  const pending = jobs.map((_, index) => index)
  const active = new Map<string, number>()
  const waiters: (() => void)[] = []
  let done = 0

  const worker = async (): Promise<void> => {
    while (pending.length) {
      const at = pending.findIndex((index) => (active.get(hosts[index]) ?? 0) < PER_HOST)
      if (at < 0) {
        await new Promise<void>((resolve) => waiters.push(resolve))
        continue
      }
      const [index] = pending.splice(at, 1)
      const host = hosts[index]
      active.set(host, (active.get(host) ?? 0) + 1)
      results[index] = await checkWithRetry(jobs[index])
      active.set(host, (active.get(host) ?? 1) - 1)
      onDone(++done)
      for (const wake of waiters.splice(0)) wake()
    }
  }
  await Promise.all(Array.from({ length: Math.min(CONCURRENCY, jobs.length) }, worker))
  return results
}

function formatAge(ms: number | undefined): string {
  if (ms === undefined) return '-'
  const minutes = ms / 60_000
  if (minutes < 60) return `${Math.round(minutes)}m`
  if (minutes < 48 * 60) return `${(minutes / 60).toFixed(1)}h`
  return `${(minutes / 1440).toFixed(1)}d`
}

function printTable(results: Result[]): void {
  const label = { ok: 'ok', stale: 'STALE', fail: 'FAIL' }
  const rows = results.map((r) => [
    label[r.status],
    r.country,
    r.source.id,
    r.feed.province ? `${r.feed.category} ${r.feed.province}` : r.feed.category,
    r.status === 'fail' ? '-' : String(r.items),
    formatAge(r.age),
    r.charset.replace(/^utf-8$/, ''),
    r.bytes ? `${Math.round(r.bytes / 1024)} KB` : '-',
    `${(r.ms / 1000).toFixed(1)}s`,
    r.error ? `${r.error}  ${r.feed.url}` : r.feed.url
  ])
  const header = ['', 'cc', 'source', 'category', 'items', 'newest', 'charset', 'size', 'time', 'url']
  const widths = header.map((h, i) => Math.max(h.length, ...rows.map((row) => row[i].length)))
  const numeric = new Set([4, 5, 7, 8])
  const line = (cells: string[]): string =>
    cells
      .map((cell, i) => {
        if (i === cells.length - 1) return cell
        return numeric.has(i) ? cell.padStart(widths[i]) : cell.padEnd(widths[i])
      })
      .join('  ')
  console.log(line(header))
  for (const row of rows) console.log(line(row))
}

async function main(): Promise<void> {
  const jobs = selectJobs(process.argv.slice(2))
  const sources = new Set(jobs.map((j) => `${j.country}/${j.source.id}`)).size
  const countries = new Set(jobs.map((j) => j.country)).size
  console.log(
    `Checking ${jobs.length} feeds from ${sources} sources in ${countries} countries (concurrency ${CONCURRENCY})…`
  )
  const results = await runAll(jobs, (done) => {
    if (process.stdout.isTTY) process.stdout.write(`\r${done}/${jobs.length}`)
  })
  if (process.stdout.isTTY) process.stdout.write('\r')

  printTable(results)
  const failed = results.filter((r) => r.status === 'fail').length
  const stale = results.filter((r) => r.status === 'stale').length
  const ratio = jobs.length ? failed / jobs.length : 0
  const megabytes = results.reduce((sum, r) => sum + r.bytes, 0) / 1024 / 1024
  const percent = (ratio * 100).toFixed(1)
  console.log(
    `\n${jobs.length} feeds: ${jobs.length - failed - stale} ok, ${stale} stale, ${failed} failed ` +
      `(${percent}% failed, limit ${FAIL_RATIO * 100}%), ${megabytes.toFixed(1)} MB downloaded`
  )
  if (ratio > FAIL_RATIO) process.exitCode = 1
}

await main()
