import type { SourceDef } from '../../types'

/*
 * United States — English-language national sources. Every feed was checked on
 * 2026-09-23 (re-check with `npm run verify:feeds us`): one feed per category,
 * stale (> 3 days), empty and bot-blocked feeds dropped.
 *
 * Not included: the Associated Press and USA Today (their feeds answer 403 /
 * no longer serve XML), CNN, whose rss.cnn.com feeds have not been updated for
 * years, and the CBS health feed, which runs days behind (NPR and the NYT cover
 * health here).
 */

export const sources: SourceDef[] = [
  // Public media
  {
    id: 'npr',
    name: 'NPR',
    homepage: 'https://www.npr.org',
    icon: 'https://media.npr.org/chrome/favicon/favicon.ico',
    color: '#0F5C9E',
    kind: 'public',
    language: 'en',
    feeds: [
      { url: 'https://feeds.npr.org/1001/rss.xml', category: 'top', headline: true },
      { url: 'https://feeds.npr.org/1003/rss.xml', category: 'national' },
      { url: 'https://feeds.npr.org/1004/rss.xml', category: 'world' },
      { url: 'https://feeds.npr.org/1006/rss.xml', category: 'economy' },
      { url: 'https://feeds.npr.org/1019/rss.xml', category: 'technology' },
      { url: 'https://feeds.npr.org/1007/rss.xml', category: 'science' },
      { url: 'https://feeds.npr.org/1128/rss.xml', category: 'health' },
      { url: 'https://feeds.npr.org/1008/rss.xml', category: 'culture' }
    ]
  },
  {
    id: 'pbs-newshour',
    name: 'PBS NewsHour',
    homepage: 'https://www.pbs.org/newshour',
    icon: 'https://www-tc.pbs.org/apple-touch-icon.png',
    color: '#2638C4',
    kind: 'public',
    language: 'en',
    feeds: [{ url: 'https://www.pbs.org/newshour/feeds/rss/headlines', category: 'top', headline: true }]
  },

  // Mainstream
  {
    id: 'nytimes',
    name: 'The New York Times',
    homepage: 'https://www.nytimes.com',
    icon: 'https://www.nytimes.com/favicon.ico',
    color: '#121212',
    kind: 'mainstream',
    language: 'en',
    feeds: [
      { url: 'https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml', category: 'top', headline: true },
      { url: 'https://rss.nytimes.com/services/xml/rss/nyt/Politics.xml', category: 'politics' },
      { url: 'https://rss.nytimes.com/services/xml/rss/nyt/World.xml', category: 'world' },
      { url: 'https://rss.nytimes.com/services/xml/rss/nyt/Business.xml', category: 'economy' },
      { url: 'https://rss.nytimes.com/services/xml/rss/nyt/Technology.xml', category: 'technology' },
      { url: 'https://rss.nytimes.com/services/xml/rss/nyt/Science.xml', category: 'science' },
      { url: 'https://rss.nytimes.com/services/xml/rss/nyt/Health.xml', category: 'health' },
      { url: 'https://rss.nytimes.com/services/xml/rss/nyt/Arts.xml', category: 'culture' }
    ]
  },
  {
    id: 'washington-post',
    name: 'The Washington Post',
    homepage: 'https://www.washingtonpost.com',
    icon: 'https://www.washingtonpost.com/touch-icons/apple-touch-icon.png',
    color: '#1A1A1A',
    kind: 'mainstream',
    language: 'en',
    feeds: [
      { url: 'https://feeds.washingtonpost.com/rss/national', category: 'national', headline: true },
      { url: 'https://feeds.washingtonpost.com/rss/politics', category: 'politics' },
      { url: 'https://feeds.washingtonpost.com/rss/world', category: 'world' },
      { url: 'https://feeds.washingtonpost.com/rss/business/technology', category: 'technology' }
    ]
  },
  {
    id: 'nbc-news',
    name: 'NBC News',
    homepage: 'https://www.nbcnews.com',
    color: '#1B4DB1',
    kind: 'mainstream',
    language: 'en',
    feeds: [
      { url: 'https://feeds.nbcnews.com/nbcnews/public/news', category: 'top', headline: true },
      { url: 'https://feeds.nbcnews.com/nbcnews/public/politics', category: 'politics' },
      { url: 'https://feeds.nbcnews.com/nbcnews/public/world', category: 'world' }
    ]
  },
  {
    id: 'cbs-news',
    name: 'CBS News',
    homepage: 'https://www.cbsnews.com',
    icon: 'https://www.cbsnews.com/apple-touch-icon.png',
    color: '#0033A0',
    kind: 'mainstream',
    language: 'en',
    feeds: [
      { url: 'https://www.cbsnews.com/latest/rss/main', category: 'top', headline: true },
      { url: 'https://www.cbsnews.com/latest/rss/us', category: 'national' },
      { url: 'https://www.cbsnews.com/latest/rss/politics', category: 'politics' },
      { url: 'https://www.cbsnews.com/latest/rss/world', category: 'world' },
      { url: 'https://www.cbsnews.com/latest/rss/technology', category: 'technology' },
      { url: 'https://www.cbsnews.com/latest/rss/science', category: 'science' },
      { url: 'https://www.cbsnews.com/latest/rss/entertainment', category: 'entertainment' }
    ]
  },
  {
    id: 'abc-news',
    name: 'ABC News',
    homepage: 'https://abcnews.go.com',
    icon: 'https://abcnews.com/apple-touch-icon.png',
    color: '#0C1B33',
    kind: 'mainstream',
    language: 'en',
    feeds: [
      { url: 'https://abcnews.go.com/abcnews/topstories', category: 'top', headline: true },
      { url: 'https://abcnews.go.com/abcnews/usheadlines', category: 'national' },
      { url: 'https://abcnews.go.com/abcnews/internationalheadlines', category: 'world' },
      { url: 'https://abcnews.go.com/abcnews/technologyheadlines', category: 'technology' }
    ]
  },
  {
    id: 'fox-news',
    name: 'Fox News',
    homepage: 'https://www.foxnews.com',
    icon: 'https://www.foxnews.com/apple-touch-icon.png',
    color: '#003366',
    kind: 'mainstream',
    language: 'en',
    feeds: [
      { url: 'https://moxie.foxnews.com/google-publisher/latest.xml', category: 'top', headline: true },
      { url: 'https://moxie.foxnews.com/google-publisher/politics.xml', category: 'politics' },
      { url: 'https://moxie.foxnews.com/google-publisher/world.xml', category: 'world' }
    ]
  },

  // Politics and independent
  {
    id: 'politico',
    name: 'Politico',
    homepage: 'https://www.politico.com',
    color: '#CE0E2D',
    kind: 'independent',
    language: 'en',
    feeds: [{ url: 'https://rss.politico.com/politics-news.xml', category: 'politics' }]
  },
  {
    id: 'the-hill',
    name: 'The Hill',
    homepage: 'https://thehill.com',
    icon: 'https://thehill.com/apple-touch-icon.png',
    color: '#1B3A6B',
    kind: 'independent',
    language: 'en',
    feeds: [{ url: 'https://thehill.com/news/feed/', category: 'politics' }]
  },
  {
    id: 'axios',
    name: 'Axios',
    homepage: 'https://www.axios.com',
    icon: 'https://www.axios.com/apple-touch-icon.png',
    color: '#E1442A',
    kind: 'independent',
    language: 'en',
    feeds: [{ url: 'https://api.axios.com/feed/', category: 'general' }]
  },

  // Business, technology, sport
  {
    id: 'cnbc',
    name: 'CNBC',
    homepage: 'https://www.cnbc.com',
    icon: 'https://www.cnbc.com/apple-touch-icon.png',
    color: '#005594',
    kind: 'business',
    language: 'en',
    feeds: [
      {
        url: 'https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=100003114',
        category: 'economy'
      },
      {
        url: 'https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=19854910',
        category: 'technology'
      }
    ]
  },
  {
    id: 'the-verge',
    name: 'The Verge',
    homepage: 'https://www.theverge.com',
    icon: 'https://cdn.vox-cdn.com/verge/favicon.ico',
    color: '#5200FF',
    kind: 'technology',
    language: 'en',
    feeds: [{ url: 'https://www.theverge.com/rss/index.xml', category: 'technology' }]
  },
  {
    id: 'ars-technica',
    name: 'Ars Technica',
    homepage: 'https://arstechnica.com',
    color: '#FF4E00',
    kind: 'technology',
    language: 'en',
    feeds: [{ url: 'https://feeds.arstechnica.com/arstechnica/index', category: 'technology' }]
  },
  {
    id: 'espn',
    name: 'ESPN',
    homepage: 'https://www.espn.com',
    icon: 'https://www.espn.com/apple-touch-icon.png',
    color: '#D50A0A',
    kind: 'sports',
    language: 'en',
    feeds: [{ url: 'https://www.espn.com/espn/rss/news', category: 'sports' }]
  }
]
