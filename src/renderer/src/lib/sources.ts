import { isSourceEnabled, listSources, setSourceEnabled } from '@shared/countries'
import type { Settings } from '@shared/settings'
import type { CountryCode, SourceDef } from '@shared/types'

/** The user's source switches (`settings.sources`). */
export type SourcePrefs = Settings['sources']

/** The current country's sources split by the user's on/off choices. */
export interface SourcesInfo {
  /** Every source of the country pack, in pack order. */
  sources: SourceDef[]
  /** Sources that are switched on, in pack order. */
  enabled: SourceDef[]
  enabledIds: ReadonlySet<string>
  /**
   * Whether articles of a source are shown: `isSourceEnabled` for the pack's
   * sources (off-by-default ones only once switched on); ids the pack no longer
   * knows (stale cache entries) are off. Stable per settings object, so it
   * doubles as a memo key.
   */
  isEnabled(id: string): boolean
  byId: ReadonlyMap<string, SourceDef>
}

let cache: { country: CountryCode; prefs: SourcePrefs; info: SourcesInfo } | null = null

/**
 * Build (and cache) the source lists for a country and the user's switches.
 * Cached on the exact inputs (the whole `settings.sources` object) so every
 * component shares one instance.
 */
export function sourcesInfo(country: CountryCode, prefs: SourcePrefs): SourcesInfo {
  if (cache && cache.country === country && cache.prefs === prefs) return cache.info
  const sources = listSources(country)
  const byId = new Map(sources.map((s) => [s.id, s]))
  const enabled = sources.filter((s) => isSourceEnabled(s, prefs))
  const enabledIds = new Set(enabled.map((s) => s.id))
  const info: SourcesInfo = {
    sources,
    enabled,
    enabledIds,
    isEnabled: (id) => enabledIds.has(id),
    byId
  }
  cache = { country, prefs, info }
  return info
}

/**
 * `prefs` with every source in `ids` switched on or off. The pack's sources are
 * rewritten through `setSourceEnabled` with their current state, so both lists
 * come out canonical (e.g. ids an older version put in `disabled` for sources
 * that are off by default anyway are dropped); other countries' ids are kept.
 */
export function switchSources(
  sources: readonly SourceDef[],
  prefs: SourcePrefs,
  ids: readonly string[],
  on: boolean
): SourcePrefs {
  const changed = new Set(ids)
  const known = new Set(sources.map((s) => s.id))
  let next: SourcePrefs = {
    disabled: prefs.disabled.filter((id) => !known.has(id)),
    enabled: (prefs.enabled ?? []).filter((id) => !known.has(id))
  }
  for (const source of sources) {
    next = setSourceEnabled(source, next, changed.has(source.id) ? on : isSourceEnabled(source, prefs))
  }
  return next
}

/** True when every source is in its default state (the pack's `defaultEnabled`). */
export function atSourceDefaults(sources: readonly SourceDef[], prefs: SourcePrefs): boolean {
  return sources.every((s) => isSourceEnabled(s, prefs) === (s.defaultEnabled !== false))
}

/** `prefs` with the pack's sources back to their defaults (other countries' ids are kept). */
export function sourceDefaults(sources: readonly SourceDef[], prefs: SourcePrefs): SourcePrefs {
  const known = new Set(sources.map((s) => s.id))
  return {
    disabled: prefs.disabled.filter((id) => !known.has(id)),
    enabled: (prefs.enabled ?? []).filter((id) => !known.has(id))
  }
}

/** One or two letters for a source monogram: `NTV` → `NTV`, `BBC Türkçe` → `BT`, `Sözcü` → `S`. */
export function sourceInitials(name: string): string {
  const words = name.split(/[\s\-–.]+/).filter(Boolean)
  if (words.length === 0) return '?'
  const first = words[0]
  if (words.length === 1) {
    const isAcronym = first.length <= 4 && first === first.toLocaleUpperCase('tr-TR')
    return isAcronym ? first : first.charAt(0).toLocaleUpperCase('tr-TR')
  }
  return (first.charAt(0) + words[1].charAt(0)).toLocaleUpperCase('tr-TR')
}

/**
 * A soft wash of the source's brand colour over the surface, for placeholders
 * and monogram tiles. Theme-aware because it mixes with the `--surface` token.
 */
export function sourceTint(color: string | undefined, percent = 16): string {
  return color ? `color-mix(in oklab, ${color} ${percent}%, var(--surface))` : 'var(--muted)'
}

/** Brand colour pulled towards the text colour so it stays legible on tinted tiles in both themes. */
export function sourceInk(color: string | undefined): string {
  return color ? `color-mix(in oklab, ${color} 72%, var(--fg))` : 'var(--fg-muted)'
}
