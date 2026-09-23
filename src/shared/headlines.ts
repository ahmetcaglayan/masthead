/**
 * Headline heuristics shared by the core (breaking news, manşet ranking) and the
 * renderer (ticker, curation), so both sides agree on what counts as routine.
 */

const MARKS = /\p{M}/gu
const QUOTES = /[’‘´`]/g

/** Turkish-aware fold for matching: `İ → i`, `I → ı → i`, diacritics and fancy quotes removed. */
function fold(text: string): string {
  return text
    .toLocaleLowerCase('tr-TR')
    .normalize('NFD')
    .replace(MARKS, '')
    .replace(/ı/g, 'i')
    .replace(QUOTES, "'")
}

/**
 * Recurring service items outlets republish every day, often tagged "son dakika"
 * for search engines. Matched on folded text; each pattern needs the service
 * wording, so real news that merely mentions the Gazette or the dollar is kept.
 */
export const ROUTINE_HEADLINES: readonly RegExp[] = [
  /\bresmi gazete (kararlari|atamalari)\b|\bbugunku resmi gazete\b|\bresmi gazete'?de bugun\b/,
  /\bborsa\w*\b.*\b(gun|hafta|seans)\w*\b.*\b(tamamladi|acti|basladi|kapatti)\b/,
  /\b(altin|gumus|doviz|dolar|euro|avro|sterlin)\b.*\b(fiyatlari|kurlari)\b/,
  /\b(gram|ceyrek|yarim|tam|cumhuriyet) altin\b.*\b(fiyati|ne kadar|kac tl)\b/,
  /\b(dolar|euro|avro|sterlin|doviz)\b.*\bkuru?\b.*\b(bugun|ne kadar|kac tl|guncel)\b/,
  /\bhava durumu\b/,
  /\b(namaz|ezan|iftar|sahur|imsak) vakitleri\b|\b(ezan|iftar|sahur|imsak) vakti\b|\bimsakiye\b/,
  /\bdeprem mi oldu\b|\bson depremler\b/,
  /\b(sayisal |super |on numara )?loto\b.*\bsonuc|\bsans topu\b.*\bsonuc|\bmilli piyango\b.*\bsonuc/,
  /\bbugun hangi maclar\b|\bbugunku maclar\b|\bmaclar hangi kanalda\b|\bmac (sonuclari|takvimi)\b|\bpuan durumu\b/,
  /\bburc yorumlari\b|\bgunluk burc\b/,
  /\bnobetci eczane/,
  /\b(elektrik|su|dogalgaz) kesintisi\b/,
  /\bbugun ne oldu\b|\bgunun ozeti\b/
]

/** A daily service or round-up item (Gazette digest, prices, weather, fixtures…) rather than a news event. */
export function isRoutineTitle(title: string): boolean {
  const folded = fold(title)
  return ROUTINE_HEADLINES.some((pattern) => pattern.test(folded))
}
