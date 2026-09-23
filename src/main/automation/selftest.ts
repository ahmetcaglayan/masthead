import type { WebContents } from 'electron'
import type { NewsSnapshot, ReaderContent } from '@shared/types'
import type { WindowCapturer } from './capture'
import type { AppHandle } from './index'
import type { Monitor, Problem } from './monitor'
import { PageDriver, poll, waitForPageLoad, withTimeout, type AutomationRoute } from './page'

const FIRST_REFRESH_TIMEOUT_MS = 120_000
const READY_TIMEOUT_MS = 60_000
const ADBLOCK_TIMEOUT_MS = 90_000
const PAGE_LOAD_TIMEOUT_MS = 45_000
const EXTRACT_TIMEOUT_MS = 30_000
const ESCAPE_TIMEOUT_MS = 3000
/** A route change slower than this fails the check; the target is `NAVIGATION_BUDGET_MS`. */
const NAVIGATION_LIMIT_MS = 2000
const NAVIGATION_BUDGET_MS = 150
/** At least this share of the planned feeds must have answered. */
const MIN_FEED_SUCCESS = 0.5
const ARTICLE_ATTEMPTS = 3
const MAX_LISTED = 25

const NAVIGATION: { label: string; route: AutomationRoute }[] = [
  { label: 'digest', route: { name: 'digest' } },
  { label: 'latest', route: { name: 'latest' } },
  { label: 'category', route: { name: 'category', id: 'economy' } },
  { label: 'settings', route: { name: 'settings' } },
  { label: 'home', route: { name: 'home' } }
]

export interface Check {
  name: string
  ok: boolean
  detail: string
}

/** The JSON report `--selftest` prints. */
export interface SelftestReport {
  ok: boolean
  startedAt: string
  durationMs: number
  app: Record<string, string | boolean>
  checks: Check[]
  news?: {
    refreshMs: number
    articles: number
    sourcesWithArticles: number
    feeds: { total: number; ok: number; failed: number; failing: string[] }
    clusters: number
    breaking: number
  }
  api?: { mastheadExposed: boolean }
  /** Frame rate of the automation window, and whether it had to be shown off-screen to get it. */
  window?: { fps: number; offscreen: boolean }
  navigation?: { budgetMs: number; cold: Record<string, number>; warm: Record<string, number> }
  webView?: {
    title: string | null
    attempts: number
    loadMs: number | null
    result: string
    finalUrl: string | null
    visible: boolean
    rendererErrors: Problem[]
    consoleErrors: number
  }
  escape?: { closed: boolean; roundtrip: boolean; ms: number | null }
  reader?: {
    title: string | null
    url: string | null
    textLength: number
    ms: number | null
    attempts: number
  }
  adblock?: { active: boolean; ms: number | null; logLine: string | null; problems: string[] }
  errors?: { main: Problem[]; renderer: Problem[]; rendererResourceFailures: number }
}

const since = (start: number): number => Date.now() - start

/**
 * `--selftest`: a smoke test of the real app against the live network. Fills
 * `report` as it goes (so a watchdog can still print a partial one) and marks
 * `report.ok` when every check passed.
 */
