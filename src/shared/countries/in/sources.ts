import type { SourceDef } from '../../types'

/*
 * India — English-language national sources. Every feed was checked on
 * 2026-09-23 (re-check with `npm run verify:feeds in`).
 *
 * Not included: Scroll.in, The Wire and Deccan Herald (their feed URLs no longer
 * serve XML) and the Times of India technology feed, which has been stale for years.
 */

export const sources: SourceDef[] = [
  // Mainstream dailies
  {
    id: 'times-of-india',
    name: 'The Times of India',
    homepage: 'https://timesofindia.indiatimes.com',
    icon: 'https://timesofindia.indiatimes.com/apple-touch-icon.png',
    color: '#CF2028',
    kind: 'mainstream',
    language: 'en',
    feeds: [
      { url: 'https://timesofindia.indiatimes.com/rssfeedstopstories.cms', category: 'top', headline: true },
      { url: 'https://timesofindia.indiatimes.com/rssfeeds/-2128936835.cms', category: 'national' },
      { url: 'https://timesofindia.indiatimes.com/rssfeeds/296589292.cms', category: 'world' },
      { url: 'https://timesofindia.indiatimes.com/rssfeeds/1898055.cms', category: 'economy' },
      { url: 'https://timesofindia.indiatimes.com/rssfeeds/4719148.cms', category: 'sports' },
      { url: 'https://timesofindia.indiatimes.com/rssfeeds/1081479906.cms', category: 'entertainment' }
    ]
  },
  {
    id: 'the-hindu',
    name: 'The Hindu',
    homepage: 'https://www.thehindu.com',
    icon: 'https://www.thehindu.com/apple-touch-icon.png',
    color: '#005B94',
    kind: 'mainstream',
    language: 'en',
    feeds: [
      { url: 'https://www.thehindu.com/news/national/feeder/default.rss', category: 'national', headline: true },
      { url: 'https://www.thehindu.com/news/international/feeder/default.rss', category: 'world' },
      { url: 'https://www.thehindu.com/business/feeder/default.rss', category: 'economy' },
      { url: 'https://www.thehindu.com/sci-tech/feeder/default.rss', category: 'science' },
      { url: 'https://www.thehindu.com/sport/feeder/default.rss', category: 'sports' }
    ]
  },
  {
    id: 'hindustan-times',
    name: 'Hindustan Times',
    homepage: 'https://www.hindustantimes.com',
    icon: 'https://www.hindustantimes.com/apple-touch-icon.png',
    color: '#004B8D',
    kind: 'mainstream',
    language: 'en',
    feeds: [
      {
        url: 'https://www.hindustantimes.com/feeds/rss/india-news/rssfeed.xml',
        category: 'national',
        headline: true
      },
      { url: 'https://www.hindustantimes.com/feeds/rss/world-news/rssfeed.xml', category: 'world' },
      { url: 'https://www.hindustantimes.com/feeds/rss/business/rssfeed.xml', category: 'economy' },
      { url: 'https://www.hindustantimes.com/feeds/rss/technology/rssfeed.xml', category: 'technology' },
      { url: 'https://www.hindustantimes.com/feeds/rss/sports/rssfeed.xml', category: 'sports' },
      { url: 'https://www.hindustantimes.com/feeds/rss/entertainment/rssfeed.xml', category: 'entertainment' }
    ]
  },
  {
    id: 'indian-express',
    name: 'The Indian Express',
    homepage: 'https://indianexpress.com',
    icon: 'https://indianexpress.com/apple-touch-icon.png',
    color: '#D4202B',
    kind: 'mainstream',
    language: 'en',
    feeds: [
      { url: 'https://indianexpress.com/feed/', category: 'top', headline: true },
      { url: 'https://indianexpress.com/section/india/feed/', category: 'national' },
      { url: 'https://indianexpress.com/section/world/feed/', category: 'world' },
      { url: 'https://indianexpress.com/section/business/feed/', category: 'economy' },
      { url: 'https://indianexpress.com/section/technology/feed/', category: 'technology' },
      { url: 'https://indianexpress.com/section/sports/feed/', category: 'sports' }
    ]
  },

  // Broadcast and digital
  {
    id: 'ndtv',
    name: 'NDTV',
    homepage: 'https://www.ndtv.com',
    icon: 'https://www.ndtv.com/apple-touch-icon.png',
    color: '#E21B22',
    kind: 'mainstream',
    language: 'en',
    feeds: [
      { url: 'https://feeds.feedburner.com/ndtvnews-top-stories', category: 'top', headline: true },
      { url: 'https://feeds.feedburner.com/ndtvnews-india-news', category: 'national' },
      { url: 'https://feeds.feedburner.com/ndtvnews-world-news', category: 'world' }
    ]
  },
  {
    id: 'india-today',
    name: 'India Today',
    homepage: 'https://www.indiatoday.in',
    icon: 'https://www.indiatoday.in/apple-touch-icon.png',
    color: '#E31E24',
    kind: 'mainstream',
    language: 'en',
    feeds: [{ url: 'https://www.indiatoday.in/rss/1206578', category: 'general' }]
  },
  {
    id: 'news18',
    name: 'News18',
    homepage: 'https://www.news18.com',
    icon: 'https://www.news18.com/favicon.ico',
    color: '#EE2A24',
    kind: 'mainstream',
    language: 'en',
    feeds: [
      { url: 'https://www.news18.com/rss/india.xml', category: 'national' },
      { url: 'https://www.news18.com/rss/world.xml', category: 'world' }
    ]
  },
  {
    id: 'firstpost',
    name: 'Firstpost',
    homepage: 'https://www.firstpost.com',
    color: '#EB1C24',
    kind: 'independent',
    language: 'en',
    defaultEnabled: false,
    feeds: [{ url: 'https://www.firstpost.com/commonfeeds/v1/mfp/rss/india.xml', category: 'national' }]
  },

  // Business
  {
    id: 'economic-times',
    name: 'The Economic Times',
    homepage: 'https://economictimes.indiatimes.com',
    icon: 'https://economictimes.indiatimes.com/apple-touch-icon.png',
    color: '#C1272D',
    kind: 'business',
    language: 'en',
    feeds: [{ url: 'https://economictimes.indiatimes.com/rssfeedstopstories.cms', category: 'economy' }]
  },
  {
    id: 'mint',
    name: 'Mint',
    homepage: 'https://www.livemint.com',
    icon: 'https://www.livemint.com/apple-touch-icon.png',
    color: '#0A7BBF',
    kind: 'business',
    language: 'en',
    feeds: [{ url: 'https://www.livemint.com/rss/news', category: 'economy' }]
  }
]
