import type { TFunction } from 'i18next'
import { getProvince } from '@shared/countries'
import type { CountryCode, RegionId } from '@shared/types'

/** The user's local-news choice: a province, a whole region, or neither. */
export interface LocationValue {
  provinceCode: string | null
  regionId: RegionId | null
}

/** Display name of a location choice (`İzmir`, `Aegean`), or null when nothing is chosen. */
export function locationLabel(t: TFunction, country: CountryCode, value: LocationValue): string | null {
  if (value.provinceCode) return getProvince(country, value.provinceCode)?.name ?? null
  if (value.regionId) return t('common:region.' + value.regionId)
  return null
}
