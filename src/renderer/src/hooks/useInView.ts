import { useCallback, useEffect, useRef, useState } from 'react'
import { useMainScroll } from '@/hooks/useMainScroll'

export interface InViewOptions {
  /** Grow the visible area so work starts just before the element scrolls in. Default `'480px 0px'`. */
  rootMargin?: string
  /** Stop observing after the first time the element is visible. Default true. */
  once?: boolean
  /** Skip observing entirely (reports false). Default true. */
  enabled?: boolean
}

/**
 * Whether an element is (about to be) on screen. Returns a callback ref for
 * the element and its visibility. Inside the page scroller the margin is
 * measured against it, so lazy work begins before a card scrolls into view.
 *
 *   const [ref, inView] = useInView<HTMLDivElement>()
 *   <div ref={ref}>…</div>
 */
export function useInView<T extends Element = HTMLElement>({
  rootMargin = '480px 0px',
  once = true,
  enabled = true
}: InViewOptions = {}): [ref: (node: T | null) => void, inView: boolean] {
  const [node, setNode] = useState<T | null>(null)
  const [inView, setInView] = useState(false)
  const done = useRef(false)
  const { element: main } = useMainScroll()

  useEffect(() => {
    if (!enabled || !node || (once && done.current)) return
    const root = main?.contains(node) ? main : null
    const observer = new IntersectionObserver(
      ([entry]) => {
        const visible = entry?.isIntersecting ?? false
        setInView(visible)
        if (visible && once) {
          done.current = true
          observer.disconnect()
        }
      },
      { root, rootMargin }
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [node, main, rootMargin, once, enabled])

  const ref = useCallback((el: T | null) => setNode(el), [])
  return [ref, inView]
}
