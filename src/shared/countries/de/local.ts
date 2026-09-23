import type { SourceDef } from '../../types'
import { localOutlet, provinceFeeds, type LocalOutlet } from '../build.ts'

/*
 * Regional news: tagesschau's page for every Land (it carries the stories of the Land's
 * ARD broadcaster), the broadcasters' own feeds where they publish one, and regional
 * papers. Every feed is only fetched for the user's selected Land. Checked on 2026-09-23.
 *
 * Not included: BR24, Radio Bremen and the Saarländischer Rundfunk (no working public
 * feed), and the Stuttgarter Zeitung, Kölner Stadt-Anzeiger, Weser-Kurier, Volksstimme,
 * Mitteldeutsche Zeitung, Saarbrücker Zeitung and Badische Zeitung (their feeds answer
 * 403/404/410).
 */

const ts = (slug: string): string => `https://www.tagesschau.de/inland/regional/${slug}/index~rss2.xml`

const tagesschauRegional: SourceDef = {
  id: 'tagesschau-regional',
  name: 'tagesschau Regional',
  homepage: 'https://www.tagesschau.de/inland/regional',
  icon: 'https://www.tagesschau.de/favicon.ico',
  color: '#003D7F',
  kind: 'local',
  language: 'de',
  feeds: provinceFeeds({
    BW: ts('badenwuerttemberg'),
    BY: ts('bayern'),
    BE: ts('berlin'),
    BB: ts('brandenburg'),
    HB: ts('bremen'),
    HH: ts('hamburg'),
    HE: ts('hessen'),
    MV: ts('mecklenburgvorpommern'),
    NI: ts('niedersachsen'),
    NW: ts('nordrheinwestfalen'),
    RP: ts('rheinlandpfalz'),
    SL: ts('saarland'),
    SN: ts('sachsen'),
    ST: ts('sachsenanhalt'),
    SH: ts('schleswigholstein'),
    TH: ts('thueringen')
  })
}

const arc = (host: string): string => `https://www.${host}/arc/outboundfeeds/rss/`

