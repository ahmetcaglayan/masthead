import { useCallback, useEffect, useState } from 'react'
import type { Article } from '@shared/types'
import { useNews, useResolvedImage } from '@/stores/news'

export interface ArticleImageOptions {
  /** Only start the og:image lookup when true (e.g. once the card is near the viewport). Default true. */
  enabled?: boolean
  /**
   * Look up the page's og:image even when the feed shipped an image and prefer
   * it once found — feed thumbnails are often tiny, so large slots (the manşet) want this.
   */
  preferResolved?: boolean
}

export interface ArticleImageState {
  /** Best working image URL; undefined when there is none (yet). */
  src: string | undefined
  /** An og:image lookup is still outstanding — show a skeleton rather than the placeholder. */
  pending: boolean
  /** Put on the `<img onError>`: marks `src` broken and falls back to the next candidate. */
  onError: () => void
}

/**
 * The image for an article: the feed's own image, or the page's og:image
 * looked up lazily through `useNews.resolveImage` (cached per article). A
 * feed image that fails to load triggers the lookup as a fallback.
 */
export function useArticleImage(
  article: Pick<Article, 'id' | 'image'>,
  { enabled = true, preferResolved = false }: ArticleImageOptions = {}
): ArticleImageState {
  const { id, image } = article
  const resolved = useResolvedImage(id)
  const [broken, setBroken] = useState<readonly string[]>([])

  const imageOk = image !== undefined && !broken.includes(image)
  const candidates = preferResolved ? [resolved, image] : [image, resolved]
  const src = candidates.find((c): c is string => typeof c === 'string' && !broken.includes(c))
  const unknown = resolved === undefined && (preferResolved || !imageOk)
  const lookup = enabled && unknown

  useEffect(() => {
    if (lookup) void useNews.getState().resolveImage(id)
  }, [lookup, id])

  const onError = useCallback(() => {
    if (src) setBroken((b) => (b.includes(src) ? b : [...b, src]))
  }, [src])

  return { src, pending: src === undefined && unknown, onError }
}
