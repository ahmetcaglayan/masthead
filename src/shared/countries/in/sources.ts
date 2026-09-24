import type { SourceDef } from '../../types'
import { favicon } from '../build.ts'
import { localSources } from './local.ts'

/*
 * India — the Hindi press. Someone who picks India reads India's news in Hindi, so every
 * source here writes in Hindi: the big dailies, the Hindi news channels, the UNI Varta
 * agency, the Hindi business and specialist desks, independent newsrooms, BBC Hindi and
 * UN News Hindi. India's English-language papers are left out on purpose; a country's front
 * page is written in its own language. Every feed was checked on 2026-09-23 and the pack
 * was widened on 2026-09-24 (re-check with `npm run verify:feeds in`). Secondary specialist
 * sites and party-aligned outlets are off by default.
 *
 * Not included: Jansatta (the feeds redirect to the homepage); Republic Bharat (every feed
 * a month old); Aaj Tak's section feeds (only the home feed is offered); ABP News' section
 * feeds, Dainik Jagran's topic feeds and Business Standard Hindi's section feeds (stale for
 * days to years, or HTTP 500); Nai Dunia, The Lallantop, Punjab Kesari / Navodaya Times,
 * Moneycontrol Hindi, CNBC Awaaz, Economic Times Hindi, Mint Hindi, Jagran Josh, News24,
 * Gaon Connection and Hindusthan Samachar (no public feed); Financial Express Hindi (410);
 * IBC24, NewsClick Hindi, Dainik Tribune, Lokmat Samachar and Raj Express (403 to feed
 * readers); DD News and All India Radio (no Hindi feed; their feeds time out); DW Hindi (no
 * Hindi feed on rss.dw.com); Haribhoomi (one 100-item full-text feed, 0.5 MB) and
 * Grehlakshmi (0.7 MB); Newslaundry Hindi and Sportskeeda Hindi (their feeds carry English
 * stories); Mongabay Hindi (dates written with Hindi month names); Gadgets 360 Hindi (a
 * single 1,000-item feed); Oneindia's technology, business, lifestyle and politics feeds,
 * Patrika's technology feeds and Zee News' lifestyle and health feeds (stale or empty);
 * Deshbandhu (its only feed is weeks old).
 */

