import { Notification } from 'electron'
import { getSource } from '@shared/countries'
import { muteMatcherFor } from '@shared/mute'
import type { Settings } from '@shared/settings'
import type { Article } from '@shared/types'

const MAX_PER_BATCH = 3
const LABEL = {
  en: 'Breaking',
  tr: 'Son dakika',
  de: 'Eilmeldung',
  pt: 'Urgente',
  hi: 'ब्रेकिंग',
  fr: 'Alerte info'
} as const

export interface BreakingNotifierOptions {
  getSettings(): Settings
  /** A notification was clicked: bring the window forward and open the story. */
  onOpen(article: Article): void
}

/**
 * Desktop notifications for newly seen breaking stories, newest first and at
 * most three per refresh, titled "<source> · Son dakika" ("Breaking" in the English UI).
 * Stories mentioning a muted word stay silent.
 */
export function createBreakingNotifier({
  getSettings,
  onOpen
}: BreakingNotifierOptions): (articles: Article[]) => void {
  // Hold shown notifications so their click handlers are not garbage collected.
  const shown = new Set<Notification>()

  return (articles) => {
    const settings = getSettings()
    if (!settings.notifications.breaking || articles.length === 0 || !Notification.isSupported()) return
    // A muted word silences its breaking news too.
    const isMuted = muteMatcherFor(settings.muted.keywords)
    const newest = articles
      .filter((article) => !isMuted?.(article))
      .sort((a, b) => b.publishedAt - a.publishedAt)
      .slice(0, MAX_PER_BATCH)
    for (const article of newest) {
      const source = getSource(settings.country, article.sourceId)?.name ?? article.sourceId
      const title = `${source} · ${LABEL[settings.language]}`
      const notification = new Notification({ title, body: article.title })
      const release = (): void => {
        shown.delete(notification)
      }
      notification.on('click', () => {
        release()
        onOpen(article)
      })
      notification.on('close', release)
      notification.on('failed', release)
      shown.add(notification)
      notification.show()
    }
  }
}
