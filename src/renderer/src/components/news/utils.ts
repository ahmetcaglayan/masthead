import { useSyncExternalStore } from 'react'
import { paragraphs } from '@/lib/format'

/** A card's focus ring, following its stretched headline link (the only `<a>` in a card). */
export const CARD_FOCUS_RING =
  'has-[a:focus-visible]:outline-2 has-[a:focus-visible]:outline-offset-4 has-[a:focus-visible]:outline-accent'

/** Local start of the hour containing `ts`. */
export function startOfHour(ts: number): number {
  const d = new Date(ts)
  d.setMinutes(0, 0, 0)
  return d.getTime()
}

/** A sentence: text up to a stop that is followed by a capital (or the end). */
const SENTENCE = /.+?[.!?…]+["”’)]*(?=\s+["“'‘(]?\p{Lu}|\s*$)|.+$/gsu

/** The summary's first sentence (the whole first paragraph when it has no sentence break). */
export function firstSentence(summary: string): string {
  const first = paragraphs(summary)[0] ?? ''
  const match = first.match(/^.+?[.!?…](?=\s+["“'‘(]?\p{Lu}|\s*$)/u)
  return match ? match[0] : first
}

/**
 * The summary's paragraphs cut after `max` sentences, always at a sentence end
 * (never mid-word); `cut` tells whether anything was left out.
 */
export function leadSentences(paras: readonly string[], max: number): { paragraphs: string[]; cut: boolean } {
  const kept: string[] = []
  let count = 0
  for (const [i, paragraph] of paras.entries()) {
    const sentences = paragraph.match(SENTENCE) ?? [paragraph]
    if (count + sentences.length <= max) {
      kept.push(paragraph)
      count += sentences.length
      if (count === max) return { paragraphs: kept, cut: i < paras.length - 1 }
      continue
    }
    const take = max - count
    if (take > 0) kept.push(sentences.slice(0, take).join('').trim())
    return { paragraphs: kept, cut: true }
  }
  return { paragraphs: kept, cut: false }
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
