import type { RegionDef } from '../types'
import { provinces } from './provinces.ts'

/** Turkey's seven geographic regions (coğrafi bölgeler), in the conventional order. */
export const TR_REGION_IDS = [
  'marmara',
  'aegean',
  'mediterranean',
  'central-anatolia',
  'black-sea',
  'eastern-anatolia',
  'southeastern-anatolia'
] as const

export type TrRegionId = (typeof TR_REGION_IDS)[number]

/** Region → plate codes, derived from the province table so the two can never disagree. */
export const regions: RegionDef[] = TR_REGION_IDS.map((id) => ({
  id,
  provinces: provinces.filter((p) => p.region === id).map((p) => p.code)
}))
