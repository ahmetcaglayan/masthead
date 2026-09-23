import type { SourceDef } from '../../types'
import { provinceFeeds } from '../build.ts'

/*
 * State pages of the big Hindi dailies. Every feed carries its state's code, so the
 * pipeline only fetches it for the user's selected state (or a handful across a zone).
 * All four cover the Hindi belt; states the Hindi press has no desk for (the south and
 * most of the northeast) get their Local page from the national stories that name them.
 * Checked on 2026-09-23.
 */

const amarUjala = 'https://www.amarujala.com/rss'
const news18 = 'https://hindi.news18.com/commonfeeds/v1/hin/rss'
const bhaskar = (category: number): string => `https://www.bhaskar.com/rss-v1--category-${category}.xml`
const prabhat = 'https://www.prabhatkhabar.com/state'

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
  }
]
