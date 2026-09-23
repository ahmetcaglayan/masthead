import type { WebContents } from 'electron'
import type { CategoryId } from '@shared/categories'
import { isWebUrl } from '../reader/view'

/**
 * The renderer's routes; mirrors `Route` in src/renderer/src/stores/ui.ts (the
 * main process cannot import renderer code).
 */
export type AutomationRoute =
  | { name: 'home' | 'digest' | 'latest' | 'breaking' | 'foryou' | 'local' | 'saved' | 'history' | 'sources' }
  | { name: 'category'; id: CategoryId }
  | { name: 'source'; id: string }
  | { name: 'search'; query: string }
  | { name: 'settings'; section?: string }

export type ArticleMode = 'web' | 'reader'

/** Result of `settle()`: how long the page took to go quiet and what was still pending. */
export interface SettleResult {
  ms: number
  pendingImages: number
  runningAnimations: number
}

const sleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms))

/** Reject after `ms` with `message`. */
export function withTimeout<T>(promise: Promise<T>, ms: number, message: string): Promise<T> {
  let timer: NodeJS.Timeout | undefined
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error(message)), ms)
  })
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer))
}

/** Poll `check` every `intervalMs` until it returns a truthy value or `timeoutMs` passes (then null). */
export async function poll<T>(
  check: () => T | Promise<T>,
  timeoutMs: number,
  intervalMs = 100
): Promise<NonNullable<T> | null> {
  const deadline = Date.now() + timeoutMs
  for (;;) {
    const value = await check()
    if (value) return value
    if (Date.now() >= deadline) return null
    await sleep(intervalMs)
  }
}

/** Resolve on a page view's first finished load of a web URL, or say why it did not come. */
export function waitForPageLoad(
  contents: WebContents,
  timeoutMs: number
): Promise<'loaded' | 'failed' | 'timeout'> {
  return new Promise((resolve) => {
    const finish = (result: 'loaded' | 'failed' | 'timeout'): void => {
      clearTimeout(timer)
      contents.off('did-stop-loading', onStop)
      contents.off('did-fail-load', onFail)
      resolve(result)
    }
    const onStop = (): void => {
      if (isWebUrl(contents.getURL())) finish('loaded')
    }
    // -3 (ERR_ABORTED) is a navigation replaced by another one.
    const onFail = (
      _event: unknown,
      code: number,
      _description: string,
      _url: string,
      main: boolean
    ): void => {
      if (main && code !== -3) finish('failed')
    }
    const timer = setTimeout(() => finish('timeout'), timeoutMs)
    contents.on('did-stop-loading', onStop)
    contents.on('did-fail-load', onFail)
    if (!contents.isLoading() && isWebUrl(contents.getURL())) finish('loaded')
  })
}

/**
 * Drives the renderer through `window.__mastheadAutomation`, the hook the
 * renderer registers in src/renderer/src/lib/automation.ts.
 */
export class PageDriver {
  constructor(private readonly contents: WebContents) {}

  /** Evaluate `expression` in the page with `hook` bound to the automation hook. */
  private async hook<T>(expression: string, timeoutMs = 15_000): Promise<T> {
    const code = `(async () => {
      const hook = window.__mastheadAutomation
      if (!hook) throw new Error('The renderer has no automation hook (window.__mastheadAutomation)')
      return ${expression}
    })()`
    return withTimeout(
      this.contents.executeJavaScript(code) as Promise<T>,
      timeoutMs,
      `Timed out after ${timeoutMs} ms: ${expression}`
    )
  }

  /** Evaluate plain `expression` in the page. */
  evaluate<T>(expression: string, timeoutMs = 15_000): Promise<T> {
    return withTimeout(
      this.contents.executeJavaScript(expression) as Promise<T>,
      timeoutMs,
      `Timed out after ${timeoutMs} ms evaluating page script`
    )
  }

  /** Wait until the hook exists and reports the app loaded and rendered. False on timeout. */
  async waitReady(timeoutMs: number): Promise<boolean> {
    const probe =
      "typeof window.__mastheadAutomation?.ready === 'function' && window.__mastheadAutomation.ready() === true"
    const ready = await poll(() => this.evaluate<boolean>(probe, 5000).catch(() => false), timeoutMs, 200)
    return ready === true
  }

