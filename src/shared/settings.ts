import { isCategoryId, type CategoryId } from './categories'
import type { CountryCode, RegionId } from './types'

export const UI_LANGUAGES = ['en', 'tr', 'de', 'pt'] as const
export type UiLanguage = (typeof UI_LANGUAGES)[number]

export type ThemeMode = 'system' | 'light' | 'dark'

export const ACCENTS = ['ember', 'ocean', 'forest', 'violet', 'gold'] as const
export type AccentId = (typeof ACCENTS)[number]

export type Density = 'comfortable' | 'compact'
export type CardStyle = 'magazine' | 'grid' | 'list'
export type ReaderMode = 'web' | 'reader'

export type FontId =
  | 'inter'
  | 'figtree'
  | 'nunito-sans'
  | 'ibm-plex-sans'
  | 'lexend'
  | 'atkinson'
  | 'newsreader'
  | 'source-serif'
  | 'literata'
  | 'lora'
  | 'merriweather'
  | 'system'

export interface FontDef {
  id: FontId
  /** Human-readable family name (not translated). */
  label: string
  /** CSS font-family stack. */
  stack: string
  style: 'sans' | 'serif'
}

export const FONTS: readonly FontDef[] = [
  { id: 'inter', label: 'Inter', stack: "'Inter Variable', 'Inter', system-ui, sans-serif", style: 'sans' },
  { id: 'figtree', label: 'Figtree', stack: "'Figtree Variable', system-ui, sans-serif", style: 'sans' },
  { id: 'nunito-sans', label: 'Nunito Sans', stack: "'Nunito Sans Variable', system-ui, sans-serif", style: 'sans' },
  { id: 'ibm-plex-sans', label: 'IBM Plex Sans', stack: "'IBM Plex Sans Variable', system-ui, sans-serif", style: 'sans' },
  { id: 'lexend', label: 'Lexend', stack: "'Lexend Variable', system-ui, sans-serif", style: 'sans' },
  {
    id: 'atkinson',
    label: 'Atkinson Hyperlegible',
    stack: "'Atkinson Hyperlegible Next Variable', system-ui, sans-serif",
    style: 'sans'
  },
  { id: 'newsreader', label: 'Newsreader', stack: "'Newsreader Variable', Georgia, serif", style: 'serif' },
  { id: 'source-serif', label: 'Source Serif', stack: "'Source Serif 4 Variable', Georgia, serif", style: 'serif' },
  { id: 'literata', label: 'Literata', stack: "'Literata Variable', Georgia, serif", style: 'serif' },
  { id: 'lora', label: 'Lora', stack: "'Lora Variable', Georgia, serif", style: 'serif' },
  { id: 'merriweather', label: 'Merriweather', stack: "'Merriweather Variable', Georgia, serif", style: 'serif' },
  {
    id: 'system',
    label: 'System',
    stack: "system-ui, -apple-system, 'Segoe UI Variable Text', 'Segoe UI', Roboto, sans-serif",
    style: 'sans'
  }
]

export function fontById(id: FontId): FontDef {
  return FONTS.find((f) => f.id === id) ?? FONTS[0]
}

export const REFRESH_INTERVALS = [5, 10, 15, 30, 60] as const

export const TIME_RANGES = ['1h', '6h', '24h', '3d', 'all'] as const
export type TimeRange = (typeof TIME_RANGES)[number]

export interface Settings {
  schemaVersion: 1
  onboardingCompleted: boolean
  language: UiLanguage
  theme: ThemeMode
  accent: AccentId
  country: CountryCode
  /** Topic categories the user cares about; drives the "For you" feed and home sections. */
  interests: CategoryId[]
  location: {
    /** Province code (plate code for Turkey) or null. */
    provinceCode: string | null
    regionId: RegionId | null
  }
  typography: {
    /** Interface and body text. */
    uiFont: FontId
    /** Headlines on cards and the manşet. */
    headlineFont: FontId
    /** Reader-mode article body. */
    readingFont: FontId
    /** Root font scale, 0.85 – 1.3. */
    scale: number
  }
  layout: {
    density: Density
    cardStyle: CardStyle
    sidebarCollapsed: boolean
  }
  sources: {
    /** Source ids the user switched off. */
    disabled: string[]
    /** Ids of sources that are off by default (`defaultEnabled: false`) and that the user switched on. */
    enabled?: string[]
  }
  refresh: {
    intervalMinutes: number
  }
  reader: {
    defaultMode: ReaderMode
    blockAds: boolean
  }
  notifications: {
    breaking: boolean
  }
  window?: {
    width: number
    height: number
    x?: number
    y?: number
    maximized: boolean
  }
}

