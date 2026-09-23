import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import type { NativeImage } from 'electron'
import { foldTr } from '@core/news/text'
import type { Article } from '@shared/types'
import type { ScreenshotOptions, ShotName } from './args'
import type { ViewLayer, WindowCapturer } from './capture'
import type { AppHandle } from './index'
import type { Monitor } from './monitor'
import {
  PageDriver,
  poll,
  waitForPageLoad,
  withTimeout,
  type ArticleMode,
  type AutomationRoute
} from './page'

const READY_TIMEOUT_MS = 60_000
const FIRST_REFRESH_TIMEOUT_MS = 90_000
const ADBLOCK_TIMEOUT_MS = 60_000
const EXTRACT_TIMEOUT_MS = 25_000
const PAGE_LOAD_TIMEOUT_MS = 30_000
/** Articles tried for the reader and web dialog shots before giving up. */
const ARTICLE_ATTEMPTS = 4
const SEARCH_CANDIDATES = ['deprem', 'ekonomi', 'enflasyon', 'dolar', 'futbol', 'istanbul']
const MIN_SEARCH_RESULTS = 5

interface ShotPlan {
  /** Rendered with `onboardingCompleted: false`. */
  onboarding?: boolean
  route?: AutomationRoute
  scroll?: number
  article?: { index: number; mode: ArticleMode }
}

function planShot(name: ShotName, searchQuery: string): ShotPlan {
  switch (name) {
    case 'onboarding':
      return { onboarding: true }
    case 'home':
      return { route: { name: 'home' } }
    case 'home-scrolled':
      return { route: { name: 'home' }, scroll: 1400 }
    case 'digest':
    case 'latest':
    case 'breaking':
    case 'local':
    case 'sources':
    case 'settings':
      return { route: { name } }
    case 'category-economy':
      return { route: { name: 'category', id: 'economy' } }
    case 'settings-typography':
      return { route: { name: 'settings', section: 'typography' } }
    case 'search':
      return { route: { name: 'search', query: searchQuery } }
    case 'reader':
      return { route: { name: 'home' }, article: { index: 0, mode: 'reader' } }
    case 'dialog-web':
      return { route: { name: 'home' }, article: { index: 1, mode: 'web' } }
  }
}

/** A query with plenty of results in the current snapshot ("deprem" when it has some). */
export function pickSearchQuery(articles: readonly Article[]): string {
  const texts = articles.map((article) => foldTr(`${article.title} ${article.summary}`))
  const counts = SEARCH_CANDIDATES.map((term) => ({
    term,
    count: texts.filter((text) => new RegExp(`(^|[^a-z0-9])${term}`).test(text)).length
  }))
  return (
    counts.find(({ count }) => count >= MIN_SEARCH_RESULTS)?.term ??
    counts.sort((a, b) => b.count - a.count)[0].term
  )
}

/**
 * `--screenshots`: render every requested shot in every language and theme and
 * write `<outDir>/<lang>-<theme>-<shot>.png`, printing one line per file.
 * Resolves with the process exit code.
 */
