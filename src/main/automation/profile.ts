import {
  copyFileSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmdirSync,
  statSync,
  unlinkSync,
  writeFileSync,
  type Dirent
} from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { DEFAULT_SETTINGS, mergeSettings, type Settings, type SettingsPatch } from '@shared/settings'
import { APP_CACHE_DIR } from '../paths'

/** Every automation profile lives under `<os temp>/masthead-automation/`. */
const ROOT = join(tmpdir(), 'masthead-automation')
/** Names the process that owns a profile, so later runs can tell ended runs from running ones. */
const PID_FILE = 'automation.pid'
/** A profile this old is an ended run's even if its pid now belongs to another process (runs are capped far below). */
const MAX_AGE_MS = 24 * 60 * 60 * 1000
/** A profile without a pid file younger than this may be one another run is creating right now. */
const NEW_PROFILE_MS = 60 * 1000
const COUNTRY = 'tr'
const NEWS_CACHE = [`news-${COUNTRY}.json`, `images-${COUNTRY}.json`]
const ADBLOCK_ENGINE = 'adblock-engine.bin'

export interface ProfileOptions {
  /** `screenshots` or `selftest`: names the profile directory. */
  mode: string
  settings: SettingsPatch
  /** Directories whose `cache/` may hold a news cache to start from (the first one that has it wins). */
  newsCacheFrom?: string[]
  /** The normal profile, whose compiled ad block engine may be reused. */
  adblockFrom?: string
}

export interface Profile {
  /** The fresh userData directory. */
  dir: string
  cacheDir: string
  /** Where the news cache was copied from, if anywhere. */
  seededFrom: string | null
  adblockSeeded: boolean
}

/**
 * Create a fresh, private userData directory for an automation run, so it never
 * touches (or collides with) the profile of a running app, and seed it with
 * settings and, when asked, the web mode's news cache. Synchronous: it runs
 * before `app.setPath('userData')`, which must happen before the app is ready.
 */
export function createProfile({ mode, settings, newsCacheFrom = [], adblockFrom }: ProfileOptions): Profile {
  mkdirSync(ROOT, { recursive: true })
  sweepEndedProfiles()
  const dir = mkdtempSync(join(ROOT, `${mode}-`))
  writeFileSync(join(dir, PID_FILE), String(process.pid))
  const cacheDir = join(dir, APP_CACHE_DIR)
  mkdirSync(cacheDir, { recursive: true })

  const seeded: Settings = mergeSettings(DEFAULT_SETTINGS, settings)
  writeFileSync(join(dir, 'settings.json'), JSON.stringify(seeded, null, 2))

  let seededFrom: string | null = null
  for (const source of newsCacheFrom) {
    // Web mode's data folder is not a Chromium profile, so its cache folder is plain `cache`.
    const from = join(source, 'cache')
    if (!existsSync(join(from, NEWS_CACHE[0]))) continue
    for (const file of NEWS_CACHE) {
      if (existsSync(join(from, file))) copyFileSync(join(from, file), join(cacheDir, file))
    }
    seededFrom = from
    break
  }

  let adblockSeeded = false
  const engine = adblockFrom ? join(adblockFrom, APP_CACHE_DIR, ADBLOCK_ENGINE) : null
  if (engine && existsSync(engine)) {
    try {
      copyFileSync(engine, join(cacheDir, ADBLOCK_ENGINE))
      adblockSeeded = true
    } catch {
      // The app may be writing it right now; the engine is then built from the lists instead.
    }
  }
  return { dir, cacheDir, seededFrom, adblockSeeded }
}

/** Delete as much of an ended run's profile as possible; the pid file goes last, with the directory. */
function removeProfile(dir: string): void {
  removeTree(dir, join(dir, PID_FILE))
  if (safeList(dir).length <= 1) removeTree(dir)
}

/** Depth-first delete that skips what it cannot remove (`rmSync` stops at the first locked file). */
function removeTree(path: string, keep?: string): void {
  let entries: Dirent[]
  try {
    entries = readdirSync(path, { withFileTypes: true })
  } catch {
    return
  }
  for (const entry of entries) {
    const child = join(path, entry.name)
    if (child === keep) continue
    if (entry.isDirectory()) removeTree(child)
    else {
      try {
        unlinkSync(child)
      } catch {
        // Locked; swept later.
      }
    }
  }
  try {
    rmdirSync(path)
  } catch {
    // Not empty yet.
  }
}

/**
 * Remove the profiles of automation runs that have ended: their process is gone
 * (or they no longer say which it was and are not brand new). Profiles of runs
 * still going — in parallel, from another checkout — are left alone.
 */
function sweepEndedProfiles(): void {
  const now = Date.now()
  for (const name of safeList(ROOT)) {
    const path = join(ROOT, name)
    try {
      const pid = Number(readFileSync(join(path, PID_FILE), 'utf8'))
      if (!isRunning(pid) || now - statSync(path).mtimeMs > MAX_AGE_MS) removeProfile(path)
    } catch {
      // No pid file: an ended run's partly deleted profile, unless it is being created right now.
      try {
        if (now - statSync(path).mtimeMs > NEW_PROFILE_MS) removeProfile(path)
      } catch {
        // Gone already.
      }
    }
  }
}

function isRunning(pid: number): boolean {
  if (!Number.isInteger(pid) || pid <= 0) return false
  try {
    process.kill(pid, 0)
    return true
  } catch (error) {
    // EPERM: it exists but belongs to someone else.
    return (error as NodeJS.ErrnoException).code === 'EPERM'
  }
}

function safeList(dir: string): string[] {
  try {
    return readdirSync(dir)
  } catch {
    return []
  }
}
