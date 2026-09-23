import { useCallback } from 'react'
import { create } from 'zustand'

const useScrollStore = create<{ element: HTMLElement | null }>(() => ({ element: null }))

/** Registered by AppShell: the `<main>` element that scrolls every page. */
export function setMainScrollElement(element: HTMLElement | null): void {
  if (useScrollStore.getState().element !== element) useScrollStore.setState({ element })
}

/** The page scroller outside React (null during onboarding). */
export function getMainScrollElement(): HTMLElement | null {
  return useScrollStore.getState().element
}

/** Scroll the page scroller to the top. */
export function scrollMainToTop(behavior: ScrollBehavior = 'smooth'): void {
  useScrollStore.getState().element?.scrollTo({ top: 0, behavior })
}

/**
 * The page scroller. Use `element` as a virtualiser's scroll element
 * (`getScrollElement: () => element`) — it re-renders once the element mounts.
 */
export function useMainScroll(): {
  element: HTMLElement | null
  scrollToTop(behavior?: ScrollBehavior): void
} {
  const element = useScrollStore((s) => s.element)
  const scrollToTop = useCallback((behavior: ScrollBehavior = 'smooth') => scrollMainToTop(behavior), [])
  return { element, scrollToTop }
}
