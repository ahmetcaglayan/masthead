/**
 * Province / region tagging from headline and summary text.
 *
 * Names match whole words only, starting with a capital: "İzmir'de" and "Ankara’nın"
 * count (apostrophe + suffix), "Trabzonspor", "Samsunlu" and lowercase "ordu" do not.
 * Scripts without capitals (Hindi) match any whole word. Names that are also common
 * words or surnames (`ambiguous` in the pack: Ordu, Tokat, Aydın, Van, Washington,
 * Sussex…) additionally need the apostrophe form or a place word after them ("Aydın
 * Valiliği", "Van Büyükşehir", "Washington state"). Districts map to their province;
 * every province adds its region.
 */
import type { CountryPack } from '../../shared/countries/types'
import type { RegionId } from '../../shared/types'

export interface GeoTags {
  provinces: string[]
  regions: RegionId[]
}

export interface GeoTagger {
  tag(text: string): GeoTags
  /** Region of a province code, if the pack knows it. */
  regionOf(provinceCode: string): RegionId | undefined
}

interface RegionName {
  name: string
  /** Also an ordinary word or name: needs the apostrophe form or a place word after it, like ambiguous provinces. */
  ambiguous?: boolean
  /** A sea: it stands for the region only when the text names no other country (see FOREIGN). */
  sea?: boolean
}

/** How news copy names Turkey's seven geographic regions; other packs name theirs on `RegionDef.names`. */
const REGION_NAMES: Record<RegionId, RegionName[]> = {
  marmara: [{ name: 'Marmara' }],
  // Ege is also a common first name.
  aegean: [{ name: 'Ege', ambiguous: true, sea: true }],
  mediterranean: [{ name: 'Akdeniz', sea: true }],
  'central-anatolia': [{ name: 'İç Anadolu' }, { name: 'Orta Anadolu' }],
  'black-sea': [{ name: 'Karadeniz', sea: true }],
  'eastern-anatolia': [{ name: 'Doğu Anadolu' }],
  // Bare "Güneydoğu" also starts "Güneydoğu Asya", "Güneydoğu Avrupa"…
  'southeastern-anatolia': [{ name: 'Güneydoğu Anadolu' }, { name: 'Güneydoğu', ambiguous: true }]
}

/** Match key: lower case with dotted and dotless i unified, so "ISTANBUL" typed without the dot still matches. */
function key(word: string): string {
  return word
    .replace(/[Iİı]/g, 'i')
    .toLowerCase()
    .replace(/\u0307/g, '')
}

/** Words that, right after an ambiguous name, make it a place ("Ordu ili", "Tokat Belediyesi"). */
const PLACE_CONTEXT = new Set(
  [
    'ili',
    'ilinde',
    'ilindeki',
    'ilinin',
    'ilçesi',
    'ilçesinde',
    'ilçesindeki',
    'ilçesinin',
    'merkezli',
    'valisi',
    'valiliği',
    'belediyesi',
    'belediye',
    'büyükşehir',
    'üniversitesi',
    'milletvekili',
    'bölgesi',
    'bölgesinde',
    'bölgesindeki',
    'bölgesinin',
    'genelinde'
  ].map(key)
)

/**
 * Other countries and bodies news about the seas names ("Rusya, Karadeniz'de…", "Doğu Akdeniz'de
 * gerilim: Yunanistan…"): with one of them in the text, a sea name is not the Turkish region.
 */
const FOREIGN = new Set(
  [
    'Rusya',
    'Rus',
    'Ukrayna',
    'Romanya',
    'Bulgaristan',
    'Gürcistan',
    'Yunanistan',
    'Yunan',
    'Kıbrıs',
    'GKRY',
    'İsrail',
    'Lübnan',
    'Suriye',
    'Mısır',
    'Libya',
    'Tunus',
    'Cezayir',
    'İtalya',
    'Fransa',
    'İspanya',
    'ABD',
    'AB',
    'BM',
    'NATO'
  ].map(key)
)