export async function runSelftest(
  app: AppHandle,
  monitor: Monitor,
  capturer: WindowCapturer,
  report: SelftestReport
): Promise<void> {
  const host = app.host()
  if (!host) throw new Error('The main window did not open')
  const { backend } = app
  const startedAt = Date.parse(report.startedAt)
  const check = (name: string, ok: boolean, detail: string): void => {
    report.checks.push({ name, ok, detail })
    process.stderr.write(`${ok ? 'PASS' : 'FAIL'}  ${name}: ${detail}\n`)
  }
  const page = new PageDriver(host.win.webContents)

  // The renderer boots and the ad blocker loads while the backend fetches every feed for the first time.
  const ready = page.waitReady(READY_TIMEOUT_MS)
  const adblockWait = withTimeout(app.adblock.settled(), ADBLOCK_TIMEOUT_MS - since(startedAt), 'timed out')
    .then(() => since(startedAt))
    .catch(() => null)
  await app.started
  const refreshed = await poll(
    () => {
      const status = backend.news.status()
      return status.state === 'idle' && status.lastCompletedAt > 0
    },
    FIRST_REFRESH_TIMEOUT_MS - since(startedAt),
    250
  )
  const refreshMs = refreshed ? backend.news.status().lastCompletedAt - startedAt : since(startedAt)
  const snapshot: NewsSnapshot = backend.news.snapshot()
  const okFeeds = snapshot.feeds.filter((feed) => feed.ok)
  const failing = snapshot.feeds.filter((feed) => !feed.ok)
  report.news = {
    refreshMs,
    articles: snapshot.articles.length,
    sourcesWithArticles: new Set(snapshot.articles.map((article) => article.sourceId)).size,
    feeds: {
      total: snapshot.feeds.length,
      ok: okFeeds.length,
      failed: failing.length,
      failing: failing
        .slice(0, MAX_LISTED)
        .map((feed) => `${feed.sourceId} ${feed.url}: ${feed.lastError ?? 'not fetched'}`)
    },
    clusters: snapshot.clusters.length,
    breaking: snapshot.articles.filter((article) => article.isBreaking).length
  }
  check('refresh', refreshed === true, refreshed ? `first refresh done after ${refreshMs} ms` : 'timed out')
  const feedShare = snapshot.feeds.length ? okFeeds.length / snapshot.feeds.length : 0
  check(
    'news',
    snapshot.articles.length > 0 && feedShare >= MIN_FEED_SUCCESS,
    `${snapshot.articles.length} articles from ${report.news.sourcesWithArticles} sources; ` +
      `${okFeeds.length}/${snapshot.feeds.length} feeds ok; ${snapshot.clusters.length} clusters; ` +
      `${report.news.breaking} breaking`
  )

  const hookReady = await ready
  check(
    'hook',
    hookReady,
    hookReady ? 'window.__mastheadAutomation ready' : 'the renderer never reported ready'
  )
  const exposed = await page
    .evaluate<boolean>(
      "typeof window.masthead === 'object' && ['app', 'settings', 'news', 'reader', 'library', 'window']" +
        ".every((key) => typeof window.masthead[key] === 'object')"
    )
    .catch(() => false)
  report.api = { mastheadExposed: exposed }
  check('api', exposed, exposed ? 'window.masthead exposes every namespace' : 'window.masthead is missing')

  if (hookReady) {
    // Wait for the renderer to pick up the refreshed snapshot before timing pages with real content.
    await poll(() => {
      const last = monitor.calls.filter((call) => call.channel === 'news:snapshot' && call.settled).at(-1)
      const value = last?.value as NewsSnapshot | undefined
      return (value?.articles.length ?? 0) > 0
    }, 15_000)
    // Timings wait for animation frames: they are only meaningful at a real frame rate.
    const fps = await capturer.ensureAnimating()
    report.window = { fps, offscreen: capturer.offscreen }
    await page.settle(3000).catch(() => undefined)
    await measureNavigation(page, report, check)
  } else {
    check('navigation', false, 'skipped: no automation hook')
  }

  const adblockMs = await adblockWait
  const adblockLine = monitor.entries('adblock', ['info']).find((entry) => /enabled/i.test(entry.message))
  const adblockProblems = monitor.entries('adblock', ['warn', 'error']).map((entry) => entry.message)
  report.adblock = {
    active: app.adblock.active,
    ms: adblockMs,
    logLine: adblockLine?.message ?? null,
    problems: adblockProblems
  }
  check(
    'adblock',
    report.adblock.active && adblockLine !== undefined && adblockProblems.length === 0,
    report.adblock.active
      ? `active after ${adblockMs} ms${adblockProblems.length ? `; ${adblockProblems.length} problem(s)` : ''}`
      : `not active${adblockProblems.length ? `: ${adblockProblems[0]}` : ''}`
  )

  if (hookReady) {
    await testWebView(app, monitor, page, report, check)
    await testReaderMode(monitor, page, report, check)
  } else {
    check('webView', false, 'skipped: no automation hook')
    check('readerMode', false, 'skipped: no automation hook')
  }

  const mainErrors = [
    ...monitor.mainErrors,
    ...monitor.logs
      .filter((entry) => entry.level === 'error')
      .map((entry) => ({ source: entry.scope, message: entry.message }))
  ]
  report.errors = {
    main: mainErrors.slice(0, MAX_LISTED),
    renderer: monitor.rendererErrors.slice(0, MAX_LISTED),
    rendererResourceFailures: monitor.rendererResourceErrors.length
  }
  check(
    'rendererConsole',
    monitor.rendererErrors.length === 0,
    monitor.rendererErrors.length === 0
      ? `no console errors (${monitor.rendererResourceErrors.length} failed resource loads ignored)`
      : `${monitor.rendererErrors.length} console error(s): ${monitor.rendererErrors[0].message}`
  )
  check(
    'mainProcess',
    mainErrors.length === 0,
    mainErrors.length === 0 ? 'no uncaught errors' : `${mainErrors.length} error(s): ${mainErrors[0].message}`
  )
  report.ok = report.checks.every((item) => item.ok)
}

