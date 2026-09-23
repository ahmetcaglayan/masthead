import type { MastheadApi } from '@shared/ipc'

declare global {
  interface Window {
    /** Exposed by the preload script. Undefined when the renderer runs in a plain browser (web preview). */
    masthead?: MastheadApi
  }
}

/** True inside the Electron app, false in the browser-based web preview (`npm run dev:web`). */
export const isElectron = typeof window !== 'undefined' && window.masthead !== undefined

/**
 * The bridge to the main process. Assigned once by `initApi()` during boot,
 * before React renders, so components can import and use it directly.
 */
export let api: MastheadApi

export async function initApi(): Promise<MastheadApi> {
  if (window.masthead) {
    api = window.masthead
  } else {
    const { createWebPreviewApi } = await import('./web-preview-api')
    api = createWebPreviewApi()
  }
  return api
}
