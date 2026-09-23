import { foldText } from './fold'
import type { CountryCode } from './types'

/**
 * The markets page's watchlist: currencies, precious metals, cryptocurrencies and equities
 * (companies and stock markets). Prices come only from free, openly offered sources —
 * ECB reference rates (currencies, once a working day), gold-api.com (metals) and Binance's
 * public market data (crypto). Equities have no such source (exchange data is licensed), so
 * they are followed through the news alone.
 */
export type AssetKind = 'currency' | 'metal' | 'crypto' | 'equity'

export const ASSET_KINDS: readonly AssetKind[] = ['currency', 'metal', 'crypto', 'equity']

export interface WatchItem {
  /** `currency:USD`, `metal:XAU`, `crypto:BTC`, `equity:THYAO` (see `watchItemId`). */
  id: string
  kind: AssetKind
  /** ISO 4217 code, `XAU`/`XAG`/`XPT`/`XPD`, a crypto ticker, or an equity's ticker or short name. */
  code: string
  /** An equity's name ("Türk Hava Yolları"); currencies, metals and crypto are named by the UI. */
  name: string
  /**
   * Words that find it in the news, in the news language: whole words ("THY", "altın"), or
   * every word starting so with a trailing `*` ("dolar*" also finds "doları", "dolardan").
   */
  keywords: string[]
}

export type MetalUnit = 'gram' | 'tenGrams' | 'ounce'

/** A price on the watchlist. */
export interface Quote {
  /** The watch item's id. */
  id: string
  price: number
  /** ISO 4217 code of `price`. */
  currency: string
  /**
   * Change in percent: since the previous reference day (currencies) or over the last 24 hours
   * (crypto, gold); null when unknown.
   */
  change: number | null
  /** Metals: what `price` is for. */
  unit?: MetalUnit
}

export interface QuotesReport {
  quotes: Quote[]
  /** Day of the ECB reference rates in use (`YYYY-MM-DD`), when any currency is involved. */
  ratesDate: string | null
  fetchedAt: number
}

export interface MarketsCountry {
  /** The country's currency: currencies and metals are priced in it. */
  currency: string
  /** How gold and other metals are quoted there. */
  metalUnit: MetalUnit
}

const COUNTRIES: Partial<Record<CountryCode, MarketsCountry>> = {
  tr: { currency: 'TRY', metalUnit: 'gram' },
  us: { currency: 'USD', metalUnit: 'ounce' },
  in: { currency: 'INR', metalUnit: 'tenGrams' },
  gb: { currency: 'GBP', metalUnit: 'ounce' },
  de: { currency: 'EUR', metalUnit: 'ounce' },
  br: { currency: 'BRL', metalUnit: 'gram' }
}

export function marketsCountry(country: CountryCode): MarketsCountry | undefined {
  return COUNTRIES[country]
}

/** Whether the country has a markets page (a currency and a watchlist to start from). */
export const hasMarkets = (country: CountryCode): boolean => COUNTRIES[country] !== undefined

/** Grams in a troy ounce, the unit metals are traded in. */
export const TROY_OUNCE_GRAMS = 31.1034768

export const METAL_UNIT_GRAMS: Record<MetalUnit, number> = {
  gram: 1,
  tenGrams: 10,
  ounce: TROY_OUNCE_GRAMS
}

/** Currencies with ECB reference rates (and the euro itself). */
export const CURRENCIES = [
  'USD', 'EUR', 'GBP', 'CHF', 'JPY', 'CNY', 'TRY', 'INR', 'BRL', 'CAD', 'AUD', 'NZD', 'SEK', 'NOK',
  'DKK', 'PLN', 'CZK', 'HUF', 'RON', 'ISK', 'ILS', 'KRW', 'HKD', 'SGD', 'MXN', 'ZAR', 'IDR', 'MYR',
  'PHP', 'THB'
] as const // prettier-ignore

export const METALS = ['XAU', 'XAG', 'XPT', 'XPD'] as const