export async function runScreenshots(
  app: AppHandle,
  options: ScreenshotOptions,
  monitor: Monitor,
  capturer: WindowCapturer
): Promise<number> {
  const host = app.host()
  if (!host) throw new Error('The main window did not open')
  const { backend } = app
  const warn = (message: string): void => void process.stderr.write(`WARN  [screenshots] ${message}\n`)

  await app.started
  const seeded = backend.news.snapshot()
  // The cache comes from web mode, which has not fetched the shots' city feeds: refresh once so the
  // Local and Sources shots show that city's outlets (and no "not fetched yet" feeds).
  const unfetched = seeded.feeds.filter((feed) => !feed.ok && feed.lastFetchedAt === undefined).length
  if (seeded.articles.length === 0 || unfetched > 0) {
    if (seeded.articles.length === 0) {
      warn(
        `No news cache to start from; waiting for the first refresh (max ${FIRST_REFRESH_TIMEOUT_MS / 1000} s)`
      )
    } else if (options.verbose) {
      process.stderr.write(`INFO  [screenshots] ${unfetched} feeds not in the news cache; refreshing once\n`)
    }
    await withTimeout(
      backend.news.refresh(),
      FIRST_REFRESH_TIMEOUT_MS,
      'The first refresh did not finish'
    ).catch((error: unknown) => warn(String(error)))
    if (backend.news.snapshot().articles.length === 0) throw new Error('There are no articles to show')
  }

  const page = new PageDriver(host.win.webContents)
  if (!(await page.waitReady(READY_TIMEOUT_MS))) {
    throw new Error('The renderer never reported ready (window.__mastheadAutomation.ready())')
  }
  // Transitions must run to completion before a capture, which takes a page that draws frames.
  await capturer.ensureAnimating()
  const searchQuery = pickSearchQuery(backend.news.snapshot().articles)
  await mkdir(options.outDir, { recursive: true })

  const closeReader = async (): Promise<void> => {
    await page.closeArticle()
    const closed = await poll(
      async () => !(await page.dialogOpen()) && !host.reader.inspect().visible,
      5000,
      50
    )
    if (!closed) warn('The article dialog did not close')
    // The dialog marks what it shows as read; later shots must not show those cards dimmed.
    backend.library.clearHistory()
  }

  /** Open an article in reader mode and wait for its extraction; false when it failed. */
  const openInReader = async (index: number): Promise<boolean> => {
    const since = Date.now()
    if (!(await page.openArticle(index, 'reader'))) throw new Error('No article with a picture to open')
    const call = await poll(
      () => monitor.callsSince('reader:extract', since).find((c) => c.settled),
      EXTRACT_TIMEOUT_MS
    )
    return Boolean(call && !call.error && call.value)
  }

  /** Open an article in web mode and wait for the page to load and show; its layer, or null on failure. */
  const openInWeb = async (index: number): Promise<ViewLayer | null> => {
    if (!(await page.openArticle(index, 'web'))) throw new Error('No article with a picture to open')
    const opened = await poll(() => {
      const state = host.reader.inspect()
      return state.articleId && state.contents ? state.contents : null
    }, 10_000)
    if (!opened) return null
    const result = await waitForPageLoad(opened, PAGE_LOAD_TIMEOUT_MS)
    if (result === 'failed') return null
    if (result === 'timeout') warn('The article page was still loading; capturing it as it is')
    const shown = await poll(() => host.reader.inspect().visible, 8000)
    if (!shown) return null
    // Let the publisher's page paint its fonts and pictures.
    await new PageDriver(opened).settle(4000).catch(() => undefined)
    const { contents, bounds } = host.reader.inspect()
    return contents ? { contents, bounds } : null
  }

  const shoot = async (name: ShotName): Promise<NativeImage> => {
    const plan = planShot(name, searchQuery)
    if (await page.dialogOpen()) await closeReader()
    if (plan.route) {
      // Leave the previous page at the top; the next one may scroll itself (settings sections).
      await page.scrollMain(0)
      await page.navigate(plan.route)
    }
    if (plan.scroll !== undefined) await page.scrollMain(plan.scroll)
    let layer: ViewLayer | undefined
    if (plan.article) {
      const { index, mode } = plan.article
      if (mode === 'web') {
        await withTimeout(app.adblock.settled(), ADBLOCK_TIMEOUT_MS, 'Ad blocking not ready').catch(() =>
          warn('Ad blocking is not ready; the page may show ads')
        )
      }
      let ok = false
      for (let attempt = 0; attempt < ARTICLE_ATTEMPTS && !ok; attempt++) {
        if (attempt > 0) await closeReader()
        if (mode === 'reader') ok = await openInReader(index + attempt)
        else {
          layer = (await openInWeb(index + attempt)) ?? undefined
          ok = layer !== undefined
        }
      }
      if (!ok) warn(`${name}: no article loaded after ${ARTICLE_ATTEMPTS} tries; capturing the last attempt`)
    }
    const settled = await page.settle()
    if (settled.pendingImages > 0) warn(`${name}: ${settled.pendingImages} picture(s) still loading`)
    return capturer.capture(layer)
  }

  let failures = 0
  /** Language, theme and onboarding state the renderer was last reloaded with. */
  let rendered = ''
  for (const lang of options.langs) {
    for (const theme of options.themes) {
      for (const name of options.shots) {
        const file = join(options.outDir, `${lang}-${theme}-${name}.png`)
        try {
          const onboarding = planShot(name, searchQuery).onboarding === true
          const wanted = `${lang} ${theme} ${onboarding}`
          if (rendered !== wanted) {
            // A reload per language and theme: every combination starts from a clean app state.
            if (await page.dialogOpen()) await closeReader()
            backend.settings.update({ language: lang, theme, onboardingCompleted: !onboarding })
            if (!(await page.reload(READY_TIMEOUT_MS))) throw new Error('The renderer did not become ready')
            await capturer.ensureAnimating()
            rendered = wanted
          }
          const image = await shoot(name)
          await writeFile(file, image.toPNG({ scaleFactor: options.scale }))
          process.stdout.write(`${file}\n`)
        } catch (error) {
          failures++
          process.stderr.write(`ERROR [screenshots] ${lang}-${theme}-${name}: ${String(error)}\n`)
        }
      }
    }
  }
  if (await page.dialogOpen().catch(() => false)) await closeReader().catch(() => undefined)
  return failures === 0 ? 0 : 1
}