async function measureNavigation(
  page: PageDriver,
  report: SelftestReport,
  check: (name: string, ok: boolean, detail: string) => void
): Promise<void> {
  const passes: Record<string, number>[] = [{}, {}]
  const failures: string[] = []
  for (const timings of passes) {
    for (const { label, route } of NAVIGATION) {
      try {
        timings[label] = Math.round((await page.measureNavigation(route, NAVIGATION_LIMIT_MS * 3)) * 10) / 10
        if (timings[label] > NAVIGATION_LIMIT_MS) failures.push(`${label} took ${timings[label]} ms`)
      } catch (error) {
        failures.push(`${label}: ${String(error)}`)
      }
      await page.settle(2000).catch(() => undefined)
    }
  }
  const [cold, warm] = passes
  report.navigation = { budgetMs: NAVIGATION_BUDGET_MS, cold, warm }
  const slow = Object.entries(warm).filter(([, ms]) => ms > NAVIGATION_BUDGET_MS)
  const summary = Object.entries(warm)
    .map(([label, ms]) => `${label} ${ms}`)
    .join(', ')
  check(
    'navigation',
    failures.length === 0,
    failures.length
      ? failures.join('; ')
      : `warm ms: ${summary}${slow.length ? ` (${slow.length} over the ${NAVIGATION_BUDGET_MS} ms budget)` : ''}`
  )
}

