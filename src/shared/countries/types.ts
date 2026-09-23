import type { CountryCode, District, Province, RegionId, SourceDef } from '../types'

export interface RegionDef {
  id: RegionId
  /** Province codes in this region. */
  provinces: string[]
}

export interface GoogleNewsEdition {
  hl: string
  gl: string
  ceid: string
}

/**
 * Everything the app needs to serve news for one country. Adding a country is
 * a matter of adding a pack and registering it in `countries/index.ts`.
 */
export interface CountryPack {
  code: CountryCode
  /** Main content language of the pack's sources (BCP-47). */
  language: string
  /**
   * Every content language the pack's sources publish in, when it is more than one
   * (India reads Hindi and English). Defaults to `[language]`.
   */
  languages?: readonly string[]
  /** Locale used for case-folding and date parsing of content (e.g. `tr-TR`). */
  locale: string
  /** IANA time zone feeds without an offset are assumed to be in. */
  timeZone: string
  /** Shipped and selectable; `false` shows the country as "coming soon". */
  available: boolean
  sources: SourceDef[]
  regions: RegionDef[]
  provinces: Province[]
  districts: District[]
  googleNews?: GoogleNewsEdition
}
