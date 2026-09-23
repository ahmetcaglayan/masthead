/**
 * Headline helpers for display and curation: calming SEO-style all-caps
 * headlines, judging a headline's quality, and spotting routine scheduled items
 * ("Resmi Gazete kararları…") that must not pass for breaking news.
 *
 * Pure (no DOM, no app imports), so curation and the unit tests can use it.
 */
import { getCountryPack } from '@shared/countries'
import { isRoutineTitle } from '@shared/headlines'
import type { Article } from '@shared/types'
import { foldText } from './fold'

const LOCALE = 'tr-TR'

/** Initialisms kept upper-case when a shouting headline is calmed down (vowel-less ones are kept anyway). */
const ACRONYMS = new Set(
  `AA AB ABD AFAD AİHM AK AKM AKP ASELSAN AVM AYM BAE BM BOTAŞ DEAŞ DEM DHA DSÖ EPDK EYT FETÖ FIFA
   HAVELSAN İBB İETT İHA İSKİ İTÜ İYİ IMF KAAN MEB MİT MKE NASA NATO NBA ODTÜ OPEC ÖSYM ÖTV ROKETSAN
   SİHA TEKNOFEST TOGG TOKİ TÜBİTAK TÜİK TUSAŞ UEFA UNESCO UNICEF YÖK`
    .split(/\s+/)
    .filter(Boolean)
)

const VOWEL = /[aeıioöuüâîûAEIİOÖUÜÂÎÛ]/
const MONTHS = new Set(
  'ocak şubat mart nisan mayıs haziran temmuz ağustos eylül ekim kasım aralık'.split(' ')
)
/** Proper nouns that often appear in shouting headlines (the country's provinces are added lazily). */
const NAMES = `türkiye erdoğan atatürk galatasaray fenerbahçe beşiktaş trabzonspor başakşehir avrupa asya
  amerika rusya ukrayna israil gazze filistin suriye irak iran yunanistan almanya fransa ingiltere çin
  japonya kıbrıs azerbaycan putin trump netanyahu zelenski`
/** Two-word names: the first word, and how the next one starts. */
const PAIRS: ReadonlyMap<string, string> = new Map([
  ['resmi', 'gazete'],
  ['merkez', 'banka'],
  ['süper', 'lig'],
  ['şampiyonlar', 'lig'],
  ['beyaz', 'saray'],
  ['birleşmiş', 'millet']
])

let names: ReadonlySet<string> | undefined

function properNames(): ReadonlySet<string> {
  if (!names) {
    const provinces = getCountryPack('tr')?.provinces.map((p) => p.name) ?? []
    names = new Set(
      [...NAMES.split(/\s+/).filter(Boolean), ...provinces].map((n) => n.toLocaleLowerCase(LOCALE))
    )
  }
  return names
}

const capitalize = (word: string): string =>
  word ? word.charAt(0).toLocaleUpperCase(LOCALE) + word.slice(1) : word

/** An initialism: listed, vowel-less (TBMM, CHP), or containing digits (F-16, A350). */
function isAcronym(base: string): boolean {
  return ACRONYMS.has(base) || /\p{N}/u.test(base) || !VOWEL.test(base)
}

type Kind = 'caps' | 'neutral' | 'lower'

/** `caps`: two or more letters, all upper-case; `neutral`: numbers, separators, a lone capital. */
function kindOf(word: string): Kind {
  if (/\p{Ll}/u.test(word)) return 'lower'
  return (word.match(/\p{Lu}/gu)?.length ?? 0) >= 2 ? 'caps' : 'neutral'
}

