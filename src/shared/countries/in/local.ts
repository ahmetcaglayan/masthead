import type { SourceDef } from '../../types'
import { favicon, provinceFeeds } from '../build.ts'

/*
 * State pages of the big Hindi dailies. Every feed carries its state's code, so the
 * pipeline only fetches it for the user's selected state (or a handful across a zone).
 * All of them cover the Hindi belt; Navbharat Times and Patrika also keep Hindi desks for
 * the south, Assam and Odisha. States no Hindi desk covers (most of the northeast, Goa, the
 * smaller union territories) get their Local page from the national stories that name them.
 * Checked on 2026-09-23; Navbharat Times, Live Hindustan, Patrika and Dainik Jagran added
 * on 2026-09-24.
 *
 * Not included: Live Hindustan's Uttar Pradesh page (the feed is empty) and its Jammu and
 * Kashmir, Chandigarh and Tripura pages; Navbharat Times' Goa and Andhra Pradesh pages;
 * Patrika's Assam, Haryana, Himachal Pradesh and Odisha pages (all stale, 3 days to a year);
 * Dainik Jagran's Uttarakhand, Rajasthan, Gujarat, Maharashtra and Odisha pages (HTTP 500);
 * Nai Dunia, Punjab Kesari, Dainik Tribune and Divya Himachal (no public feed, or 403).
 */

const amarUjala = 'https://www.amarujala.com/rss'
const news18 = 'https://hindi.news18.com/commonfeeds/v1/hin/rss'
const bhaskar = (category: number): string => `https://www.bhaskar.com/rss-v1--category-${category}.xml`
const prabhat = 'https://www.prabhatkhabar.com/state'
const nbt = (path: string, id: number): string =>
  `https://navbharattimes.indiatimes.com/${path}/rssfeed/${id}.xml`
const hindustan = (path: string): string => `https://api.livehindustan.com/feeds/rss/${path}/rssfeed.xml`
const patrika = (location: string): string => `https://cms.patrika.com/googlefeed/blog/location/${location}`
const jagran = (state: string): string => `https://rss.jagran.com/local/${state}.xml`