const WORD = /[\p{L}\p{M}\p{N}]+/gu
/** A word that can start a name: a capital, or a letter of a script without case (Devanagari). */
const CAPITALISED = /[\p{Lu}\p{Lo}][\p{L}\p{M}\p{N}]*/gu
/** The next word of a multi-word name, after a space, dot or hyphen ("İç Anadolu", "K.Maraş"). */
const NEXT_NAME_WORD = /[\s.-]{1,2}([\p{L}\p{M}\p{N}]+)/uy
const NEXT_WORD = /\s+([\p{L}\p{M}\p{N}]+)/uy
const APOSTROPHE_SUFFIX = /['’‘´`]\p{L}/uy
const WORD_CHAR = /[\p{L}\p{M}\p{N}]/u

interface Entry {
  words: string[]
  province?: string
  region?: RegionId
  ambiguous: boolean
  sea?: boolean
}

const words = (name: string): string[] => [...name.matchAll(WORD)].map((m) => key(m[0]))

/** Build a tagger for a country pack. Construction indexes names by their first word; tagging is linear. */
export function createGeoTagger(pack: CountryPack): GeoTagger {
  const index = new Map<string, Entry[]>()
  const taken = new Set<string>()
  const regionOfProvince = new Map(pack.provinces.map((p) => [p.code, p.region]))
  const placeWords = new Set([...PLACE_CONTEXT, ...(pack.placeWords ?? []).map(key)])
  // In Turkish only proper nouns take an apostrophe suffix ("Ordu'da", never "ordu'da"); an
  // English possessive says nothing ("Washington's allies" is the federal government).
  const suffixMarksName = pack.language === 'tr'

  const add = (name: string, entry: Omit<Entry, 'words'>): void => {
    const nameWords = words(name)
    if (nameWords.length === 0) return
    taken.add(nameWords.join(' '))
    const list = index.get(nameWords[0]) ?? []
    list.push({ ...entry, words: nameWords })
    list.sort((a, b) => b.words.length - a.words.length)
    index.set(nameWords[0], list)
  }

  const regionIds = new Set(pack.regions.map((r) => r.id))
  for (const [id, names] of Object.entries(REGION_NAMES)) {
    if (!regionIds.has(id)) continue
    for (const { name, ambiguous, sea } of names) {
      add(name, { region: id, ambiguous: ambiguous === true, sea: sea === true })
    }
  }
  for (const region of pack.regions) {
    for (const name of region.names ?? []) add(name, { region: region.id, ambiguous: false })
  }
  for (const province of pack.provinces) {
    for (const name of [province.name, ...province.aliases]) {
      add(name, { province: province.code, ambiguous: province.ambiguous === true })
    }
  }
  // A district name used in several provinces cannot tell them apart; one that
  // equals a province or region name defers to it.
  const districtProvinces = new Map<string, Set<string>>()
  for (const district of pack.districts) {
    const k = words(district.name).join(' ')
    districtProvinces.set(k, (districtProvinces.get(k) ?? new Set<string>()).add(district.provinceCode))
  }
  for (const district of pack.districts) {
    const k = words(district.name).join(' ')
    if (taken.has(k) || (districtProvinces.get(k)?.size ?? 0) > 1 || k === 'merkez') continue
    add(district.name, { province: district.provinceCode, ambiguous: false })
  }

  /** End offset of `entry` when its remaining words follow at `pos` and its rules hold, else -1. */
  function matchFrom(text: string, pos: number, entry: Entry): number {
    let end = pos
    for (let w = 1; w < entry.words.length; w++) {
      NEXT_NAME_WORD.lastIndex = end
      const next = NEXT_NAME_WORD.exec(text)
      if (!next || key(next[1]) !== entry.words[w]) return -1
      end = NEXT_NAME_WORD.lastIndex
    }
    if (!entry.ambiguous) return end
    if (suffixMarksName) {
      APOSTROPHE_SUFFIX.lastIndex = end
      if (APOSTROPHE_SUFFIX.test(text)) return end
    }
    NEXT_WORD.lastIndex = end
    const context = NEXT_WORD.exec(text)
    return context && placeWords.has(key(context[1])) ? end : -1
  }

  function tag(text: string): GeoTags {
    const provinces: string[] = []
    const regions: RegionId[] = []
    /** Regions only a sea name gave so far. */
    const bySeaOnly = new Set<RegionId>()
    let foreign = false
    const addRegion = (region: RegionId | undefined, sea = false): void => {
      if (!region) return
      if (!regions.includes(region)) {
        regions.push(region)
        if (sea) bySeaOnly.add(region)
      } else if (!sea) {
        bySeaOnly.delete(region)
      }
    }
    const scanner = new RegExp(CAPITALISED)
    for (let match = scanner.exec(text); match; match = scanner.exec(text)) {
      if (match.index > 0 && WORD_CHAR.test(text[match.index - 1])) continue
      const word = key(match[0])
      if (FOREIGN.has(word)) foreign = true
      const entries = index.get(word)
      if (!entries) continue
      for (const entry of entries) {
        const end = matchFrom(text, match.index + match[0].length, entry)
        if (end < 0) continue
        if (entry.province) {
          if (!provinces.includes(entry.province)) provinces.push(entry.province)
          addRegion(regionOfProvince.get(entry.province))
        }
        addRegion(entry.region, entry.sea)
        scanner.lastIndex = end
        break
      }
    }
    return { provinces, regions: foreign ? regions.filter((region) => !bySeaOnly.has(region)) : regions }
  }

  return { tag, regionOf: (code) => regionOfProvince.get(code) }
}
