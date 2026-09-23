import type { Article } from '@shared/types'
import { cn } from '@/lib/cn'
import { tameCaps } from '@/lib/format'
import { openArticle } from './actions'
import { HighlightText } from './HighlightText'

export interface CardTitleProps {
  article: Article
  /** List the card belongs to, for next/previous in the reader. */
  queue?: readonly string[]
  /** Folded search terms to highlight. */
  highlight?: readonly string[]
  as?: 'h2' | 'h3'
  /** No hover underline (headlines set on photos). */
  plain?: boolean
  /** Content language of the headline. */
  lang?: string
  className?: string
}

/**
 * The full headline (SEO all-caps calmed, see `tameCaps`) as a link whose
 * `::after` stretches over the nearest positioned ancestor, so the whole card
 * opens the article (Enter works too), while buttons layered above it
 * (`relative z-10`) stay clickable. Needs a `group/card` ancestor for the
 * hover underline.
 */
export function CardTitle({
  article,
  queue,
  highlight,
  as: Heading = 'h3',
  plain = false,
  lang = 'tr',
  className
}: CardTitleProps): React.JSX.Element {
  return (
    <Heading lang={lang} className={cn('headline text-pretty', className)}>
      <a
        href={article.url}
        draggable={false}
        onClick={(e) => {
          e.preventDefault()
          openArticle(article, queue)
        }}
        className={cn(
          "after:absolute after:inset-0 after:content-[''] focus-visible:outline-none",
          !plain &&
            'decoration-line-strong decoration-[1.5px] underline-offset-[5px] group-hover/card:underline'
        )}
      >
        <HighlightText text={tameCaps(article.title)} terms={highlight} />
      </a>
    </Heading>
  )
}
