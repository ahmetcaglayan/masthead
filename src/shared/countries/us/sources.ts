import type { SourceDef } from '../../types'
import { favicon } from '../build.ts'
import { localSources } from './local.ts'

/*
 * United States — English-language national sources, plus two or three local newsrooms
 * per state (see `local.ts`). Every feed was checked on 2026-09-24 (re-check with
 * `npm run verify:feeds us`): stale (> 3 days), empty and bot-blocked feeds dropped.
 *
 * Not included: the Associated Press, Bleacher Report, PCMag, The Chronicle of Higher
 * Education, Autoblog, Fodor's and Frommer's (bot walls answer 403), USA Today (its
 * rssfeeds.usatoday.com feeds redirect to the home page), CNN, whose rss.cnn.com host
 * refuses HTTPS and whose feeds stopped in 2024, People, Entertainment Weekly, Travel +
 * Leisure, Food & Wine and Serious Eats (Dotdash Meredith answers feed readers with 402),
 * The Ringer, MotorTrend, Vulture / New York, WebMD, Scripps News and Stars and Stripes
 * (no feed), Space.com (its feed is empty), RealClearPolitics (it republishes other
 * outlets' stories, foreign ones among them), and the CBS health feed, which runs days
 * behind.
 *
 * The default set is balanced the way the Turkey pack is: public media, the mainstream
 * dailies and networks (MS NOW among them) and the left-leaning magazines Slate, Mother
 * Jones and The New Yorker alongside Fox News, Fox Business, Newsmax, the Wall Street
 * Journal, the Washington Examiner, the Washington Times, National Review, The Dispatch,
 * The Free Press and Reason from the right. Off by default: the tabloid (New York Post),
 * the most partisan sites on both sides (Salon, The Daily Beast, The Nation, The New
 * Republic, The Intercept; The Daily Wire, The Federalist, Breitbart) and niche titles
 * (Kiplinger, MacRumors, Tom's Hardware, Defense One, Military Times).
 */