/** Cryptocurrencies offered for the watchlist: ticker and name (they are priced in US dollars). */
export const CRYPTOS: readonly { code: string; name: string }[] = [
  { code: 'BTC', name: 'Bitcoin' },
  { code: 'ETH', name: 'Ethereum' },
  { code: 'BNB', name: 'BNB' },
  { code: 'SOL', name: 'Solana' },
  { code: 'XRP', name: 'XRP' },
  { code: 'DOGE', name: 'Dogecoin' },
  { code: 'ADA', name: 'Cardano' },
  { code: 'TRX', name: 'Tron' },
  { code: 'AVAX', name: 'Avalanche' },
  { code: 'LINK', name: 'Chainlink' },
  { code: 'DOT', name: 'Polkadot' },
  { code: 'LTC', name: 'Litecoin' },
  { code: 'TON', name: 'Toncoin' },
  { code: 'SHIB', name: 'Shiba Inu' }
]

type Lang = 'tr' | 'en' | 'de' | 'pt' | 'hi'

/**
 * How the news calls the big currencies, by news language. Bare "dolar" or "Dollar" is left
 * out where it mostly states amounts ("2 milyar dolarlık", "Milliarden Dollar"): the rate's
 * own phrases are what market news uses.
 */
const CURRENCY_WORDS: Record<string, Record<Lang, string[]>> = {
  USD: {
    tr: ['dolar/TL', 'dolar kuru', 'dolar endeksi', 'doları', 'dolardan', 'dolar ne kadar', 'USD/TRY'],
    en: ['the dollar', 'US dollar', 'dollar index', 'greenback'],
    de: ['US-Dollar', 'Dollarkurs', 'Dollar-Kurs', 'Greenback'],
    pt: [
      'cotação do dólar',
      'dólar hoje',
      'dólar sobe',
      'dólar cai',
      'dólar fecha',
      'dólar abre',
      'dólar opera'
    ],
    hi: ['डॉलर']
  },
  EUR: {
    tr: ['euro/TL', 'euro kuru', 'avro', 'euro ne kadar', 'EUR/TRY'],
    en: ['the euro', 'euro zone', 'eurozone'],
    de: ['Euro-Kurs', 'Eurokurs', 'Euroraum', 'Eurozone'],
    pt: ['cotação do euro', 'euro hoje', 'euro sobe', 'euro cai'],
    hi: ['यूरो']
  },
  GBP: {
    tr: ['sterlin*'],
    en: ['sterling', 'the pound'],
    de: ['britische Pfund', 'Pfund Sterling'],
    pt: ['libra esterlina'],
    hi: ['पाउंड']
  },
  CHF: {
    tr: ['İsviçre frangı'],
    en: ['Swiss franc'],
    de: ['Franken'],
    pt: ['franco suíço'],
    hi: ['स्विस फ्रैंक']
  },
  JPY: { tr: ['yen'], en: ['yen'], de: ['Yen'], pt: ['iene'], hi: ['येन'] },
  CNY: { tr: ['yuan'], en: ['yuan', 'renminbi'], de: ['Yuan', 'Renminbi'], pt: ['yuan'], hi: ['युआन'] },
  TRY: {
    tr: ['Türk lirası'],
    en: ['Turkish lira'],
    de: ['türkische Lira'],
    pt: ['lira turca'],
    hi: ['तुर्की लीरा']
  },
  INR: {
    tr: ['rupi'],
    en: ['rupee', 'rupees'],
    de: ['Rupie'],
    pt: ['rupia'],
    hi: ['रुपया', 'रुपये', 'रुपए']
  },
  BRL: {
    tr: ['Brezilya reali'],
    en: ['Brazilian real'],
    de: ['brasilianischer Real'],
    pt: ['real', 'reais'],
    hi: ['ब्राज़ीली रियल']
  },
  CAD: {
    tr: ['Kanada doları'],
    en: ['Canadian dollar', 'loonie'],
    de: ['kanadischer Dollar'],
    pt: ['dólar canadense'],
    hi: ['कनाडाई डॉलर']
  }
}

