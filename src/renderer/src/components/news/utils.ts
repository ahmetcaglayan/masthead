import { useSyncExternalStore } from 'react'
import { paragraphs } from '@/lib/format'

export { leadCharacters, leadSentences } from '@/lib/summary'

/** The summary's first sentence (the whole first paragraph when it has no sentence break). */
export function firstSentence(summary: string): string {
  const first = paragraphs(summary)[0] ?? ''
  const match = first.match(/^.+?[.!?…](?=\s+["“'‘(]?\p{Lu}|\s*$)/u)
  return match ? match[0] : first
}

/**
 * A card's focus ring, following its stretched headline link (the only `<a>` in a card).
 * Cards have no padding of their own, so the ring keeps its distance from the text — and, at the
 * rounded corners, from a photo that reaches the card's edge.
 */
export const CARD_FOCUS_RING =
  'has-[a:focus-visible]:outline-2 has-[a:focus-visible]:outline-offset-[7px] has-[a:focus-visible]:outline-accent'

/** Local start of the hour containing `ts`. */
export function startOfHour(ts: number): number {
  const d = new Date(ts)
  d.setMinutes(0, 0, 0)
  return d.getTime()
}

function subscribeOnline(onChange: () => void): () => void {
  window.addEventListener('online', onChange)
  window.addEventListener('offline', onChange)
  return () => {
    window.removeEventListener('online', onChange)
    window.removeEventListener('offline', onChange)
  }
}

/** Whether the browser reports a network connection. */
export function useOnline(): boolean {
  return useSyncExternalStore(subscribeOnline, () => navigator.onLine)
}
