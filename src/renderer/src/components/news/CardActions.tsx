import { Bookmark, Link2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { Article } from '@shared/types'
import { IconButton } from '@/components/ui/IconButton'
import { cn } from '@/lib/cn'
import { useLibrary } from '@/stores/library'
import { copyArticleLink, toggleSaved } from './actions'

/** Hidden until the card (a `group/card` ancestor) is hovered or holds focus. */
const REVEAL =
  'opacity-0 transition-opacity duration-150 group-hover/card:opacity-100 group-focus-within/card:opacity-100'

export interface CardActionsProps {
  article: Article
  /** `glass` floats over images, `ghost` sits in a text row. */
  tone?: 'glass' | 'ghost'
  /** Show the buttons only on hover/focus (a saved bookmark always stays visible). Default true. */
  reveal?: boolean
  className?: string
}

/** Save and copy-link buttons for a card, layered above the card's click target. */
export function CardActions({
  article,
  tone = 'glass',
  reveal = true,
  className
}: CardActionsProps): React.JSX.Element {
  const { t } = useTranslation()
  const saved = useLibrary((s) => s.savedIds.has(article.id))

  return (
    <div className={cn('relative z-10 flex items-center gap-1', className)}>
      <IconButton
        size="sm"
        variant={tone}
        icon={Bookmark}
        label={saved ? t('common:actions.unsave') : t('common:actions.save')}
        aria-pressed={saved}
        iconClassName={saved ? 'fill-current text-accent-ink' : undefined}
        onClick={() => void toggleSaved(article, t)}
        className={cn(reveal && !saved && REVEAL)}
      />
      <IconButton
        size="sm"
        variant={tone}
        icon={Link2}
        label={t('common:actions.copyLink')}
        onClick={() => void copyArticleLink(article, t)}
        className={cn(reveal && REVEAL)}
      />
    </div>
  )
}