export const localSources: SourceDef[] = [
  {
    id: 'amar-ujala-rajya',
    name: 'अमर उजाला राज्य',
    homepage: 'https://www.amarujala.com',
    icon: 'https://www.amarujala.com/favicon.ico',
    color: '#E8262C',
    kind: 'local',
    language: 'hi',
    feeds: provinceFeeds({
      UP: `${amarUjala}/uttar-pradesh.xml`,
      UK: `${amarUjala}/uttarakhand.xml`,
      DL: `${amarUjala}/delhi-ncr.xml`,
      HP: `${amarUjala}/himachal-pradesh.xml`,
      JK: `${amarUjala}/jammu-and-kashmir.xml`,
      PB: `${amarUjala}/punjab.xml`,
      HR: `${amarUjala}/haryana.xml`,
      CH: `${amarUjala}/chandigarh.xml`,
      RJ: `${amarUjala}/rajasthan.xml`,
      MP: `${amarUjala}/madhya-pradesh.xml`,
      CT: `${amarUjala}/chhattisgarh.xml`,
      BR: `${amarUjala}/bihar.xml`,
      JH: `${amarUjala}/jharkhand.xml`,
      GJ: `${amarUjala}/gujarat.xml`,
      MH: `${amarUjala}/maharashtra.xml`
    })
  },
  {
    id: 'dainik-bhaskar-rajya',
    name: 'दैनिक भास्कर राज्य',
    homepage: 'https://www.bhaskar.com',
    icon: 'https://www.bhaskar.com/favicon.ico',
    color: '#D01A1A',
    kind: 'local',
    language: 'hi',
    feeds: provinceFeeds({
      RJ: bhaskar(1740),
      MP: bhaskar(1739),
      UP: bhaskar(2052),
      BR: bhaskar(3679),
      CT: bhaskar(1741),
      HR: bhaskar(1742),
      DL: bhaskar(7140),
      MH: bhaskar(2318),
      JH: bhaskar(3682),
      PB: bhaskar(1743),
      GJ: bhaskar(2314),
      CH: bhaskar(11649),
      HP: bhaskar(12084)
    })
  },
  {
    id: 'news18-hindi-rajya',
    name: 'News18 हिंदी राज्य',
    homepage: 'https://hindi.news18.com',
    icon: 'https://hindi.news18.com/apple-touch-icon.png',
    color: '#EE2A24',
    kind: 'local',
    language: 'hi',
    feeds: provinceFeeds({
      UP: `${news18}/uttar-pradesh.xml`,
      BR: `${news18}/bihar.xml`,
      MP: `${news18}/madhya-pradesh.xml`,
      RJ: `${news18}/rajasthan.xml`,
      DL: `${news18}/delhi.xml`,
      HR: `${news18}/haryana.xml`,
      UK: `${news18}/uttarakhand.xml`,
      HP: `${news18}/himachal-pradesh.xml`,
      JH: `${news18}/jharkhand.xml`,
      CT: `${news18}/chhattisgarh.xml`,
      PB: `${news18}/punjab.xml`,
      GJ: `${news18}/gujarat.xml`,
      MH: `${news18}/maharashtra.xml`,
      WB: `${news18}/west-bengal.xml`
    })
  },
  {
    id: 'prabhat-khabar-rajya',
    name: 'प्रभात खबर राज्य',
    homepage: 'https://www.prabhatkhabar.com',
    icon: 'https://www.google.com/s2/favicons?domain=prabhatkhabar.com&sz=128',
    color: '#D32027',
    kind: 'local',
    language: 'hi',
    feeds: provinceFeeds({
      BR: `${prabhat}/bihar/feed`,
      JH: `${prabhat}/jharkhand/feed`,
      WB: `${prabhat}/west-bengal/feed`,
      OR: `${prabhat}/odisha/feed`
    })
  },
  {
    id: 'navbharat-times-rajya',
    name: 'नवभारत टाइम्स राज्य',
    homepage: 'https://navbharattimes.indiatimes.com',
    icon: favicon('navbharattimes.indiatimes.com'),
    color: '#E0282E',
    kind: 'local',
    language: 'hi',
    feeds: provinceFeeds({
      DL: nbt('metro/delhi', 4836708),
      UP: nbt('state/uttar-pradesh', 21236867),
      BR: nbt('state/bihar', 21236753),
      MP: nbt('state/madhya-pradesh', 21236720),
      RJ: nbt('state/rajasthan', 21236734),
      // One desk for both states; its stories are mostly from Haryana and the NCR.
      HR: nbt('state/punjab-and-haryana', 21236773),
      UK: nbt('state/uttarakhand', 21236621),
      JH: nbt('state/jharkhand', 21236677),
      CT: nbt('state/chhattisgarh', 21236696),
      HP: nbt('state/himachal-pradesh', 21236640),
      JK: nbt('state/jammu-and-kashmir', 21648462),
      MH: nbt('state/maharashtra', 21236663),
      GJ: nbt('state/gujarat', 21236669),
      WB: nbt('state/west-bengal', 79935756),
      OR: nbt('state/odisha', 92591183),
      AS: nbt('state/assam', 92681645),
      KA: nbt('state/karnataka', 93210099),
      TN: nbt('state/tamil-nadu', 92676483),
      TG: nbt('state/telangana', 93211478),
      KL: nbt('state/kerala', 92680180)
    })
  },
  {
    id: 'live-hindustan-rajya',
    name: 'लाइव हिन्दुस्तान राज्य',
    homepage: 'https://www.livehindustan.com',
    icon: favicon('livehindustan.com'),
    color: '#E31E24',
    kind: 'local',
    language: 'hi',
    feeds: provinceFeeds({
      BR: hindustan('bihar'),
      JH: hindustan('jharkhand'),
      UK: hindustan('uttarakhand'),
      DL: hindustan('ncr'),
      MP: hindustan('madhya-pradesh'),
      RJ: hindustan('rajasthan'),
      HR: hindustan('haryana'),
      PB: hindustan('punjab'),
      HP: hindustan('himachal-pradesh'),
      CT: hindustan('chhattisgarh'),
      MH: hindustan('maharashtra'),
      GJ: hindustan('gujarat'),
      WB: hindustan('west-bengal'),
      OR: hindustan('odisha')
    })
  },
  {
    id: 'patrika-rajya',
    name: 'पत्रिका राज्य',
    homepage: 'https://www.patrika.com',
    icon: favicon('patrika.com'),
    color: '#C8102E',
    kind: 'local',
    language: 'hi',
    feeds: provinceFeeds({
      RJ: patrika('rajasthan-news'),
      MP: patrika('madhya-pradesh-news'),
      CT: patrika('chhattisgarh-news'),
      UP: patrika('uttar-pradesh-news'),
      BR: patrika('bihar-news'),
      JH: patrika('jharkhand-news'),
      UK: patrika('uttarakhand-1'),
      DL: patrika('delhi-news'),
      PB: patrika('punjab-news'),
      CH: patrika('chandigarh-punjab-news'),
      JK: patrika('jammu-and-kashmir-1'),
      GJ: patrika('gujarat-news'),
      MH: patrika('maharashtra-news'),
      WB: patrika('west-bengal-news'),
      KA: patrika('karnataka-news'),
      TN: patrika('tamil-nadu-news'),
      TG: patrika('telangana-news'),
      AP: patrika('andhra-pradesh-news')
    })
  },
  {
    id: 'dainik-jagran-rajya',
    name: 'दैनिक जागरण राज्य',
    homepage: 'https://www.jagran.com',
    icon: 'https://www.google.com/s2/favicons?domain=jagran.com&sz=128',
    color: '#D71920',
    kind: 'local',
    language: 'hi',
    feeds: provinceFeeds({
      UP: jagran('uttar-pradesh'),
      BR: jagran('bihar'),
      DL: jagran('delhi'),
      HR: jagran('haryana'),
      PB: jagran('punjab'),
      HP: jagran('himachal-pradesh'),
      JK: jagran('jammu-and-kashmir'),
      JH: jagran('jharkhand'),
      MP: jagran('madhya-pradesh'),
      CT: jagran('chhattisgarh'),
      WB: jagran('west-bengal')
    })
  }
]
