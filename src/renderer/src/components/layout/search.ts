import { useUi } from '@/stores/ui'

let searchInput: HTMLInputElement | null = null

/** Registered by the title bar's search field. */
export function registerSearchInput(input: HTMLInputElement | null): void {
  searchInput = input
}

/** Focus and select the title-bar search field (Ctrl/Cmd+K). No-op while it is not mounted. */
export function focusSearch(): void {
  searchInput?.focus()
  searchInput?.select()
}

/**
 * Show search results for a query. While already on the search page the query
 * is replaced in place (no history entry per keystroke); elsewhere it navigates.
 */
export function goSearch(query: string): void {
  const ui = useUi.getState()
  if (ui.route.name === 'search') {
    if (ui.route.query !== query) useUi.setState({ route: { name: 'search', query } })
  } else if (query) {
    ui.navigate({ name: 'search', query })
  }
}
