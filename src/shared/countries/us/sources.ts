import type { SourceDef } from '../../types'
import { localSources } from './local.ts'

/*
 * United States — English-language national sources, plus two or three local newsrooms
 * per state (see `local.ts`). Every feed was checked on 2026-09-23 (re-check with
 * `npm run verify:feeds us`): stale (> 3 days), empty and bot-blocked feeds dropped.
 *
 * Not included: the Associated Press and USA Today (their feeds answer 403 / no longer
 * serve XML), CNN, whose rss.cnn.com feeds have not been updated for years, and the
 * CBS health feed, which runs days behind.
 *
 * The default set is balanced the way the Turkey pack is: public media and the
 * mainstream dailies alongside Fox News, the Wall Street Journal, the Washington
 * Examiner, the Washington Times, National Review, The Dispatch, The Free Press and
 * Reason from the right, with the tabloid and The Daily Wire off by default.
 */

const nationalSources: SourceDef[] = [
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
      { url: 'https://feeds.npr.org/1008/rss.xml', category: 'culture' },
      { url: 'https://feeds.npr.org/1014/rss.xml', category: 'politics' },
      { url: 'https://feeds.npr.org/1025/rss.xml', category: 'environment' },
      { url: 'https://feeds.npr.org/1013/rss.xml', category: 'education' },
      { url: 'https://feeds.npr.org/1055/rss.xml', category: 'sports' }
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
      { url: 'https://rss.nytimes.com/services/xml/rss/nyt/Arts.xml', category: 'culture' },
      { url: 'https://rss.nytimes.com/services/xml/rss/nyt/US.xml', category: 'national' },
      { url: 'https://rss.nytimes.com/services/xml/rss/nyt/Climate.xml', category: 'environment' },
      { url: 'https://rss.nytimes.com/services/xml/rss/nyt/Education.xml', category: 'education' },
      { url: 'https://rss.nytimes.com/services/xml/rss/nyt/Travel.xml', category: 'travel' },
      { url: 'https://rss.nytimes.com/services/xml/rss/nyt/Opinion.xml', category: 'opinion' }
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
      { url: 'https://feeds.washingtonpost.com/rss/business/technology', category: 'technology' },
      { url: 'https://feeds.washingtonpost.com/rss/business', category: 'economy' },
      { url: 'https://feeds.washingtonpost.com/rss/sports', category: 'sports' },
      { url: 'https://feeds.washingtonpost.com/rss/lifestyle', category: 'lifestyle' },
      { url: 'https://feeds.washingtonpost.com/rss/entertainment', category: 'entertainment' },
      { url: 'https://feeds.washingtonpost.com/rss/opinions', category: 'opinion' }
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
      { url: 'https://feeds.nbcnews.com/nbcnews/public/world', category: 'world' },
      { url: 'https://feeds.nbcnews.com/nbcnews/public/business', category: 'economy' },
      { url: 'https://feeds.nbcnews.com/nbcnews/public/tech', category: 'technology' },
      { url: 'https://feeds.nbcnews.com/nbcnews/public/science', category: 'science' },
      { url: 'https://feeds.nbcnews.com/nbcnews/public/health', category: 'health' }
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
      { url: 'https://www.cbsnews.com/latest/rss/entertainment', category: 'entertainment' },
      { url: 'https://www.cbsnews.com/latest/rss/moneywatch', category: 'economy' }
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
      { url: 'https://abcnews.go.com/abcnews/technologyheadlines', category: 'technology' },
      { url: 'https://abcnews.go.com/abcnews/politicsheadlines', category: 'politics' },
      { url: 'https://abcnews.go.com/abcnews/moneyheadlines', category: 'economy' },
      { url: 'https://abcnews.go.com/abcnews/healthheadlines', category: 'health' },
      { url: 'https://abcnews.go.com/abcnews/entertainmentheadlines', category: 'entertainment' },
      { url: 'https://abcnews.go.com/abcnews/sportsheadlines', category: 'sports' }
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
      { url: 'https://moxie.foxnews.com/google-publisher/world.xml', category: 'world' },
      { url: 'https://moxie.foxnews.com/google-publisher/us.xml', category: 'national' },
      { url: 'https://moxie.foxnews.com/google-publisher/tech.xml', category: 'technology' },
      { url: 'https://moxie.foxnews.com/google-publisher/health.xml', category: 'health' },
      { url: 'https://moxie.foxnews.com/google-publisher/entertainment.xml', category: 'entertainment' },
      { url: 'https://moxie.foxnews.com/google-publisher/travel.xml', category: 'travel' },
      { url: 'https://moxie.foxnews.com/google-publisher/sports.xml', category: 'sports' },
      { url: 'https://moxie.foxnews.com/google-publisher/opinion.xml', category: 'opinion' }
    ]
  },

  {
    id: 'washington-examiner',
    name: 'Washington Examiner',
    homepage: 'https://www.washingtonexaminer.com',
    icon: 'https://www.washingtonexaminer.com/apple-touch-icon.png',
    color: '#0C2C52',
    kind: 'mainstream',
    language: 'en',
    feeds: [{ url: 'https://www.washingtonexaminer.com/feed', category: 'general' }]
  },
  {
    id: 'national-review',
    name: 'National Review',
    homepage: 'https://www.nationalreview.com',
    color: '#1B3F73',
    kind: 'independent',
    language: 'en',
    feeds: [{ url: 'https://www.nationalreview.com/feed/', category: 'opinion' }]
  },
  {
    id: 'new-york-post',
    name: 'New York Post',
    homepage: 'https://nypost.com',
    color: '#C60800',
    kind: 'mainstream',
    language: 'en',
    defaultEnabled: false,
    feeds: [{ url: 'https://nypost.com/feed/', category: 'general' }]
  },
  {
    id: 'washington-times',
    name: 'The Washington Times',
    homepage: 'https://www.washingtontimes.com',
    icon: 'https://www.google.com/s2/favicons?domain=washingtontimes.com&sz=128',
    color: '#1F3B6E',
    kind: 'mainstream',
    language: 'en',
    feeds: [
      { url: 'https://www.washingtontimes.com/rss/headlines/news/', category: 'general' },
      { url: 'https://www.washingtontimes.com/rss/headlines/news/politics/', category: 'politics' }
    ]
  },
  {
    id: 'the-dispatch',
    name: 'The Dispatch',
    homepage: 'https://thedispatch.com',
    icon: 'https://www.google.com/s2/favicons?domain=thedispatch.com&sz=128',
    color: '#1D1D1B',
    kind: 'independent',
    language: 'en',
    feeds: [{ url: 'https://thedispatch.com/feed/', category: 'politics' }]
  },
  {
    id: 'the-free-press',
    name: 'The Free Press',
    homepage: 'https://www.thefp.com',
    icon: 'https://www.google.com/s2/favicons?domain=thefp.com&sz=128',
    color: '#1A1A1A',
    kind: 'independent',
    language: 'en',
    feeds: [{ url: 'https://www.thefp.com/feed', category: 'opinion' }]
  },
  {
    id: 'reason',
    name: 'Reason',
    homepage: 'https://reason.com',
    icon: 'https://www.google.com/s2/favicons?domain=reason.com&sz=128',
    color: '#E2231A',
    kind: 'independent',
    language: 'en',
    feeds: [{ url: 'https://reason.com/feed/', category: 'opinion' }]
  },
  {
    id: 'daily-wire',
    name: 'The Daily Wire',
    homepage: 'https://www.dailywire.com',
    icon: 'https://www.google.com/s2/favicons?domain=dailywire.com&sz=128',
    color: '#1C2331',
    kind: 'independent',
    language: 'en',
    defaultEnabled: false,
    feeds: [{ url: 'https://www.dailywire.com/feeds/rss.xml', category: 'politics' }]
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
  {
    id: 'wall-street-journal',
    name: 'The Wall Street Journal',
    homepage: 'https://www.wsj.com',
    icon: 'https://www.google.com/s2/favicons?domain=wsj.com&sz=128',
    color: '#0080C3',
    kind: 'mainstream',
    language: 'en',
    feeds: [
      { url: 'https://feeds.content.dowjones.io/public/rss/RSSUSnews', category: 'national' },
      { url: 'https://feeds.content.dowjones.io/public/rss/RSSMarketsMain', category: 'economy' }
    ]
  },
  {
    id: 'los-angeles-times',
    name: 'Los Angeles Times',
    homepage: 'https://www.latimes.com',
    icon: 'https://www.google.com/s2/favicons?domain=latimes.com&sz=128',
    color: '#000000',
    kind: 'mainstream',
    language: 'en',
    feeds: [{ url: 'https://www.latimes.com/world-nation/rss2.0.xml', category: 'national' }]
  },
  {
    id: 'csmonitor',
    name: 'The Christian Science Monitor',
    homepage: 'https://www.csmonitor.com',
    icon: 'https://www.google.com/s2/favicons?domain=csmonitor.com&sz=128',
    color: '#E03A3E',
    kind: 'independent',
    language: 'en',
    feeds: [{ url: 'https://rss.csmonitor.com/feeds/all', category: 'general' }]
  },
  {
    id: 'propublica',
    name: 'ProPublica',
    homepage: 'https://www.propublica.org',
    icon: 'https://www.google.com/s2/favicons?domain=propublica.org&sz=128',
    color: '#333333',
    kind: 'independent',
    language: 'en',
    feeds: [{ url: 'https://www.propublica.org/feeds/propublica/main', category: 'national' }]
  },
  {
    id: 'semafor',
    name: 'Semafor',
    homepage: 'https://www.semafor.com',
    icon: 'https://www.google.com/s2/favicons?domain=semafor.com&sz=128',
    color: '#E8A33D',
    kind: 'independent',
    language: 'en',
    feeds: [{ url: 'https://www.semafor.com/rss.xml', category: 'general' }]
  },
  {
    id: 'the-atlantic',
    name: 'The Atlantic',
    homepage: 'https://www.theatlantic.com',
    icon: 'https://www.google.com/s2/favicons?domain=theatlantic.com&sz=128',
    color: '#000000',
    kind: 'independent',
    language: 'en',
    feeds: [{ url: 'https://www.theatlantic.com/feed/all/', category: 'culture' }]
  },
  {
    id: 'vox',
    name: 'Vox',
    homepage: 'https://www.vox.com',
    icon: 'https://www.google.com/s2/favicons?domain=vox.com&sz=128',
    color: '#FFF200',
    kind: 'independent',
    language: 'en',
    feeds: [{ url: 'https://www.vox.com/rss/index.xml', category: 'politics' }]
  },
  {
    id: 'time',
    name: 'TIME',
    homepage: 'https://time.com',
    icon: 'https://www.google.com/s2/favicons?domain=time.com&sz=128',
    color: '#E90606',
    kind: 'mainstream',
    language: 'en',
    feeds: [{ url: 'https://time.com/feed/', category: 'general' }]
  },
  {
    id: 'newsweek',
    name: 'Newsweek',
    homepage: 'https://www.newsweek.com',
    icon: 'https://www.google.com/s2/favicons?domain=newsweek.com&sz=128',
    color: '#E4002B',
    kind: 'mainstream',
    language: 'en',
    feeds: [{ url: 'https://www.newsweek.com/rss', category: 'general' }]
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
  },
  {
    id: 'marketwatch',
    name: 'MarketWatch',
    homepage: 'https://www.marketwatch.com',
    icon: 'https://www.google.com/s2/favicons?domain=marketwatch.com&sz=128',
    color: '#4B8A3A',
    kind: 'business',
    language: 'en',
    feeds: [{ url: 'https://feeds.content.dowjones.io/public/rss/mw_topstories', category: 'economy' }]
  },
  {
    id: 'wired',
    name: 'WIRED',
    homepage: 'https://www.wired.com',
    icon: 'https://www.google.com/s2/favicons?domain=wired.com&sz=128',
    color: '#000000',
    kind: 'technology',
    language: 'en',
    feeds: [{ url: 'https://www.wired.com/feed/rss', category: 'technology' }]
  },
  {
    id: 'techcrunch',
    name: 'TechCrunch',
    homepage: 'https://techcrunch.com',
    icon: 'https://www.google.com/s2/favicons?domain=techcrunch.com&sz=128',
    color: '#0A9E01',
    kind: 'technology',
    language: 'en',
    feeds: [{ url: 'https://techcrunch.com/feed/', category: 'technology' }]
  },
  {
    id: 'engadget',
    name: 'Engadget',
    homepage: 'https://www.engadget.com',
    icon: 'https://www.google.com/s2/favicons?domain=engadget.com&sz=128',
    color: '#1A1A1A',
    kind: 'technology',
    language: 'en',
    feeds: [{ url: 'https://www.engadget.com/rss.xml', category: 'technology' }]
  },
  {
    id: 'scientific-american',
    name: 'Scientific American',
    homepage: 'https://www.scientificamerican.com',
    icon: 'https://www.google.com/s2/favicons?domain=scientificamerican.com&sz=128',
    color: '#CC0000',
    kind: 'mainstream',
    language: 'en',
    feeds: [{ url: 'https://www.scientificamerican.com/platform/syndication/rss/', category: 'science' }]
  },
  {
    id: 'science-news',
    name: 'Science News',
    homepage: 'https://www.sciencenews.org',
    icon: 'https://www.google.com/s2/favicons?domain=sciencenews.org&sz=128',
    color: '#0C3B5E',
    kind: 'independent',
    language: 'en',
    feeds: [{ url: 'https://www.sciencenews.org/feed', category: 'science' }]
  },
  {
    id: 'stat',
    name: 'STAT',
    homepage: 'https://www.statnews.com',
    icon: 'https://www.google.com/s2/favicons?domain=statnews.com&sz=128',
    color: '#D52B1E',
    kind: 'mainstream',
    language: 'en',
    feeds: [{ url: 'https://www.statnews.com/feed/', category: 'health' }]
  },
  {
    id: 'kff-health-news',
    name: 'KFF Health News',
    homepage: 'https://kffhealthnews.org',
    icon: 'https://www.google.com/s2/favicons?domain=kffhealthnews.org&sz=128',
    color: '#1E5D8C',
    kind: 'independent',
    language: 'en',
    feeds: [{ url: 'https://kffhealthnews.org/feed/', category: 'health' }]
  },
  {
    id: 'hechinger-report',
    name: 'The Hechinger Report',
    homepage: 'https://hechingerreport.org',
    icon: 'https://www.google.com/s2/favicons?domain=hechingerreport.org&sz=128',
    color: '#0B4F6C',
    kind: 'independent',
    language: 'en',
    feeds: [{ url: 'https://hechingerreport.org/feed/', category: 'education' }]
  },
  {
    id: 'inside-higher-ed',
    name: 'Inside Higher Ed',
    homepage: 'https://www.insidehighered.com',
    icon: 'https://www.google.com/s2/favicons?domain=insidehighered.com&sz=128',
    color: '#00467F',
    kind: 'independent',
    language: 'en',
    feeds: [{ url: 'https://www.insidehighered.com/rss.xml', category: 'education' }]
  },
  {
    id: 'car-and-driver',
    name: 'Car and Driver',
    homepage: 'https://www.caranddriver.com',
    icon: 'https://www.google.com/s2/favicons?domain=caranddriver.com&sz=128',
    color: '#000000',
    kind: 'mainstream',
    language: 'en',
    feeds: [{ url: 'https://www.caranddriver.com/rss/all.xml/', category: 'automotive' }]
  },
  {
    id: 'electrek',
    name: 'Electrek',
    homepage: 'https://electrek.co',
    icon: 'https://www.google.com/s2/favicons?domain=electrek.co&sz=128',
    color: '#1E9E5A',
    kind: 'technology',
    language: 'en',
    feeds: [{ url: 'https://electrek.co/feed/', category: 'automotive' }]
  },
  {
    id: 'conde-nast-traveler',
    name: 'Condé Nast Traveler',
    homepage: 'https://www.cntraveler.com',
    icon: 'https://www.google.com/s2/favicons?domain=cntraveler.com&sz=128',
    color: '#000000',
    kind: 'mainstream',
    language: 'en',
    feeds: [{ url: 'https://www.cntraveler.com/feed/rss', category: 'travel' }]
  },
  {
    id: 'inside-climate-news',
    name: 'Inside Climate News',
    homepage: 'https://insideclimatenews.org',
    icon: 'https://www.google.com/s2/favicons?domain=insideclimatenews.org&sz=128',
    color: '#1A6A8D',
    kind: 'independent',
    language: 'en',
    feeds: [{ url: 'https://insideclimatenews.org/feed/', category: 'environment' }]
  },
  {
    id: 'grist',
    name: 'Grist',
    homepage: 'https://grist.org',
    icon: 'https://www.google.com/s2/favicons?domain=grist.org&sz=128',
    color: '#3C8D2F',
    kind: 'independent',
    language: 'en',
    feeds: [{ url: 'https://grist.org/feed/', category: 'environment' }]
  },
  {
    id: 'variety',
    name: 'Variety',
    homepage: 'https://variety.com',
    icon: 'https://www.google.com/s2/favicons?domain=variety.com&sz=128',
    color: '#000000',
    kind: 'mainstream',
    language: 'en',
    feeds: [{ url: 'https://variety.com/feed/', category: 'entertainment' }]
  },
  {
    id: 'hollywood-reporter',
    name: 'The Hollywood Reporter',
    homepage: 'https://www.hollywoodreporter.com',
    icon: 'https://www.google.com/s2/favicons?domain=hollywoodreporter.com&sz=128',
    color: '#000000',
    kind: 'mainstream',
    language: 'en',
    feeds: [{ url: 'https://www.hollywoodreporter.com/feed/', category: 'entertainment' }]
  },
  {
    id: 'rolling-stone',
    name: 'Rolling Stone',
    homepage: 'https://www.rollingstone.com',
    icon: 'https://www.google.com/s2/favicons?domain=rollingstone.com&sz=128',
    color: '#D32323',
    kind: 'mainstream',
    language: 'en',
    feeds: [{ url: 'https://www.rollingstone.com/feed/', category: 'culture' }]
  },
  {
    id: 'cbs-sports',
    name: 'CBS Sports',
    homepage: 'https://www.cbssports.com',
    icon: 'https://www.google.com/s2/favicons?domain=cbssports.com&sz=128',
    color: '#0B2A5B',
    kind: 'sports',
    language: 'en',
    feeds: [{ url: 'https://www.cbssports.com/rss/headlines/', category: 'sports' }]
  },
  {
    id: 'yahoo-sports',
    name: 'Yahoo Sports',
    homepage: 'https://sports.yahoo.com',
    icon: 'https://www.google.com/s2/favicons?domain=sports.yahoo.com&sz=128',
    color: '#6001D2',
    kind: 'sports',
    language: 'en',
    feeds: [{ url: 'https://sports.yahoo.com/rss/', category: 'sports' }]
  }
]

export const sources: SourceDef[] = [...nationalSources, ...localSources]
