import type { CountryCode, District, Province, RegionId, SourceDef } from '../types'

export interface RegionDef {
  id: RegionId
  /** Province codes in this region. */
  provinces: string[]
  /** How news copy names the region ("Scotland", "Yorkshire"); stories naming it are tagged with it. */
  names?: string[]
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
  /**
   * Content language of the pack's sources (BCP-47). Every source publishes in it: a
   * country's front page is written by its own newsrooms, in its own language.
   */
  language: string
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
  /**
   * What the UI calls a province when it is not a city: a `state` in the US, Brazil and
   * India, a `land` (Bundesland) in Germany, an `area` (a county or city region) in the UK,
   * a `department` (département) in France.
   */
  localUnit?: 'state' | 'land' | 'area' | 'department'
  /**
   * Words that, right after a place name that is also an ordinary word, make it a place
   * ("Washington state", "Georgia Governor"). Turkish ones are built into the geo tagger.
   */
  placeWords?: readonly string[]
  /**
   * Names that contain one of the pack's places but mean somewhere else: "Grande-Bretagne"
   * is not Brittany, "Corée du Nord" not the Nord department. The geo tagger reads past them.
   */
  notPlaces?: readonly string[]
  googleNews?: GoogleNewsEdition
}
