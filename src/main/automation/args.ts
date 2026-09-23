import { isAbsolute, resolve } from 'node:path'
import { UI_LANGUAGES, type UiLanguage } from '@shared/settings'

/** Every screenshot the `--screenshots` mode knows, in the order they are taken. */
export const SHOT_NAMES = [
  'onboarding',
  'home',
  'home-scrolled',
  'digest',
  'latest',
  'breaking',
  'category-economy',
  'local',
  'sources',
  'settings',
  'settings-typography',
  'search',
  'reader',
  'dialog-web'
] as const

export type ShotName = (typeof SHOT_NAMES)[number]

export type ShotTheme = 'dark' | 'light'

const THEMES: readonly ShotTheme[] = ['dark', 'light']
const DEFAULT_OUT_DIR = 'assets/screenshots'

export interface ScreenshotOptions {
  mode: 'screenshots'
  /** Absolute directory the PNGs are written to. */
  outDir: string
  shots: ShotName[]
  langs: UiLanguage[]
  themes: ShotTheme[]
  /** Device scale factor the pages are rendered at (1 = 1440×900 pixels). */
  scale: number
  /** Also print the app's info logs (stderr). */
  verbose: boolean
}

export interface SelftestOptions {
  mode: 'selftest'
  verbose: boolean
}

export type AutomationOptions = ScreenshotOptions | SelftestOptions

/** A bad automation command line; the message is meant for the person who typed it. */
export class AutomationArgsError extends Error {
  override name = 'AutomationArgsError'
}

/** `--name=value` → value; `--name` → ''; absent → undefined. Exact names only. */
function flag(args: readonly string[], name: string): string | undefined {
  let value: string | undefined
  for (const arg of args) {
    if (arg === `--${name}`) value = ''
    else if (arg.startsWith(`--${name}=`)) value = arg.slice(name.length + 3)
  }
  return value
}

function list<T extends string>(raw: string | undefined, allowed: readonly T[], what: string): T[] {
  if (raw === undefined || raw.trim() === '') return [...allowed]
  const items = [
    ...new Set(
      raw
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean)
    )
  ]
  const unknown = items.filter((item) => !(allowed as readonly string[]).includes(item))
  if (unknown.length > 0) {
    throw new AutomationArgsError(`Unknown ${what}: ${unknown.join(', ')} (expected ${allowed.join(', ')})`)
  }
  // Keep the canonical order, so files come out in the same sequence every run.
  return allowed.filter((item) => items.includes(item))
}

/**
 * The automation mode asked for on the command line, or null for a normal run.
 * Only the exact flags `--screenshots[=<outDir>]` and `--selftest` switch a mode
 * on; `cwd` resolves a relative output directory.
 */
export function parseAutomationArgs(argv: readonly string[], cwd: string): AutomationOptions | null {
  const args = argv.slice(1)
  const screenshots = flag(args, 'screenshots')
  const selftest = flag(args, 'selftest')
  if (screenshots === undefined && selftest === undefined) return null
  if (screenshots !== undefined && selftest !== undefined) {
    throw new AutomationArgsError('--screenshots and --selftest cannot be combined')
  }
  const verbose = flag(args, 'verbose') !== undefined
  if (selftest !== undefined) return { mode: 'selftest', verbose }

  const dir = screenshots || DEFAULT_OUT_DIR
  const rawScale = flag(args, 'scale')
  const scale = rawScale ? Number(rawScale) : 1
  if (!Number.isFinite(scale) || scale < 1 || scale > 3) {
    throw new AutomationArgsError(`--scale must be a number from 1 to 3 (got ${rawScale})`)
  }
  return {
    mode: 'screenshots',
    outDir: isAbsolute(dir) ? dir : resolve(cwd, dir),
    shots: list(flag(args, 'shots'), SHOT_NAMES, 'shot'),
    langs: list(flag(args, 'langs'), UI_LANGUAGES, 'language'),
    themes: list(flag(args, 'themes'), THEMES, 'theme'),
    scale,
    verbose
  }
}
