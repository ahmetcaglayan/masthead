import { useMemo } from 'react'
import { getCountryPack, getProvince, getSource, type CountryPack } from '@shared/countries'
import type { Province, SourceDef } from '@shared/types'
import { sourcesInfo, switchSources, type SourcePrefs, type SourcesInfo } from '@/lib/sources'
import { getSettings, useSettings } from '@/stores/settings'

/**
 * Sources of the selected country, honouring the user's on/off switches
 * (`isSourceEnabled`: off-by-default sources count only once switched on).
 * The single place the renderer decides whether a source is on.
 */
export function useSources(): SourcesInfo {
  const country = useSettings((s) => s.settings.country)
  const prefs = useSettings((s) => s.settings.sources)
  return sourcesInfo(country, prefs)
}

/** `useSources()` outside React (current settings). */
export function getSources(): SourcesInfo {
  const { country, sources } = getSettings()
  return sourcesInfo(country, sources)
}

/**
 * Switch sources of the selected country on or off and persist both lists.
 * Returns the previous `settings.sources` for undo (`restoreSources`).
 */
export function setSourcesEnabled(ids: readonly string[], on: boolean): SourcePrefs {
  const { settings, update } = useSettings.getState()
  const previous = settings.sources
  const next = switchSources(getSources().sources, previous, ids, on)
  void update({ sources: { disabled: next.disabled, enabled: next.enabled ?? [] } })
  return previous
}

/** Put the source switches back to an earlier state (undo, "restore defaults"). */
export function restoreSources(prefs: SourcePrefs): void {
  void useSettings.getState().update({ sources: { disabled: prefs.disabled, enabled: prefs.enabled ?? [] } })
}

/** A single source of the selected country, or undefined when unknown. Ignores the on/off switches. */
export function useSource(id: string | undefined): SourceDef | undefined {
  const country = useSettings((s) => s.settings.country)
  return id ? getSource(country, id) : undefined
}

/** The selected country's pack (regions, provinces, sources), or undefined if it is not shipped. */
export function useCountryPack(): CountryPack | undefined {
  const country = useSettings((s) => s.settings.country)
  return useMemo(() => getCountryPack(country), [country])
}

/** The user's selected province, or undefined when none is chosen. */
export function useSelectedProvince(): Province | undefined {
  const country = useSettings((s) => s.settings.country)
  const code = useSettings((s) => s.settings.location.provinceCode)
  return code ? getProvince(country, code) : undefined
}
