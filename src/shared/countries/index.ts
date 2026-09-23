/**
 * Country registry. A country becomes selectable by shipping a pack and
 * registering it in `PACKS`; the rest of the app only goes through this module.
 */
import type { Settings } from '../settings'
import type { CountryCode, Province, SourceDef } from '../types'
import type { CountryPack } from './types'
import { br } from './br/index.ts'
import { de } from './de/index.ts'
import { gb } from './gb/index.ts'
import { inPack } from './in/index.ts'
import { tr } from './tr/index.ts'
import { us } from './us/index.ts'

export type { CountryPack, GoogleNewsEdition, RegionDef } from './types'

export interface CountryOption {
  code: CountryCode
  /** A pack is shipped; `false` is shown as "coming soon". */
  available: boolean
}

const PACKS: Partial<Record<CountryCode, CountryPack>> = { tr, us, in: inPack, gb, de, br }

const ORDER: readonly CountryCode[] = ['tr', 'us', 'in', 'gb', 'de', 'br', 'fr', 'es', 'it', 'nl', 'az']

/** Countries offered in onboarding and settings, in display order. */
export const COUNTRY_OPTIONS: readonly CountryOption[] = ORDER.map((code) => ({
  code,
  available: PACKS[code]?.available === true
}))

export function getCountryPack(code: CountryCode): CountryPack | undefined {
  return PACKS[code]
}

/**
 * Whether the country's pack ships provinces. Countries without one have no
 * Local page to offer, so the city question and the local navigation are left out.
 */
export function hasLocalNews(code: CountryCode): boolean {
  return (PACKS[code]?.provinces.length ?? 0) > 0
}

/** All sources of a country, or an empty list when no pack is shipped. */
export function listSources(code: CountryCode): SourceDef[] {
  return PACKS[code]?.sources ?? []
}

const sourceIndex = new Map<CountryCode, Map<string, SourceDef>>()
const provinceIndex = new Map<CountryCode, Map<string, Province>>()

function indexed<T>(
  cache: Map<CountryCode, Map<string, T>>,
  code: CountryCode,
  items: T[],
  key: (item: T) => string
): Map<string, T> {
  let map = cache.get(code)
  if (!map) {
    map = new Map(items.map((item) => [key(item), item]))
    cache.set(code, map)
  }
  return map
}

export function getSource(code: CountryCode, id: string): SourceDef | undefined {
  return indexed(sourceIndex, code, listSources(code), (s) => s.id).get(id)
}

/** Province by its code (plate code for Turkey). */
export function getProvince(code: CountryCode, provinceCode: string): Province | undefined {
  return indexed(provinceIndex, code, PACKS[code]?.provinces ?? [], (p) => p.code).get(provinceCode)
}

/**
 * Whether a source is switched on. Sources are on unless the user switched them
 * off; `defaultEnabled: false` sources stay off until the user switches them on.
 */
export function isSourceEnabled(source: SourceDef, prefs: Settings['sources']): boolean {
  if (prefs.disabled.includes(source.id)) return false
  return source.defaultEnabled !== false || (prefs.enabled?.includes(source.id) ?? false)
}

/** The new `settings.sources` after the user switches a source on or off. */
export function setSourceEnabled(
  source: SourceDef,
  prefs: Settings['sources'],
  on: boolean
): Settings['sources'] {
  const disabled = prefs.disabled.filter((id) => id !== source.id)
  const enabled = (prefs.enabled ?? []).filter((id) => id !== source.id)
  const onByDefault = source.defaultEnabled !== false
  if (on && !onByDefault) enabled.push(source.id)
  if (!on && onByDefault) disabled.push(source.id)
  return { disabled, enabled }
}
