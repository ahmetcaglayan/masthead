import type { TFunction } from 'i18next'
import type { Article } from '@shared/types'
import { toast } from '@/components/ui/Toaster'
import { useLibrary } from '@/stores/library'
import { getSettings } from '@/stores/settings'
import { useUi } from '@/stores/ui'

/**
 * Open an article in the reader dialog with the user's default reader mode (the
 * dialog marks it read). `queue` is the ordered list it was opened from (next/previous).
 */
export function openArticle(article: Article, queue: readonly string[] = []): void {
  useUi.getState().openArticle(article, [...queue], getSettings().reader.defaultMode)
}

/** Show every outlet's report of a clustered story, leaving the reader if it is open. */
export function openStory(clusterId: string): void {
  const ui = useUi.getState()
  if (ui.reader) ui.closeArticle()
  ui.navigate({ name: 'story', id: clusterId })
}

/** Save or unsave an article, confirming with a toast. */
export async function toggleSaved(article: Article, t: TFunction): Promise<void> {
  const wasSaved = useLibrary.getState().savedIds.has(article.id)
  try {
    await useLibrary.getState().toggleSave(article)
    toast.success(wasSaved ? t('news:toast.unsaved') : t('news:toast.saved'))
  } catch {
    toast.error(t('common:states.error'), { description: t('common:states.errorHint') })
  }
}

/** Copy the article's URL to the clipboard. */
export async function copyArticleLink(article: Article, t: TFunction): Promise<void> {
  try {
    await navigator.clipboard.writeText(article.url)
    toast.success(t('common:actions.linkCopied'))
  } catch {
    toast.error(t('common:states.error'))
  }
}
