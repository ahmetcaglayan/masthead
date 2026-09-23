import { create } from 'zustand'
import type { Article, Library } from '@shared/types'
import { api } from '@/lib/api'

interface LibraryState {
  library: Library
  savedIds: Set<string>
  readIds: Set<string>
  init(): Promise<void>
  toggleSave(article: Article): Promise<void>
  markRead(article: Article): Promise<void>
  clearHistory(): Promise<void>
}

function derive(library: Library): Pick<LibraryState, 'library' | 'savedIds' | 'readIds'> {
  return {
    library,
    savedIds: new Set(library.saved.map((s) => s.article.id)),
    readIds: new Set(library.history.map((h) => h.article.id))
  }
}

export const useLibrary = create<LibraryState>((set, get) => ({
  ...derive({ saved: [], history: [] }),

  async init() {
    set(derive(await api.library.get()))
    api.library.onChange((library) => set(derive(library)))
  },

  async toggleSave(article) {
    set(derive(await api.library.toggleSave(article)))
  },

  async markRead(article) {
    if (!get().readIds.has(article.id)) set({ readIds: new Set(get().readIds).add(article.id) })
    // Always recorded: re-reading moves the article back to the top of History.
    await api.library.markRead(article)
  },

  async clearHistory() {
    set(derive(await api.library.clearHistory()))
  }
}))