/** How the news calls the metals. "altın" is a whole word only: "altında" means "under". */
const METAL_WORDS: Record<(typeof METALS)[number], Record<Lang, string[]>> = {
  XAU: {
    tr: ['altın', 'altının', 'gram altın', 'ons altın', 'çeyrek altın'],
    en: ['gold', 'bullion'],
    de: ['Gold', 'Goldpreis*'],
    pt: ['ouro'],
    hi: ['सोना', 'सोने', 'गोल्ड']
  },
  XAG: { tr: ['gümüş'], en: ['silver'], de: ['Silber*'], pt: ['prata'], hi: ['चांदी', 'चाँदी'] },
  XPT: { tr: ['platin'], en: ['platinum'], de: ['Platin'], pt: ['platina'], hi: ['प्लैटिनम'] },
  XPD: { tr: ['paladyum'], en: ['palladium'], de: ['Palladium'], pt: ['paládio'], hi: ['पैलेडियम'] }
}

const CRYPTO_WORDS: Partial<Record<string, Partial<Record<Lang, string[]>>>> = {
  BTC: { hi: ['बिटकॉइन'] },
  ETH: { hi: ['एथेरियम'] }
}

/** The pack language as a key of the word tables (the five languages Masthead ships). */
function langOf(language: string): Lang {
  const code = language.slice(0, 2)
  return code === 'tr' || code === 'de' || code === 'pt' || code === 'hi' ? code : 'en'
}

export const watchItemId = (kind: AssetKind, code: string): string =>
  `${kind}:${kind === 'equity' ? foldText(code).replace(/[^\p{L}\p{N}]+/gu, '-') : code.toUpperCase()}`

/** A currency to watch, with the words the news uses for it (its code and name, see `CURRENCY_WORDS`). */
export function currencyItem(code: string, language: string, displayName?: string): WatchItem {
  const words = CURRENCY_WORDS[code]?.[langOf(language)] ?? (displayName ? [displayName] : [])
  return { id: watchItemId('currency', code), kind: 'currency', code, name: '', keywords: [...words, code] }
}

export function metalItem(code: (typeof METALS)[number], language: string): WatchItem {
  return {
    id: watchItemId('metal', code),
    kind: 'metal',
    code,
    name: '',
    keywords: METAL_WORDS[code][langOf(language)]
  }
}

export function cryptoItem(code: string, language: string): WatchItem {
  const name = CRYPTOS.find((c) => c.code === code)?.name ?? code
  const local = CRYPTO_WORDS[code]?.[langOf(language)] ?? []
  return {
    id: watchItemId('crypto', code),
    kind: 'crypto',
    code,
    name,
    keywords: [...new Set([name, code, ...local])]
  }
}

export function equityItem(name: string, keywords: readonly string[], ticker?: string): WatchItem {
  const code = ticker ?? name
  return {
    id: watchItemId('equity', code),
    kind: 'equity',
    code,
    name,
    keywords: [...new Set([...keywords, ...(ticker ? [ticker] : [])])]
  }
}

interface EquitySeed {
  name: string
  ticker?: string
  keywords: string[]
}

/**
 * The stock markets and companies most people there invest in: the default watchlist, and
 * the suggestions offered when adding. Keywords avoid names that are also everyday words
 * ("Garanti" alone means "guarantee", "Vale" is "worth" in Portuguese).
 */
