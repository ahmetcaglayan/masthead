/**
 * Case- and accent-insensitive form of a string for search, using Turkish
 * casing rules: `İzmir` → `izmir`, `Çankırı` → `cankiri`, `IŞIK` → `isik`.
 */
export function foldSearch(text: string): string {
  return text.toLocaleLowerCase('tr-TR').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/ı/g, 'i')
}
