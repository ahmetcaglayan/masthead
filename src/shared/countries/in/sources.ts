import type { SourceDef } from '../../types'

/*
 * India — Hindi and English national sources. Someone who picks India reads the news
 * of India, and that news is written in Hindi as much as in English: the six Hindi
 * newsrooms are all on by default, beside four of the English nationals (the Times of
 * India, The Hindu, The Indian Express and NDTV). The other English papers ship off —
 * one tap on the Sources page brings them back — so the front page reads Hindi first. Every feed
 * was checked on 2026-09-23 (re-check with `npm run verify:feeds in`).
 *
 * Not included: Dainik Jagran, Navbharat Times, Zee News Hindi, Patrika and The
 * Lallantop (their feed URLs answer 404 or no longer serve XML), Live Hindustan (its
 * feed host answers with HTML), Scroll.in, The Wire and Deccan Herald, and the Times
 * of India technology feed, which has been stale for years.
 */

export const sources: SourceDef[] = [
  // Hindi
  {
    id: 'amar-ujala',
    name: 'अमर उजाला',
    homepage: 'https://www.amarujala.com',
    icon: 'https://www.amarujala.com/favicon.ico',
    color: '#E8262C',
    kind: 'mainstream',
    language: 'hi',
    feeds: [
      { url: 'https://www.amarujala.com/rss/india-news.xml', category: 'national', headline: true },
      { url: 'https://www.amarujala.com/rss/world.xml', category: 'world' },
      { url: 'https://www.amarujala.com/rss/business.xml', category: 'economy' },
      { url: 'https://www.amarujala.com/rss/sports.xml', category: 'sports' },
      { url: 'https://www.amarujala.com/rss/technology.xml', category: 'technology' },
      { url: 'https://www.amarujala.com/rss/entertainment.xml', category: 'entertainment' },
      { url: 'https://www.amarujala.com/rss/education.xml', category: 'education' }
    ]
  },
  {
    id: 'dainik-bhaskar',
    name: 'दैनिक भास्कर',
    homepage: 'https://www.bhaskar.com',
    icon: 'https://www.bhaskar.com/favicon.ico',
    color: '#D01A1A',
    kind: 'mainstream',
    language: 'hi',
    feeds: [
      { url: 'https://www.bhaskar.com/rss-v1--category-1061.xml', category: 'national', headline: true },
      { url: 'https://www.bhaskar.com/rss-v1--category-1051.xml', category: 'economy' },
      { url: 'https://www.bhaskar.com/rss-v1--category-1053.xml', category: 'sports' },
      { url: 'https://www.bhaskar.com/rss-v1--category-1057.xml', category: 'lifestyle' }
    ]
  },
  {
    id: 'ndtv-india',
    name: 'NDTV इंडिया',
    homepage: 'https://khabar.ndtv.com',
    icon: 'https://khabar.ndtv.com/apple-touch-icon.png',
    color: '#E21B22',
    kind: 'mainstream',
    language: 'hi',
    feeds: [
      { url: 'https://feeds.feedburner.com/ndtvkhabar-latest', category: 'top', headline: true },
      { url: 'https://feeds.feedburner.com/ndtvkhabar-india', category: 'national' },
      { url: 'https://feeds.feedburner.com/ndtvkhabar-world', category: 'world' },
      { url: 'https://feeds.feedburner.com/ndtvkhabar-business', category: 'economy' }
    ]
  },
  {
    id: 'news18-hindi',
    name: 'News18 हिंदी',
    homepage: 'https://hindi.news18.com',
    icon: 'https://hindi.news18.com/apple-touch-icon.png',
    color: '#EE2A24',
    kind: 'mainstream',
    language: 'hi',
    feeds: [
      { url: 'https://hindi.news18.com/commonfeeds/v1/hin/rss/nation.xml', category: 'national' },
      { url: 'https://hindi.news18.com/commonfeeds/v1/hin/rss/world.xml', category: 'world' },
      { url: 'https://hindi.news18.com/commonfeeds/v1/hin/rss/business.xml', category: 'economy' },
      { url: 'https://hindi.news18.com/commonfeeds/v1/hin/rss/sports.xml', category: 'sports' },
      { url: 'https://hindi.news18.com/commonfeeds/v1/hin/rss/tech.xml', category: 'technology' },
      { url: 'https://hindi.news18.com/commonfeeds/v1/hin/rss/entertainment.xml', category: 'entertainment' }
    ]
  },
  {
    id: 'aaj-tak',
    name: 'आज तक',
    homepage: 'https://www.aajtak.in',
    icon: 'https://smedia2.intoday.in/aajtak_pwapp/resources/atmobile/public/images/apple-touch-icon.png',
    color: '#E4002B',
    kind: 'mainstream',
    language: 'hi',
    feeds: [{ url: 'https://www.aajtak.in/rssfeeds/?id=home', category: 'top', headline: true }]
  },
  {
    id: 'bbc-hindi',
    name: 'BBC News हिंदी',
    homepage: 'https://www.bbc.com/hindi',
    icon: 'https://www.bbc.co.uk/apple-touch-icon.png',
    color: '#BB1919',
    kind: 'international',
    language: 'hi',
    feeds: [{ url: 'https://feeds.bbci.co.uk/hindi/rss.xml', category: 'general' }]
  },

  // English — India's own national press, not a foreign edition
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
      { url: 'https://timesofindia.indiatimes.com/rssfeeds/-2128838597.cms', category: 'politics' },
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
      { url: 'https://www.thehindu.com/entertainment/feeder/default.rss', category: 'culture' },
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
    defaultEnabled: false,
    feeds: [
      {
        url: 'https://www.hindustantimes.com/feeds/rss/india-news/rssfeed.xml',
        category: 'national',
        headline: true
      },
      { url: 'https://www.hindustantimes.com/feeds/rss/world-news/rssfeed.xml', category: 'world' },
      { url: 'https://www.hindustantimes.com/feeds/rss/business/rssfeed.xml', category: 'economy' },
      { url: 'https://www.hindustantimes.com/feeds/rss/technology/rssfeed.xml', category: 'technology' },
      { url: 'https://www.hindustantimes.com/feeds/rss/lifestyle/health/rssfeed.xml', category: 'health' },
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
      { url: 'https://indianexpress.com/section/political-pulse/feed/', category: 'politics' },
      { url: 'https://indianexpress.com/section/world/feed/', category: 'world' },
      { url: 'https://indianexpress.com/section/business/feed/', category: 'economy' },
      { url: 'https://indianexpress.com/section/technology/feed/', category: 'technology' },
      { url: 'https://indianexpress.com/section/sports/feed/', category: 'sports' },
      { url: 'https://indianexpress.com/section/entertainment/feed/', category: 'entertainment' }
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
    defaultEnabled: false,
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
    defaultEnabled: false,
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
    defaultEnabled: false,
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
    defaultEnabled: false,
    feeds: [{ url: 'https://www.livemint.com/rss/news', category: 'economy' }]
  }
]