const EQUITIES: Partial<Record<CountryCode, { defaults: EquitySeed[]; more: EquitySeed[] }>> = {
  tr: {
    defaults: [
      { name: 'Borsa İstanbul', ticker: 'BIST', keywords: ['Borsa İstanbul', 'BIST 100', 'BIST', 'borsa'] },
      { name: 'Türk Hava Yolları', ticker: 'THYAO', keywords: ['THY', 'Türk Hava Yolları'] },
      { name: 'Aselsan', ticker: 'ASELS', keywords: ['Aselsan'] },
      { name: 'Garanti BBVA', ticker: 'GARAN', keywords: ['Garanti BBVA'] },
      { name: 'Koç Holding', ticker: 'KCHOL', keywords: ['Koç Holding'] },
      { name: 'Tüpraş', ticker: 'TUPRS', keywords: ['Tüpraş'] },
      { name: 'BİM', ticker: 'BIMAS', keywords: ['BİM'] }
    ],
    more: [
      { name: 'Akbank', ticker: 'AKBNK', keywords: ['Akbank'] },
      { name: 'Türkiye İş Bankası', ticker: 'ISCTR', keywords: ['İş Bankası'] },
      { name: 'Yapı Kredi', ticker: 'YKBNK', keywords: ['Yapı Kredi'] },
      { name: 'Ereğli Demir Çelik', ticker: 'EREGL', keywords: ['Erdemir', 'Ereğli Demir Çelik'] },
      { name: 'Şişecam', ticker: 'SISE', keywords: ['Şişecam'] },
      { name: 'Sabancı Holding', ticker: 'SAHOL', keywords: ['Sabancı Holding'] },
      { name: 'Turkcell', ticker: 'TCELL', keywords: ['Turkcell'] },
      { name: 'Ford Otosan', ticker: 'FROTO', keywords: ['Ford Otosan'] },
      { name: 'Pegasus', ticker: 'PGSUS', keywords: ['Pegasus'] },
      { name: 'Sasa Polyester', ticker: 'SASA', keywords: ['Sasa'] },
      { name: 'Türk Telekom', ticker: 'TTKOM', keywords: ['Türk Telekom'] },
      { name: 'Migros', ticker: 'MGROS', keywords: ['Migros'] }
    ]
  },
  us: {
    defaults: [
      { name: 'Wall Street', keywords: ['Wall Street', 'S&P 500', 'Nasdaq', 'Dow Jones'] },
      { name: 'Apple', ticker: 'AAPL', keywords: ['Apple'] },
      { name: 'Nvidia', ticker: 'NVDA', keywords: ['Nvidia'] },
      { name: 'Microsoft', ticker: 'MSFT', keywords: ['Microsoft'] },
      { name: 'Amazon', ticker: 'AMZN', keywords: ['Amazon'] },
      { name: 'Tesla', ticker: 'TSLA', keywords: ['Tesla'] },
      { name: 'Alphabet', ticker: 'GOOGL', keywords: ['Alphabet', 'Google'] }
    ],
    more: [
      { name: 'Meta', ticker: 'META', keywords: ['Meta Platforms', 'Meta'] },
      { name: 'Berkshire Hathaway', ticker: 'BRK.B', keywords: ['Berkshire Hathaway'] },
      { name: 'JPMorgan Chase', ticker: 'JPM', keywords: ['JPMorgan'] },
      { name: 'Broadcom', ticker: 'AVGO', keywords: ['Broadcom'] },
      { name: 'Eli Lilly', ticker: 'LLY', keywords: ['Eli Lilly'] },
      { name: 'Exxon Mobil', ticker: 'XOM', keywords: ['Exxon'] },
      { name: 'Netflix', ticker: 'NFLX', keywords: ['Netflix'] },
      { name: 'Walmart', ticker: 'WMT', keywords: ['Walmart'] }
    ]
  },
  in: {
    defaults: [
      { name: 'Sensex & Nifty', keywords: ['सेंसेक्स', 'निफ्टी', 'Sensex', 'Nifty', 'शेयर बाजार'] },
      { name: 'Reliance', ticker: 'RELIANCE', keywords: ['रिलायंस', 'Reliance'] },
      { name: 'TCS', ticker: 'TCS', keywords: ['टीसीएस', 'TCS'] },
      { name: 'HDFC Bank', ticker: 'HDFCBANK', keywords: ['एचडीएफसी', 'HDFC'] },
      { name: 'Infosys', ticker: 'INFY', keywords: ['इंफोसिस', 'Infosys'] },
      { name: 'Adani', keywords: ['अदाणी', 'अडानी', 'Adani'] }
    ],
    more: [
      { name: 'ICICI Bank', ticker: 'ICICIBANK', keywords: ['आईसीआईसीआई', 'ICICI'] },
      { name: 'State Bank of India', ticker: 'SBIN', keywords: ['एसबीआई', 'SBI', 'स्टेट बैंक'] },
      { name: 'Tata Motors', ticker: 'TATAMOTORS', keywords: ['टाटा मोटर्स', 'Tata Motors'] },
      { name: 'Bharti Airtel', ticker: 'BHARTIARTL', keywords: ['एयरटेल', 'Airtel'] },
      { name: 'ITC', ticker: 'ITC', keywords: ['आईटीसी', 'ITC'] },
      { name: 'Larsen & Toubro', ticker: 'LT', keywords: ['एलएंडटी', 'L&T'] }
    ]
  },
  gb: {
    defaults: [
      { name: 'FTSE 100', keywords: ['FTSE', 'London Stock Exchange'] },
      { name: 'Shell', ticker: 'SHEL', keywords: ['Shell'] },
      { name: 'AstraZeneca', ticker: 'AZN', keywords: ['AstraZeneca'] },
      { name: 'HSBC', ticker: 'HSBA', keywords: ['HSBC'] },
      { name: 'BP', ticker: 'BP', keywords: ['BP'] },
      { name: 'Unilever', ticker: 'ULVR', keywords: ['Unilever'] },
      { name: 'Rolls-Royce', ticker: 'RR', keywords: ['Rolls-Royce'] }
    ],
    more: [
      { name: 'Barclays', ticker: 'BARC', keywords: ['Barclays'] },
      { name: 'Lloyds Banking Group', ticker: 'LLOY', keywords: ['Lloyds'] },
      { name: 'GSK', ticker: 'GSK', keywords: ['GSK'] },
      { name: 'Rio Tinto', ticker: 'RIO', keywords: ['Rio Tinto'] },
      { name: 'Tesco', ticker: 'TSCO', keywords: ['Tesco'] },
      { name: 'BAE Systems', ticker: 'BA', keywords: ['BAE Systems'] },
      { name: 'Vodafone', ticker: 'VOD', keywords: ['Vodafone'] }
    ]
  },
  de: {
    defaults: [
      { name: 'DAX', keywords: ['DAX', 'Frankfurter Börse'] },
      { name: 'SAP', ticker: 'SAP', keywords: ['SAP'] },
      { name: 'Siemens', ticker: 'SIE', keywords: ['Siemens'] },
      { name: 'Allianz', ticker: 'ALV', keywords: ['Allianz'] },
      { name: 'Deutsche Telekom', ticker: 'DTE', keywords: ['Telekom'] },
      { name: 'Mercedes-Benz', ticker: 'MBG', keywords: ['Mercedes'] },
      { name: 'Volkswagen', ticker: 'VOW3', keywords: ['Volkswagen', 'VW'] }
    ],
    more: [
      { name: 'BASF', ticker: 'BAS', keywords: ['BASF'] },
      { name: 'BMW', ticker: 'BMW', keywords: ['BMW'] },
      { name: 'Deutsche Bank', ticker: 'DBK', keywords: ['Deutsche Bank'] },
      { name: 'Rheinmetall', ticker: 'RHM', keywords: ['Rheinmetall'] },
      { name: 'Bayer', ticker: 'BAYN', keywords: ['Bayer'] },
      { name: 'Infineon', ticker: 'IFX', keywords: ['Infineon'] },
      { name: 'Adidas', ticker: 'ADS', keywords: ['Adidas'] }
    ]
  },
  br: {
    defaults: [
      { name: 'Ibovespa', keywords: ['Ibovespa', 'B3'] },
      { name: 'Petrobras', ticker: 'PETR4', keywords: ['Petrobras'] },
      { name: 'Vale', ticker: 'VALE3', keywords: ['mineradora Vale', 'Vale S.A.'] },
      { name: 'Itaú Unibanco', ticker: 'ITUB4', keywords: ['Itaú'] },
      { name: 'Bradesco', ticker: 'BBDC4', keywords: ['Bradesco'] },
      { name: 'Banco do Brasil', ticker: 'BBAS3', keywords: ['Banco do Brasil'] },
      { name: 'Ambev', ticker: 'ABEV3', keywords: ['Ambev'] }
    ],
    more: [
      { name: 'WEG', ticker: 'WEGE3', keywords: ['WEG'] },
      { name: 'Embraer', ticker: 'EMBR3', keywords: ['Embraer'] },
      { name: 'Magazine Luiza', ticker: 'MGLU3', keywords: ['Magazine Luiza', 'Magalu'] },
      { name: 'Suzano', ticker: 'SUZB3', keywords: ['Suzano'] },
      { name: 'JBS', ticker: 'JBSS3', keywords: ['JBS'] },
      { name: 'Eletrobras', ticker: 'ELET3', keywords: ['Eletrobras'] }
    ]
  }
}

