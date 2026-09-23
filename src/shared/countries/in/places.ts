import type { District, Province } from '../../types'
import { regionsOf } from '../build.ts'

/** India's zones, in the order the picker lists them. */
export const IN_REGION_IDS = ['north', 'central', 'east', 'northeast', 'west', 'south'] as const

type InRegionId = (typeof IN_REGION_IDS)[number]

interface InProvince extends Province {
  region: InRegionId
}

/**
 * The 28 states and 8 union territories, keyed by their ISO 3166-2 suffix. Names are
 * Hindi, as the Hindi press writes them; aliases carry other spellings and the English
 * names, which Hindi headlines use too ("UP News", "Bihar News").
 */
export const provinces: InProvince[] = [
  // North
  {
    code: 'JK',
    name: 'जम्मू-कश्मीर',
    slug: 'jammu-kashmir',
    region: 'north',
    aliases: ['जम्मू कश्मीर', 'Jammu and Kashmir', 'Jammu Kashmir']
  },
  { code: 'LA', name: 'लद्दाख', slug: 'ladakh', region: 'north', aliases: ['Ladakh'] },
  {
    code: 'HP',
    name: 'हिमाचल प्रदेश',
    slug: 'himachal-pradesh',
    region: 'north',
    aliases: ['हिमाचल', 'Himachal Pradesh', 'Himachal']
  },
  { code: 'PB', name: 'पंजाब', slug: 'punjab', region: 'north', aliases: ['Punjab'] },
  { code: 'CH', name: 'चंडीगढ़', slug: 'chandigarh', region: 'north', aliases: ['Chandigarh'] },
  { code: 'HR', name: 'हरियाणा', slug: 'haryana', region: 'north', aliases: ['Haryana'] },
  {
    code: 'DL',
    name: 'दिल्ली',
    slug: 'delhi',
    region: 'north',
    aliases: ['नई दिल्ली', 'Delhi', 'New Delhi']
  },
  {
    code: 'UK',
    name: 'उत्तराखंड',
    slug: 'uttarakhand',
    region: 'north',
    aliases: ['उत्तराखण्ड', 'Uttarakhand']
  },
  {
    code: 'UP',
    name: 'उत्तर प्रदेश',
    slug: 'uttar-pradesh',
    region: 'north',
    aliases: ['यूपी', 'Uttar Pradesh', 'UP']
  },
  { code: 'RJ', name: 'राजस्थान', slug: 'rajasthan', region: 'north', aliases: ['Rajasthan'] },

  // Central
  {
    code: 'MP',
    name: 'मध्य प्रदेश',
    slug: 'madhya-pradesh',
    region: 'central',
    aliases: ['मध्यप्रदेश', 'Madhya Pradesh']
  },
  { code: 'CT', name: 'छत्तीसगढ़', slug: 'chhattisgarh', region: 'central', aliases: ['Chhattisgarh'] },

  // East
  { code: 'BR', name: 'बिहार', slug: 'bihar', region: 'east', aliases: ['Bihar'] },
  { code: 'JH', name: 'झारखंड', slug: 'jharkhand', region: 'east', aliases: ['झारखण्ड', 'Jharkhand'] },
  { code: 'OR', name: 'ओडिशा', slug: 'odisha', region: 'east', aliases: ['उड़ीसा', 'Odisha', 'Orissa'] },
  {
    code: 'WB',
    name: 'पश्चिम बंगाल',
    slug: 'west-bengal',
    region: 'east',
    aliases: ['बंगाल', 'West Bengal']
  },

  // Northeast
  { code: 'AS', name: 'असम', slug: 'assam', region: 'northeast', aliases: ['Assam'] },
  {
    code: 'AR',
    name: 'अरुणाचल प्रदेश',
    slug: 'arunachal-pradesh',
    region: 'northeast',
    aliases: ['अरुणाचल', 'Arunachal Pradesh', 'Arunachal']
  },
  { code: 'MN', name: 'मणिपुर', slug: 'manipur', region: 'northeast', aliases: ['Manipur'] },
  { code: 'ML', name: 'मेघालय', slug: 'meghalaya', region: 'northeast', aliases: ['Meghalaya'] },
  { code: 'MZ', name: 'मिज़ोरम', slug: 'mizoram', region: 'northeast', aliases: ['मिजोरम', 'Mizoram'] },
  { code: 'NL', name: 'नगालैंड', slug: 'nagaland', region: 'northeast', aliases: ['नागालैंड', 'Nagaland'] },
  { code: 'TR', name: 'त्रिपुरा', slug: 'tripura', region: 'northeast', aliases: ['Tripura'] },
  { code: 'SK', name: 'सिक्किम', slug: 'sikkim', region: 'northeast', aliases: ['Sikkim'] },

  // West
  { code: 'GJ', name: 'गुजरात', slug: 'gujarat', region: 'west', aliases: ['Gujarat'] },
  { code: 'MH', name: 'महाराष्ट्र', slug: 'maharashtra', region: 'west', aliases: ['Maharashtra'] },
  { code: 'GA', name: 'गोवा', slug: 'goa', region: 'west', aliases: ['Goa'] },
  {
    code: 'DH',
    name: 'दादरा और नगर हवेली और दमन और दीव',
    slug: 'dadra-nagar-haveli-daman-diu',
    region: 'west',
    aliases: ['दादरा', 'दमन', 'दीव', 'Daman', 'Diu']
  },

  // South
  {
    code: 'AP',
    name: 'आंध्र प्रदेश',
    slug: 'andhra-pradesh',
    region: 'south',
    aliases: ['आंध्र', 'Andhra Pradesh']
  },
  { code: 'TG', name: 'तेलंगाना', slug: 'telangana', region: 'south', aliases: ['Telangana'] },
  { code: 'KA', name: 'कर्नाटक', slug: 'karnataka', region: 'south', aliases: ['Karnataka'] },
  { code: 'KL', name: 'केरल', slug: 'kerala', region: 'south', aliases: ['Kerala'] },
  { code: 'TN', name: 'तमिलनाडु', slug: 'tamil-nadu', region: 'south', aliases: ['तमिल नाडु', 'Tamil Nadu'] },
  { code: 'PY', name: 'पुडुचेरी', slug: 'puducherry', region: 'south', aliases: ['पांडिचेरी', 'Puducherry'] },
  {
    code: 'AN',
    name: 'अंडमान और निकोबार',
    slug: 'andaman-nicobar',
    region: 'south',
    aliases: ['अंडमान', 'Andaman']
  },
  { code: 'LD', name: 'लक्षद्वीप', slug: 'lakshadweep', region: 'south', aliases: ['Lakshadweep'] }
]

