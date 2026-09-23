import { join } from 'node:path'
import { DEFAULT_SETTINGS, mergeSettings, type Settings, type SettingsPatch } from '../../shared/settings'
import type { Logger } from '../backend'
import { JsonFile } from './json-file'

export type SettingsListener = (prev: Settings, next: Settings) => void

export interface StoreOptions {
  logger?: Logger
  /** Save debounce; see `JsonFile`. */
  debounceMs?: number
}

/** Settings persisted as `<dataDir>/settings.json`, always complete and validated. */
export class SettingsStore {
  private readonly listeners = new Set<SettingsListener>()

  private constructor(
    private readonly file: JsonFile<Settings>,
    private current: Settings,
    private readonly logger?: Logger
  ) {}

  static async open(dataDir: string, options: StoreOptions = {}): Promise<SettingsStore> {
    const file = new JsonFile<Settings>(join(dataDir, 'settings.json'), { ...options, pretty: true })
    const settings = await file.load(mergeSettings(DEFAULT_SETTINGS, {}), validateSettings)
    return new SettingsStore(file, settings, options.logger)
  }

  get(): Settings {
    return this.current
  }

  /** Merge an untrusted patch; invalid fields are dropped. Returns the new settings. */
  update(patch: SettingsPatch): Settings {
    return this.commit(mergeSettings(this.current, patch))
  }

  /** Back to defaults, keeping the window bounds. */
  reset(): Settings {
    return this.commit(mergeSettings(DEFAULT_SETTINGS, { window: this.current.window }))
  }

  /** Called after every effective change. Returns an unsubscribe function. */
  onChange(listener: SettingsListener): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  flush(): Promise<void> {
    return this.file.flush()
  }

  private commit(next: Settings): Settings {
    const prev = this.current
    if (JSON.stringify(prev) === JSON.stringify(next)) return prev
    this.current = next
    this.file.save(next)
    for (const listener of this.listeners) {
      try {
        listener(prev, next)
      } catch (error) {
        this.logger?.error('Settings listener failed', error)
      }
    }
    return next
  }
}

function validateSettings(raw: unknown): Settings {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw))
    throw new Error('Settings file is not a JSON object')
  return mergeSettings(DEFAULT_SETTINGS, raw)
}
