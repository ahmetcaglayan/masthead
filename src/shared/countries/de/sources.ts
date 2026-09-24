import type { SourceDef } from '../../types'
import { favicon } from '../build.ts'
import { localSources } from './local.ts'

/*
 * Germany — German-language national sources, plus regional news for every Land (see
 * `local.ts`). Every feed was checked on 2026-09-23 and the pack was widened on 2026-09-24
 * (re-check with `npm run verify:feeds de`). Newsrooms outside Germany (NZZ, Der Standard)
 * are left out.
 *
 * Not included: the Zeit Online culture and science feeds (404), the old rss.focus.de news
 * feed, replaced by its section feed, Sport1 (403), junge Welt (403), B.Z., Bunte, Freundin,
 * Business Insider's front page, Finanztip, Börse Online, Börsen-Zeitung, NetDoktor, kino.de,
 * TV Movie, Cosmopolitan, InStyle, Elle, Auto Zeitung, ADAC and Table.Media (no feed),
 * Apotheken Umschau, Transfermarkt, GameStar/GamePro/PC Games/Mein-MMO, PC Games Hardware,
 * TV Spielfilm, Prisma and Tagesspiegel Background (bot wall), Jungle World, Quotenmeter,
 * the Ärzte Zeitung, Sport Bild and the Deutsches Schulportal (items carry no readable
 * date), Quarks, Klimafakten and the Deutschlandfunk economy/Europe/sport pages (stale),
 * CHIP and Fit for Fun (400-item feeds of 800 KB) and Verfassungsblog (mostly English).
 * Bild, Focus, RTL and the celebrity press are off by default, like the tabloids in the
 * Turkey pack; so are the partisan outlets on both edges (nd, Telepolis, NachDenkSeiten,
 * Tichys Einblick, NIUS, Junge Freiheit, Apollo News, Achse des Guten, DWN).
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
    feeds: [
      { url: 'https://rss.dw.com/xml/rss-de-top', category: 'top', headline: true },
      { url: 'https://rss.dw.com/rdf/rss-de-all', category: 'general' }
    ]
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
      { url: 'https://www.deutschlandfunk.de/politikportal-100.rss', category: 'politics' },
      { url: 'https://www.deutschlandfunk.de/kulturportal-100.rss', category: 'culture' }
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
      { url: 'https://www.spiegel.de/familie/index.rss', category: 'lifestyle' },
      { url: 'https://www.spiegel.de/start/index.rss', category: 'education' }
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
      { url: 'https://newsfeed.zeit.de/mobilitaet/index', category: 'automotive' },
      { url: 'https://newsfeed.zeit.de/campus/index', category: 'education' }
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
      { url: 'https://www.stern.de/feed/standard/politik/', category: 'politics' },
      { url: 'https://www.stern.de/feed/standard/digital/', category: 'technology' },
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
    feeds: [
      { url: 'https://www.tagesspiegel.de/contentexport/feed/home', category: 'general' },
      { url: 'https://www.tagesspiegel.de/contentexport/feed/politik', category: 'politics' },
      { url: 'https://www.tagesspiegel.de/contentexport/feed/kultur', category: 'culture' }
    ]
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
    feeds: [
      { url: 'https://www.handelsblatt.com/contentexport/feed/schlagzeilen', category: 'economy' },
      { url: 'https://feeds.cms.handelsblatt.com/politik', category: 'politics' },
      { url: 'https://feeds.cms.handelsblatt.com/technologie', category: 'technology' }
    ]
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
  },
  // Public broadcasting: culture, young audiences, science
  {
    id: 'deutschlandfunk-kultur',
    name: 'Deutschlandfunk Kultur',
    homepage: 'https://www.deutschlandfunkkultur.de',
    icon: favicon('deutschlandfunkkultur.de'),
    kind: 'public',
    language: 'de',
    feeds: [
      { url: 'https://www.deutschlandfunkkultur.de/aktuelle-kultur-themen-100.rss', category: 'culture' },
      { url: 'https://www.deutschlandfunkkultur.de/meinung-debatte-100.rss', category: 'opinion' }
    ]
  },
  {
    id: 'deutschlandfunk-nova',
    name: 'Deutschlandfunk Nova',
    homepage: 'https://www.deutschlandfunknova.de',
    icon: favicon('deutschlandfunknova.de'),
    kind: 'public',
    language: 'de',
    feeds: [{ url: 'https://www.deutschlandfunknova.de/feeds/index', category: 'general' }]
  },
  {
    id: 'mdr-wissen',
    name: 'MDR Wissen',
    homepage: 'https://www.mdr.de/wissen',
    icon: favicon('mdr.de'),
    kind: 'public',
    language: 'de',
    feeds: [{ url: 'https://www.mdr.de/wissen/index~rss2.xml', category: 'science' }]
  },
  {
    id: 'das-parlament',
    name: 'Das Parlament',
    homepage: 'https://www.das-parlament.de',
    icon: favicon('das-parlament.de'),
    kind: 'public',
    language: 'de',
    feeds: [{ url: 'https://www.das-parlament.de/rss', category: 'politics' }]
  },

  // Independent, investigative and weekly press
  {
    id: 'correctiv',
    name: 'CORRECTIV',
    homepage: 'https://correctiv.org',
    icon: favicon('correctiv.org'),
    kind: 'independent',
    language: 'de',
    feeds: [{ url: 'https://correctiv.org/feed/', category: 'general' }]
  },
  {
    id: 'krautreporter',
    name: 'Krautreporter',
    homepage: 'https://krautreporter.de',
    icon: favicon('krautreporter.de'),
    kind: 'independent',
    language: 'de',
    feeds: [{ url: 'https://krautreporter.de/feeds.rss', category: 'general' }]
  },
  {
    id: 'freitag',
    name: 'Der Freitag',
    homepage: 'https://www.freitag.de',
    icon: favicon('freitag.de'),
    kind: 'independent',
    language: 'de',
    feeds: [{ url: 'https://www.freitag.de/RSS', category: 'general' }]
  },
  {
    id: 'uebermedien',
    name: 'Übermedien',
    homepage: 'https://uebermedien.de',
    icon: favicon('uebermedien.de'),
    kind: 'independent',
    language: 'de',
    feeds: [{ url: 'https://uebermedien.de/feed/', category: 'culture' }]
  },
  {
    id: 'lto',
    name: 'Legal Tribune Online',
    homepage: 'https://www.lto.de',
    icon: favicon('lto.de'),
    kind: 'independent',
    language: 'de',
    feeds: [{ url: 'https://www.lto.de/rss/nachrichten-rss/feed.xml', category: 'politics' }]
  },
  {
    id: 'watson-de',
    name: 'watson',
    homepage: 'https://www.watson.de',
    icon: favicon('watson.de'),
    kind: 'mainstream',
    language: 'de',
    feeds: [{ url: 'https://www.watson.de/api/2.0/rss/index.xml?tag=Front', category: 'top', headline: true }]
  },

  // Partisan outlets on both edges and popular press, off by default
  {
    id: 'nd',
    name: 'nd',
    homepage: 'https://www.nd-aktuell.de',
    icon: favicon('nd-aktuell.de'),
    kind: 'independent',
    language: 'de',
    defaultEnabled: false,
    feeds: [
      { url: 'https://www.nd-aktuell.de/rss/aktuell.php', category: 'general' },
      { url: 'https://www.nd-aktuell.de/rss/kommentare.xml', category: 'opinion' }
    ]
  },
  {
    id: 'telepolis',
    name: 'Telepolis',
    homepage: 'https://www.telepolis.de',
    icon: favicon('telepolis.de'),
    kind: 'independent',
    language: 'de',
    defaultEnabled: false,
    feeds: [{ url: 'https://www.telepolis.de/feed.xml', category: 'general' }]
  },
  {
    id: 'nachdenkseiten',
    name: 'NachDenkSeiten',
    homepage: 'https://www.nachdenkseiten.de',
    icon: favicon('nachdenkseiten.de'),
    kind: 'independent',
    language: 'de',
    defaultEnabled: false,
    feeds: [{ url: 'https://www.nachdenkseiten.de/?feed=rss2', category: 'opinion' }]
  },
  {
    id: 'tichys-einblick',
    name: 'Tichys Einblick',
    homepage: 'https://www.tichyseinblick.de',
    icon: favicon('tichyseinblick.de'),
    kind: 'independent',
    language: 'de',
    defaultEnabled: false,
    feeds: [{ url: 'https://www.tichyseinblick.de/feed/', category: 'opinion' }]
  },
  {
    id: 'nius',
    name: 'NIUS',
    homepage: 'https://nius.de',
    icon: favicon('nius.de'),
    kind: 'independent',
    language: 'de',
    defaultEnabled: false,
    feeds: [{ url: 'https://nius.de/rss', category: 'general' }]
  },
  {
    id: 'junge-freiheit',
    name: 'Junge Freiheit',
    homepage: 'https://jungefreiheit.de',
    icon: favicon('jungefreiheit.de'),
    kind: 'independent',
    language: 'de',
    defaultEnabled: false,
    feeds: [{ url: 'https://jungefreiheit.de/feed/', category: 'general' }]
  },
  {
    id: 'apollo-news',
    name: 'Apollo News',
    homepage: 'https://apollo-news.net',
    icon: favicon('apollo-news.net'),
    kind: 'independent',
    language: 'de',
    defaultEnabled: false,
    feeds: [{ url: 'https://apollo-news.net/feed/', category: 'general' }]
  },
  {
    id: 'achgut',
    name: 'Die Achse des Guten',
    homepage: 'https://www.achgut.com',
    icon: favicon('achgut.com'),
    kind: 'independent',
    language: 'de',
    defaultEnabled: false,
    feeds: [{ url: 'https://www.achgut.com/rss', category: 'opinion' }]
  },
  {
    id: 'rtl-news',
    name: 'RTL',
    homepage: 'https://www.rtl.de',
    icon: favicon('rtl.de'),
    kind: 'mainstream',
    language: 'de',
    defaultEnabled: false,
    feeds: [{ url: 'https://www.rtl.de/rss/feed/news', category: 'general' }]
  },
  {
    id: 'promiflash',
    name: 'Promiflash',
    homepage: 'https://www.promiflash.de',
    icon: favicon('promiflash.de'),
    kind: 'mainstream',
    language: 'de',
    defaultEnabled: false,
    feeds: [{ url: 'https://www.promiflash.de/feed/', category: 'entertainment' }]
  },
  {
    id: 'gala',
    name: 'Gala',
    homepage: 'https://www.gala.de',
    icon: favicon('gala.de'),
    kind: 'mainstream',
    language: 'de',
    defaultEnabled: false,
    feeds: [{ url: 'https://www.gala.de/feed/standard-rss/', category: 'entertainment' }]
  },

  // Business and consumer advice
  {
    id: 'business-insider-de',
    name: 'Business Insider Deutschland',
    homepage: 'https://www.businessinsider.de',
    icon: favicon('businessinsider.de'),
    kind: 'business',
    language: 'de',
    feeds: [
      { url: 'https://www.businessinsider.de/wirtschaft/feed/', category: 'economy' },
      { url: 'https://www.businessinsider.de/gruenderszene/feed/', category: 'technology' }
    ]
  },
  {
    id: 'finanzen-net',
    name: 'finanzen.net',
    homepage: 'https://www.finanzen.net',
    icon: favicon('finanzen.net'),
    kind: 'business',
    language: 'de',
    feeds: [{ url: 'https://www.finanzen.net/rss/news', category: 'economy' }]
  },
  {
    id: 'der-aktionaer',
    name: 'Der Aktionär',
    homepage: 'https://www.deraktionaer.de',
    icon: favicon('deraktionaer.de'),
    kind: 'business',
    language: 'de',
    feeds: [{ url: 'https://www.deraktionaer.de/aktionaer-news.rss', category: 'economy' }]
  },
  {
    id: 'deutsche-wirtschafts-nachrichten',
    name: 'Deutsche Wirtschafts Nachrichten',
    homepage: 'https://deutsche-wirtschafts-nachrichten.de',
    icon: favicon('deutsche-wirtschafts-nachrichten.de'),
    kind: 'business',
    language: 'de',
    defaultEnabled: false,
    feeds: [{ url: 'https://deutsche-wirtschafts-nachrichten.de/feed/', category: 'economy' }]
  },
  {
    id: 'stiftung-warentest',
    name: 'Stiftung Warentest',
    homepage: 'https://www.test.de',
    icon: favicon('test.de'),
    kind: 'independent',
    language: 'de',
    feeds: [{ url: 'https://www.test.de/rss/news/', category: 'lifestyle' }]
  },
  {
    id: 'oekotest',
    name: 'ÖKO-TEST',
    homepage: 'https://www.oekotest.de',
    icon: favicon('oekotest.de'),
    kind: 'independent',
    language: 'de',
    feeds: [
      {
        url: 'https://feeds.purplemanager.com/353c4833-8b25-428b-825c-d3339038bf4c/newsfeed',
        category: 'lifestyle'
      }
    ]
  },

  // Technology
  {
    id: 'computer-bild',
    name: 'Computer Bild',
    homepage: 'https://www.computerbild.de',
    icon: favicon('computerbild.de'),
    kind: 'technology',
    language: 'de',
    feeds: [{ url: 'https://www.computerbild.de/rss/35011529.xml', category: 'technology' }]
  },
  {
    id: 'giga',
    name: 'GIGA',
    homepage: 'https://www.giga.de',
    icon: favicon('giga.de'),
    kind: 'technology',
    language: 'de',
    feeds: [{ url: 'https://www.giga.de/feed/giga/', category: 'technology' }]
  },
  {
    id: 'netzwelt',
    name: 'netzwelt',
    homepage: 'https://www.netzwelt.de',
    icon: favicon('netzwelt.de'),
    kind: 'technology',
    language: 'de',
    feeds: [{ url: 'https://www.netzwelt.de/feed/news_full.xml', category: 'technology' }]
  },
  {
    id: 'caschys-blog',
    name: 'Caschys Blog',
    homepage: 'https://stadt-bremerhaven.de',
    icon: favicon('stadt-bremerhaven.de'),
    kind: 'technology',
    language: 'de',
    feeds: [{ url: 'https://stadt-bremerhaven.de/feed/', category: 'technology' }]
  },
  {
    id: 'winfuture',
    name: 'WinFuture',
    homepage: 'https://winfuture.de',
    icon: favicon('winfuture.de'),
    kind: 'technology',
    language: 'de',
    feeds: [{ url: 'https://static.winfuture.de/feeds/WinFuture-News-rss2.0.xml', category: 'technology' }]
  },
  {
    id: 'mobiflip',
    name: 'Mobiflip',
    homepage: 'https://www.mobiflip.de',
    icon: favicon('mobiflip.de'),
    kind: 'technology',
    language: 'de',
    defaultEnabled: false,
    feeds: [{ url: 'https://www.mobiflip.de/feed/', category: 'technology' }]
  },

  // Sport
  {
    id: '11-freunde',
    name: '11 Freunde',
    homepage: 'https://www.11freunde.de',
    icon: favicon('11freunde.de'),
    kind: 'sports',
    language: 'de',
    feeds: [{ url: 'https://www.11freunde.de/aktuelles/index.rss', category: 'sports' }]
  },
  {
    id: 'spox',
    name: 'SPOX',
    homepage: 'https://www.spox.com',
    icon: favicon('spox.com'),
    kind: 'sports',
    language: 'de',
    feeds: [{ url: 'https://feeds.footballco.com/spox/feed/in9xv2rmbt7qjzpk', category: 'sports' }]
  },
  {
    id: 'sport-de',
    name: 'sport.de',
    homepage: 'https://www.sport.de',
    icon: favicon('sport.de'),
    kind: 'sports',
    language: 'de',
    feeds: [{ url: 'https://www.sport.de/rss/news/', category: 'sports' }]
  },
  {
    id: 'motorsport-total',
    name: 'Motorsport-Total.com',
    homepage: 'https://www.motorsport-total.com',
    icon: favicon('motorsport-total.com'),
    kind: 'sports',
    language: 'de',
    feeds: [{ url: 'https://www.motorsport-total.com/rss/rss.xml', category: 'sports' }]
  },

  // Science and health
  {
    id: 'geo',
    name: 'GEO',
    homepage: 'https://www.geo.de',
    icon: favicon('geo.de'),
    kind: 'mainstream',
    language: 'de',
    feeds: [{ url: 'https://www.geo.de/feed/rss/geo/', category: 'science' }]
  },
  {
    id: 'scinexx',
    name: 'scinexx',
    homepage: 'https://www.scinexx.de',
    icon: favicon('scinexx.de'),
    kind: 'independent',
    language: 'de',
    feeds: [{ url: 'https://www.scinexx.de/feed/', category: 'science' }]
  },
  {
    id: 'wissenschaft-de',
    name: 'bild der wissenschaft',
    homepage: 'https://wissenschaft.de',
    icon: favicon('wissenschaft.de'),
    kind: 'independent',
    language: 'de',
    feeds: [{ url: 'https://wissenschaft.de/feed.xml', category: 'science' }]
  },
  {
    id: 'riffreporter',
    name: 'RiffReporter',
    homepage: 'https://www.riffreporter.de',
    icon: favicon('riffreporter.de'),
    kind: 'independent',
    language: 'de',
    feeds: [{ url: 'https://riff.media/de/rss/umwelt', category: 'environment' }]
  },
  {
    id: 'pharmazeutische-zeitung',
    name: 'Pharmazeutische Zeitung',
    homepage: 'https://www.pharmazeutische-zeitung.de',
    icon: favicon('pharmazeutische-zeitung.de'),
    kind: 'independent',
    language: 'de',
    feeds: [
      { url: 'https://www.pharmazeutische-zeitung.de/fileadmin/rss/pz_online_rss.php', category: 'health' }
    ]
  },
  {
    id: 'mens-health-de',
    name: "Men's Health",
    homepage: 'https://www.menshealth.de',
    icon: favicon('menshealth.de'),
    kind: 'mainstream',
    language: 'de',
    feeds: [{ url: 'https://www.menshealth.de/rss/alle/', category: 'health' }]
  },
  {
    id: 'womens-health-de',
    name: "Women's Health",
    homepage: 'https://www.womenshealth.de',
    icon: favicon('womenshealth.de'),
    kind: 'mainstream',
    language: 'de',
    feeds: [{ url: 'https://www.womenshealth.de/rss/alle/', category: 'health' }]
  },

  // Entertainment and culture
  {
    id: 'moviepilot',
    name: 'Moviepilot',
    homepage: 'https://www.moviepilot.de',
    icon: favicon('moviepilot.de'),
    kind: 'mainstream',
    language: 'de',
    feeds: [{ url: 'https://www.moviepilot.de/rss/moviepilot-standard', category: 'entertainment' }]
  },
  {
    id: 'serienjunkies',
    name: 'Serienjunkies',
    homepage: 'https://www.serienjunkies.de',
    icon: favicon('serienjunkies.de'),
    kind: 'mainstream',
    language: 'de',
    feeds: [{ url: 'https://www.serienjunkies.de/news/rssfeed.xml', category: 'entertainment' }]
  },
  {
    id: 'laut-de',
    name: 'laut.de',
    homepage: 'https://laut.de',
    icon: favicon('laut.de'),
    kind: 'mainstream',
    language: 'de',
    feeds: [{ url: 'https://laut.de/_feeds/news/rss', category: 'culture' }]
  },
  {
    id: 'perlentaucher',
    name: 'Perlentaucher',
    homepage: 'https://www.perlentaucher.de',
    icon: favicon('perlentaucher.de'),
    kind: 'independent',
    language: 'de',
    feeds: [{ url: 'https://www.perlentaucher.de/index.rss', category: 'culture' }]
  },
  {
    id: 'monopol',
    name: 'Monopol',
    homepage: 'https://www.monopol-magazin.de',
    icon: favicon('monopol-magazin.de'),
    kind: 'independent',
    language: 'de',
    feeds: [{ url: 'https://www.monopol-magazin.de/rss.xml', category: 'culture' }]
  },

  // Lifestyle, motoring and travel
  {
    id: 'brigitte',
    name: 'Brigitte',
    homepage: 'https://www.brigitte.de',
    icon: favicon('brigitte.de'),
    kind: 'mainstream',
    language: 'de',
    feeds: [{ url: 'https://www.brigitte.de/feed.rss', category: 'lifestyle' }]
  },
  {
    id: 'eltern',
    name: 'Eltern',
    homepage: 'https://www.eltern.de',
    icon: favicon('eltern.de'),
    kind: 'mainstream',
    language: 'de',
    feeds: [{ url: 'https://www.eltern.de/feed/all/', category: 'lifestyle' }]
  },
  {
    id: 'vogue-de',
    name: 'Vogue',
    homepage: 'https://www.vogue.de',
    icon: favicon('vogue.de'),
    kind: 'mainstream',
    language: 'de',
    feeds: [{ url: 'https://www.vogue.de/feed/rss', category: 'lifestyle' }]
  },
  {
    id: 'gq-de',
    name: 'GQ',
    homepage: 'https://www.gq-magazin.de',
    icon: favicon('gq-magazin.de'),
    kind: 'mainstream',
    language: 'de',
    feeds: [{ url: 'https://www.gq-magazin.de/feed/rss', category: 'lifestyle' }]
  },
  {
    id: 'auto-motor-und-sport',
    name: 'auto motor und sport',
    homepage: 'https://www.auto-motor-und-sport.de',
    icon: favicon('auto-motor-und-sport.de'),
    kind: 'mainstream',
    language: 'de',
    feeds: [{ url: 'https://www.auto-motor-und-sport.de/rss/alle/', category: 'automotive' }]
  },
  {
    id: 'motor1-de',
    name: 'Motor1',
    homepage: 'https://de.motor1.com',
    icon: favicon('motor1.com'),
    kind: 'mainstream',
    language: 'de',
    feeds: [{ url: 'https://de.motor1.com/rss/news/all/', category: 'automotive' }]
  },
  {
    id: 'electrive',
    name: 'electrive',
    homepage: 'https://www.electrive.net',
    icon: favicon('electrive.net'),
    kind: 'independent',
    language: 'de',
    feeds: [{ url: 'https://www.electrive.net/feed/', category: 'automotive' }]
  },
  {
    id: 'travelbook',
    name: 'TRAVELBOOK',
    homepage: 'https://www.travelbook.de',
    icon: favicon('travelbook.de'),
    kind: 'mainstream',
    language: 'de',
    feeds: [{ url: 'https://www.travelbook.de/feed', category: 'travel' }]
  },
  {
    id: 'merian',
    name: 'Merian',
    homepage: 'https://www.merian.de',
    icon: favicon('merian.de'),
    kind: 'mainstream',
    language: 'de',
    feeds: [{ url: 'https://www.merian.de/feed', category: 'travel' }]
  },

  // Education and environment
  {
    id: 'bildungsklick',
    name: 'bildungsklick',
    homepage: 'https://bildungsklick.de',
    icon: favicon('bildungsklick.de'),
    kind: 'independent',
    language: 'de',
    feeds: [{ url: 'https://bildungsklick.de/rss/top-news', category: 'education' }]
  },
  {
    id: 'klimareporter',
    name: 'klimareporter°',
    homepage: 'https://www.klimareporter.de',
    icon: favicon('klimareporter.de'),
    kind: 'independent',
    language: 'de',
    feeds: [{ url: 'https://www.klimareporter.de/?format=feed&type=rss', category: 'environment' }]
  }
]

export const sources: SourceDef[] = [...nationalSources, ...localSources]
