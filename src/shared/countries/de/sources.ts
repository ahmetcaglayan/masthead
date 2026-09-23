import type { SourceDef } from '../../types'
import { localSources } from './local.ts'

/*
 * Germany — German-language national sources, plus regional news for every Land (see
 * `local.ts`). Every feed was checked on 2026-09-23 (re-check with
 * `npm run verify:feeds de`). Newsrooms outside Germany (NZZ, Der Standard) are left out.
 *
 * Not included: the Zeit Online culture and science feeds (404), the old rss.focus.de news
 * feed, replaced by its section feed, Sport1 (403) and auto motor und sport (no feed).
 * Bild is off by default, like the tabloids in the Turkey pack.
 */

const nationalSources: SourceDef[] = [
  // Public broadcasters
  {
    id: 'tagesschau',
    name: 'tagesschau',
    homepage: 'https://www.tagesschau.de',
    icon: 'https://www.tagesschau.de/favicon.ico',
    color: '#003C78',
    kind: 'public',
    language: 'de',
    feeds: [
      { url: 'https://www.tagesschau.de/index~rss2.xml', category: 'top', headline: true },
      { url: 'https://www.tagesschau.de/inland/index~rss2.xml', category: 'national' },
      { url: 'https://www.tagesschau.de/ausland/index~rss2.xml', category: 'world' },
      { url: 'https://www.tagesschau.de/wirtschaft/index~rss2.xml', category: 'economy' },
      { url: 'https://www.tagesschau.de/wissen/index~rss2.xml', category: 'science' },
      { url: 'https://www.tagesschau.de/wissen/gesundheit/index~rss2.xml', category: 'health' },
      { url: 'https://www.tagesschau.de/wissen/klima/index~rss2.xml', category: 'environment' },
      { url: 'https://www.tagesschau.de/sport/index~rss2.xml', category: 'sports' }
    ]
  },
  {
    id: 'zdf-heute',
    name: 'ZDFheute',
    homepage: 'https://www.zdf.de/nachrichten',
    color: '#FA7D19',
    kind: 'public',
    language: 'de',
    feeds: [
      { url: 'https://www.zdf.de/rss/zdf/nachrichten', category: 'general' },
      { url: 'https://www.zdfheute.de/rss/zdf/nachrichten/politik', category: 'politics' }
    ]
  },
  {
    id: 'deutsche-welle',
    name: 'Deutsche Welle',
    homepage: 'https://www.dw.com/de',
    icon: 'https://www.dw.com/favicon.ico',
    color: '#0098DB',
    kind: 'international',
    language: 'de',
    feeds: [{ url: 'https://rss.dw.com/rdf/rss-de-all', category: 'general' }]
  },

  {
    id: 'deutschlandfunk',
    name: 'Deutschlandfunk',
    homepage: 'https://www.deutschlandfunk.de',
    icon: 'https://www.google.com/s2/favicons?domain=deutschlandfunk.de&sz=128',
    color: '#00457D',
    kind: 'public',
    language: 'de',
    feeds: [
      { url: 'https://www.deutschlandfunk.de/nachrichten-100.rss', category: 'general' },
      { url: 'https://www.deutschlandfunk.de/politikportal-100.rss', category: 'politics' }
    ]
  },
  {
    id: 'sportschau',
    name: 'Sportschau',
    homepage: 'https://www.sportschau.de',
    icon: 'https://www.google.com/s2/favicons?domain=sportschau.de&sz=128',
    color: '#003D7F',
    kind: 'public',
    language: 'de',
    feeds: [{ url: 'https://www.sportschau.de/index~rss2.xml', category: 'sports' }]
  },
  // Mainstream
  {
    id: 'spiegel',
    name: 'Der Spiegel',
    homepage: 'https://www.spiegel.de',
    icon: 'https://www.spiegel.de/favicon.ico',
    color: '#E64415',
    kind: 'mainstream',
    language: 'de',
    feeds: [
      { url: 'https://www.spiegel.de/schlagzeilen/tops/index.rss', category: 'top', headline: true },
      { url: 'https://www.spiegel.de/politik/index.rss', category: 'politics' },
      { url: 'https://www.spiegel.de/panorama/index.rss', category: 'general' },
      { url: 'https://www.spiegel.de/ausland/index.rss', category: 'world' },
      { url: 'https://www.spiegel.de/wirtschaft/index.rss', category: 'economy' },
      { url: 'https://www.spiegel.de/netzwelt/index.rss', category: 'technology' },
      { url: 'https://www.spiegel.de/wissenschaft/index.rss', category: 'science' },
      { url: 'https://www.spiegel.de/kultur/index.rss', category: 'culture' },
      { url: 'https://www.spiegel.de/sport/index.rss', category: 'sports' },
      { url: 'https://www.spiegel.de/gesundheit/index.rss', category: 'health' },
      { url: 'https://www.spiegel.de/reise/index.rss', category: 'travel' },
      { url: 'https://www.spiegel.de/psychologie/index.rss', category: 'lifestyle' }
    ]
  },
  {
    id: 'zeit-online',
    name: 'Zeit Online',
    homepage: 'https://www.zeit.de',
    icon: 'https://img.zeit.de/static/img/ZO-ipad-114x114.png',
    color: '#2B2B2B',
    kind: 'mainstream',
    language: 'de',
    feeds: [
      { url: 'https://newsfeed.zeit.de/index', category: 'top', headline: true },
      { url: 'https://newsfeed.zeit.de/politik/index', category: 'politics' },
      { url: 'https://newsfeed.zeit.de/wirtschaft/index', category: 'economy' },
      { url: 'https://newsfeed.zeit.de/gesellschaft/index', category: 'general' },
      { url: 'https://newsfeed.zeit.de/digital/index', category: 'technology' },
      { url: 'https://newsfeed.zeit.de/gesundheit/index', category: 'health' },
      { url: 'https://newsfeed.zeit.de/sport/index', category: 'sports' },
      { url: 'https://newsfeed.zeit.de/entdecken/index', category: 'travel' },
      { url: 'https://newsfeed.zeit.de/mobilitaet/index', category: 'automotive' }
    ]
  },
  {
    id: 'faz',
    name: 'Frankfurter Allgemeine',
    homepage: 'https://www.faz.net',
    icon: 'https://www.faz.net/apple-touch-icon.png',
    color: '#00477F',
    kind: 'mainstream',
    language: 'de',
    feeds: [
      { url: 'https://www.faz.net/rss/aktuell/', category: 'top', headline: true },
      { url: 'https://www.faz.net/rss/aktuell/politik/', category: 'politics' },
      { url: 'https://www.faz.net/rss/aktuell/wirtschaft/', category: 'economy' },
      { url: 'https://www.faz.net/rss/aktuell/wissen/', category: 'science' },
      { url: 'https://www.faz.net/rss/aktuell/wissen/medizin-ernaehrung/', category: 'health' },
      { url: 'https://www.faz.net/rss/aktuell/technik-motor/', category: 'technology' },
      { url: 'https://www.faz.net/rss/aktuell/feuilleton/', category: 'culture' },
      { url: 'https://www.faz.net/rss/aktuell/reise/', category: 'travel' },
      { url: 'https://www.faz.net/rss/aktuell/sport/', category: 'sports' }
    ]
  },
  {
    id: 'sueddeutsche',
    name: 'Süddeutsche Zeitung',
    homepage: 'https://www.sueddeutsche.de',
    icon: 'https://www.sueddeutsche.de/favicon.ico',
    color: '#0A4E96',
    kind: 'mainstream',
    language: 'de',
    feeds: [
      { url: 'https://rss.sueddeutsche.de/rss/Topthemen', category: 'top', headline: true },
      { url: 'https://rss.sueddeutsche.de/rss/Politik', category: 'politics' },
      { url: 'https://rss.sueddeutsche.de/rss/Wirtschaft', category: 'economy' },
      { url: 'https://rss.sueddeutsche.de/rss/Kultur', category: 'culture' },
      { url: 'https://rss.sueddeutsche.de/rss/Sport', category: 'sports' },
      { url: 'https://rss.sueddeutsche.de/rss/Wissen', category: 'science' },
      { url: 'https://rss.sueddeutsche.de/rss/Gesundheit', category: 'health' },
      { url: 'https://rss.sueddeutsche.de/rss/Digital', category: 'technology' },
      { url: 'https://rss.sueddeutsche.de/rss/Reise', category: 'travel' },
      { url: 'https://rss.sueddeutsche.de/rss/Auto', category: 'automotive' },
      { url: 'https://rss.sueddeutsche.de/rss/Meinung', category: 'opinion' }
    ]
  },
  {
    id: 'welt',
    name: 'Welt',
    homepage: 'https://www.welt.de',
    icon: 'https://www.welt.de/favicon.ico',
    color: '#0A5FA5',
    kind: 'mainstream',
    language: 'de',
    feeds: [
      { url: 'https://www.welt.de/feeds/latest.rss', category: 'top', headline: true },
      { url: 'https://www.welt.de/feeds/section/politik.rss', category: 'politics' },
      { url: 'https://www.welt.de/feeds/section/wirtschaft.rss', category: 'economy' },
      { url: 'https://www.welt.de/feeds/section/kultur.rss', category: 'culture' },
      { url: 'https://www.welt.de/feeds/section/sport.rss', category: 'sports' },
      { url: 'https://www.welt.de/feeds/section/wissenschaft.rss', category: 'science' },
      { url: 'https://www.welt.de/feeds/section/gesundheit.rss', category: 'health' },
      { url: 'https://www.welt.de/feeds/section/reise.rss', category: 'travel' },
      { url: 'https://www.welt.de/feeds/section/iconist.rss', category: 'lifestyle' },
      { url: 'https://www.welt.de/feeds/section/debatte.rss', category: 'opinion' }
    ]
  },
  {
    id: 'ntv',
    name: 'n-tv',
    homepage: 'https://www.n-tv.de',
    icon: 'https://www.n-tv.de/favicon.ico',
    color: '#E2001A',
    kind: 'mainstream',
    language: 'de',
    feeds: [
      { url: 'https://www.n-tv.de/rss', category: 'top', headline: true },
      { url: 'https://www.n-tv.de/politik/rss', category: 'politics' },
      { url: 'https://www.n-tv.de/wirtschaft/rss', category: 'economy' },
      { url: 'https://www.n-tv.de/technik/rss', category: 'technology' },
      { url: 'https://www.n-tv.de/wissen/rss', category: 'science' },
      { url: 'https://www.n-tv.de/sport/rss', category: 'sports' },
      { url: 'https://www.n-tv.de/panorama/rss', category: 'general' },
      { url: 'https://www.n-tv.de/auto/rss', category: 'automotive' },
      { url: 'https://www.n-tv.de/leute/rss', category: 'entertainment' },
      { url: 'https://www.n-tv.de/ratgeber/rss', category: 'lifestyle' }
    ]
  },
  {
    id: 'stern',
    name: 'Stern',
    homepage: 'https://www.stern.de',
    color: '#E3000F',
    kind: 'mainstream',
    language: 'de',
    feeds: [
      { url: 'https://www.stern.de/feed/standard/all/', category: 'general' },
      { url: 'https://www.stern.de/feed/standard/gesundheit/', category: 'health' },
      { url: 'https://www.stern.de/feed/standard/reise/', category: 'travel' },
      { url: 'https://www.stern.de/feed/standard/kultur/', category: 'culture' }
    ]
  },
  {
    id: 'tagesspiegel',
    name: 'Der Tagesspiegel',
    homepage: 'https://www.tagesspiegel.de',
    icon: 'https://www.google.com/s2/favicons?domain=tagesspiegel.de&sz=128',
    color: '#1A3A6B',
    kind: 'mainstream',
    language: 'de',
    feeds: [{ url: 'https://www.tagesspiegel.de/contentexport/feed/home', category: 'general' }]
  },
  {
    id: 'rnd',
    name: 'RedaktionsNetzwerk Deutschland',
    homepage: 'https://www.rnd.de',
    icon: 'https://www.google.com/s2/favicons?domain=rnd.de&sz=128',
    color: '#D6001C',
    kind: 'mainstream',
    language: 'de',
    feeds: [{ url: 'https://www.rnd.de/arc/outboundfeeds/rss/', category: 'general' }]
  },
  {
    id: 't-online',
    name: 't-online',
    homepage: 'https://www.t-online.de',
    icon: 'https://www.google.com/s2/favicons?domain=t-online.de&sz=128',
    color: '#E20074',
    kind: 'mainstream',
    language: 'de',
    feeds: [{ url: 'https://www.t-online.de/feed.rss', category: 'general' }]
  },
  {
    id: 'cicero',
    name: 'Cicero',
    homepage: 'https://www.cicero.de',
    icon: 'https://www.google.com/s2/favicons?domain=cicero.de&sz=128',
    color: '#B5121B',
    kind: 'independent',
    language: 'de',
    feeds: [{ url: 'https://www.cicero.de/rss.xml', category: 'opinion' }]
  },
  {
    id: 'bild',
    name: 'Bild',
    homepage: 'https://www.bild.de',
    icon: 'https://www.google.com/s2/favicons?domain=bild.de&sz=128',
    color: '#DD0000',
    kind: 'mainstream',
    language: 'de',
    defaultEnabled: false,
    feeds: [{ url: 'https://www.bild.de/feed/alles.xml', category: 'general' }]
  },
  {
    id: 'focus',
    name: 'Focus Online',
    homepage: 'https://www.focus.de',
    icon: 'https://www.focus.de/apple-touch-icon.png',
    color: '#E2001A',
    kind: 'mainstream',
    language: 'de',
    defaultEnabled: false,
    feeds: [{ url: 'https://rss.focus.de/politik/', category: 'politics' }]
  },

  // Independent, business, technology, sport
  {
    id: 'taz',
    name: 'taz',
    homepage: 'https://taz.de',
    icon: 'https://taz.de/apple-touch-icon.png',
    color: '#E5003C',
    kind: 'independent',
    language: 'de',
    feeds: [{ url: 'https://taz.de/!p4608;rss/', category: 'general' }]
  },
  {
    id: 'handelsblatt',
    name: 'Handelsblatt',
    homepage: 'https://www.handelsblatt.com',
    color: '#E8730C',
    kind: 'business',
    language: 'de',
    feeds: [{ url: 'https://www.handelsblatt.com/contentexport/feed/schlagzeilen', category: 'economy' }]
  },
  {
    id: 'heise',
    name: 'heise online',
    homepage: 'https://www.heise.de',
    icon: 'https://www.heise.de/apple-touch-icon.png',
    color: '#C40D27',
    kind: 'technology',
    language: 'de',
    feeds: [{ url: 'https://www.heise.de/rss/heise-atom.xml', category: 'technology' }]
  },
  {
    id: 'kicker',
    name: 'kicker',
    homepage: 'https://www.kicker.de',
    icon: 'https://www.kicker.de/apple-touch-icon.png',
    color: '#C8102E',
    kind: 'sports',
    language: 'de',
    feeds: [{ url: 'https://newsfeed.kicker.de/news/aktuell', category: 'sports' }]
  },
  {
    id: 'wirtschaftswoche',
    name: 'WirtschaftsWoche',
    homepage: 'https://www.wiwo.de',
    icon: 'https://www.google.com/s2/favicons?domain=wiwo.de&sz=128',
    color: '#E3000F',
    kind: 'business',
    language: 'de',
    feeds: [{ url: 'https://feeds.cms.wiwo.de/rss/schlagzeilen', category: 'economy' }]
  },
  {
    id: 'manager-magazin',
    name: 'manager magazin',
    homepage: 'https://www.manager-magazin.de',
    icon: 'https://www.google.com/s2/favicons?domain=manager-magazin.de&sz=128',
    color: '#0A2240',
    kind: 'business',
    language: 'de',
    feeds: [{ url: 'https://www.manager-magazin.de/news/index.rss', category: 'economy' }]
  },
  {
    id: 'capital',
    name: 'Capital',
    homepage: 'https://www.capital.de',
    icon: 'https://www.google.com/s2/favicons?domain=capital.de&sz=128',
    color: '#C8102E',
    kind: 'business',
    language: 'de',
    feeds: [{ url: 'https://www.capital.de/feed/standard/', category: 'economy' }]
  },
  {
    id: 'golem',
    name: 'Golem.de',
    homepage: 'https://www.golem.de',
    icon: 'https://www.google.com/s2/favicons?domain=golem.de&sz=128',
    color: '#6BA53A',
    kind: 'technology',
    language: 'de',
    feeds: [{ url: 'https://rss.golem.de/rss.php?feed=RSS2.0', category: 'technology' }]
  },
  {
    id: 't3n',
    name: 't3n',
    homepage: 'https://t3n.de',
    icon: 'https://www.google.com/s2/favicons?domain=t3n.de&sz=128',
    color: '#E4002B',
    kind: 'technology',
    language: 'de',
    feeds: [{ url: 'https://t3n.de/rss.xml', category: 'technology' }]
  },
  {
    id: 'computerbase',
    name: 'ComputerBase',
    homepage: 'https://www.computerbase.de',
    icon: 'https://www.google.com/s2/favicons?domain=computerbase.de&sz=128',
    color: '#1F4E8C',
    kind: 'technology',
    language: 'de',
    feeds: [{ url: 'https://www.computerbase.de/rss/news.xml', category: 'technology' }]
  },
  {
    id: 'netzpolitik',
    name: 'netzpolitik.org',
    homepage: 'https://netzpolitik.org',
    icon: 'https://www.google.com/s2/favicons?domain=netzpolitik.org&sz=128',
    color: '#E6007E',
    kind: 'independent',
    language: 'de',
    feeds: [{ url: 'https://netzpolitik.org/feed/', category: 'technology' }]
  },
  {
    id: 'spektrum',
    name: 'Spektrum der Wissenschaft',
    homepage: 'https://www.spektrum.de',
    icon: 'https://www.google.com/s2/favicons?domain=spektrum.de&sz=128',
    color: '#004B87',
    kind: 'mainstream',
    language: 'de',
    feeds: [{ url: 'https://www.spektrum.de/alias/rss/spektrum-de-rss-feed/996406', category: 'science' }]
  },
  {
    id: 'aerzteblatt',
    name: 'Deutsches Ärzteblatt',
    homepage: 'https://www.aerzteblatt.de',
    icon: 'https://www.google.com/s2/favicons?domain=aerzteblatt.de&sz=128',
    color: '#00457D',
    kind: 'independent',
    language: 'de',
    feeds: [{ url: 'https://www.aerzteblatt.de/rss/news.asp', category: 'health' }]
  },
  {
    id: 'news4teachers',
    name: 'News4teachers',
    homepage: 'https://www.news4teachers.de',
    icon: 'https://www.google.com/s2/favicons?domain=news4teachers.de&sz=128',
    color: '#1E73BE',
    kind: 'independent',
    language: 'de',
    feeds: [{ url: 'https://www.news4teachers.de/feed/', category: 'education' }]
  },
  {
    id: 'utopia',
    name: 'Utopia',
    homepage: 'https://utopia.de',
    icon: 'https://www.google.com/s2/favicons?domain=utopia.de&sz=128',
    color: '#7AB317',
    kind: 'independent',
    language: 'de',
    feeds: [{ url: 'https://utopia.de/feed/', category: 'environment' }]
  },
  {
    id: 'reisereporter',
    name: 'reisereporter',
    homepage: 'https://www.reisereporter.de',
    icon: 'https://www.google.com/s2/favicons?domain=reisereporter.de&sz=128',
    color: '#E2001A',
    kind: 'mainstream',
    language: 'de',
    feeds: [{ url: 'https://www.reisereporter.de/arc/outboundfeeds/rss/', category: 'travel' }]
  },
  {
    id: 'auto-bild',
    name: 'Auto Bild',
    homepage: 'https://www.autobild.de',
    icon: 'https://www.google.com/s2/favicons?domain=autobild.de&sz=128',
    color: '#DD0000',
    kind: 'mainstream',
    language: 'de',
    feeds: [{ url: 'https://www.autobild.de/rss/22590661.xml', category: 'automotive' }]
  },
  {
    id: 'dwdl',
    name: 'DWDL.de',
    homepage: 'https://www.dwdl.de',
    icon: 'https://www.google.com/s2/favicons?domain=dwdl.de&sz=128',
    color: '#E30613',
    kind: 'independent',
    language: 'de',
    feeds: [{ url: 'https://www.dwdl.de/rss/allethemen.xml', category: 'entertainment' }]
  },
  {
    id: 'filmstarts',
    name: 'Filmstarts',
    homepage: 'https://www.filmstarts.de',
    icon: 'https://www.google.com/s2/favicons?domain=filmstarts.de&sz=128',
    color: '#1E1E1E',
    kind: 'mainstream',
    language: 'de',
    feeds: [{ url: 'https://www.filmstarts.de/rss/nachrichten.xml', category: 'entertainment' }]
  },
  {
    id: 'rolling-stone-de',
    name: 'Rolling Stone',
    homepage: 'https://www.rollingstone.de',
    icon: 'https://www.google.com/s2/favicons?domain=rollingstone.de&sz=128',
    color: '#D32323',
    kind: 'mainstream',
    language: 'de',
    feeds: [{ url: 'https://www.rollingstone.de/feed/', category: 'culture' }]
  },
  {
    id: 'musikexpress',
    name: 'Musikexpress',
    homepage: 'https://www.musikexpress.de',
    icon: 'https://www.google.com/s2/favicons?domain=musikexpress.de&sz=128',
    color: '#000000',
    kind: 'mainstream',
    language: 'de',
    feeds: [{ url: 'https://www.musikexpress.de/feed/', category: 'culture' }]
  }
]

export const sources: SourceDef[] = [...nationalSources, ...localSources]