async function testWebView(
  app: AppHandle,
  monitor: Monitor,
  page: PageDriver,
  report: SelftestReport,
  check: (name: string, ok: boolean, detail: string) => void
): Promise<void> {
  const host = app.host()
  if (!host) return
  const inspect = (): ReturnType<typeof host.reader.inspect> => host.reader.inspect()
  const web: NonNullable<SelftestReport['webView']> = {
    title: null,
    attempts: 0,
    loadMs: null,
    result: 'not opened',
    finalUrl: null,
    visible: false,
    rendererErrors: [],
    consoleErrors: 0
  }
  report.webView = web
  let contents: WebContents | null = null
  for (let attempt = 0; attempt < ARTICLE_ATTEMPTS; attempt++) {
    web.attempts = attempt + 1
    if (attempt > 0) await closeArticle(page, host)
    const start = Date.now()
    web.title = await page.openArticle(attempt, 'web')
    if (!web.title) {
      web.result = 'no article with a picture'
      break
    }
    contents = await poll(() => {
      const state = inspect()
      return state.articleId && state.contents ? state.contents : null
    }, 10_000)
    if (!contents) {
      web.result = 'the page view was not created'
      continue
    }
    const errorsBefore = monitor.viewProblems.get(contents)?.length ?? 0
    web.result = await waitForPageLoad(contents, PAGE_LOAD_TIMEOUT_MS)
    web.loadMs = since(start)
    web.finalUrl = contents.getURL()
    web.visible = (await poll(() => inspect().visible, 8000)) === true
    const problems = (monitor.viewProblems.get(contents) ?? []).slice(errorsBefore)
    web.rendererErrors = problems.filter((problem) => problem.source !== 'console')
    web.consoleErrors = problems.length - web.rendererErrors.length
    if (web.result === 'loaded' && web.visible && web.rendererErrors.length === 0) break
  }
  const loaded = web.result === 'loaded' && web.visible && web.rendererErrors.length === 0
  check(
    'webView',
    loaded,
    loaded
      ? `loaded in ${web.loadMs} ms: ${web.finalUrl}`
      : `${web.result}${web.visible ? '' : ', not shown'}${web.rendererErrors[0] ? `: ${web.rendererErrors[0].message}` : ''}`
  )

  // Esc pressed in the page travels view → main → renderer ('reader:event') → main ('reader:close').
  const escape: NonNullable<SelftestReport['escape']> = { closed: false, roundtrip: false, ms: null }
  report.escape = escape
  if (!contents || contents.isDestroyed() || !inspect().visible) {
    check('escape', false, 'skipped: no page on screen')
    await closeArticle(page, host)
    return
  }
  const start = Date.now()
  contents.sendInputEvent({ type: 'keyDown', keyCode: 'Escape' })
  contents.sendInputEvent({ type: 'keyUp', keyCode: 'Escape' })
  const closed = await poll(
    async () => !inspect().visible && inspect().articleId === null && !(await page.dialogOpen()),
    ESCAPE_TIMEOUT_MS,
    25
  )
  escape.ms = since(start)
  escape.closed = closed === true
  escape.roundtrip = monitor.callsSince('reader:close', start).length > 0
  check(
    'escape',
    escape.closed && escape.roundtrip,
    escape.closed
      ? `reader closed ${escape.ms} ms after Esc in the page`
      : `Esc in the page did not close the reader${escape.roundtrip ? '' : ' (no reader:close call)'}`
  )
  if (!escape.closed) await closeArticle(page, host)
}

async function testReaderMode(
  monitor: Monitor,
  page: PageDriver,
  report: SelftestReport,
  check: (name: string, ok: boolean, detail: string) => void
): Promise<void> {
  const reader: NonNullable<SelftestReport['reader']> = {
    title: null,
    url: null,
    textLength: 0,
    ms: null,
    attempts: 0
  }
  report.reader = reader
  let content: ReaderContent | null = null
  let failure = 'no article with a picture'
  for (let attempt = 0; attempt < ARTICLE_ATTEMPTS && !content; attempt++) {
    reader.attempts = attempt + 1
    if (attempt > 0) await closeArticle(page)
    const start = Date.now()
    reader.title = await page.openArticle(attempt, 'reader')
    if (!reader.title) break
    const call = await poll(
      () => monitor.callsSince('reader:extract', start).find((item) => item.settled),
      EXTRACT_TIMEOUT_MS
    )
    reader.ms = since(start)
    if (!call) failure = 'no extraction within the time limit'
    else if (call.error) failure = call.error
    else if (!call.value) failure = 'the page has no readable article'
    else content = call.value as ReaderContent
  }
  if (content) {
    reader.url = content.url
    reader.textLength = content.textLength
  }
  check(
    'readerMode',
    content !== null,
    content ? `${content.textLength} characters from ${content.url} in ${reader.ms} ms` : failure
  )
  await closeArticle(page)
}

async function closeArticle(
  page: PageDriver,
  host?: NonNullable<ReturnType<AppHandle['host']>>
): Promise<void> {
  await page.closeArticle().catch(() => undefined)
  await poll(async () => !(await page.dialogOpen()) && !(host?.reader.inspect().visible ?? false), 5000, 50)
}
