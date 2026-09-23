import { create } from 'zustand'

/** Reader-mode body typeface: the reading font from settings, or the interface font. */
export type ReaderTypeface = 'reading' | 'ui'

export const READER_SCALE = { min: 0.9, max: 1.3, step: 0.1 } as const

const SCALE_KEY = 'reader.scale'
const TYPEFACE_KEY = 'reader.font'

function load(key: string): string | null {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

function save(key: string, value: string): void {
  try {
    localStorage.setItem(key, value)
  } catch {
    // Storage can be unavailable (private window, blocked site data); the choice then lasts this session.
  }
}

function clampScale(value: number): number {
  if (!Number.isFinite(value)) return 1
  return Math.round(Math.min(READER_SCALE.max, Math.max(READER_SCALE.min, value)) * 10) / 10
}

interface ReaderPrefsState {
  /** Multiplier for the Reader-mode text size. */
  scale: number
  typeface: ReaderTypeface
  setScale(scale: number): void
  setTypeface(typeface: ReaderTypeface): void
}

/** Reader-mode text size and typeface, remembered in this browser's local storage. */
export const useReaderPrefs = create<ReaderPrefsState>((set) => ({
  scale: clampScale(Number(load(SCALE_KEY) ?? 1)),
  typeface: load(TYPEFACE_KEY) === 'ui' ? 'ui' : 'reading',

  setScale(scale) {
    const next = clampScale(scale)
    save(SCALE_KEY, String(next))
    set({ scale: next })
  },

  setTypeface(typeface) {
    save(TYPEFACE_KEY, typeface)
    set({ typeface })
  }
}))
