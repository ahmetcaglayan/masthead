/**
 * Internal contract of the news pipeline (src/core/news). `createBackend()` in
 * src/core/index.ts only talks to the pipeline through `NewsService`.
 */
import type { CountryPack } from '../../shared/countries/types'
import type { Settings } from '../../shared/settings'
import type { Article, ArticleDetail, NewsSnapshot, NewsUpdate, RefreshStatus } from '../../shared/types'
import type { Logger } from '../backend'

export interface NewsServiceOptions {
  /** Directory for `news-<country>.json` and the image cache. */
  cacheDir: string
  /** Returns the country pack for a country code, or undefined if none is shipped. */
  getPack: (country: Settings['country']) => CountryPack | undefined
  /** Current settings (country, disabled sources, location, refresh interval). */
  getSettings: () => Settings
  appVersion: string
  logger: Logger
  now: () => number
  fetch: typeof fetch
  /** When true, never schedule timers; refresh only on explicit calls. */
  manualRefresh: boolean
  onUpdated: (update: NewsUpdate) => void
  onStatus: (status: RefreshStatus) => void
  /** Newly-seen breaking articles (not on the first load from cache). */
  onBreaking: (articles: Article[]) => void
}

export interface NewsService {
  /** Load the on-disk cache for the current country and start the schedule. */
  start(): Promise<void>
  stop(): Promise<void>
  snapshot(): NewsSnapshot
  status(): RefreshStatus
  refresh(force?: boolean): Promise<void>
  resolveImage(articleId: string): Promise<string | null>
  detail(articleId: string): Promise<ArticleDetail | null>
  /**
   * Called by the backend after every settings change. The service decides what
   * to do: switch country (load that cache + refresh), refetch when sources are
   * re-enabled or the province changes, drop disabled sources from the
   * snapshot, reschedule on interval change.
   */
  settingsChanged(prev: Settings, next: Settings): void
}

export type CreateNewsService = (options: NewsServiceOptions) => NewsService
