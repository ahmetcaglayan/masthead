const MARKS = /\p{M}/gu
const QUOTES = /[’‘´`]/g

/**
 * Fold text for Turkish-aware matching: Turkish lower-casing (`İ → i`, `I → ı`),
 * diacritics stripped and dotless `ı` read as `i`, so "İSTANBUL", "Istanbul" and
 * "istanbul" all become `istanbul`, and "ogretmen" finds "öğretmen".
 *
 * Kept free of DOM and app imports: curation, muted-word matching and their tests use it.
 */
export function foldText(text: string): string {
  return text
    .toLocaleLowerCase('tr-TR')
    .normalize('NFD')
    .replace(MARKS, '')
    .replace(/ı/g, 'i')
    .replace(QUOTES, "'")
}
