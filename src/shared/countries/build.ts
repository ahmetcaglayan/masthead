/**
 * Small builders the state-based packs (US, UK, Germany, Brazil, India) share for
 * their local sources. Turkey's pack predates them and keeps its own.
 */
import type { FeedDef, Province, SourceDef } from '../types'
import type { RegionDef } from './types'

/** A site's icon through Google's favicon service, for outlets without a stable touch icon. */
export const favicon = (host: string): string => `https://www.google.com/s2/favicons?domain=${host}&sz=128`

/**
 * Region → province codes, derived from the province table so the two can never disagree.
 * `names` gives the regions news copy names on their own ("Scotland", "Yorkshire").
 */
export function regionsOf(
  ids: readonly string[],
  provinces: readonly Province[],
  names: Readonly<Record<string, string[]>> = {}
): RegionDef[] {
  return ids.map((id) => ({
    id,
    provinces: provinces.filter((p) => p.region === id).map((p) => p.code),
    ...(names[id] ? { names: names[id] } : {})
  }))
}

/** One `local` feed per province code, for an outlet with a page per state. */
export function provinceFeeds(urls: Readonly<Record<string, string>>): FeedDef[] {
  return Object.entries(urls).map(([province, url]) => ({ url, category: 'local', province }))
}

export type LocalOutlet = {
  id: string
  name: string
  feed: string
} & (
  | {
      /** Province code the outlet reports from. */
      province: string
      region?: never
    }
  | {
      /** A region-wide outlet (a Scottish or Welsh national paper) instead of a single province. */
      region: string
      province?: never
    }
)

/** A regional paper, broadcaster or newsroom: one feed, fetched only when its place is chosen. */
export function localOutlet(outlet: LocalOutlet, language: string): SourceDef {
  const { origin, hostname } = new URL(outlet.feed)
  const where = outlet.province !== undefined ? { province: outlet.province } : { region: outlet.region }
  return {
    id: outlet.id,
    name: outlet.name,
    homepage: origin,
    icon: favicon(hostname.replace(/^(www|feeds|rss)\./, '')),
    kind: 'local',
    language,
    ...(outlet.province !== undefined ? { provinces: [outlet.province] } : {}),
    feeds: [{ url: outlet.feed, category: 'local', ...where }]
  }
}
