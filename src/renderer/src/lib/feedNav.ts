/**
 * Keyboard reading of a page's stories (J / K, O, S): every card, timeline row and
 * story-page report carries `data-article-id`; the one holding focus is "current".
 */

const CARD = '[data-article-id]'
/** Stories scrolled under the sticky filter bar do not count as "on screen". */
const TOP_OFFSET = 140

function cards(): HTMLElement[] {
  return [...document.querySelectorAll<HTMLElement>(`#main ${CARD}`)].filter((el) => el.offsetParent !== null)
}

function current(): HTMLElement | null {
  const active = document.activeElement
  return active instanceof HTMLElement ? active.closest<HTMLElement>(`#main ${CARD}`) : null
}

/** The element a card opens its story with: the headline link, or the row's button. */
function opener(card: HTMLElement): HTMLElement {
  return card.querySelector<HTMLElement>('a[href]') ?? card.querySelector<HTMLElement>('button') ?? card
}

/**
 * Focus the next (`1`) or previous (`-1`) story and bring it to the middle of the screen.
 * Without a focused story it starts from the first one on screen.
 */
export function moveStoryFocus(step: 1 | -1, reducedMotion = false): void {
  const list = cards()
  if (list.length === 0) return
  const focused = current()
  let index: number
  if (focused && list.includes(focused)) {
    index = list.indexOf(focused) + step
  } else {
    const onScreen = list.findIndex((el) => el.getBoundingClientRect().bottom > TOP_OFFSET)
    index = onScreen === -1 ? list.length - 1 : step === 1 ? onScreen : Math.max(0, onScreen - 1)
  }
  const target = list[Math.max(0, Math.min(list.length - 1, index))]
  opener(target).focus({ preventScroll: true })
  target.scrollIntoView({ block: 'center', behavior: reducedMotion ? 'auto' : 'smooth' })
}

/** The id of the story that holds focus, if any. */
export function focusedStoryId(): string | null {
  return current()?.dataset.articleId ?? null
}

/** Open the focused story, as a click on its headline would. */
export function openFocusedStory(): boolean {
  const card = current()
  if (!card) return false
  opener(card).click()
  return true
}
