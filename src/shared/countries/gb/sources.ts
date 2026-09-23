import type { SourceDef } from '../../types'
import { localSources } from './local.ts'

/*
 * United Kingdom — English-language national sources, plus BBC local news for every area
 * and the regional papers (see `local.ts`). Every feed was checked on 2026-09-23
 * (re-check with `npm run verify:feeds gb`).
 *
 * The default set runs from the Guardian, the New Statesman and the Mirror's side to
 * the Telegraph and GB News; the tabloids are off by default, like in the Turkey pack.
 *
 * Not included: ITV News (no public feed any more), The Spectator (its feed answers
 * 404) and the Telegraph's section feeds, stale for months (its main feed is live).
 */

const nationalSources: SourceDef[] = [
  {
    id: 'bbc-news',
    name: 'BBC News',
    homepage: 'https://www.bbc.co.uk/news',
    icon: 'https://www.bbc.co.uk/apple-touch-icon.png',
    color: '#BB1919',
    kind: 'public',
    language: 'en',
    feeds: [
      { url: 'https://feeds.bbci.co.uk/news/rss.xml', category: 'top', headline: true },
      { url: 'https://feeds.bbci.co.uk/news/uk/rss.xml', category: 'national' },
      { url: 'https://feeds.bbci.co.uk/news/politics/rss.xml', category: 'politics' },
      { url: 'https://feeds.bbci.co.uk/news/world/rss.xml', category: 'world' },
      { url: 'https://feeds.bbci.co.uk/news/business/rss.xml', category: 'economy' },
      { url: 'https://feeds.bbci.co.uk/news/technology/rss.xml', category: 'technology' },
      { url: 'https://feeds.bbci.co.uk/news/science_and_environment/rss.xml', category: 'science' },
      { url: 'https://feeds.bbci.co.uk/news/health/rss.xml', category: 'health' },
      { url: 'https://feeds.bbci.co.uk/news/entertainment_and_arts/rss.xml', category: 'culture' },
      { url: 'https://feeds.bbci.co.uk/sport/rss.xml', category: 'sports' },
      { url: 'https://feeds.bbci.co.uk/news/education/rss.xml', category: 'education' }
    ]
  },
  {
    id: 'guardian',
    name: 'The Guardian',
    homepage: 'https://www.theguardian.com/uk',
    icon: 'https://www.theguardian.com/favicon.ico',
    color: '#052962',
    kind: 'mainstream',
    language: 'en',
    feeds: [
      { url: 'https://www.theguardian.com/uk/rss', category: 'top', headline: true },
      { url: 'https://www.theguardian.com/politics/rss', category: 'politics' },
      { url: 'https://www.theguardian.com/world/rss', category: 'world' },
      { url: 'https://www.theguardian.com/uk/business/rss', category: 'economy' },
      { url: 'https://www.theguardian.com/uk/technology/rss', category: 'technology' },
      { url: 'https://www.theguardian.com/science/rss', category: 'science' },
      { url: 'https://www.theguardian.com/uk/environment/rss', category: 'environment' },
      { url: 'https://www.theguardian.com/uk/culture/rss', category: 'culture' },
      { url: 'https://www.theguardian.com/uk/sport/rss', category: 'sports' },
      { url: 'https://www.theguardian.com/society/rss', category: 'health' },
      { url: 'https://www.theguardian.com/education/rss', category: 'education' },
      { url: 'https://www.theguardian.com/uk/lifeandstyle/rss', category: 'lifestyle' },
      { url: 'https://www.theguardian.com/uk/travel/rss', category: 'travel' },
      { url: 'https://www.theguardian.com/uk/film/rss', category: 'entertainment' },
      { url: 'https://www.theguardian.com/uk/commentisfree/rss', category: 'opinion' }
    ]
  },
  {
    id: 'sky-news',
    name: 'Sky News',
    homepage: 'https://news.sky.com',
    icon: 'https://news.sky.com/apple-touch-icon.png',
    color: '#D5232F',
    kind: 'mainstream',
    language: 'en',
    feeds: [
      { url: 'https://feeds.skynews.com/feeds/rss/home.xml', category: 'top', headline: true },
      { url: 'https://feeds.skynews.com/feeds/rss/uk.xml', category: 'national' },
      { url: 'https://feeds.skynews.com/feeds/rss/politics.xml', category: 'politics' },
      { url: 'https://feeds.skynews.com/feeds/rss/world.xml', category: 'world' },
      { url: 'https://feeds.skynews.com/feeds/rss/business.xml', category: 'economy' },
      { url: 'https://feeds.skynews.com/feeds/rss/technology.xml', category: 'technology' },
      { url: 'https://feeds.skynews.com/feeds/rss/entertainment.xml', category: 'entertainment' }
    ]
  },
  {
    id: 'independent',
    name: 'The Independent',
    homepage: 'https://www.independent.co.uk',
    icon: 'https://www.independent.co.uk/favicon.ico',
    color: '#EE1B24',
    kind: 'mainstream',
    language: 'en',
    feeds: [
      { url: 'https://www.independent.co.uk/news/uk/rss', category: 'national', headline: true },
      { url: 'https://www.independent.co.uk/news/world/rss', category: 'world' },
      { url: 'https://www.independent.co.uk/news/business/rss', category: 'economy' },
      { url: 'https://www.independent.co.uk/sport/rss', category: 'sports' },
      { url: 'https://www.independent.co.uk/tech/rss', category: 'technology' },
      { url: 'https://www.independent.co.uk/climate-change/rss', category: 'environment' },
      { url: 'https://www.independent.co.uk/life-style/rss', category: 'lifestyle' },
      { url: 'https://www.independent.co.uk/travel/rss', category: 'travel' },
      { url: 'https://www.independent.co.uk/arts-entertainment/rss', category: 'entertainment' },
      { url: 'https://www.independent.co.uk/voices/rss', category: 'opinion' }
    ]
  },
  {
    id: 'evening-standard',
    name: 'Evening Standard',
    homepage: 'https://www.standard.co.uk',
    icon: 'https://www.standard.co.uk/img/shortcut-icons/favicon.ico',
    color: '#C8102E',
    kind: 'mainstream',
    language: 'en',
    feeds: [{ url: 'https://www.standard.co.uk/rss', category: 'general' }]
  },
  {
    id: 'financial-times',
    name: 'Financial Times',
    homepage: 'https://www.ft.com',
    color: '#990F3D',
    kind: 'business',
    language: 'en',
    feeds: [{ url: 'https://www.ft.com/rss/home', category: 'economy' }]
  },
  {
    id: 'economist',
    name: 'The Economist',
    homepage: 'https://www.economist.com',
    icon: 'https://www.economist.com/favicon.ico',
    color: '#E3120B',
    kind: 'international',
    language: 'en',
    feeds: [{ url: 'https://www.economist.com/latest/rss.xml', category: 'general' }]
  },
  {
    id: 'telegraph',
    name: 'The Telegraph',
    homepage: 'https://www.telegraph.co.uk',
    icon: 'https://www.google.com/s2/favicons?domain=telegraph.co.uk&sz=128',
    color: '#1A1A1A',
    kind: 'mainstream',
    language: 'en',
    feeds: [
      { url: 'https://www.telegraph.co.uk/rss.xml', category: 'general' },
      { url: 'https://www.telegraph.co.uk/business/rss.xml', category: 'economy' }
    ]
  },
  {
    id: 'i-news',
    name: 'The i Paper',
    homepage: 'https://inews.co.uk',
    icon: 'https://www.google.com/s2/favicons?domain=inews.co.uk&sz=128',
    color: '#0F5B8D',
    kind: 'mainstream',
    language: 'en',
    feeds: [{ url: 'https://inews.co.uk/feed', category: 'general' }]
  },
  {
    id: 'gb-news',
    name: 'GB News',
    homepage: 'https://www.gbnews.com',
    icon: 'https://www.google.com/s2/favicons?domain=gbnews.com&sz=128',
    color: '#002F6C',
    kind: 'mainstream',
    language: 'en',
    feeds: [{ url: 'https://www.gbnews.com/feeds/news.rss', category: 'national' }]
  },
  {
    id: 'channel-4-news',
    name: 'Channel 4 News',
    homepage: 'https://www.channel4.com/news',
    icon: 'https://www.google.com/s2/favicons?domain=channel4.com/news&sz=128',
    color: '#1A1A1A',
    kind: 'public',
    language: 'en',
    feeds: [{ url: 'https://www.channel4.com/news/feed', category: 'general' }]
  },
  {
    id: 'new-statesman',
    name: 'New Statesman',
    homepage: 'https://www.newstatesman.com',
    icon: 'https://www.google.com/s2/favicons?domain=newstatesman.com&sz=128',
    color: '#C4122F',
    kind: 'independent',
    language: 'en',
    feeds: [{ url: 'https://www.newstatesman.com/feed', category: 'politics' }]
  },
  {
    id: 'the-conversation-uk',
    name: 'The Conversation UK',
    homepage: 'https://theconversation.com/uk',
    icon: 'https://www.google.com/s2/favicons?domain=theconversation.com/uk&sz=128',
    color: '#D8352A',
    kind: 'independent',
    language: 'en',
    feeds: [{ url: 'https://theconversation.com/uk/articles.atom', category: 'science' }]
  },

  // Business, technology, health, environment, motoring, sport, entertainment
  {
    id: 'city-am',
    name: 'City A.M.',
    homepage: 'https://www.cityam.com',
    icon: 'https://www.google.com/s2/favicons?domain=cityam.com&sz=128',
    color: '#E4032E',
    kind: 'business',
    language: 'en',
    feeds: [{ url: 'https://www.cityam.com/feed/', category: 'economy' }]
  },
  {
    id: 'this-is-money',
    name: 'This is Money',
    homepage: 'https://www.thisismoney.co.uk',
    icon: 'https://www.google.com/s2/favicons?domain=thisismoney.co.uk&sz=128',
    color: '#004DB3',
    kind: 'business',
    language: 'en',
    feeds: [{ url: 'https://www.thisismoney.co.uk/money/index.rss', category: 'economy' }]
  },
  {
    id: 'the-register',
    name: 'The Register',
    homepage: 'https://www.theregister.com',
    icon: 'https://www.google.com/s2/favicons?domain=theregister.com&sz=128',
    color: '#D12D2D',
    kind: 'technology',
    language: 'en',
    feeds: [{ url: 'https://www.theregister.com/headlines.atom', category: 'technology' }]
  },
  {
    id: 'techradar',
    name: 'TechRadar',
    homepage: 'https://www.techradar.com',
    icon: 'https://www.google.com/s2/favicons?domain=techradar.com&sz=128',
    color: '#1D1D1B',
    kind: 'technology',
    language: 'en',
    feeds: [{ url: 'https://www.techradar.com/feeds.xml', category: 'technology' }]
  },
  {
    id: 'pulse',
    name: 'Pulse',
    homepage: 'https://www.pulsetoday.co.uk',
    icon: 'https://www.google.com/s2/favicons?domain=pulsetoday.co.uk&sz=128',
    color: '#00558C',
    kind: 'independent',
    language: 'en',
    feeds: [{ url: 'https://www.pulsetoday.co.uk/feed/', category: 'health' }]
  },
  {
    id: 'carbon-brief',
    name: 'Carbon Brief',
    homepage: 'https://www.carbonbrief.org',
    icon: 'https://www.google.com/s2/favicons?domain=carbonbrief.org&sz=128',
    color: '#1B4D5C',
    kind: 'independent',
    language: 'en',
    feeds: [{ url: 'https://www.carbonbrief.org/feed', category: 'environment' }]
  },
  {
    id: 'autocar',
    name: 'Autocar',
    homepage: 'https://www.autocar.co.uk',
    icon: 'https://www.google.com/s2/favicons?domain=autocar.co.uk&sz=128',
    color: '#E30613',
    kind: 'mainstream',
    language: 'en',
    feeds: [{ url: 'https://www.autocar.co.uk/rss', category: 'automotive' }]
  },
  {
    id: 'auto-express',
    name: 'Auto Express',
    homepage: 'https://www.autoexpress.co.uk',
    icon: 'https://www.google.com/s2/favicons?domain=autoexpress.co.uk&sz=128',
    color: '#E2001A',
    kind: 'mainstream',
    language: 'en',
    feeds: [{ url: 'https://www.autoexpress.co.uk/feed/all', category: 'automotive' }]
  },
  {
    id: 'sky-sports',
    name: 'Sky Sports',
    homepage: 'https://www.skysports.com',
    icon: 'https://www.google.com/s2/favicons?domain=skysports.com&sz=128',
    color: '#0B1F44',
    kind: 'sports',
    language: 'en',
    feeds: [{ url: 'https://www.skysports.com/rss/12040', category: 'sports' }]
  },
  {
    id: 'nme',
    name: 'NME',
    homepage: 'https://www.nme.com',
    icon: 'https://www.google.com/s2/favicons?domain=nme.com&sz=128',
    color: '#E41C24',
    kind: 'mainstream',
    language: 'en',
    feeds: [{ url: 'https://www.nme.com/feed', category: 'entertainment' }]
  },
  {
    id: 'radio-times',
    name: 'Radio Times',
    homepage: 'https://www.radiotimes.com',
    icon: 'https://www.google.com/s2/favicons?domain=radiotimes.com&sz=128',
    color: '#E4032E',
    kind: 'mainstream',
    language: 'en',
    feeds: [{ url: 'https://www.radiotimes.com/feed/', category: 'entertainment' }]
  },

  // Popular press — off by default, like the tabloids in the Turkey pack.
  {
    id: 'daily-mail',
    name: 'Daily Mail',
    homepage: 'https://www.dailymail.co.uk',
    icon: 'https://www.dailymail.com/apple-touch-icon.png',
    color: '#004DB3',
    kind: 'mainstream',
    language: 'en',
    defaultEnabled: false,
    feeds: [
      { url: 'https://www.dailymail.co.uk/articles.rss', category: 'general' },
      { url: 'https://www.dailymail.co.uk/news/index.rss', category: 'national' }
    ]
  },
  {
    id: 'mirror',
    name: 'Daily Mirror',
    homepage: 'https://www.mirror.co.uk',
    icon: 'https://www.mirror.co.uk/favicon.ico',
    color: '#E01E26',
    kind: 'mainstream',
    language: 'en',
    defaultEnabled: false,
    feeds: [{ url: 'https://www.mirror.co.uk/news/?service=rss', category: 'general' }]
  },
  {
    id: 'metro',
    name: 'Metro',
    homepage: 'https://metro.co.uk',
    icon: 'https://metro.co.uk/apple-touch-icon.png',
    color: '#00A0DF',
    kind: 'mainstream',
    language: 'en',
    defaultEnabled: false,
    feeds: [{ url: 'https://metro.co.uk/feed/', category: 'general' }]
  },
  {
    id: 'the-sun',
    name: 'The Sun',
    homepage: 'https://www.thesun.co.uk',
    icon: 'https://www.google.com/s2/favicons?domain=thesun.co.uk&sz=128',
    color: '#EB1C24',
    kind: 'mainstream',
    language: 'en',
    defaultEnabled: false,
    feeds: [{ url: 'https://www.thesun.co.uk/feed/', category: 'general' }]
  },
  {
    id: 'daily-express',
    name: 'Daily Express',
    homepage: 'https://www.express.co.uk',
    icon: 'https://www.google.com/s2/favicons?domain=express.co.uk&sz=128',
    color: '#C00000',
    kind: 'mainstream',
    language: 'en',
    defaultEnabled: false,
    feeds: [{ url: 'https://www.express.co.uk/posts/rss/1/uk', category: 'general' }]
  }
]

export const sources: SourceDef[] = [...nationalSources, ...localSources]
