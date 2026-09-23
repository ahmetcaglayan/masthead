import { create } from 'zustand'
import type { UpdateStatus } from '@shared/ipc'
import { api } from '@/lib/api'

/** Where a copy that cannot install updates itself sends the user. */
export const RELEASES_URL = 'https://github.com/ahmetcaglayan/masthead/releases/latest'

interface UpdatesState {
  /** Null until the host has answered. */
  status: UpdateStatus | null
  init(): Promise<void>
  check(): Promise<void>
  download(): Promise<void>
  install(): Promise<void>
}

/** The app updater's state, as the host reports it. */
export const useUpdates = create<UpdatesState>((set) => ({
  status: null,

  async init() {
    api.updates.onChange((status) => set({ status }))
    set({ status: await api.updates.status() })
  },

  async check() {
    set({ status: await api.updates.check() })
  },

  download: () => api.updates.download(),
  install: () => api.updates.install()
}))
