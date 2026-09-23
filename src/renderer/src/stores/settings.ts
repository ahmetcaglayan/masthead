import { create } from 'zustand'
import { DEFAULT_SETTINGS, mergeSettings, type Settings, type SettingsPatch } from '@shared/settings'
import { api } from '@/lib/api'

interface SettingsState {
  settings: Settings
  ready: boolean
  init(): Promise<Settings>
  /** Optimistically applies the patch, then persists it through the main process. */
  update(patch: SettingsPatch): Promise<void>
  reset(): Promise<void>
}

export const useSettings = create<SettingsState>((set, get) => ({
  settings: DEFAULT_SETTINGS,
  ready: false,

  async init() {
    const settings = await api.settings.get()
    set({ settings, ready: true })
    api.settings.onChange((next) => set({ settings: next }))
    return settings
  },

  async update(patch) {
    set({ settings: mergeSettings(get().settings, patch) })
    const saved = await api.settings.update(patch)
    set({ settings: saved })
  },

  async reset() {
    set({ settings: await api.settings.reset() })
  }
}))

/** Read settings outside React. */
export const getSettings = (): Settings => useSettings.getState().settings
