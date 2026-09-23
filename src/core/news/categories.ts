/**
 * Maps the free-form section names feeds use (`<category>Kültür Sanat</category>`,
 * `/dunya-haberleri/` in a URL) onto the app's CategoryIds. Turkish, English, German
 * and Portuguese section words, because every pack's URLs pass through here.
 */
import type { CategoryId } from '../../shared/categories'
import { foldTr } from './text'

/** Folded Turkish (and English) section words → category. */
const KEYWORDS: Record<string, CategoryId> = {
  gundem: 'general',
  guncel: 'general',
  turkiye: 'national',
  ulusal: 'national',
  dunya: 'world',
  uluslararasi: 'world',
  avrupa: 'world',
  ortadogu: 'world',
  world: 'world',
  international: 'world',
  politika: 'politics',
  siyaset: 'politics',
  secim: 'politics',
  politics: 'politics',
  ekonomi: 'economy',
  finans: 'economy',
  borsa: 'economy',
  piyasa: 'economy',
  piyasalar: 'economy',
  doviz: 'economy',
  emtia: 'economy',
  kripto: 'economy',
  sirketler: 'economy',
  sektorler: 'economy',
  emlak: 'economy',
  para: 'economy',
  economy: 'economy',
  business: 'economy',
  finance: 'economy',
  markets: 'economy',
  spor: 'sports',
  sporlar: 'sports',
  futbol: 'sports',
  basketbol: 'sports',
  voleybol: 'sports',
  sports: 'sports',
  sport: 'sports',
  football: 'sports',
  teknoloji: 'technology',
  bilisim: 'technology',
  internet: 'technology',
  mobil: 'technology',
  oyun: 'technology',
  donanim: 'technology',
  technology: 'technology',
  tech: 'technology',
  bilim: 'science',
  uzay: 'science',
  science: 'science',
  saglik: 'health',
  health: 'health',
  kultur: 'culture',
  sanat: 'culture',
  kitap: 'culture',
  sinema: 'culture',
  muzik: 'culture',
  tiyatro: 'culture',
  culture: 'culture',
  arts: 'culture',
  books: 'culture',
  magazin: 'entertainment',
  kelebek: 'entertainment',
  televizyon: 'entertainment',
  dizi: 'entertainment',
  unluler: 'entertainment',
  eglence: 'entertainment',
  entertainment: 'entertainment',
  yasam: 'lifestyle',
  hayat: 'lifestyle',
  kadin: 'lifestyle',
  aile: 'lifestyle',
  yemek: 'lifestyle',
  moda: 'lifestyle',
  astroloji: 'lifestyle',
  lifestyle: 'lifestyle',
  egitim: 'education',
  education: 'education',
  otomobil: 'automotive',
  otomotiv: 'automotive',
  auto: 'automotive',
  seyahat: 'travel',
  turizm: 'travel',
  gezi: 'travel',
  travel: 'travel',
  cevre: 'environment',
  iklim: 'environment',
  doga: 'environment',
  environment: 'environment',
  climate: 'environment',
  yazarlar: 'opinion',
  yazar: 'opinion',
  gorus: 'opinion',
  yorum: 'opinion',
  analiz: 'opinion',
  opinion: 'opinion',
  yerel: 'local',
  local: 'local',

  // German
  inland: 'national',
  ausland: 'world',
  politik: 'politics',
  wirtschaft: 'economy',
  boerse: 'economy',
  finanzen: 'economy',
  technik: 'technology',
  netzwelt: 'technology',
  digital: 'technology',
  wissenschaft: 'science',
  wissen: 'science',
  gesundheit: 'health',
  unterhaltung: 'entertainment',
  panorama: 'general',
  gesellschaft: 'general',
  bildung: 'education',
  reise: 'travel',
  umwelt: 'environment',
  klima: 'environment',
  meinung: 'opinion',
  kommentar: 'opinion',
  regional: 'local',

  // Portuguese
  brasil: 'national',
  mundo: 'world',
  politica: 'politics',
  economia: 'economy',
  mercado: 'economy',
  negocios: 'economy',
  esporte: 'sports',
  esportes: 'sports',
  futebol: 'sports',
  tecnologia: 'technology',
  ciencia: 'science',
  saude: 'health',
  cultura: 'culture',
  entretenimento: 'entertainment',
  celebridades: 'entertainment',
  educacao: 'education',
  carros: 'automotive',
  viagem: 'travel',
  ambiente: 'environment',
  opiniao: 'opinion',
  cotidiano: 'general'
}

/**
 * Words that name a section in Turkish but mean something ordinary in another pack's
 * language: Portuguese URLs are full of `para` ("for"), which is Turkish for money.
 */
const TURKISH_ONLY = new Set(['para', 'dizi', 'gezi'])

/** Words of five or more letters also match their inflected forms (`ekonomisi`, `teknolojileri`). */
function lookup(word: string): CategoryId | undefined {
  const exact = KEYWORDS[word]
  if (exact) return exact
  if (word.length < 6) return undefined
  for (let end = word.length - 1; end >= 5; end--) {
    const stem = KEYWORDS[word.slice(0, end)]
    if (stem) return stem
  }
  return undefined
}

function fromWords(words: string[], language: string): CategoryId[] {
  const out = new Set<CategoryId>()
  for (const word of words) {
    if (language !== 'tr' && TURKISH_ONLY.has(word)) continue
    const category = lookup(word)
    if (category) out.add(category)
  }
  return [...out]
}

/** Categories for a feed's section label (`Gündem`, `Kültür Sanat`, `Bilim ve Teknoloji`). */
export function categoriesFromLabel(label: string, language = 'tr'): CategoryId[] {
  return fromWords(foldTr(label).split(/[^a-z0-9]+/), language)
}

/** Categories implied by an article URL's section directories (`/dunya-haberleri/…`, `/haber/ekonomi/…`). */
export function categoriesFromUrl(url: string, language = 'tr'): CategoryId[] {
  let segments: string[]
  try {
    segments = new URL(url).pathname.split('/').filter(Boolean)
  } catch {
    return []
  }
  const directories = segments.slice(0, -1).slice(0, 2)
  return fromWords(
    directories.flatMap((segment) => foldTr(decodeURIComponentSafe(segment)).split(/[^a-z0-9]+/)),
    language
  )
}

function decodeURIComponentSafe(value: string): string {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}
