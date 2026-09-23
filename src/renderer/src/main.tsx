import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/fonts'
import './styles/globals.css'
import { initApi } from '@/lib/api'
import { installAutomation } from '@/lib/automation'
import { applyAppearance, watchSystemTheme } from '@/lib/appearance'
import { initI18n, setLanguage } from '@/i18n'
import { getSettings, useSettings } from '@/stores/settings'
import { useNews } from '@/stores/news'
import { useLibrary } from '@/stores/library'
import { useUpdates } from '@/stores/updates'
import { App } from './App'

let rendered = false

async function boot(): Promise<void> {
  await initApi()
  const settings = await useSettings.getState().init()
  applyAppearance(settings)
  await initI18n(settings.language)

  // Keep <html> and i18n in sync with settings for the lifetime of the app.
  useSettings.subscribe((state, prev) => {
    if (state.settings === prev.settings) return
    applyAppearance(state.settings)
    if (state.settings.language !== prev.settings.language) void setLanguage(state.settings.language)
  })
  watchSystemTheme(getSettings)

  await Promise.all([useLibrary.getState().init(), useNews.getState().init()])

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>
  )
  rendered = true

  // The updater's state arrives behind the first paint; nothing waits for it.
  useUpdates
    .getState()
    .init()
    .catch((error: unknown) => console.warn('Update status unavailable', error))

  // Inert until called: lets the Electron screenshot / self-test modes drive the UI.
  installAutomation()
}

/**
 * Shown in place of the app when it could not start (web mode: the backend failed to load after
 * this page was served). Plain English: translations may not have loaded.
 */
function showStartupFailure(error: unknown): void {
  console.error('Masthead failed to start', error)
  const root = document.getElementById('root')
  // The web host may already show its own notice; once React renders, the app handles errors itself.
  if (!root || rendered || root.hasChildNodes()) return
  const notice = document.createElement('p')
  notice.style.cssText =
    'max-width:40rem;margin:4rem auto;padding:0 1.5rem;font:15px/1.6 system-ui,sans-serif'
  const reason = error instanceof Error ? error.message : String(error)
  notice.append(`Masthead could not start: ${reason} `)
  const reload = document.createElement('button')
  reload.type = 'button'
  reload.textContent = 'Reload'
  reload.addEventListener('click', () => location.reload())
  notice.append(reload)
  root.append(notice)
}

boot().catch(showStartupFailure)
