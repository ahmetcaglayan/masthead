import { fontById, type Settings } from '@shared/settings'
import { api } from '@/lib/api'

const darkQuery = window.matchMedia('(prefers-color-scheme: dark)')

export function resolveTheme(theme: Settings['theme']): 'light' | 'dark' {
  if (theme === 'system') return darkQuery.matches ? 'dark' : 'light'
  return theme
}

/**
 * Push appearance settings onto <html>: theme, accent, font stacks and scale,
 * then recolour the native caption buttons to match the title bar.
 */
export function applyAppearance(settings: Settings): void {
  const root = document.documentElement
  const theme = resolveTheme(settings.theme)
  root.dataset.theme = theme
  root.dataset.accent = settings.accent
  root.dataset.density = settings.layout.density
  root.style.setProperty('--font-ui-stack', fontById(settings.typography.uiFont).stack)
  root.style.setProperty('--font-headline-stack', fontById(settings.typography.headlineFont).stack)
  root.style.setProperty('--font-reading-stack', fontById(settings.typography.readingFont).stack)
  root.style.setProperty('--font-scale', String(settings.typography.scale))

  const styles = getComputedStyle(root)
  api.window.setTitleBarColors({
    background: styles.getPropertyValue('--canvas').trim() || (theme === 'dark' ? '#0e0f12' : '#f6f4ef'),
    symbol: styles.getPropertyValue('--fg-muted').trim() || (theme === 'dark' ? '#a6a299' : '#5c574d')
  })
}

/** Re-apply when the OS theme flips while the user is on "system". */
export function watchSystemTheme(getSettings: () => Settings): () => void {
  const onChange = (): void => {
    const settings = getSettings()
    if (settings.theme === 'system') applyAppearance(settings)
  }
  darkQuery.addEventListener('change', onChange)
  return () => darkQuery.removeEventListener('change', onChange)
}
