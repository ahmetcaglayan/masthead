import type { CategoryId } from './categories'

export type CountryCode = 'tr' | 'us' | 'in' | 'gb' | 'de' | 'br' | 'fr' | 'es' | 'it' | 'nl' | 'az'

/** Geographic region id inside a country pack (e.g. `marmara` for Turkey). */
export type RegionId = string

export type SourceKind =
  | 'mainstream'
  | 'public'
  | 'agency'
  | 'independent'
  | 'international'
  | 'business'
  | 'sports'
  | 'technology'
  | 'local'
  | 'aggregator'

export interface FeedDef {
  url: string
  category: CategoryId
  /** Feed lists the site's front-page / manşet stories. */
  headline?: boolean
  /** Feed is the site's breaking-news ("son dakika") stream. */
  breaking?: boolean
  /** Force a charset when the server lies about it (e.g. `windows-1254`). */
  encoding?: string
  /**
   * IANA zone the feed's timestamps are really in, overriding any offset they
   * declare (CNN Türk labels Turkish time as GMT; Investing omits it and means UTC).
   */
  timeZone?: string
  /**
   * City-specific feed (province code). Only fetched when the user's selected
   * province matches, so 81 city feeds don't all refresh every cycle.
   */
  province?: string
  /**
   * Region-wide local feed (a Scottish or Welsh national paper): fetched when the user's
   * province lies in that region, or the region itself is selected.
   */
  region?: RegionId
}

export interface SourceDef {
  id: string
  name: string
  homepage: string
  /** Favicon / touch icon URL. */
  icon?: string
  /** Brand colour, used for image placeholders and source chips. */
  color?: string
  kind: SourceKind
  /** BCP-47 content language, e.g. `tr`. */
  language: string
  feeds: FeedDef[]
  /** Sources are on by default unless this is `false`. */
  defaultEnabled?: boolean
  /** For local outlets: the provinces they primarily cover. */
  provinces?: string[]
}

export interface Province {
  /** Plate code for Turkey (`34`), the ISO 3166-2 suffix for states (`CA`, `BY`, `SP`, `UP`), a short slug for UK areas. */
  code: string
  name: string
  slug: string
  region: RegionId
  /** Alternative spellings used in news copy (`Antep`, `Urfa`, `İzmit`). */
  aliases: string[]
  /** Name is also a common word (e.g. `Ordu` = army); needs stricter matching. */
  ambiguous?: boolean
}

export interface District {
  name: string
  provinceCode: string
}

export interface Article {
  /** Stable id: hash of the canonical URL. */
  id: string
  url: string
  /** Full headline — never truncated in the data model. */
  title: string
  /**
   * The feed's full description as plain text (paragraph breaks kept as "\n\n"),
   * capped at ~1500 characters. The UI shows as much of it as the layout allows,
   * so people can follow the news without clicking through.
   */
  summary: string
  /** True when the feed carried a longer body than the summary; fetch it with `news.detail()`. */
  hasDetail: boolean
  image?: string
  /** Publish time (epoch ms). Falls back to first-seen time when a feed has no date. */
  publishedAt: number
  /** First time we saw this article (epoch ms). */
  fetchedAt: number
  sourceId: string
  categories: CategoryId[]
  isBreaking: boolean
  /** Came from a source's front-page / manşet feed. */
  isHeadline: boolean
  /** Province codes mentioned in the story. */
  provinces: string[]
  regions: RegionId[]
  author?: string
  clusterId?: string
}

/**
 * The long-form body a feed shipped with an article (content:encoded / long
 * description), cleaned to plain paragraphs. Kept out of the snapshot to keep it
 * small; loaded on demand for inline "read more" expansion.
 */
export interface ArticleDetail {
  id: string
  paragraphs: string[]
  /** Extra images found in the body, absolute URLs. */
  images: string[]
}

/** A group of articles from different sources that cover the same story. */
export interface StoryCluster {
  id: string
  articleIds: string[]
  leadId: string
  sourceIds: string[]
  /** Ranking score used for the manşet area; higher is more prominent. */
  score: number
  /** Newest publish time of any member (epoch ms). */
  updatedAt: number
}

export interface FeedStatus {
  sourceId: string
  url: string
  ok: boolean
  itemCount: number
  lastFetchedAt?: number
  lastError?: string
}

export interface NewsSnapshot {
  country: CountryCode
  articles: Article[]
  clusters: StoryCluster[]
  feeds: FeedStatus[]
  /** Epoch ms of the last completed refresh, 0 if never refreshed. */
  updatedAt: number
}

export interface RefreshStatus {
  state: 'idle' | 'refreshing'
  done: number
  total: number
  /** Epoch ms of the last completed refresh. */
  lastCompletedAt: number
}

export interface NewsUpdate {
  updatedAt: number
  /** Articles that were not in the previous snapshot. */
  newCount: number
  newBreaking: number
}

export interface ReaderContent {
  url: string
  title: string
  byline?: string
  siteName?: string
  /** Sanitised article HTML. */
  html: string
  textLength: number
  image?: string
  publishedAt?: number
}

export interface ReaderBounds {
  x: number
  y: number
  width: number
  height: number
}

export type ReaderEvent =
  | { type: 'loading'; loading: boolean }
  | { type: 'progress'; value: number }
  | { type: 'navigated'; url: string; title: string; canGoBack: boolean; canGoForward: boolean }
  | { type: 'failed'; url: string; code: number; description: string }
  | { type: 'escape' }
  | { type: 'shortcut'; key: 'next' | 'prev' | 'reader' | 'find' }

export interface SavedArticle {
  article: Article
  savedAt: number
}

export interface HistoryEntry {
  article: Article
  readAt: number
}

export interface Library {
  saved: SavedArticle[]
  history: HistoryEntry[]
}
