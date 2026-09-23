/**
 * Cutting a summary down to what a card shows. Pure text helpers with no imports, so the
 * tests and the node type-check can reach them without the DOM or i18n.
 */

/** A sentence: text up to a stop that is followed by a capital (or the end). */
const SENTENCE = /.+?[.!?…]+["”’)]*(?=\s+["“'‘(]?\p{Lu}|\s*$)|.+$/gsu

/**
 * The summary's paragraphs cut to roughly `max` characters so cards in a row stay the
 * same height: whole paragraphs while they fit, then a last paragraph cut at a sentence
 * end (or a word boundary) and closed with an ellipsis. `cut` tells whether anything was
 * left out, so the card can still offer the full summary.
 */
export function leadCharacters(
  paras: readonly string[],
  max: number
): { paragraphs: string[]; cut: boolean } {
  const kept: string[] = []
  let used = 0
  for (const paragraph of paras) {
    const remaining = max - used
    if (paragraph.length <= remaining) {
      kept.push(paragraph)
      used += paragraph.length + 1
      continue
    }
    // Keep a paragraph only when enough of it fits to read as one — unless nothing has been
    // kept yet, in which case a short lead still beats an empty card.
    if (remaining >= 80 || kept.length === 0) {
      const slice = paragraph.slice(0, remaining)
      let end = -1
      for (const m of slice.matchAll(/[.!?…]["'”’)]*(?=\s)/g)) end = m.index + m[0].length
      if (end < remaining * 0.5) end = slice.lastIndexOf(' ')
      if (end < remaining * 0.5) end = remaining
      kept.push(slice.slice(0, end).replace(/[\s\p{P}]+$/u, '') + '…')
      return { paragraphs: kept, cut: true }
    }
    return { paragraphs: kept, cut: true }
  }
  return { paragraphs: kept, cut: false }
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
