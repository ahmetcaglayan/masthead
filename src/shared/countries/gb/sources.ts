import type { SourceDef } from '../../types'

/*
 * United Kingdom — English-language national sources. Every feed was checked on
 * 2026-09-23 (re-check with `npm run verify:feeds gb`).
 *
 * Not included: ITV News (no public feed any more) and The Telegraph, whose news
 * and politics feeds have been stale for months.
 */

export const sources: SourceDef[] = [
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
      { url: 'https://feeds.bbci.co.uk/sport/rss.xml', category: 'sports' }
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
      { url: 'https://www.theguardian.com/uk/sport/rss', category: 'sports' }
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
      { url: 'https://www.independent.co.uk/sport/rss', category: 'sports' }
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
    feeds: [{ url: 'https://www.economist.com/latest/rss.xml', category: 'world' }]
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
  }
]
