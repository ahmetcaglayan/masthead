import { useState } from 'react'
import type { Article, SourceDef } from '@shared/types'
import { useArticleImage } from '@/hooks/useArticleImage'
import { useInView } from '@/hooks/useInView'
import { useSource } from '@/hooks/useSources'
import { sourceTint } from '@/lib/sources'
import { cn } from '@/lib/cn'
import { SourceLogo, type SourceLogoSize } from './SourceLogo'

export interface ArticleImageProps {
  article: Pick<Article, 'id' | 'image' | 'sourceId'>
  /** Defaults to the article's source from the current country pack. */
  source?: SourceDef
  /** Sizing, aspect and rounding, e.g. `aspect-[16/9] rounded-card`. */
  className?: string
  /** Size of the source logo on the placeholder. Default `lg`. */
  logoSize?: SourceLogoSize
  /** Prefer the page's high-resolution og:image over the feed thumbnail (hero slots). */
  preferResolved?: boolean
  /** Load immediately with high priority (above-the-fold hero). */
  priority?: boolean
  /** Gently zoom the image while an ancestor with the `group` class is hovered. Default true. */
  zoomOnHover?: boolean
  /** Render nothing, instead of the logo placeholder, once it is clear there is no picture (list thumbnails). */
  collapseWhenMissing?: boolean
  /** Rendered on top of the image (gradients, captions, badges). */
  children?: React.ReactNode
}

/**
 * An article's picture in a fixed-shape frame: the feed image, else the
 * og:image looked up once the frame nears the viewport, else a placeholder
 * washed in the source's colour with its logo. Images fade in on load and fall
 * back on error.
 */
export function ArticleImage({
  article,
  source,
  className,
  logoSize = 'lg',
  preferResolved = false,
  priority = false,
  zoomOnHover = true,
  collapseWhenMissing = false,
  children
}: ArticleImageProps): React.JSX.Element | null {
  const [ref, inView] = useInView<HTMLDivElement>()
  const packSource = useSource(source ? undefined : article.sourceId)
  const logoSource = source ?? packSource
  const { src, pending, onError } = useArticleImage(article, { enabled: priority || inView, preferResolved })
  const [loaded, setLoaded] = useState<string | null>(null)

  if (collapseWhenMissing && !src && !pending) return null

  return (
    <div ref={ref} className={cn('relative isolate overflow-hidden bg-muted', className)}>
      {src ? (
        <img
          key={src}
          src={src}
          alt=""
          loading={priority ? 'eager' : 'lazy'}
          fetchPriority={priority ? 'high' : 'auto'}
          decoding="async"
          referrerPolicy="no-referrer"
          draggable={false}
          onLoad={() => setLoaded(src)}
          onError={onError}
          className={cn(
            'absolute inset-0 size-full object-cover transition-[opacity,scale] duration-500 ease-out',
            loaded === src ? 'opacity-100' : 'opacity-0',
            zoomOnHover && 'group-hover:scale-[1.035]'
          )}
        />
      ) : pending ? (
        <div aria-hidden className="skeleton absolute inset-0" />
      ) : (
        <div
          aria-hidden
          className="absolute inset-0 flex items-center justify-center"
          style={{
            background: `radial-gradient(120% 90% at 30% 20%, ${sourceTint(logoSource?.color, 10)}, ${sourceTint(logoSource?.color, 26)})`
          }}
        >
          <SourceLogo source={logoSource} size={logoSize} className="shadow-soft" />
        </div>
      )}
      {children}
    </div>
  )
}