export const DEFAULT_SETTINGS: Settings = {
  schemaVersion: 1,
  onboardingCompleted: false,
  language: 'en',
  theme: 'system',
  accent: 'ember',
  country: 'tr',
  interests: ['national', 'world', 'economy', 'sports', 'technology'],
  location: { provinceCode: null, regionId: null },
  typography: { uiFont: 'inter', headlineFont: 'newsreader', readingFont: 'literata', scale: 1 },
  layout: { density: 'comfortable', cardStyle: 'magazine', sidebarCollapsed: false },
  sources: { disabled: [], enabled: [] },
  refresh: { intervalMinutes: 10 },
  // Reader mode by default: the article as text, with the publisher's page one click away.
  reader: { defaultMode: 'reader', blockAds: true },
  notifications: { breaking: true }
}

type DeepPartial<T> = { [K in keyof T]?: T[K] extends (infer U)[] ? U[] : T[K] extends object ? DeepPartial<T[K]> : T[K] }
export type SettingsPatch = DeepPartial<Settings>

const pick = <T extends string>(value: unknown, allowed: readonly T[], fallback: T): T =>
  typeof value === 'string' && (allowed as readonly string[]).includes(value) ? (value as T) : fallback

const FONT_IDS = FONTS.map((f) => f.id)
const COUNTRIES: readonly CountryCode[] = ['tr', 'us', 'in', 'gb', 'de', 'br', 'fr', 'es', 'it', 'nl', 'az']

function obj(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : {}
}

/**
 * Merge an untrusted patch (from disk or the renderer) into a base settings
 * object, dropping anything that does not validate. Always returns a complete,
 * valid Settings object.
 */
export function mergeSettings(base: Settings, patch: unknown): Settings {
  const p = obj(patch)
  const typo = obj(p.typography)
  const layout = obj(p.layout)
  const location = obj(p.location)
  const sources = obj(p.sources)
  const refresh = obj(p.refresh)
  const reader = obj(p.reader)
  const notifications = obj(p.notifications)
  const win = obj(p.window)

  const scale = typeof typo.scale === 'number' && Number.isFinite(typo.scale) ? typo.scale : base.typography.scale
  const interval =
    typeof refresh.intervalMinutes === 'number' && refresh.intervalMinutes >= 1
      ? Math.min(240, Math.round(refresh.intervalMinutes))
      : base.refresh.intervalMinutes

  const next: Settings = {
    schemaVersion: 1,
    onboardingCompleted:
      typeof p.onboardingCompleted === 'boolean' ? p.onboardingCompleted : base.onboardingCompleted,
    language: pick(p.language, UI_LANGUAGES, base.language),
    theme: pick(p.theme, ['system', 'light', 'dark'] as const, base.theme),
    accent: pick(p.accent, ACCENTS, base.accent),
    country: pick(p.country, COUNTRIES, base.country),
    interests: Array.isArray(p.interests) ? [...new Set(p.interests.filter(isCategoryId))] : base.interests,
    location: {
      provinceCode:
        location.provinceCode === null || typeof location.provinceCode === 'string'
          ? (location.provinceCode as string | null)
          : base.location.provinceCode,
      regionId:
        location.regionId === null || typeof location.regionId === 'string'
          ? (location.regionId as string | null)
          : base.location.regionId
    },
    typography: {
      uiFont: pick(typo.uiFont, FONT_IDS, base.typography.uiFont),
      headlineFont: pick(typo.headlineFont, FONT_IDS, base.typography.headlineFont),
      readingFont: pick(typo.readingFont, FONT_IDS, base.typography.readingFont),
      scale: Math.min(1.3, Math.max(0.85, scale))
    },
    layout: {
      density: pick(layout.density, ['comfortable', 'compact'] as const, base.layout.density),
      cardStyle: pick(layout.cardStyle, ['magazine', 'grid', 'list'] as const, base.layout.cardStyle),
      sidebarCollapsed:
        typeof layout.sidebarCollapsed === 'boolean' ? layout.sidebarCollapsed : base.layout.sidebarCollapsed
    },
    sources: {
      disabled: Array.isArray(sources.disabled)
        ? [...new Set(sources.disabled.filter((s): s is string => typeof s === 'string'))]
        : base.sources.disabled,
      enabled: Array.isArray(sources.enabled)
        ? [...new Set(sources.enabled.filter((s): s is string => typeof s === 'string'))]
        : base.sources.enabled
    },
    refresh: { intervalMinutes: interval },
    reader: {
      defaultMode: pick(reader.defaultMode, ['web', 'reader'] as const, base.reader.defaultMode),
      blockAds: typeof reader.blockAds === 'boolean' ? reader.blockAds : base.reader.blockAds
    },
    notifications: {
      breaking: typeof notifications.breaking === 'boolean' ? notifications.breaking : base.notifications.breaking
    },
    window: base.window
  }

  if (typeof win.width === 'number' && typeof win.height === 'number') {
    next.window = {
      width: Math.max(900, Math.round(win.width)),
      height: Math.max(600, Math.round(win.height)),
      x: typeof win.x === 'number' ? Math.round(win.x) : undefined,
      y: typeof win.y === 'number' ? Math.round(win.y) : undefined,
      maximized: win.maximized === true
    }
  }

  return next
}