const SEPARATOR = /^[|–—-]$/
const ENDS_SENTENCE = /[:!?.]["'”’»)]*$/

interface Word {
  text: string
  kind: Kind
  /** Rewritten in lower case (a proper noun or month may keep its capital). */
  calmed: boolean
  /** Lower-cased core, for the name and month checks. */
  base: string
}

/** Lower-case one shouting word, keeping initialisms and the capital of apostrophe-marked proper nouns. */
function calmWord(word: Word): void {
  const match = word.text.match(/^([^\p{L}\p{N}]*)(.*?)([^\p{L}\p{N}]*)$/u)
  if (!match) return
  const [, lead, core, trail] = match
  const apostrophe = core.search(/['’]/)
  const base = apostrophe < 0 ? core : core.slice(0, apostrophe)
  const suffix = apostrophe < 0 ? '' : core.slice(apostrophe).toLocaleLowerCase(LOCALE)
  if (isAcronym(base)) {
    word.text = lead + base + suffix + trail
    return
  }
  const lower = base.toLocaleLowerCase(LOCALE)
  // Turkish only sets suffixes off with an apostrophe after proper nouns: "BEŞİKTAŞ'I" → "Beşiktaş'ı".
  const proper = suffix !== '' || properNames().has(lower)
  word.text = lead + (proper ? capitalize(lower) : lower) + suffix + trail
  word.base = lower
  word.calmed = true
}

function capitalizeWord(word: Word): void {
  word.text = word.text.replace(/\p{L}/u, (letter) => letter.toLocaleUpperCase(LOCALE))
}

function calm(title: string): string {
  const parts = title.split(/(\s+)/)
  const words: Word[] = []
  const slots: number[] = []
  parts.forEach((text, i) => {
    if (!text || /^\s+$/.test(text)) return
    words.push({ text, kind: kindOf(text), calmed: false, base: '' })
    slots.push(i)
  })
  if (!words.some((w) => w.kind === 'caps')) return title

  let touched = false
  for (let start = 0; start < words.length;) {
    if (words[start].kind === 'lower') {
      start++
      continue
    }
    let end = start
    while (end < words.length && words[end].kind !== 'lower') end++
    const run = words.slice(start, end)
    const caps = run.filter((w) => w.kind === 'caps')
    const last = run[run.length - 1]
    const whole = start === 0 && end === words.length
    // A leading label such as "SON DAKİKA:" or "FLAŞ |".
    const label = start === 0 && end < words.length && (SEPARATOR.test(last.text) || /:$/.test(last.text))
    const qualifies = caps.length >= 3 || (whole && caps.length >= 2) || (label && caps.length >= 1)
    if (qualifies) {
      for (const word of caps) {
        const before = word.text
        calmWord(word)
        touched ||= word.text !== before
      }
    }
    start = end
  }
  if (!touched) return title

  words.forEach((word, i) => {
    if (!word.calmed) return
    const prev = words[i - 1]
    const next = words[i + 1]
    if (
      !prev ||
      ENDS_SENTENCE.test(prev.text) ||
      SEPARATOR.test(prev.text) ||
      (MONTHS.has(word.base) && /^\d+$/.test(prev.text))
    ) {
      capitalizeWord(word)
    }
    const pair = PAIRS.get(word.base)
    if (pair && next?.calmed && next.base.startsWith(pair)) {
      capitalizeWord(word)
      capitalizeWord(next)
    }
  })

  words.forEach((word, i) => (parts[slots[i]] = word.text))
  return parts.join('')
}

const calmCache = new Map<string, string>()
const CALM_CACHE_MAX = 20_000

/**
 * Calm an SEO-style all-caps headline for display: a run of three or more
 * shouting words (or a shouting "SON DAKİKA:" label, or an all-caps headline)
 * is lower-cased with Turkish rules (`İ → i`, `I → ı`), then the headline and
 * each sentence start get their capital back. Initialisms (TCMB, AFAD, BM),
 * numbers, months after a day ("23 Eylül"), known names and apostrophe-marked
 * proper nouns ("Beşiktaş'ı") keep theirs. Normal headlines come back as is.
 *
 * `RESMİ GAZETE KARARLARI 23 EYLÜL: Atamalar` → `Resmi Gazete kararları 23 Eylül: Atamalar`
 */
export function tameCaps(title: string): string {
  let calmed = calmCache.get(title)
  if (calmed === undefined) {
    calmed = calm(title)
    if (calmCache.size >= CALM_CACHE_MAX) calmCache.clear()
    calmCache.set(title, calmed)
  }
  return calmed
}

/** Share of a headline's cased letters that are upper-case (0 when it has none). */
export function capsRatio(title: string): number {
  const upper = title.match(/\p{Lu}/gu)?.length ?? 0
  const lower = title.match(/\p{Ll}/gu)?.length ?? 0
  return upper + lower === 0 ? 0 : upper / (upper + lower)
}

/**
 * How well a headline reads as a manşet: 0 for a clean one, lower for one that
 * looks cut off (trailing `…`), shouts in capitals, or opens with a
 * "SON DAKİKA" / "FLAŞ" label.
 */
export function headlineQuality(title: string): number {
  let score = 0
  if (/(…|\.\.\.)\s*$/.test(title)) score -= 1
  if (capsRatio(title) > 0.6) score -= 1
  if (/^\s*(son dakika|flas)\b/.test(foldText(title))) score -= 0.5
  return score
}

const routineCache = new Map<string, boolean>()

/**
 * Whether a headline is a routine scheduled item — the daily gazette, market
 * open/close, prices, weather, prayer times, fixtures… Same list as the core
 * (`@shared/headlines`), which already keeps these out of breaking news and the
 * manşet; checked here too for articles cached before that. Cached per title.
 */
export function isRoutineHeadline(title: string): boolean {
  let routine = routineCache.get(title)
  if (routine === undefined) {
    routine = isRoutineTitle(title)
    if (routineCache.size >= CALM_CACHE_MAX) routineCache.clear()
    routineCache.set(title, routine)
  }
  return routine
}

/** Breaking news worth a red label: from a breaking stream and not a routine scheduled item. */
export function isBreakingNews(article: Pick<Article, 'isBreaking' | 'title'>): boolean {
  return article.isBreaking && !isRoutineHeadline(article.title)
}