  /** Reload the renderer and wait until it is ready again. */
  async reload(timeoutMs: number): Promise<boolean> {
    const loaded = new Promise<void>((resolve) => this.contents.once('did-finish-load', () => resolve()))
    this.contents.reload()
    await withTimeout(loaded, timeoutMs, 'The renderer did not finish reloading')
    return this.waitReady(timeoutMs)
  }

  navigate(route: AutomationRoute): Promise<void> {
    return this.hook(`hook.navigate(${JSON.stringify(route)})`)
  }

  /** Navigate and resolve with the milliseconds until the new route has rendered. */
  measureNavigation(route: AutomationRoute, timeoutMs = 10_000): Promise<number> {
    return this.hook(`hook.measureNavigation(${JSON.stringify(route)})`, timeoutMs)
  }

  /** Open the index-th article that has a picture; its title, or null when there is none. */
  openArticle(index: number, mode: ArticleMode): Promise<string | null> {
    return this.hook(`hook.openArticle(${index}, ${JSON.stringify(mode)})`)
  }

  closeArticle(): Promise<void> {
    return this.hook('hook.closeArticle()')
  }

  scrollMain(top: number): Promise<void> {
    return this.hook(`hook.scrollMain(${top})`)
  }

  /** True while a dialog (the article reader) is in the DOM. */
  dialogOpen(): Promise<boolean> {
    return this.evaluate<boolean>('document.querySelector(\'[role="dialog"]\') !== null')
  }

  /**
   * Wait until the visible part of the page is complete: fonts loaded, every
   * image in the viewport loaded (or failed) with no picture still being looked
   * up, finite animations and transitions done, then two animation frames.
   * Gives up waiting after `maxMs` and reports what was still pending.
   */
  settle(maxMs = 8000): Promise<SettleResult> {
    return this.evaluate<SettleResult>(`(${SETTLE_SCRIPT})(${maxMs})`, maxMs + 5000)
  }
}

/**
 * Page side of `settle()`, kept as plain source so no bundler transform touches
 * it. Pictures still being looked up render as `.skeleton` placeholders; CSS
 * transitions (image fade-ins) and finite animations show up in getAnimations().
 */
const SETTLE_SCRIPT = String.raw`async (maxMs) => {
  const start = performance.now()
  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
  const frames = () => Promise.race([
    new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))),
    wait(500)
  ])
  const inView = (el) => {
    const r = el.getBoundingClientRect()
    return r.width > 0 && r.height > 0 && r.bottom > 0 && r.right > 0 && r.top < innerHeight && r.left < innerWidth
  }
  const pendingImages = () =>
    [...document.images].filter((img) => !img.complete && inView(img)).length +
    [...document.querySelectorAll('.skeleton')].filter(inView).length
  const runningAnimations = () =>
    document.getAnimations().filter((animation) => {
      const end = animation.effect ? animation.effect.getComputedTiming().endTime : Infinity
      return animation.playState === 'running' && Number.isFinite(end)
    }).length
  // Smooth scrolling (a settings section, a dialog) is not an animation: watch the scrollers instead.
  const scrollers = () =>
    [document.scrollingElement, ...document.querySelectorAll('#main, [role="dialog"] *')]
      .filter((el) => el && el.scrollHeight > el.clientHeight)
      .map((el) => el.scrollTop)
      .join(',')

  await Promise.race([document.fonts.ready, wait(maxMs)])
  let quiet = 0
  let scrolled = scrollers()
  while (performance.now() - start < maxMs) {
    const scroll = scrollers()
    if (pendingImages() + runningAnimations() === 0 && scroll === scrolled) {
      if (++quiet >= 3) break
    } else quiet = 0
    scrolled = scroll
    await wait(100)
  }
  await frames()
  return {
    ms: Math.round(performance.now() - start),
    pendingImages: pendingImages(),
    runningAnimations: runningAnimations()
  }
}`
