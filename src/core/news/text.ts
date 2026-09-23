/**
 * Text helpers for feed content: entity decoding, HTML → paragraphs, Turkish-aware
 * case folding and removal of the boilerplate Turkish news sites append to summaries.
 */

const LATIN1_NAMES =
  'nbsp iexcl cent pound curren yen brvbar sect uml copy ordf laquo not shy reg macr deg plusmn sup2 sup3 acute ' +
  'micro para middot cedil sup1 ordm raquo frac14 frac12 frac34 iquest Agrave Aacute Acirc Atilde Auml Aring AElig ' +
  'Ccedil Egrave Eacute Ecirc Euml Igrave Iacute Icirc Iuml ETH Ntilde Ograve Oacute Ocirc Otilde Ouml times Oslash ' +
  'Ugrave Uacute Ucirc Uuml Yacute THORN szlig agrave aacute acirc atilde auml aring aelig ccedil egrave eacute ' +
  'ecirc euml igrave iacute icirc iuml eth ntilde ograve oacute ocirc otilde ouml divide oslash ugrave uacute ucirc ' +
  'uuml yacute thorn yuml'

const NAMED_ENTITIES = new Map<string, string>([
  ['amp', '&'],
  ['lt', '<'],
  ['gt', '>'],
  ['quot', '"'],
  ['apos', "'"],
  ...LATIN1_NAMES.split(' ').map((name, i): [string, string] => [name, String.fromCharCode(160 + i)]),
  ...Object.entries({
    OElig: 0x152,
    oelig: 0x153,
    Scaron: 0x160,
    scaron: 0x161,
    Yuml: 0x178,
    fnof: 0x192,
    circ: 0x2c6,
    tilde: 0x2dc,
    Gbreve: 0x11e,
    gbreve: 0x11f,
    Idot: 0x130,
    inodot: 0x131,
    imath: 0x131,
    Scedil: 0x15e,
    scedil: 0x15f,
    ensp: 0x2002,
    emsp: 0x2003,
    thinsp: 0x2009,
    zwnj: 0x200c,
    zwj: 0x200d,
    lrm: 0x200e,
    rlm: 0x200f,
    hyphen: 0x2010,
    ndash: 0x2013,
    mdash: 0x2014,
    lsquo: 0x2018,
    rsquo: 0x2019,
    sbquo: 0x201a,
    ldquo: 0x201c,
    rdquo: 0x201d,
    bdquo: 0x201e,
    dagger: 0x2020,
    Dagger: 0x2021,
    bull: 0x2022,
    hellip: 0x2026,
    permil: 0x2030,
    prime: 0x2032,
    Prime: 0x2033,
    lsaquo: 0x2039,
    rsaquo: 0x203a,
    oline: 0x203e,
    euro: 0x20ac,
    trade: 0x2122,
    larr: 0x2190,
    uarr: 0x2191,
    rarr: 0x2192,
    darr: 0x2193,
    minus: 0x2212
  }).map(([name, code]): [string, string] => [name, String.fromCharCode(code)])
])

/** HTML maps numeric references 128–159 through windows-1252, which CMSs still emit (`&#146;` → ’). */
const C1_WINDOWS_1252 = '€\u0081‚ƒ„…†‡ˆ‰Š‹Œ\u008dŽ\u008f\u0090‘’“”•–—˜™š›œ\u009džŸ'