const seedItem = (seed: EquitySeed): WatchItem => equityItem(seed.name, seed.keywords, seed.ticker)

/** Companies offered when adding to the watchlist, most invested first. */
export function suggestedEquities(country: CountryCode): WatchItem[] {
  const pack = EQUITIES[country]
  return pack ? [...pack.defaults, ...pack.more].map(seedItem) : []
}

/** Foreign currencies watched by default: the ones people there hold and price things in. */
const DEFAULT_CURRENCIES: Partial<Record<CountryCode, string[]>> = {
  tr: ['USD', 'EUR', 'GBP'],
  us: ['EUR', 'GBP', 'JPY'],
  in: ['USD', 'EUR', 'GBP'],
  gb: ['USD', 'EUR'],
  de: ['USD', 'GBP', 'CHF'],
  br: ['USD', 'EUR']
}

/**
 * The watchlist before the user changes it: the country's most held currencies, gold and
 * silver, Bitcoin and Ethereum, its stock market and its most invested-in companies.
 */
export function defaultWatchlist(country: CountryCode, language: string): WatchItem[] {
  if (!marketsCountry(country)) return []
  return [
    ...(DEFAULT_CURRENCIES[country] ?? []).map((code) => currencyItem(code, language)),
    metalItem('XAU', language),
    metalItem('XAG', language),
    cryptoItem('BTC', language),
    cryptoItem('ETH', language),
    ...(EQUITIES[country]?.defaults ?? []).map(seedItem)
  ]
}

