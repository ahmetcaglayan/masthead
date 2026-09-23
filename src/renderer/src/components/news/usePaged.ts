import { useCallback, useEffect, useState } from 'react'
import { useMainScroll } from '@/hooks/useMainScroll'

export interface Paged {
  /** How many items to render. */
  limit: number
  hasMore: boolean
  /** Render one more page. */
  more: () => void
  /** Put on an element after the list: nearing it loads the next page. */
  sentinelRef: (node: HTMLElement | null) => void
}

/**
 * Page through a long list: starts with `pageSize` items and adds a page each
 * time the sentinel comes within ~1200px of the page scroller's viewport (or
 * `more()` is called). Starts over when `resetKey` changes.
 */
export function usePaged(total: number, pageSize: number, resetKey?: unknown): Paged {
  const [limit, setLimit] = useState(pageSize)
  const [key, setKey] = useState(resetKey)
  const [node, setNode] = useState<HTMLElement | null>(null)
  const { element: main } = useMainScroll()

  if (key !== resetKey) {
    setKey(resetKey)
    setLimit(pageSize)
  }

  const hasMore = limit < total
  const more = useCallback(() => setLimit((l) => l + pageSize), [pageSize])

  // A fresh observer per page reports the sentinel at once, so a short page keeps filling up.
  useEffect(() => {
    if (!node || !hasMore) return
    const observer = new IntersectionObserver(([entry]) => entry?.isIntersecting && more(), {
      root: main?.contains(node) ? main : null,
      rootMargin: '1200px 0px'
    })
    observer.observe(node)
    return () => observer.disconnect()
  }, [node, main, hasMore, limit, more])

  return { limit, hasMore, more, sentinelRef: setNode }
}
