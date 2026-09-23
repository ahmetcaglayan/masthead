import type { SourceDef } from '../../types'

/*
 * Germany — German-language national sources. Every feed was checked on
 * 2026-09-23 (re-check with `npm run verify:feeds de`).
 *
 * Not included: the Zeit Online culture and science feeds (404) and the old
 * rss.focus.de news feed, replaced by its section feed.
 */

export const sources: SourceDef[] = [
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
      { url: 'https://www.tagesschau.de/wissen/index~rss2.xml', category: 'science' }
    ]
  },
  {
    id: 'zdf-heute',
    name: 'ZDFheute',
    homepage: 'https://www.zdf.de/nachrichten',
    color: '#FA7D19',
    kind: 'public',
    language: 'de',
    feeds: [{ url: 'https://www.zdf.de/rss/zdf/nachrichten', category: 'general' }]
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
      { url: 'https://www.spiegel.de/sport/index.rss', category: 'sports' }
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
      { url: 'https://newsfeed.zeit.de/digital/index', category: 'technology' }
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
      { url: 'https://www.faz.net/rss/aktuell/wirtschaft/', category: 'economy' }
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
      { url: 'https://rss.sueddeutsche.de/rss/Sport', category: 'sports' }
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
      { url: 'https://www.welt.de/feeds/section/sport.rss', category: 'sports' }
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
      { url: 'https://www.n-tv.de/sport/rss', category: 'sports' }
    ]
  },
  {
    id: 'stern',
    name: 'Stern',
    homepage: 'https://www.stern.de',
    color: '#E3000F',
    kind: 'mainstream',
    language: 'de',
    feeds: [{ url: 'https://www.stern.de/feed/standard/all/', category: 'general' }]
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
      { url: 'https://www.handelsblatt.com/contentexport/feed/schlagzeilen', category: 'economy' }
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
  }
]