const outlets: LocalOutlet[] = [
  // Public broadcasters
  {
    id: 'ndr-hamburg',
    name: 'NDR Hamburg',
    province: 'HH',
    feed: 'https://www.ndr.de/nachrichten/hamburg/index~rdf.xml'
  },
  {
    id: 'ndr-schleswig-holstein',
    name: 'NDR Schleswig-Holstein',
    province: 'SH',
    feed: 'https://www.ndr.de/nachrichten/schleswig-holstein/index~rdf.xml'
  },
  {
    id: 'ndr-niedersachsen',
    name: 'NDR Niedersachsen',
    province: 'NI',
    feed: 'https://www.ndr.de/nachrichten/niedersachsen/index~rdf.xml'
  },
  {
    id: 'ndr-mv',
    name: 'NDR Mecklenburg-Vorpommern',
    province: 'MV',
    feed: 'https://www.ndr.de/nachrichten/mecklenburg-vorpommern/index~rdf.xml'
  },
  { id: 'wdr', name: 'WDR', province: 'NW', feed: 'https://www1.wdr.de/uebersicht-100.feed' },
  {
    id: 'mdr-sachsen',
    name: 'MDR Sachsen',
    province: 'SN',
    feed: 'https://www.mdr.de/nachrichten/sachsen/index~rss2.xml'
  },
  {
    id: 'mdr-sachsen-anhalt',
    name: 'MDR Sachsen-Anhalt',
    province: 'ST',
    feed: 'https://www.mdr.de/nachrichten/sachsen-anhalt/index~rss2.xml'
  },
  {
    id: 'mdr-thueringen',
    name: 'MDR Thüringen',
    province: 'TH',
    feed: 'https://www.mdr.de/nachrichten/thueringen/index~rss2.xml'
  },
  { id: 'rbb24', name: 'rbb24', province: 'BE', feed: 'https://www.rbb24.de/aktuell/index.xml/feed=rss.xml' },
  { id: 'hessenschau', name: 'hessenschau', province: 'HE', feed: 'https://www.hessenschau.de/index.rss' },
  {
    id: 'swr-bw',
    name: 'SWR Aktuell Baden-Württemberg',
    province: 'BW',
    feed: 'https://www.swr.de/~rss/swraktuell/baden-wuerttemberg/index.xml'
  },
  {
    id: 'swr-rp',
    name: 'SWR Aktuell Rheinland-Pfalz',
    province: 'RP',
    feed: 'https://www.swr.de/~rss/swraktuell/rheinland-pfalz/index.xml'
  },

  // Regional papers
  { id: 'sz-bayern', name: 'SZ Bayern', province: 'BY', feed: 'https://rss.sueddeutsche.de/rss/Bayern' },
  { id: 'merkur', name: 'Münchner Merkur', province: 'BY', feed: 'https://www.merkur.de/rssfeed.rdf' },
  { id: 'tz', name: 'tz', province: 'BY', feed: 'https://www.tz.de/rssfeed.rdf' },
  {
    id: 'augsburger-allgemeine',
    name: 'Augsburger Allgemeine',
    province: 'BY',
    feed: 'https://www.augsburger-allgemeine.de/rss'
  },
  {
    id: 'tagesspiegel-berlin',
    name: 'Tagesspiegel Berlin',
    province: 'BE',
    feed: 'https://www.tagesspiegel.de/contentexport/feed/berlin'
  },
  {
    id: 'berliner-zeitung',
    name: 'Berliner Zeitung',
    province: 'BE',
    feed: 'https://www.berliner-zeitung.de/feed.xml'
  },
  { id: 'maz', name: 'Märkische Allgemeine', province: 'BB', feed: arc('maz-online.de') },
  {
    id: 'hamburger-abendblatt',
    name: 'Hamburger Abendblatt',
    province: 'HH',
    feed: 'https://www.abendblatt.de/rss'
  },
  {
    id: 'mopo',
    name: 'Hamburger Morgenpost',
    province: 'HH',
    feed: 'https://www.mopo.de/index?lab_viewport=rss'
  },
  {
    id: 'frankfurter-rundschau',
    name: 'Frankfurter Rundschau',
    province: 'HE',
    feed: 'https://www.fr.de/rssfeed.rdf'
  },
  { id: 'fnp', name: 'Frankfurter Neue Presse', province: 'HE', feed: 'https://www.fnp.de/rssfeed.rdf' },
  { id: 'hna', name: 'HNA', province: 'HE', feed: 'https://www.hna.de/rssfeed.rdf' },
  { id: 'ostsee-zeitung', name: 'Ostsee-Zeitung', province: 'MV', feed: arc('ostsee-zeitung.de') },
  { id: 'haz', name: 'Hannoversche Allgemeine', province: 'NI', feed: arc('haz.de') },
  { id: 'waz', name: 'WAZ', province: 'NW', feed: 'https://www.waz.de/rss' },
  { id: 'rheinische-post', name: 'Rheinische Post', province: 'NW', feed: 'https://rp-online.de/feed.rss' },
  { id: 'lvz', name: 'Leipziger Volkszeitung', province: 'SN', feed: arc('lvz.de') },
  { id: 'dnn', name: 'Dresdner Neueste Nachrichten', province: 'SN', feed: arc('dnn.de') },
  {
    id: 'freie-presse',
    name: 'Freie Presse',
    province: 'SN',
    feed: 'https://www.freiepresse.de/chemnitz/feed.atom'
  },
  { id: 'kieler-nachrichten', name: 'Kieler Nachrichten', province: 'SH', feed: arc('kn-online.de') },
  { id: 'luebecker-nachrichten', name: 'Lübecker Nachrichten', province: 'SH', feed: arc('ln-online.de') },
  { id: 'shz', name: 'shz', province: 'SH', feed: 'https://www.shz.de/rss' },
  {
    id: 'thueringer-allgemeine',
    name: 'Thüringer Allgemeine',
    province: 'TH',
    feed: 'https://www.thueringer-allgemeine.de/rss'
  }
]

export const localSources: SourceDef[] = [
  tagesschauRegional,
  ...outlets.map((outlet) => localOutlet(outlet, 'de'))
]
