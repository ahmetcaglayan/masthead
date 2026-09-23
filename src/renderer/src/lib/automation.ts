/**
 * `window.__mastheadAutomation`: a small, typed hook the Electron screenshot and
 * self-test modes (src/main/automation) use to drive the renderer. Installed once
 * after boot by main.tsx; nothing here runs until one of its methods is called.
 */
import { muteMatcherFor } from '@shared/mute'
import type { ReaderMode } from '@shared/settings'
import { routeKey } from '@/components/layout/routing'
import { getMainScrollElement } from '@/hooks/useMainScroll'
import { getSources } from '@/hooks/useSources'
import { selectView, useNews } from '@/stores/news'
import { getSettings, useSettings } from '@/stores/settings'
import { useUi, type Route } from '@/stores/ui'

export interface MastheadAutomation {
  /** True once settings, library and the first news snapshot are loaded and React has rendered. */
  ready(): boolean
  navigate(route: Route): void
  /**
   * Open the `index`-th article with a picture (enabled sources, newest first)
   * in the reader dialog without marking it read; its title, or null when there
   * is no such article.
   */
  openArticle(index: number, mode: ReaderMode): string | null
  closeArticle(): void
  /** Scroll the page scroller (`<main id="main">`) to `top` px, instantly. */
  scrollMain(top: number): void
  /**
   * Navigate and resolve with the milliseconds until the new route's page has
   * committed to the DOM and two animation frames have passed.
   */
  measureNavigation(route: Route): Promise<number>
}

declare global {
  interface Window {
    /** Automation hook for the Electron screenshot / self-test modes (see lib/automation.ts). */
    __mastheadAutomation?: MastheadAutomation
  }
}

/** Longest wait for a route to commit or a frame to arrive (frames stall in hidden windows). */
const COMMIT_TIMEOUT_MS = 10_000
const FRAME_TIMEOUT_MS = 1000

let rendered = false

function frame(): Promise<void> {
  return new Promise((resolve) => {
    const timer = setTimeout(resolve, FRAME_TIMEOUT_MS)
    requestAnimationFrame(() => {
      clearTimeout(timer)
      resolve()
    })
  })
}

/** The page container AppShell renders for a route (it carries `data-route`). */
function routeElement(route: Route): Element | null {
  const main = document.getElementById('main')
  if (!main) return null
  for (const child of main.children) {
    if (child instanceof HTMLElement && child.dataset.route === routeKey(route)) return child
  }
  return null
}

/** Resolve as soon as `check()` holds, watching DOM mutations; reject after `timeoutMs`. */
function whenDom(check: () => boolean, timeoutMs: number): Promise<void> {
  if (check()) return Promise.resolve()
  return new Promise((resolve, reject) => {
    const observer = new MutationObserver(() => {
      if (!check()) return
      finish()
      resolve()
    })
    const timer = setTimeout(() => {
      finish()
      reject(new Error(`Timed out after ${timeoutMs} ms waiting for the page to render`))
    }, timeoutMs)
    const finish = (): void => {
      observer.disconnect()
      clearTimeout(timer)
    }
    observer.observe(document.body, { childList: true, subtree: true })
  })
}

const automation: MastheadAutomation = {
  ready() {
    return (
      rendered &&
      useSettings.getState().ready &&
      useNews.getState().snapshot !== null &&
      (document.getElementById('root')?.childElementCount ?? 0) > 0
    )
  },

  navigate(route) {
    useUi.getState().navigate(route)
  },

  openArticle(index, mode) {
    const view = selectView(
      useNews.getState().index,
      getSources().isEnabled,
      muteMatcherFor(getSettings().muted.keywords)
    )
    const pictured = view.articles.filter((a) => a.image)
    const article = pictured[index]
    if (!article) return null
    useUi.getState().openArticle(
      article,
      pictured.map((a) => a.id),
      mode
    )
    return article.title
  },

  closeArticle() {
    useUi.getState().closeArticle()
  },

  scrollMain(top) {
    getMainScrollElement()?.scrollTo({ top, behavior: 'instant' })
  },

  async measureNavigation(route) {
    const start = performance.now()
    useUi.getState().navigate(route)
    await whenDom(() => routeElement(route) !== null, COMMIT_TIMEOUT_MS)
    await frame()
    await frame()
    return Math.round((performance.now() - start) * 10) / 10
  }
}

/**
 * Register `window.__mastheadAutomation`. Call once after the first render was
 * scheduled; `ready()` turns true after the next frame.
 */
export function installAutomation(): void {
  if (window.__mastheadAutomation) return
  window.__mastheadAutomation = automation
  void frame().then(() => {
    rendered = true
  })
}