const nationalSources: SourceDef[] = [
  // Dailies
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
      { url: 'https://www.amarujala.com/rss/breaking-news.xml', category: 'breaking', breaking: true },
      { url: 'https://www.amarujala.com/rss/world.xml', category: 'world' },
      { url: 'https://www.amarujala.com/rss/business.xml', category: 'economy' },
      { url: 'https://www.amarujala.com/rss/sports.xml', category: 'sports' },
      { url: 'https://www.amarujala.com/rss/technology.xml', category: 'technology' },
      { url: 'https://www.amarujala.com/rss/fitness.xml', category: 'health' },
      { url: 'https://www.amarujala.com/rss/entertainment.xml', category: 'entertainment' },
      { url: 'https://www.amarujala.com/rss/lifestyle.xml', category: 'lifestyle' },
      { url: 'https://www.amarujala.com/rss/education.xml', category: 'education' },
      { url: 'https://www.amarujala.com/rss/automobiles.xml', category: 'automotive' },
      { url: 'https://www.amarujala.com/rss/opinion.xml', category: 'opinion' }
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
      { url: 'https://www.bhaskar.com/rss-v1--category-1125.xml', category: 'world' },
      { url: 'https://www.bhaskar.com/rss-v1--category-1051.xml', category: 'economy' },
      { url: 'https://www.bhaskar.com/rss-v1--category-1053.xml', category: 'sports' },
      { url: 'https://www.bhaskar.com/rss-v1--category-5707.xml', category: 'technology' },
      { url: 'https://www.bhaskar.com/rss-v1--category-3998.xml', category: 'entertainment' },
      { url: 'https://www.bhaskar.com/rss-v1--category-1057.xml', category: 'lifestyle' },
      { url: 'https://www.bhaskar.com/rss-v1--category-11945.xml', category: 'education' },
      { url: 'https://www.bhaskar.com/rss-v1--category-1944.xml', category: 'opinion' }
    ]
  },
  {
    id: 'dainik-jagran',
    name: 'दैनिक जागरण',
    homepage: 'https://www.jagran.com',
    icon: 'https://www.google.com/s2/favicons?domain=jagran.com&sz=128',
    color: '#D71920',
    kind: 'mainstream',
    language: 'hi',
    feeds: [
      { url: 'https://rss.jagran.com/rss/news/national.xml', category: 'national' },
      { url: 'https://rss.jagran.com/rss/news/education.xml', category: 'education' }
    ]
  },
  {
    id: 'prabhat-khabar',
    name: 'प्रभात खबर',
    homepage: 'https://www.prabhatkhabar.com',
    icon: 'https://www.google.com/s2/favicons?domain=prabhatkhabar.com&sz=128',
    color: '#D32027',
    kind: 'mainstream',
    language: 'hi',
    feeds: [
      { url: 'https://www.prabhatkhabar.com/feed', category: 'general' },
      { url: 'https://www.prabhatkhabar.com/national/feed', category: 'national' },
      { url: 'https://www.prabhatkhabar.com/world/feed', category: 'world' },
      { url: 'https://www.prabhatkhabar.com/business/feed', category: 'economy' },
      { url: 'https://www.prabhatkhabar.com/sports/feed', category: 'sports' },
      { url: 'https://www.prabhatkhabar.com/entertainment/feed', category: 'entertainment' },
      { url: 'https://www.prabhatkhabar.com/life-and-style/feed', category: 'lifestyle' }
    ]
  },
  {
    id: 'navbharat-times',
    name: 'नवभारत टाइम्स',
    homepage: 'https://navbharattimes.indiatimes.com',
    icon: favicon('navbharattimes.indiatimes.com'),
    color: '#E0282E',
    kind: 'mainstream',
    language: 'hi',
    feeds: [
      {
        url: 'https://navbharattimes.indiatimes.com/langapi/sitemap/gstandrssfeed.xml',
        category: 'top',
        headline: true
      },
      { url: 'https://navbharattimes.indiatimes.com/india/rssfeed/1564454.xml', category: 'national' },
      { url: 'https://navbharattimes.indiatimes.com/world/rssfeed/2279801.xml', category: 'world' },
      { url: 'https://navbharattimes.indiatimes.com/business/rssfeed/2279786.xml', category: 'economy' },
      { url: 'https://navbharattimes.indiatimes.com/sports/rssfeed/2279790.xml', category: 'sports' },
      { url: 'https://navbharattimes.indiatimes.com/tech/rssfeed/19615041.xml', category: 'technology' },
      {
        url: 'https://navbharattimes.indiatimes.com/world/science-news/rssfeed/2355184.xml',
        category: 'science'
      },
      {
        url: 'https://navbharattimes.indiatimes.com/health-wellness/rssfeed/127795157.xml',
        category: 'health'
      },
      {
        url: 'https://navbharattimes.indiatimes.com/entertainment/rssfeed/2279793.xml',
        category: 'entertainment'
      },
      { url: 'https://navbharattimes.indiatimes.com/lifestyle/rssfeed/2354729.xml', category: 'lifestyle' },
      // Astrology and religion.
      { url: 'https://navbharattimes.indiatimes.com/astro/rssfeed/17127056.xml', category: 'lifestyle' },
      {
        url: 'https://navbharattimes.indiatimes.com/education/education-news/rssfeed/2303761.xml',
        category: 'education'
      },
      {
        url: 'https://navbharattimes.indiatimes.com/auto/car-bikes/rssfeed/2355188.xml',
        category: 'automotive'
      }
    ]
  },
  {
    // Hindustan's site. Its Uttar Pradesh feed is empty and its breaking feed months old.
    id: 'live-hindustan',
    name: 'लाइव हिन्दुस्तान',
    homepage: 'https://www.livehindustan.com',
    icon: favicon('livehindustan.com'),
    color: '#E31E24',
    kind: 'mainstream',
    language: 'hi',
    feeds: [
      { url: 'https://api.livehindustan.com/feeds/rss/national/rssfeed.xml', category: 'national' },
      { url: 'https://api.livehindustan.com/feeds/rss/international/rssfeed.xml', category: 'world' },
      { url: 'https://api.livehindustan.com/feeds/rss/business/rssfeed.xml', category: 'economy' },
      { url: 'https://api.livehindustan.com/feeds/rss/cricket/rssfeed.xml', category: 'sports' },
      { url: 'https://api.livehindustan.com/feeds/rss/gadgets/rssfeed.xml', category: 'technology' },
      { url: 'https://api.livehindustan.com/feeds/rss/lifestyle/health/rssfeed.xml', category: 'health' },
      { url: 'https://api.livehindustan.com/feeds/rss/entertainment/rssfeed.xml', category: 'entertainment' },
      { url: 'https://api.livehindustan.com/feeds/rss/lifestyle/rssfeed.xml', category: 'lifestyle' },
      { url: 'https://api.livehindustan.com/feeds/rss/astrology/rssfeed.xml', category: 'lifestyle' },
      { url: 'https://api.livehindustan.com/feeds/rss/lifestyle/travel/rssfeed.xml', category: 'travel' },
      { url: 'https://api.livehindustan.com/feeds/rss/career/rssfeed.xml', category: 'education' },
      { url: 'https://api.livehindustan.com/feeds/rss/auto/rssfeed.xml', category: 'automotive' },
      { url: 'https://api.livehindustan.com/feeds/rss/blog/rssfeed.xml', category: 'opinion' }
    ]
  },
  {
    // Rajasthan Patrika. Its feeds are the ones listed on patrika.com/rss.
    id: 'patrika',
    name: 'पत्रिका',
    homepage: 'https://www.patrika.com',
    icon: favicon('patrika.com'),
    color: '#C8102E',
    kind: 'mainstream',
    language: 'hi',
    feeds: [
      { url: 'https://cms.patrika.com/googlefeed/blog/category/national-news', category: 'national' },
      { url: 'https://cms.patrika.com/googlefeed/blog/category/world-news', category: 'world' },
      { url: 'https://cms.patrika.com/googlefeed/blog/category/political-news', category: 'politics' },
      { url: 'https://cms.patrika.com/googlefeed/blog/category/business-news', category: 'economy' },
      { url: 'https://cms.patrika.com/googlefeed/blog/category/sports-news', category: 'sports' },
      { url: 'https://cms.patrika.com/googlefeed/blog/category/health-news', category: 'health' },
      {
        url: 'https://cms.patrika.com/googlefeed/blog/category/entertainment-news',
        category: 'entertainment'
      },
      { url: 'https://cms.patrika.com/googlefeed/blog/category/lifestyle-news', category: 'lifestyle' },
      {
        url: 'https://cms.patrika.com/googlefeed/blog/category/astrology-and-spirituality',
        category: 'lifestyle'
      },
      { url: 'https://cms.patrika.com/googlefeed/blog/category/education-news', category: 'education' },
      { url: 'https://cms.patrika.com/googlefeed/blog/category/automobile-news', category: 'automotive' },
      { url: 'https://cms.patrika.com/googlefeed/blog/category/opinion', category: 'opinion' }
    ]
  },

  // News channels
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
      { url: 'https://feeds.feedburner.com/ndtvkhabar-business', category: 'economy' },
      { url: 'https://feeds.feedburner.com/ndtvkhabar-sports', category: 'sports' }
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
      { url: 'https://hindi.news18.com/commonfeeds/v1/hin/rss/health.xml', category: 'health' },
      { url: 'https://hindi.news18.com/commonfeeds/v1/hin/rss/entertainment.xml', category: 'entertainment' },
      { url: 'https://hindi.news18.com/commonfeeds/v1/hin/rss/lifestyle.xml', category: 'lifestyle' },
      { url: 'https://hindi.news18.com/commonfeeds/v1/hin/rss/career.xml', category: 'education' },
      { url: 'https://hindi.news18.com/commonfeeds/v1/hin/rss/auto.xml', category: 'automotive' }
    ]
  },
  {
    id: 'tv9-bharatvarsh',
    name: 'TV9 भारतवर्ष',
    homepage: 'https://www.tv9hindi.com',
    icon: 'https://www.google.com/s2/favicons?domain=tv9hindi.com&sz=128',
    color: '#E4252B',
    kind: 'mainstream',
    language: 'hi',
    feeds: [
      { url: 'https://www.tv9hindi.com/feed', category: 'top', headline: true },
      { url: 'https://www.tv9hindi.com/india/feed', category: 'national' },
      { url: 'https://www.tv9hindi.com/world/feed', category: 'world' },
      { url: 'https://www.tv9hindi.com/business/feed', category: 'economy' },
      { url: 'https://www.tv9hindi.com/sports/feed', category: 'sports' },
      { url: 'https://www.tv9hindi.com/technology/feed', category: 'technology' },
      { url: 'https://www.tv9hindi.com/health/feed', category: 'health' },
      { url: 'https://www.tv9hindi.com/entertainment/feed', category: 'entertainment' }
    ]
  },
  {
    id: 'india-tv',
    name: 'इंडिया टीवी',
    homepage: 'https://www.indiatv.in',
    icon: 'https://www.google.com/s2/favicons?domain=indiatv.in&sz=128',
    color: '#D7282F',
    kind: 'mainstream',
    language: 'hi',
    feeds: [
      { url: 'https://www.indiatv.in/rssnews/topstory.xml', category: 'top', headline: true },
      { url: 'https://www.indiatv.in/rssnews/topstory-india.xml', category: 'national' },
      { url: 'https://www.indiatv.in/rssnews/topstory-world.xml', category: 'world' },
      { url: 'https://www.indiatv.in/rssnews/topstory-paisa.xml', category: 'economy' },
      { url: 'https://www.indiatv.in/rssnews/topstory-sports.xml', category: 'sports' },
      { url: 'https://www.indiatv.in/rssnews/topstory-tech.xml', category: 'technology' },
      { url: 'https://www.indiatv.in/rssnews/topstory-health.xml', category: 'health' },
      { url: 'https://www.indiatv.in/rssnews/topstory-entertainment.xml', category: 'entertainment' },
      { url: 'https://www.indiatv.in/rssnews/topstory-lifestyle.xml', category: 'lifestyle' },
      { url: 'https://www.indiatv.in/rssnews/topstory-religion.xml', category: 'lifestyle' }
    ]
  },
  {
    id: 'abp-news',
    name: 'ABP न्यूज़',
    homepage: 'https://www.abplive.com',
    icon: 'https://www.google.com/s2/favicons?domain=abplive.com&sz=128',
    color: '#E2231A',
    kind: 'mainstream',
    language: 'hi',
    feeds: [{ url: 'https://www.abplive.com/news/feed', category: 'general' }]
  },
  {
    id: 'zee-news-hindi',
    name: 'ज़ी न्यूज़',
    homepage: 'https://zeenews.india.com/hindi',
    icon: favicon('zeenews.india.com'),
    color: '#5B2C83',
    kind: 'mainstream',
    language: 'hi',
    feeds: [
      { url: 'https://zeenews.india.com/hindi/india.xml', category: 'national' },
      { url: 'https://zeenews.india.com/hindi/world.xml', category: 'world' },
      { url: 'https://zeenews.india.com/hindi/business.xml', category: 'economy' },
      { url: 'https://zeenews.india.com/hindi/sports.xml', category: 'sports' },
      { url: 'https://zeenews.india.com/hindi/technology.xml', category: 'technology' },
      { url: 'https://zeenews.india.com/hindi/entertainment.xml', category: 'entertainment' },
      { url: 'https://zeenews.india.com/hindi/religion.xml', category: 'lifestyle' }
    ]
  },
  {
    id: 'times-now-navbharat',
    name: 'टाइम्स नाउ नवभारत',
    homepage: 'https://www.timesnowhindi.com',
    icon: favicon('timesnowhindi.com'),
    color: '#E20613',
    kind: 'mainstream',
    language: 'hi',
    // Section feeds carry full-text items (190–390 KB each), and the latest-news stream 100 of
    // them (0.5 MB); the core sections are kept.
    feeds: [
      { url: 'https://www.timesnowhindi.com/feeds/gns-hin-india.xml', category: 'national' },
      { url: 'https://www.timesnowhindi.com/feeds/gns-hin-world.xml', category: 'world' },
      { url: 'https://www.timesnowhindi.com/feeds/gns-hin-business.xml', category: 'economy' },
      { url: 'https://www.timesnowhindi.com/feeds/gns-hin-sports.xml', category: 'sports' },
      { url: 'https://www.timesnowhindi.com/feeds/gns-hin-tech-gadgets.xml', category: 'technology' },
      { url: 'https://www.timesnowhindi.com/feeds/gns-hin-health.xml', category: 'health' }
    ]
  },
  {
    id: 'news-nation',
    name: 'न्यूज़ नेशन',
    homepage: 'https://www.newsnationtv.com',
    icon: favicon('newsnationtv.com'),
    color: '#D71920',
    kind: 'mainstream',
    language: 'hi',
    feeds: [
      { url: 'https://www.newsnationtv.com/rss/categories/india', category: 'national' },
      { url: 'https://www.newsnationtv.com/rss/categories/world', category: 'world' },
      { url: 'https://www.newsnationtv.com/rss/categories/business', category: 'economy' },
      { url: 'https://www.newsnationtv.com/rss/categories/sports', category: 'sports' },
      { url: 'https://www.newsnationtv.com/rss/categories/science-tech', category: 'technology' },
      { url: 'https://www.newsnationtv.com/rss/categories/health', category: 'health' },
      { url: 'https://www.newsnationtv.com/rss/categories/entertainment', category: 'entertainment' },
      { url: 'https://www.newsnationtv.com/rss/categories/religion', category: 'lifestyle' },
      { url: 'https://www.newsnationtv.com/rss/categories/education', category: 'education' }
    ]
  },
  {
    id: 'india-news',
    name: 'इंडिया न्यूज़',
    homepage: 'https://www.indianews.in',
    icon: favicon('indianews.in'),
    kind: 'mainstream',
    language: 'hi',
    feeds: [{ url: 'https://www.indianews.in/feed/', category: 'general' }]
  },

  // Agency
  {
    id: 'uni-varta',
    name: 'यूनीवार्ता',
    homepage: 'https://univarta.com',
    icon: favicon('univarta.com'),
    kind: 'agency',
    language: 'hi',
    feeds: [{ url: 'https://univarta.com/rss', category: 'general' }]
  },

  // Business
  {
    id: 'business-standard-hindi',
    name: 'बिज़नेस स्टैंडर्ड हिंदी',
    homepage: 'https://hindi.business-standard.com',
    icon: favicon('hindi.business-standard.com'),
    kind: 'business',
    language: 'hi',
    feeds: [{ url: 'https://hindi.business-standard.com/feed/', category: 'economy' }]
  },
  {
    id: 'zee-business-hindi',
    name: 'ज़ी बिज़नेस',
    homepage: 'https://www.zeebiz.com/hindi',
    icon: favicon('zeebiz.com'),
    kind: 'business',
    language: 'hi',
    feeds: [{ url: 'https://www.zeebiz.com/hindi/rss/latest.xml', category: 'economy' }]
  },
  {
    id: 'money9',
    name: 'Money9',
    homepage: 'https://www.money9live.com',
    icon: favicon('money9live.com'),
    kind: 'business',
    language: 'hi',
    defaultEnabled: false,
    feeds: [{ url: 'https://www.money9live.com/feed', category: 'economy' }]
  },
  {
    id: 'goodreturns-hindi',
    name: 'GoodReturns हिंदी',
    homepage: 'https://hindi.goodreturns.in',
    icon: favicon('hindi.goodreturns.in'),
    kind: 'business',
    language: 'hi',
    defaultEnabled: false,
    feeds: [{ url: 'https://hindi.goodreturns.in/rss/feeds/goodreturns-hindi-fb.xml', category: 'economy' }]
  },
  {
    id: 'krishi-jagran-hindi',
    name: 'कृषि जागरण',
    homepage: 'https://hindi.krishijagran.com',
    icon: favicon('hindi.krishijagran.com'),
    kind: 'business',
    language: 'hi',
    defaultEnabled: false,
    feeds: [{ url: 'https://hindi.krishijagran.com/feeds/rss', category: 'economy' }]
  },

  // Sports, technology and specialist desks
  {
    id: 'crictracker-hindi',
    name: 'CricTracker हिंदी',
    homepage: 'https://hindi.crictracker.com',
    icon: favicon('hindi.crictracker.com'),
    kind: 'sports',
    language: 'hi',
    feeds: [{ url: 'https://hindi.crictracker.com/feed/', category: 'sports' }]
  },
  {
    id: 'gizbot-hindi',
    name: 'Gizbot हिंदी',
    homepage: 'https://hindi.gizbot.com',
    icon: favicon('hindi.gizbot.com'),
    kind: 'technology',
    language: 'hi',
    defaultEnabled: false,
    feeds: [{ url: 'https://hindi.gizbot.com/rss/feeds/gizbot-hindi-fb.xml', category: 'technology' }]
  },
  {
    id: 'drivespark-hindi',
    name: 'DriveSpark हिंदी',
    homepage: 'https://hindi.drivespark.com',
    icon: favicon('hindi.drivespark.com'),
    kind: 'technology',
    language: 'hi',
    defaultEnabled: false,
    feeds: [{ url: 'https://hindi.drivespark.com/rss/feeds/drivespark-hindi-fb.xml', category: 'automotive' }]
  },
  {
    id: 'filmibeat-hindi',
    name: 'Filmibeat हिंदी',
    homepage: 'https://hindi.filmibeat.com',
    icon: favicon('hindi.filmibeat.com'),
    kind: 'mainstream',
    language: 'hi',
    defaultEnabled: false,
    feeds: [
      { url: 'https://hindi.filmibeat.com/rss/feeds/filmibeat-hindi-fb.xml', category: 'entertainment' }
    ]
  },
  {
    id: 'boldsky-hindi',
    name: 'Boldsky हिंदी',
    homepage: 'https://hindi.boldsky.com',
    icon: favicon('hindi.boldsky.com'),
    kind: 'mainstream',
    language: 'hi',
    defaultEnabled: false,
    feeds: [{ url: 'https://hindi.boldsky.com/rss/feeds/boldsky-hindi-fb.xml', category: 'lifestyle' }]
  },
  {
    id: 'careerindia-hindi',
    name: 'Careerindia हिंदी',
    homepage: 'https://hindi.careerindia.com',
    icon: favicon('hindi.careerindia.com'),
    kind: 'mainstream',
    language: 'hi',
    defaultEnabled: false,
    feeds: [
      { url: 'https://hindi.careerindia.com/rss/feeds/careerindia-hindi-fb.xml', category: 'education' }
    ]
  },

  // Portals, independent newsrooms, international
  {
    id: 'webdunia',
    name: 'वेबदुनिया',
    homepage: 'https://hindi.webdunia.com',
    icon: 'https://www.google.com/s2/favicons?domain=hindi.webdunia.com&sz=128',
    color: '#F26522',
    kind: 'mainstream',
    language: 'hi',
    feeds: [{ url: 'https://hindi.webdunia.com/rss/news.rss', category: 'general' }]
  },
  {
    id: 'oneindia-hindi',
    name: 'वनइंडिया हिंदी',
    homepage: 'https://hindi.oneindia.com',
    icon: favicon('hindi.oneindia.com'),
    kind: 'mainstream',
    language: 'hi',
    feeds: [
      { url: 'https://hindi.oneindia.com/rss/feeds/oneindia-hindi-fb.xml', category: 'general' },
      { url: 'https://hindi.oneindia.com/rss/feeds/hindi-india-fb.xml', category: 'national' },
      { url: 'https://hindi.oneindia.com/rss/feeds/hindi-international-fb.xml', category: 'world' },
      { url: 'https://hindi.oneindia.com/rss/feeds/hindi-sports-fb.xml', category: 'sports' },
      { url: 'https://hindi.oneindia.com/rss/feeds/hindi-entertainment-fb.xml', category: 'entertainment' },
      { url: 'https://hindi.oneindia.com/rss/feeds/hindi-opinion-fb.xml', category: 'opinion' }
    ]
  },
  {
    id: 'the-wire-hindi',
    name: 'द वायर हिंदी',
    homepage: 'https://thewirehindi.com',
    icon: 'https://www.google.com/s2/favicons?domain=thewirehindi.com&sz=128',
    color: '#C7202A',
    kind: 'independent',
    language: 'hi',
    feeds: [{ url: 'https://thewirehindi.com/feed/', category: 'politics' }]
  },
  {
    id: 'satya-hindi',
    name: 'सत्य हिंदी',
    homepage: 'https://www.satyahindi.com',
    icon: 'https://www.google.com/s2/favicons?domain=satyahindi.com&sz=128',
    color: '#E03A3E',
    kind: 'independent',
    language: 'hi',
    feeds: [{ url: 'https://www.satyahindi.com/rss', category: 'politics' }]
  },
  {
    // A rural newsroom run by women reporters in Uttar Pradesh, Bihar and Madhya Pradesh.
    id: 'khabar-lahariya',
    name: 'खबर लहरिया',
    homepage: 'https://khabarlahariya.org',
    icon: favicon('khabarlahariya.org'),
    kind: 'independent',
    language: 'hi',
    feeds: [{ url: 'https://khabarlahariya.org/feed/', category: 'general' }]
  },
  {
    id: 'janchowk',
    name: 'जनचौक',
    homepage: 'https://janchowk.com',
    icon: favicon('janchowk.com'),
    kind: 'independent',
    language: 'hi',
    defaultEnabled: false,
    feeds: [{ url: 'https://janchowk.com/feed/', category: 'politics' }]
  },
  {
    // Owned by the Congress-linked Associated Journals (National Herald); off by default.
    id: 'navjivan',
    name: 'नवजीवन',
    homepage: 'https://www.navjivanindia.com',
    icon: favicon('navjivanindia.com'),
    kind: 'independent',
    language: 'hi',
    defaultEnabled: false,
    feeds: [{ url: 'https://www.navjivanindia.com/stories.rss', category: 'politics' }]
  },
  {
    // The RSS weekly; off by default.
    id: 'panchjanya',
    name: 'पाञ्चजन्य',
    homepage: 'https://panchjanya.com',
    icon: favicon('panchjanya.com'),
    kind: 'independent',
    language: 'hi',
    defaultEnabled: false,
    feeds: [{ url: 'https://panchjanya.com/feed/', category: 'politics' }]
  },
  {
    // Partisan and repeatedly flagged by fact-checkers; one tap on the Sources page brings it in.
    id: 'opindia-hindi',
    name: 'ऑपइंडिया',
    homepage: 'https://hindi.opindia.com',
    icon: 'https://www.google.com/s2/favicons?domain=hindi.opindia.com&sz=128',
    color: '#E4572E',
    kind: 'independent',
    language: 'hi',
    defaultEnabled: false,
    feeds: [{ url: 'https://hindi.opindia.com/feed/', category: 'opinion' }]
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
  {
    id: 'un-news-hindi',
    name: 'UN News हिंदी',
    homepage: 'https://news.un.org/hi/',
    icon: favicon('news.un.org'),
    color: '#009EDB',
    kind: 'international',
    language: 'hi',
    feeds: [{ url: 'https://news.un.org/feed/subscribe/hi/news/all/rss.xml', category: 'world' }]
  }
]

export const sources: SourceDef[] = [...nationalSources, ...localSources]