const ENTITY = /&(?:#(\d{1,7})|#[xX]([0-9a-fA-F]{1,6})|([A-Za-z][A-Za-z0-9]{1,31}));/g

function fromCodePoint(code: number): string {
  if (code >= 128 && code <= 159) return C1_WINDOWS_1252[code - 128]
  if (code === 0 || code > 0x10ffff || (code >= 0xd800 && code <= 0xdfff)) return '�'
  return String.fromCodePoint(code)
}

/** Decode named (HTML) and numeric character references; unknown names are left as they are. */
export function decodeEntities(text: string): string {
  if (!text.includes('&')) return text
  return text.replace(
    ENTITY,
    (match, dec: string | undefined, hex: string | undefined, name: string | undefined) => {
      if (dec) return fromCodePoint(parseInt(dec, 10))
      if (hex) return fromCodePoint(parseInt(hex, 16))
      return NAMED_ENTITIES.get(name ?? '') ?? match
    }
  )
}

const SPACES = /[\s\u00a0\u1680\u2000-\u200a\u2028\u2029\u202f\u205f\u3000]+/g
const INVISIBLE = /[\u200b-\u200d\u2060\ufeff\u00ad]/g

/** Collapse all whitespace (including non-breaking and exotic spaces) to single spaces and trim. */
export function collapseWhitespace(text: string): string {
  return text.replace(INVISIBLE, '').replace(SPACES, ' ').trim()
}

/** A tag, tolerant of `>` inside quoted attribute values. */
const TAG = /<\/?[A-Za-z][^\s>/]*(?:[^>"']|"[^"]*"|'[^']*')*>/g
const COMMENT = /<!--[\s\S]*?(?:-->|$)/g
const DROPPED_ELEMENTS =
  /<(script|style|noscript|iframe|svg|template|object|video|audio|button|form|select|textarea|figcaption|aside)\b[\s\S]*?<\/\1\s*>/gi
/** Related-story inserts and similar widgets embedded in article bodies (e.g. Milliyet's `section.insert`). */
const WIDGETS =
  /<(section|div)\b[^>]*\bclass\s*=\s*["'][^"']*\b(?:insert|related|share|social)\b[^"']*["'][^>]*>[\s\S]*?<\/\1\s*>/gi
const BLOCK =
  /<\/?(?:p|div|section|article|header|footer|main|h[1-6]|blockquote|ul|ol|dl|dt|dd|table|thead|tbody|tr|figure|pre|hr|address|center)\b(?:[^>"']|"[^"]*"|'[^']*')*>|<br\b[^>]*>/gi
const LIST_ITEM = /<li\b(?:[^>"']|"[^"]*"|'[^']*')*>/gi
const BREAK = '\u0000'

/**
 * Convert an HTML fragment to plain-text paragraphs. Block elements (`<p>`, `<div>`,
 * headings, list items…) and `<br>` start a new paragraph; scripts, styles, captions
 * and embedded widgets are dropped; entities are decoded and whitespace collapsed.
 */
export function htmlToParagraphs(html: string): string[] {
  if (!html) return []
  let source = html
  // Double-escaped markup (`&lt;p&gt;` inside CDATA) with no real tags: unescape it once.
  if (!/<[A-Za-z]/.test(source) && /&lt;\/?[A-Za-z]/.test(source)) source = decodeEntities(source)
  const text = source
    .replace(COMMENT, ' ')
    .replace(DROPPED_ELEMENTS, ' ')
    .replace(WIDGETS, ' ')
    .replace(SPACES, ' ')
    .replace(LIST_ITEM, `${BREAK}• `)
    .replace(BLOCK, BREAK)
    .replace(TAG, '')
  const paragraphs: string[] = []
  for (const part of decodeEntities(text).split(BREAK)) {
    const paragraph = collapseWhitespace(part)
    if (paragraph && paragraph !== '•') paragraphs.push(paragraph)
  }
  return paragraphs
}

/** Plain text of an HTML fragment on one line (titles, captions). */
export function htmlToText(html: string): string {
  return htmlToParagraphs(html).join(' ')
}

/** Turkish-aware lower case: `İ` → `i`, `I` → `ı`. Length-preserving for Turkish text. */
export function trLower(text: string): string {
  return text.replace(/I/g, 'ı').replace(/İ/g, 'i').toLowerCase()
}

const FOLD: Record<string, string> = {
  ç: 'c',
  ğ: 'g',
  ı: 'i',
  ö: 'o',
  ş: 's',
  ü: 'u',
  â: 'a',
  î: 'i',
  û: 'u'
}

/** Accent-insensitive key for search and clustering: trLower + ç→c ğ→g ı→i ö→o ş→s ü→u (and â î û). */
export function foldTr(text: string): string {
  return trLower(text)
    .replace(/[çğıöşüâîû]/g, (ch) => FOLD[ch])
    .replace(/\u0307/g, '')
}

/** A headline set in capitals: more than 60% of its letters are upper-case. */
export function isShouting(text: string): boolean {
  const letters = text.match(/\p{L}/gu)?.length ?? 0
  const upper = text.match(/\p{Lu}/gu)?.length ?? 0
  return letters > 0 && upper / letters > 0.6
}

/** A headline the outlet cut short: it ends in "..." or "…". */
export function isTruncatedTitle(text: string): boolean {
  return /(?:\.{3}|…)\s*$/u.test(text)
}

/** Daily service items (Gazette digest, prices, weather…); shared with the renderer's curation. */
export { isRoutineTitle } from '../../shared/headlines'

const HASHTAG_SUFFIX = /(?:\s+#[\p{L}\p{N}_-]+)+$/u

/** Remove trailing hashtags such as the ` #izmir` Sabah appends to its city-feed titles. */
export function stripTrailingHashtags(text: string): string {
  return text.replace(HASHTAG_SUFFIX, '')
}

const CLICK = 'tıklayın(?:ız)?'
/** "Read more" calls to action that end a summary, matched on trLower'd text. */
const TRAILING_CTA = new RegExp(
  '[\\s:,;|»›>-]*(?:' +
    [
      `haberin devamı(?: için ${CLICK})?`,
      `devamı(?: için)? ${CLICK}`,
      `devamını (?:okumak|görmek) için(?: ${CLICK})?`,
      `devamını oku(?:yun)?`,
      `(?:haberin )?detaylar(?:ı)? için ${CLICK}`,
      `(?:tüm )?detaylar haberimizde`,
      `(?:[\\p{L}\\p{N}]+ ){0,3}için ${CLICK}`,
      `read more|continue reading|read the full (?:story|article)`
    ].join('|') +
    ')[\\s.…:!»›>]*$',
  'u'
)
const WORDPRESS_FOOTER = /\s*the post\b[\s\S]*?\bappeared first on\b[\s\S]*$/u
const LEADING_BREAKING =
  /^(?:son ?dak[iı]ka(?: haberler[iı]| haber[iı])?|fla[şs](?: haber)?)\s*(?:[.…:|!–—-]+|\s+ı\s+)\s*/u
const SOURCE_LINE = /^(?:kaynak|haber kaynağı|source|fotoğraf|foto|görsel)\s*:\s*\S.{0,60}$/u
const BRACKETED_ELLIPSIS = /\s*[[(]\s*(?:…|\.{2,})\s*[\])]\s*$/u
const TRAILING_DOTS = /\s*\.{3,}$/u

/** Cut `text` where `pattern` matches its trLower'd form (trLower keeps offsets for Turkish text). */
function cutAt(text: string, pattern: RegExp, fromStart = false): string {
  const lower = trLower(text)
  if (lower.length !== text.length) return text
  const match = pattern.exec(lower)
  if (!match) return text
  return fromStart ? text.slice(match.index + match[0].length) : text.slice(0, match.index)
}

/**
 * Remove boilerplate from summary paragraphs: "Devamı için tıklayınız", "Haberin
 * devamı…", "Detaylar haberimizde", "Read more", WordPress's "The post … appeared
 * first on …", "[…]" markers, a lone "Kaynak: X" line, a leading "Son dakika
 * haberleri…" and Sabah's hashtags. A trailing "..." is normalised to "…".
 */
export function stripBoilerplate(paragraphs: readonly string[]): string[] {
  const out: string[] = []
  for (const original of paragraphs) {
    let text = cutAt(original, WORDPRESS_FOOTER)
    text = cutAt(text, LEADING_BREAKING, true)
    let previous: string
    do {
      previous = text
      text = cutAt(text, TRAILING_CTA)
      text = stripTrailingHashtags(text).replace(BRACKETED_ELLIPSIS, '')
    } while (text !== previous && text)
    text = text.replace(TRAILING_DOTS, '…').trim()
    if (!text || SOURCE_LINE.test(trLower(text)) || /^[\p{P}\p{S}\s]+$/u.test(text)) continue
    out.push(text)
  }
  return out
}
