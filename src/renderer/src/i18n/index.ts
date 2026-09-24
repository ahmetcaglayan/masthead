import { useSyncExternalStore } from 'react'
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import type { UiLanguage } from '@shared/settings'

/**
 * Locale files live in `locales/<lang>/<namespace>.json` and are picked up
 * automatically. Namespaces: common, news, reader, onboarding, settings.
 * English is the source of truth; every key must exist in `en`.
 */
const modules = import.meta.glob<{ default: Record<string, unknown> }>('./locales/*/*.json', { eager: true })

type Resources = Record<string, Record<string, Record<string, unknown>>>

const resources: Resources = {}
for (const [path, mod] of Object.entries(modules)) {
  const match = path.match(/\.\/locales\/([^/]+)\/([^/]+)\.json$/)
  if (!match) continue
  const [, lng, ns] = match
  resources[lng] ??= {}
  resources[lng][ns] = mod.default
}

export const NAMESPACES = ['common', 'news', 'reader', 'onboarding', 'settings'] as const

export async function initI18n(language: UiLanguage): Promise<typeof i18n> {
  await i18n.use(initReactI18next).init({
    resources,
    lng: language,
    fallbackLng: 'en',
    ns: [...NAMESPACES],
    defaultNS: 'common',
    interpolation: { escapeValue: false },
    returnNull: false
  })
  document.documentElement.lang = language
  return i18n
}

export async function setLanguage(language: UiLanguage): Promise<void> {
  if (i18n.language !== language) await i18n.changeLanguage(language)
  document.documentElement.lang = language
}

function subscribeLanguage(onChange: () => void): () => void {
  i18n.on('languageChanged', onChange)
  return () => i18n.off('languageChanged', onChange)
}

/**
 * The UI language, re-rendering when it changes. A lighter alternative to
 * `useTranslation()` for the many small components that only format dates.
 */
export function useLanguage(): string {
  return useSyncExternalStore(subscribeLanguage, () => i18n.language)
}

/**
 * BCP-47 locale for Intl APIs for a UI language. English is British, like its
 * copy ("colour"): "Wednesday 23 September 2026"; Portuguese is Brazilian.
 */
const LOCALES: Record<string, string> = { tr: 'tr-TR', de: 'de-DE', pt: 'pt-BR', hi: 'hi-IN', fr: 'fr-FR' }

export function localeFor(language: string): string {
  return LOCALES[language] ?? 'en-GB'
}

export default i18n
