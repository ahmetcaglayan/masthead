import { muteMatcherFor } from '@shared/mute'
import type { Article } from '@shared/types'
import { useSources } from '@/hooks/useSources'
import { selectView, useNews, type NewsView } from '@/stores/news'
import { useSettings } from '@/stores/settings'

/**
 * The current snapshot narrowed to the enabled sources and without muted
 * stories, with per-category, per-source, per-place and breaking lists indexed
 * once (see `selectView`). Re-renders only when the snapshot, the source
 * switches or the muted words change.
 */
export function useNewsView(): NewsView {
  const index = useNews((s) => s.index)
  const { isEnabled } = useSources()
  const isMuted = muteMatcherFor(useSettings((s) => s.settings.muted.keywords))
  return selectView(index, isEnabled, isMuted)
}

/**
 * Every article from the user's enabled sources, newest first. The array is
 * shared between all callers and only rebuilt when the snapshot or the source
 * selection changes, so it is safe to use as a memo dependency.
 */
export function useArticles(): Article[] {
  return useNewsView().articles
}

/** One article by id (from the full snapshot, regardless of source switches). */
export function useArticle(id: string | null | undefined): Article | undefined {
  return useNews((s) => (id ? s.byId.get(id) : undefined))
}
