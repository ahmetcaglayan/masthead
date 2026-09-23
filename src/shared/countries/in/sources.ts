import type { SourceDef } from '../../types'
import { localSources } from './local.ts'

/*
 * India — the Hindi press. Someone who picks India reads India's news in Hindi, so every
 * source here writes in Hindi: the big dailies, the Hindi news channels, two independent
 * newsrooms and BBC Hindi. India's English-language papers are left out on purpose; a
 * country's front page is written in its own language. Every feed was checked on
 * 2026-09-23 (re-check with `npm run verify:feeds in`).
 *
 * Not included: Navbharat Times and Live Hindustan (their feeds answer 404/503), Zee News
 * (its feeds carry no dates and block non-browser clients), Jansatta (the feed redirects to
 * the homepage), ABP News' section feeds and Dainik Jagran's topic feeds (stale for weeks
 * or months), and Gadgets 360 Hindi (a single 1,000-item feed).
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
    feeds: [{ url: 'https://www.prabhatkhabar.com/feed', category: 'general' }]
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
      { url: 'https://www.indiatv.in/rssnews/topstory-health.xml', category: 'health' },
      { url: 'https://www.indiatv.in/rssnews/topstory-entertainment.xml', category: 'entertainment' },
      { url: 'https://www.indiatv.in/rssnews/topstory-lifestyle.xml', category: 'lifestyle' }
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
  }
]

export const sources: SourceDef[] = [...nationalSources, ...localSources]
