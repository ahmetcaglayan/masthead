import { useCallback, useLayoutEffect, useRef } from 'react'
import { getMainScrollElement, setMainScrollElement } from '@/hooks/useMainScroll'
import { useUi } from '@/stores/ui'
import { NewStoriesPill } from './NewStoriesPill'
import { routeKey } from './routing'
import { Sidebar } from './Sidebar'
import { TitleBar } from './TitleBar'

/** Frames to keep trying to reach a remembered position while a page fills in below the fold. */
const SCROLL_RESTORE_FRAMES = 45
const USER_SCROLL_EVENTS = ['wheel', 'pointerdown', 'keydown', 'touchstart'] as const

/**
 * Scroll the page scroller to `top` now and again over the next frames: pages
 * render their lower parts progressively, so a remembered position may not
 * exist yet. Gives up once reached, after ~¾ s, or as soon as the user scrolls.
 * Returns a function that stops it.
 */
function scrollSettled(top: number): () => void {
  const main = getMainScrollElement()
  if (!main) return () => {}
  let frames = 0
  let frame = 0
  const stop = (): void => {
    cancelAnimationFrame(frame)
    for (const type of USER_SCROLL_EVENTS) main.removeEventListener(type, stop)
  }
  const apply = (): void => {
    main.scrollTop = top
    if (Math.abs(main.scrollTop - top) < 1 || ++frames > SCROLL_RESTORE_FRAMES) stop()
    else frame = requestAnimationFrame(apply)
  }
  for (const type of USER_SCROLL_EVENTS) main.addEventListener(type, stop, { passive: true })
  apply()
  return stop
}

/**
 * Window chrome around the pages: title bar on top, sidebar on the left and
 * `<main>` as the page scroller. The incoming page mounts at once and fades in
 * with a CSS animation (no waiting on the old page or on JS animation frames,
 * which a hidden tab pauses); the scroll position is reset for new routes and
 * restored when going back.
 */
export function AppShell({ children }: { children: React.ReactNode }): React.JSX.Element {
  const route = useUi((s) => s.route)
  const depth = useUi((s) => s.history.length)
  const key = routeKey(route)

  const positions = useRef(new Map<string, number>())
  const currentKey = useRef(key)
  const prevDepth = useRef(depth)

  // Parent layout effects run after the new page mounted, so its content is in place.
  useLayoutEffect(() => {
    const back = depth < prevDepth.current
    prevDepth.current = depth
    currentKey.current = key
    return scrollSettled(back ? (positions.current.get(key) ?? 0) : 0)
  }, [key, depth])

  const onScroll = useCallback((event: React.UIEvent<HTMLElement>) => {
    positions.current.set(currentKey.current, event.currentTarget.scrollTop)
  }, [])
  const mainRef = useCallback((el: HTMLElement | null) => setMainScrollElement(el), [])

  return (
    <div className="flex h-full flex-col bg-canvas text-fg">
      <TitleBar />
      <div className="flex min-h-0 flex-1">
        <Sidebar />
        <div className="relative min-w-0 flex-1">
          <NewStoriesPill />
          <main
            ref={mainRef}
            id="main"
            tabIndex={-1}
            onScroll={onScroll}
            className="absolute inset-0 overflow-x-hidden overflow-y-auto outline-none [scrollbar-gutter:stable]"
          >
            <div key={key} data-route={key} className="min-h-full animate-page-in">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