export const MAX_WATCHLIST = 60
const MAX_KEYWORDS = 20
const MAX_TEXT = 60

const isKind = (value: unknown): value is AssetKind => ASSET_KINDS.includes(value as AssetKind)

/** A watchlist from settings or the renderer, validated: known kinds, tidy words, no duplicates, capped. */
export function cleanWatchlist(list: readonly unknown[]): WatchItem[] {
  const seen = new Set<string>()
  const clean: WatchItem[] = []
  for (const raw of list) {
    if (!raw || typeof raw !== 'object') continue
    const item = raw as Record<string, unknown>
    if (!isKind(item.kind) || typeof item.code !== 'string') continue
    const code = item.code.trim().slice(0, MAX_TEXT)
    if (!code) continue
    const kind = item.kind
    if (kind === 'currency' && !(CURRENCIES as readonly string[]).includes(code)) continue
    if (kind === 'metal' && !(METALS as readonly string[]).includes(code)) continue
    if (kind === 'crypto' && !/^[A-Z0-9]{2,10}$/.test(code)) continue
    const id = watchItemId(kind, code)
    if (seen.has(id)) continue
    seen.add(id)
    const keywords = Array.isArray(item.keywords)
      ? [...new Set(item.keywords.filter((k): k is string => typeof k === 'string').map((k) => k.trim()))]
          .filter((k) => k.length > 0 && k.length <= MAX_TEXT)
          .slice(0, MAX_KEYWORDS)
      : []
    const name = typeof item.name === 'string' ? item.name.trim().slice(0, MAX_TEXT) : ''
    clean.push({ id, kind, code, name: kind === 'equity' ? name || code : name, keywords })
    if (clean.length >= MAX_WATCHLIST) break
  }
  return clean
}

const escapeRegExp = (text: string): string => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

/**
 * A test for (folded, see `foldText`) text that mentions any of the keywords, or null when
 * there are none. Keywords match whole words — "altın" is not "altında" — unless they end
 * in `*`: "dolar*" also finds "doları" and "dolardan". Case, accents and Turkish letters
 * do not matter, and a phrase matches with any spacing between its words.
 */
export function keywordMatcher(keywords: readonly string[]): ((folded: string) => boolean) | null {
  const parts = keywords
    .map((keyword) => {
      const prefix = keyword.trim().endsWith('*')
      const words = foldText(keyword.replace(/\*+\s*$/, ''))
        .trim()
        .split(/\s+/)
        .filter(Boolean)
      if (words.length === 0) return null
      const body = words.map(escapeRegExp).join('\\s+')
      return prefix ? body : `${body}(?![\\p{L}\\p{N}])`
    })
    .filter((part): part is string => part !== null)
  if (parts.length === 0) return null
  const pattern = new RegExp(`(?<![\\p{L}\\p{N}])(?:${parts.join('|')})`, 'u')
  return (folded) => pattern.test(folded)
}