export const regions = regionsOf(IN_REGION_IDS, provinces)

/**
 * Cities the Hindi press names on their own ("लखनऊ में…"). Left out: names that are
 * ordinary Hindi words (गया "went", सूरत "face", कोटा "quota") and names two states share.
 */
const cities: Record<string, string[]> = {
  UP: [
    'लखनऊ',
    'कानपुर',
    'वाराणसी',
    'प्रयागराज',
    'आगरा',
    'नोएडा',
    'गाजियाबाद',
    'गोरखपुर',
    'अयोध्या',
    'मेरठ',
    'Lucknow',
    'Noida'
  ],
  BR: ['पटना', 'मुजफ्फरपुर', 'भागलपुर', 'दरभंगा', 'Patna'],
  RJ: ['जयपुर', 'जोधपुर', 'उदयपुर', 'अजमेर', 'बीकानेर', 'Jaipur'],
  MP: ['भोपाल', 'इंदौर', 'ग्वालियर', 'जबलपुर', 'उज्जैन', 'Bhopal', 'Indore'],
  CT: ['रायपुर', 'Raipur'],
  UK: ['देहरादून', 'हरिद्वार', 'नैनीताल', 'Dehradun'],
  HP: ['शिमला', 'धर्मशाला', 'Shimla'],
  PB: ['अमृतसर', 'लुधियाना', 'जालंधर', 'Amritsar', 'Ludhiana'],
  HR: ['गुरुग्राम', 'फरीदाबाद', 'रोहतक', 'पानीपत', 'Gurugram'],
  JH: ['रांची', 'जमशेदपुर', 'धनबाद', 'Ranchi'],
  WB: ['कोलकाता', 'Kolkata'],
  OR: ['भुवनेश्वर', 'कटक', 'Bhubaneswar'],
  AS: ['गुवाहाटी', 'Guwahati'],
  GJ: ['अहमदाबाद', 'वडोदरा', 'राजकोट', 'गांधीनगर', 'Ahmedabad'],
  MH: ['मुंबई', 'पुणे', 'नागपुर', 'नासिक', 'Mumbai', 'Pune'],
  TG: ['हैदराबाद', 'Hyderabad'],
  KA: ['बेंगलुरु', 'बेंगलुरू', 'Bengaluru'],
  TN: ['चेन्नई', 'Chennai'],
  KL: ['तिरुवनंतपुरम', 'कोच्चि'],
  AP: ['विशाखापत्तनम'],
  JK: ['श्रीनगर', 'जम्मू', 'Srinagar'],
  LA: ['लेह', 'Leh'],
  MN: ['इंफाल', 'Imphal'],
  ML: ['शिलांग', 'Shillong'],
  MZ: ['आइजोल'],
  NL: ['कोहिमा'],
  TR: ['अगरतला'],
  SK: ['गंगटोक'],
  GA: ['पणजी']
}

export const districts: District[] = Object.entries(cities).flatMap(([provinceCode, names]) =>
  names.map((name) => ({ name, provinceCode }))
)