const nationalSources: SourceDef[] = [
  // Public media and agencies
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
  {
    id: 'upi',
    name: 'UPI',
    homepage: 'https://www.upi.com',
    icon: favicon('upi.com'),
    color: '#B5121B',
    kind: 'agency',
    language: 'en',
    feeds: [
      { url: 'https://rss.upi.com/news/top_news.rss', category: 'top', headline: true },
      { url: 'https://rss.upi.com/news/business_news.rss', category: 'economy' }
    ]
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
    id: 'ms-now',
    name: 'MS NOW',
    homepage: 'https://www.ms.now',
    icon: favicon('ms.now'),
    color: '#1F2A44',
    kind: 'mainstream',
    language: 'en',
    feeds: [{ url: 'https://www.ms.now/feed', category: 'general' }]
  },
  {
    id: 'newsnation',
    name: 'NewsNation',
    homepage: 'https://www.newsnationnow.com',
    icon: favicon('newsnationnow.com'),
    color: '#002D72',
    kind: 'mainstream',
    language: 'en',
    feeds: [{ url: 'https://www.newsnationnow.com/feed/', category: 'general' }]
  },
  {
    id: 'huffpost',
    name: 'HuffPost',
    homepage: 'https://www.huffpost.com',
    icon: favicon('huffpost.com'),
    color: '#0DBE98',
    kind: 'mainstream',
    language: 'en',
    feeds: [
      { url: 'https://www.huffpost.com/section/us-news/feed', category: 'national' },
      { url: 'https://www.huffpost.com/section/politics/feed', category: 'politics' },
      { url: 'https://www.huffpost.com/section/world-news/feed', category: 'world' }
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
    id: 'newsmax',
    name: 'Newsmax',
    homepage: 'https://www.newsmax.com',
    icon: favicon('newsmax.com'),
    color: '#0A2B5C',
    kind: 'mainstream',
    language: 'en',
    feeds: [
      { url: 'https://www.newsmax.com/rss/Newsfront/16/', category: 'general' },
      { url: 'https://www.newsmax.com/rss/Politics/1/', category: 'politics' }
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
    icon: favicon('washingtontimes.com'),
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
    icon: favicon('thedispatch.com'),
    color: '#1D1D1B',
    kind: 'independent',
    language: 'en',
    feeds: [{ url: 'https://thedispatch.com/feed/', category: 'politics' }]
  },
  {
    id: 'the-free-press',
    name: 'The Free Press',
    homepage: 'https://www.thefp.com',
    icon: favicon('thefp.com'),
    color: '#1A1A1A',
    kind: 'independent',
    language: 'en',
    feeds: [{ url: 'https://www.thefp.com/feed', category: 'opinion' }]
  },
  {
    id: 'reason',
    name: 'Reason',
    homepage: 'https://reason.com',
    icon: favicon('reason.com'),
    color: '#E2231A',
    kind: 'independent',
    language: 'en',
    feeds: [{ url: 'https://reason.com/feed/', category: 'opinion' }]
  },
  {
    id: 'daily-wire',
    name: 'The Daily Wire',
    homepage: 'https://www.dailywire.com',
    icon: favicon('dailywire.com'),
    color: '#1C2331',
    kind: 'independent',
    language: 'en',
    defaultEnabled: false,
    feeds: [{ url: 'https://www.dailywire.com/feeds/rss.xml', category: 'politics' }]
  },
  {
    id: 'the-federalist',
    name: 'The Federalist',
    homepage: 'https://thefederalist.com',
    icon: favicon('thefederalist.com'),
    color: '#1A1A1A',
    kind: 'independent',
    language: 'en',
    defaultEnabled: false,
    feeds: [{ url: 'https://thefederalist.com/feed/', category: 'opinion' }]
  },
  {
    id: 'breitbart',
    name: 'Breitbart',
    homepage: 'https://www.breitbart.com',
    icon: favicon('breitbart.com'),
    color: '#FF6A00',
    kind: 'independent',
    language: 'en',
    defaultEnabled: false,
    feeds: [{ url: 'https://feeds.feedburner.com/breitbart', category: 'politics' }]
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
    id: 'roll-call',
    name: 'Roll Call',
    homepage: 'https://rollcall.com',
    icon: favicon('rollcall.com'),
    color: '#1F3864',
    kind: 'independent',
    language: 'en',
    feeds: [{ url: 'https://rollcall.com/feed/', category: 'politics' }]
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
    icon: favicon('wsj.com'),
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
    icon: favicon('latimes.com'),
    color: '#000000',
    kind: 'mainstream',
    language: 'en',
    feeds: [{ url: 'https://www.latimes.com/world-nation/rss2.0.xml', category: 'national' }]
  },
  {
    id: 'csmonitor',
    name: 'The Christian Science Monitor',
    homepage: 'https://www.csmonitor.com',
    icon: favicon('csmonitor.com'),
    color: '#E03A3E',
    kind: 'independent',
    language: 'en',
    feeds: [{ url: 'https://rss.csmonitor.com/feeds/all', category: 'general' }]
  },
  {
    id: 'propublica',
    name: 'ProPublica',
    homepage: 'https://www.propublica.org',
    icon: favicon('propublica.org'),
    color: '#333333',
    kind: 'independent',
    language: 'en',
    feeds: [{ url: 'https://www.propublica.org/feeds/propublica/main', category: 'national' }]
  },
  {
    id: 'semafor',
    name: 'Semafor',
    homepage: 'https://www.semafor.com',
    icon: favicon('semafor.com'),
    color: '#E8A33D',
    kind: 'independent',
    language: 'en',
    feeds: [{ url: 'https://www.semafor.com/rss.xml', category: 'general' }]
  },
  {
    id: 'the-atlantic',
    name: 'The Atlantic',
    homepage: 'https://www.theatlantic.com',
    icon: favicon('theatlantic.com'),
    color: '#000000',
    kind: 'independent',
    language: 'en',
    feeds: [{ url: 'https://www.theatlantic.com/feed/all/', category: 'culture' }]
  },
  {
    id: 'the-new-yorker',
    name: 'The New Yorker',
    homepage: 'https://www.newyorker.com',
    icon: favicon('newyorker.com'),
    color: '#000000',
    kind: 'mainstream',
    language: 'en',
    feeds: [
      { url: 'https://www.newyorker.com/feed/news/rss', category: 'general' },
      { url: 'https://www.newyorker.com/feed/culture/rss', category: 'culture' }
    ]
  },
  {
    id: 'vox',
    name: 'Vox',
    homepage: 'https://www.vox.com',
    icon: favicon('vox.com'),
    color: '#FFF200',
    kind: 'independent',
    language: 'en',
    feeds: [{ url: 'https://www.vox.com/rss/index.xml', category: 'politics' }]
  },
  {
    id: 'slate',
    name: 'Slate',
    homepage: 'https://slate.com',
    icon: favicon('slate.com'),
    color: '#2E2E2E',
    kind: 'independent',
    language: 'en',
    feeds: [
      { url: 'https://slate.com/feeds/news-and-politics.rss', category: 'politics' },
      { url: 'https://slate.com/feeds/culture.rss', category: 'culture' }
    ]
  },
  {
    id: 'mother-jones',
    name: 'Mother Jones',
    homepage: 'https://www.motherjones.com',
    icon: favicon('motherjones.com'),
    color: '#D0021B',
    kind: 'independent',
    language: 'en',
    feeds: [{ url: 'https://www.motherjones.com/feed/', category: 'politics' }]
  },
  {
    id: 'the-bulwark',
    name: 'The Bulwark',
    homepage: 'https://www.thebulwark.com',
    icon: favicon('thebulwark.com'),
    color: '#1D3557',
    kind: 'independent',
    language: 'en',
    feeds: [{ url: 'https://www.thebulwark.com/feed', category: 'opinion' }]
  },
  {
    id: 'the-nation',
    name: 'The Nation',
    homepage: 'https://www.thenation.com',
    icon: favicon('thenation.com'),
    color: '#C8102E',
    kind: 'independent',
    language: 'en',
    defaultEnabled: false,
    feeds: [{ url: 'https://www.thenation.com/feed/?post_type=article', category: 'politics' }]
  },
  {
    id: 'the-new-republic',
    name: 'The New Republic',
    homepage: 'https://newrepublic.com',
    icon: favicon('newrepublic.com'),
    color: '#1A1A1A',
    kind: 'independent',
    language: 'en',
    defaultEnabled: false,
    feeds: [{ url: 'https://newrepublic.com/rss.xml', category: 'politics' }]
  },
  {
    id: 'the-intercept',
    name: 'The Intercept',
    homepage: 'https://theintercept.com',
    icon: favicon('theintercept.com'),
    color: '#000000',
    kind: 'independent',
    language: 'en',
    defaultEnabled: false,
    feeds: [{ url: 'https://theintercept.com/feed/?rss', category: 'politics' }]
  },
  {
    id: 'salon',
    name: 'Salon',
    homepage: 'https://www.salon.com',
    icon: favicon('salon.com'),
    color: '#E8212E',
    kind: 'independent',
    language: 'en',
    defaultEnabled: false,
    feeds: [{ url: 'https://www.salon.com/feed/', category: 'general' }]
  },
  {
    id: 'daily-beast',
    name: 'The Daily Beast',
    homepage: 'https://www.thedailybeast.com',
    icon: favicon('thedailybeast.com'),
    color: '#EB1C24',
    kind: 'independent',
    language: 'en',
    defaultEnabled: false,
    feeds: [{ url: 'https://www.thedailybeast.com/arc/outboundfeeds/rss/articles/', category: 'general' }]
  },
  {
    id: 'time',
    name: 'TIME',
    homepage: 'https://time.com',
    icon: favicon('time.com'),
    color: '#E90606',
    kind: 'mainstream',
    language: 'en',
    feeds: [{ url: 'https://time.com/feed/', category: 'general' }]
  },
  {
    id: 'newsweek',
    name: 'Newsweek',
    homepage: 'https://www.newsweek.com',
    icon: favicon('newsweek.com'),
    color: '#E4002B',
    kind: 'mainstream',
    language: 'en',
    feeds: [{ url: 'https://www.newsweek.com/rss', category: 'general' }]
  },
  {
    id: 'defense-one',
    name: 'Defense One',
    homepage: 'https://www.defenseone.com',
    icon: favicon('defenseone.com'),
    color: '#0B2D4D',
    kind: 'independent',
    language: 'en',
    defaultEnabled: false,
    feeds: [{ url: 'https://www.defenseone.com/rss/all/', category: 'politics' }]
  },
  {
    id: 'military-times',
    name: 'Military Times',
    homepage: 'https://www.militarytimes.com',
    icon: favicon('militarytimes.com'),
    color: '#1B365D',
    kind: 'independent',
    language: 'en',
    defaultEnabled: false,
    feeds: [
      { url: 'https://www.militarytimes.com/arc/outboundfeeds/rss/?outputType=xml', category: 'national' }
    ]
  },

  // Business and markets
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
    id: 'marketwatch',
    name: 'MarketWatch',
    homepage: 'https://www.marketwatch.com',
    icon: favicon('marketwatch.com'),
    color: '#4B8A3A',
    kind: 'business',
    language: 'en',
    feeds: [{ url: 'https://feeds.content.dowjones.io/public/rss/mw_topstories', category: 'economy' }]
  },
  {
    id: 'bloomberg',
    name: 'Bloomberg',
    homepage: 'https://www.bloomberg.com',
    icon: favicon('bloomberg.com'),
    color: '#000000',
    kind: 'business',
    language: 'en',
    feeds: [
      { url: 'https://feeds.bloomberg.com/markets/news.rss', category: 'economy' },
      { url: 'https://feeds.bloomberg.com/politics/news.rss', category: 'politics' },
      { url: 'https://feeds.bloomberg.com/technology/news.rss', category: 'technology' }
    ]
  },
  {
    id: 'fox-business',
    name: 'Fox Business',
    homepage: 'https://www.foxbusiness.com',
    icon: favicon('foxbusiness.com'),
    color: '#003366',
    kind: 'business',
    language: 'en',
    feeds: [{ url: 'https://moxie.foxbusiness.com/google-publisher/latest.xml', category: 'economy' }]
  },
  {
    id: 'business-insider',
    name: 'Business Insider',
    homepage: 'https://www.businessinsider.com',
    icon: favicon('businessinsider.com'),
    color: '#0A2240',
    kind: 'business',
    language: 'en',
    feeds: [{ url: 'https://feeds.businessinsider.com/custom/all', category: 'general' }]
  },
  {
    id: 'forbes',
    name: 'Forbes',
    homepage: 'https://www.forbes.com',
    icon: favicon('forbes.com'),
    color: '#000000',
    kind: 'business',
    language: 'en',
    feeds: [{ url: 'https://www.forbes.com/business/feed/', category: 'economy' }]
  },
  {
    id: 'fortune',
    name: 'Fortune',
    homepage: 'https://fortune.com',
    icon: favicon('fortune.com'),
    color: '#E4002B',
    kind: 'business',
    language: 'en',
    feeds: [{ url: 'https://fortune.com/feed/', category: 'economy' }]
  },
  {
    id: 'kiplinger',
    name: 'Kiplinger',
    homepage: 'https://www.kiplinger.com',
    icon: favicon('kiplinger.com'),
    color: '#005596',
    kind: 'business',
    language: 'en',
    defaultEnabled: false,
    feeds: [{ url: 'https://www.kiplinger.com/feeds.xml', category: 'economy' }]
  },

  // Technology
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
    id: 'wired',
    name: 'WIRED',
    homepage: 'https://www.wired.com',
    icon: favicon('wired.com'),
    color: '#000000',
    kind: 'technology',
    language: 'en',
    feeds: [{ url: 'https://www.wired.com/feed/rss', category: 'technology' }]
  },
  {
    id: 'techcrunch',
    name: 'TechCrunch',
    homepage: 'https://techcrunch.com',
    icon: favicon('techcrunch.com'),
    color: '#0A9E01',
    kind: 'technology',
    language: 'en',
    feeds: [{ url: 'https://techcrunch.com/feed/', category: 'technology' }]
  },
  {
    id: 'engadget',
    name: 'Engadget',
    homepage: 'https://www.engadget.com',
    icon: favicon('engadget.com'),
    color: '#1A1A1A',
    kind: 'technology',
    language: 'en',
    feeds: [{ url: 'https://www.engadget.com/rss.xml', category: 'technology' }]
  },
  {
    id: 'cnet',
    name: 'CNET',
    homepage: 'https://www.cnet.com',
    icon: favicon('cnet.com'),
    color: '#E71D36',
    kind: 'technology',
    language: 'en',
    feeds: [{ url: 'https://www.cnet.com/rss/news/', category: 'technology' }]
  },
  {
    id: 'gizmodo',
    name: 'Gizmodo',
    homepage: 'https://gizmodo.com',
    icon: favicon('gizmodo.com'),
    color: '#000000',
    kind: 'technology',
    language: 'en',
    feeds: [{ url: 'https://gizmodo.com/feed', category: 'technology' }]
  },
  {
    id: 'mit-technology-review',
    name: 'MIT Technology Review',
    homepage: 'https://www.technologyreview.com',
    icon: favicon('technologyreview.com'),
    color: '#000000',
    kind: 'technology',
    language: 'en',
    feeds: [{ url: 'https://www.technologyreview.com/feed/', category: 'technology' }]
  },
  {
    id: 'macrumors',
    name: 'MacRumors',
    homepage: 'https://www.macrumors.com',
    icon: favicon('macrumors.com'),
    color: '#1E6BB8',
    kind: 'technology',
    language: 'en',
    defaultEnabled: false,
    feeds: [{ url: 'https://feeds.macrumors.com/MacRumors-All', category: 'technology' }]
  },
  {
    id: 'toms-hardware',
    name: "Tom's Hardware",
    homepage: 'https://www.tomshardware.com',
    icon: favicon('tomshardware.com'),
    color: '#C4161C',
    kind: 'technology',
    language: 'en',
    defaultEnabled: false,
    feeds: [{ url: 'https://www.tomshardware.com/feeds.xml', category: 'technology' }]
  },

  // Sport
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
    id: 'cbs-sports',
    name: 'CBS Sports',
    homepage: 'https://www.cbssports.com',
    icon: favicon('cbssports.com'),
    color: '#0B2A5B',
    kind: 'sports',
    language: 'en',
    feeds: [{ url: 'https://www.cbssports.com/rss/headlines/', category: 'sports' }]
  },
  {
    id: 'yahoo-sports',
    name: 'Yahoo Sports',
    homepage: 'https://sports.yahoo.com',
    icon: favicon('sports.yahoo.com'),
    color: '#6001D2',
    kind: 'sports',
    language: 'en',
    feeds: [{ url: 'https://sports.yahoo.com/rss/', category: 'sports' }]
  },
  {
    id: 'fox-sports',
    name: 'FOX Sports',
    homepage: 'https://www.foxsports.com',
    icon: favicon('foxsports.com'),
    color: '#002244',
    kind: 'sports',
    language: 'en',
    feeds: [
      {
        url: 'https://api.foxsports.com/v2/content/optimized-rss?partnerKey=MB0Wehpmuj2lUhuRhQaafhBjAJqaPU244mlTDK1i&size=30',
        category: 'sports'
      }
    ]
  },
  {
    id: 'sports-illustrated',
    name: 'Sports Illustrated',
    homepage: 'https://www.si.com',
    icon: favicon('si.com'),
    color: '#E11B22',
    kind: 'sports',
    language: 'en',
    feeds: [{ url: 'https://www.si.com/feed', category: 'sports' }]
  },
  {
    id: 'the-athletic',
    name: 'The Athletic',
    homepage: 'https://www.nytimes.com/athletic/',
    icon: favicon('theathletic.com'),
    color: '#000000',
    kind: 'sports',
    language: 'en',
    feeds: [{ url: 'https://www.nytimes.com/athletic/rss/news/', category: 'sports' }]
  },

  // Science and health
  {
    id: 'scientific-american',
    name: 'Scientific American',
    homepage: 'https://www.scientificamerican.com',
    icon: favicon('scientificamerican.com'),
    color: '#CC0000',
    kind: 'mainstream',
    language: 'en',
    feeds: [{ url: 'https://www.scientificamerican.com/platform/syndication/rss/', category: 'science' }]
  },
  {
    id: 'science-news',
    name: 'Science News',
    homepage: 'https://www.sciencenews.org',
    icon: favicon('sciencenews.org'),
    color: '#0C3B5E',
    kind: 'independent',
    language: 'en',
    feeds: [{ url: 'https://www.sciencenews.org/feed', category: 'science' }]
  },
  {
    id: 'popular-science',
    name: 'Popular Science',
    homepage: 'https://www.popsci.com',
    icon: favicon('popsci.com'),
    color: '#000000',
    kind: 'mainstream',
    language: 'en',
    feeds: [{ url: 'https://www.popsci.com/feed/', category: 'science' }]
  },
  {
    id: 'live-science',
    name: 'Live Science',
    homepage: 'https://www.livescience.com',
    icon: favicon('livescience.com'),
    color: '#1B75BB',
    kind: 'mainstream',
    language: 'en',
    feeds: [{ url: 'https://www.livescience.com/feeds.xml', category: 'science' }]
  },
  {
    id: 'smithsonian-magazine',
    name: 'Smithsonian Magazine',
    homepage: 'https://www.smithsonianmag.com',
    icon: favicon('smithsonianmag.com'),
    color: '#003A70',
    kind: 'mainstream',
    language: 'en',
    feeds: [{ url: 'https://www.smithsonianmag.com/rss/latest_articles/', category: 'science' }]
  },
  {
    id: 'stat',
    name: 'STAT',
    homepage: 'https://www.statnews.com',
    icon: favicon('statnews.com'),
    color: '#D52B1E',
    kind: 'mainstream',
    language: 'en',
    feeds: [{ url: 'https://www.statnews.com/feed/', category: 'health' }]
  },
  {
    id: 'kff-health-news',
    name: 'KFF Health News',
    homepage: 'https://kffhealthnews.org',
    icon: favicon('kffhealthnews.org'),
    color: '#1E5D8C',
    kind: 'independent',
    language: 'en',
    feeds: [{ url: 'https://kffhealthnews.org/feed/', category: 'health' }]
  },
  {
    id: 'medpage-today',
    name: 'MedPage Today',
    homepage: 'https://www.medpagetoday.com',
    icon: favicon('medpagetoday.com'),
    color: '#00539F',
    kind: 'mainstream',
    language: 'en',
    feeds: [{ url: 'https://www.medpagetoday.com/rss/headlines.xml', category: 'health' }]
  },

  // Education, environment, travel and cars
  {
    id: 'hechinger-report',
    name: 'The Hechinger Report',
    homepage: 'https://hechingerreport.org',
    icon: favicon('hechingerreport.org'),
    color: '#0B4F6C',
    kind: 'independent',
    language: 'en',
    feeds: [{ url: 'https://hechingerreport.org/feed/', category: 'education' }]
  },
  {
    id: 'inside-higher-ed',
    name: 'Inside Higher Ed',
    homepage: 'https://www.insidehighered.com',
    icon: favicon('insidehighered.com'),
    color: '#00467F',
    kind: 'independent',
    language: 'en',
    feeds: [{ url: 'https://www.insidehighered.com/rss.xml', category: 'education' }]
  },
  {
    id: 'education-week',
    name: 'Education Week',
    homepage: 'https://www.edweek.org',
    icon: favicon('edweek.org'),
    color: '#002F6C',
    kind: 'independent',
    language: 'en',
    feeds: [{ url: 'https://www.edweek.org/index.rss', category: 'education' }]
  },
  {
    id: 'chalkbeat',
    name: 'Chalkbeat',
    homepage: 'https://www.chalkbeat.org',
    icon: favicon('chalkbeat.org'),
    color: '#1A1A1A',
    kind: 'independent',
    language: 'en',
    feeds: [{ url: 'https://www.chalkbeat.org/arc/outboundfeeds/rss/?outputType=xml', category: 'education' }]
  },
  {
    id: 'inside-climate-news',
    name: 'Inside Climate News',
    homepage: 'https://insideclimatenews.org',
    icon: favicon('insideclimatenews.org'),
    color: '#1A6A8D',
    kind: 'independent',
    language: 'en',
    feeds: [{ url: 'https://insideclimatenews.org/feed/', category: 'environment' }]
  },
  {
    id: 'grist',
    name: 'Grist',
    homepage: 'https://grist.org',
    icon: favicon('grist.org'),
    color: '#3C8D2F',
    kind: 'independent',
    language: 'en',
    feeds: [{ url: 'https://grist.org/feed/', category: 'environment' }]
  },
  {
    id: 'heatmap',
    name: 'Heatmap News',
    homepage: 'https://heatmap.news',
    icon: favicon('heatmap.news'),
    color: '#F04E23',
    kind: 'independent',
    language: 'en',
    feeds: [{ url: 'https://heatmap.news/feeds/feed.rss', category: 'environment' }]
  },
  {
    id: 'conde-nast-traveler',
    name: 'Condé Nast Traveler',
    homepage: 'https://www.cntraveler.com',
    icon: favicon('cntraveler.com'),
    color: '#000000',
    kind: 'mainstream',
    language: 'en',
    feeds: [{ url: 'https://www.cntraveler.com/feed/rss', category: 'travel' }]
  },
  {
    id: 'the-points-guy',
    name: 'The Points Guy',
    homepage: 'https://thepointsguy.com',
    icon: favicon('thepointsguy.com'),
    color: '#2F6BD5',
    kind: 'independent',
    language: 'en',
    feeds: [{ url: 'https://thepointsguy.com/feed/', category: 'travel' }]
  },
  {
    id: 'car-and-driver',
    name: 'Car and Driver',
    homepage: 'https://www.caranddriver.com',
    icon: favicon('caranddriver.com'),
    color: '#000000',
    kind: 'mainstream',
    language: 'en',
    feeds: [{ url: 'https://www.caranddriver.com/rss/all.xml/', category: 'automotive' }]
  },
  {
    id: 'road-and-track',
    name: 'Road & Track',
    homepage: 'https://www.roadandtrack.com',
    icon: favicon('roadandtrack.com'),
    color: '#000000',
    kind: 'mainstream',
    language: 'en',
    feeds: [{ url: 'https://www.roadandtrack.com/rss/all.xml/', category: 'automotive' }]
  },
  {
    id: 'jalopnik',
    name: 'Jalopnik',
    homepage: 'https://www.jalopnik.com',
    icon: favicon('jalopnik.com'),
    color: '#1A1A1A',
    kind: 'independent',
    language: 'en',
    feeds: [{ url: 'https://www.jalopnik.com/feed/', category: 'automotive' }]
  },
  {
    id: 'electrek',
    name: 'Electrek',
    homepage: 'https://electrek.co',
    icon: favicon('electrek.co'),
    color: '#1E9E5A',
    kind: 'technology',
    language: 'en',
    feeds: [{ url: 'https://electrek.co/feed/', category: 'automotive' }]
  },

  // Entertainment, culture and lifestyle
  {
    id: 'variety',
    name: 'Variety',
    homepage: 'https://variety.com',
    icon: favicon('variety.com'),
    color: '#000000',
    kind: 'mainstream',
    language: 'en',
    feeds: [{ url: 'https://variety.com/feed/', category: 'entertainment' }]
  },
  {
    id: 'hollywood-reporter',
    name: 'The Hollywood Reporter',
    homepage: 'https://www.hollywoodreporter.com',
    icon: favicon('hollywoodreporter.com'),
    color: '#000000',
    kind: 'mainstream',
    language: 'en',
    feeds: [{ url: 'https://www.hollywoodreporter.com/feed/', category: 'entertainment' }]
  },
  {
    id: 'deadline',
    name: 'Deadline',
    homepage: 'https://deadline.com',
    icon: favicon('deadline.com'),
    color: '#000000',
    kind: 'mainstream',
    language: 'en',
    feeds: [{ url: 'https://deadline.com/feed/', category: 'entertainment' }]
  },
  {
    id: 'billboard',
    name: 'Billboard',
    homepage: 'https://www.billboard.com',
    icon: favicon('billboard.com'),
    color: '#000000',
    kind: 'mainstream',
    language: 'en',
    feeds: [{ url: 'https://www.billboard.com/feed/', category: 'entertainment' }]
  },
  {
    id: 'rolling-stone',
    name: 'Rolling Stone',
    homepage: 'https://www.rollingstone.com',
    icon: favicon('rollingstone.com'),
    color: '#D32323',
    kind: 'mainstream',
    language: 'en',
    feeds: [{ url: 'https://www.rollingstone.com/feed/', category: 'culture' }]
  },
  {
    id: 'pitchfork',
    name: 'Pitchfork',
    homepage: 'https://pitchfork.com',
    icon: favicon('pitchfork.com'),
    color: '#000000',
    kind: 'mainstream',
    language: 'en',
    feeds: [{ url: 'https://pitchfork.com/feed/feed-news/rss', category: 'culture' }]
  },
  {
    id: 'vanity-fair',
    name: 'Vanity Fair',
    homepage: 'https://www.vanityfair.com',
    icon: favicon('vanityfair.com'),
    color: '#000000',
    kind: 'mainstream',
    language: 'en',
    feeds: [{ url: 'https://www.vanityfair.com/feed/rss', category: 'culture' }]
  },
  {
    id: 'vogue',
    name: 'Vogue',
    homepage: 'https://www.vogue.com',
    icon: favicon('vogue.com'),
    color: '#000000',
    kind: 'mainstream',
    language: 'en',
    feeds: [{ url: 'https://www.vogue.com/feed/rss', category: 'lifestyle' }]
  },
  {
    id: 'gq',
    name: 'GQ',
    homepage: 'https://www.gq.com',
    icon: favicon('gq.com'),
    color: '#000000',
    kind: 'mainstream',
    language: 'en',
    feeds: [{ url: 'https://www.gq.com/feed/rss', category: 'lifestyle' }]
  },
  {
    id: 'esquire',
    name: 'Esquire',
    homepage: 'https://www.esquire.com',
    icon: favicon('esquire.com'),
    color: '#000000',
    kind: 'mainstream',
    language: 'en',
    feeds: [{ url: 'https://www.esquire.com/rss/all.xml/', category: 'lifestyle' }]
  },
  {
    id: 'bon-appetit',
    name: 'Bon Appétit',
    homepage: 'https://www.bonappetit.com',
    icon: favicon('bonappetit.com'),
    color: '#D72027',
    kind: 'mainstream',
    language: 'en',
    feeds: [{ url: 'https://www.bonappetit.com/feed/rss', category: 'lifestyle' }]
  },
  {
    id: 'eater',
    name: 'Eater',
    homepage: 'https://www.eater.com',
    icon: favicon('eater.com'),
    color: '#E60023',
    kind: 'independent',
    language: 'en',
    feeds: [{ url: 'https://www.eater.com/rss/index.xml', category: 'lifestyle' }]
  }
]

export const sources: SourceDef[] = [...nationalSources, ...localSources]
