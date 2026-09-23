import { EventEmitter } from 'node:events'
import { getCountryPack } from '../shared/countries'
import type { Backend, BackendEvents, BackendOptions, Logger } from './backend'
import { createLogger, scopeLogger } from './log'
import { createNewsService } from './news/service'
import type { NewsService, NewsServiceOptions } from './news/types'
import { createReaderService } from './reader'
import { LibraryStore } from './stores/library-store'
import { SettingsStore } from './stores/settings-store'

export type { Backend, BackendEventName, BackendEvents, BackendOptions, Logger } from './backend'
export { createLogger, scopeLogger, type LogEntry, type LogLevel, type LogSink } from './log'

/**
 * Build the backend: load settings and library from `dataDir`, wire the news
 * pipeline and reader, and fan their changes out as typed events. Call `start()`
 * to load the news cache and begin refreshing; `stop()` before exit.
 */
export async function createBackend(options: BackendOptions): Promise<Backend> {
  const logger = options.logger ?? createLogger('core')
  const now = options.now ?? Date.now
  const fetchImpl = options.fetch ?? ((input, init) => fetch(input, init))
  const events = new TypedEmitter<BackendEvents>(logger)

  const [settings, library] = await Promise.all([
    SettingsStore.open(options.dataDir, { logger: scopeLogger(logger, 'settings') }),
    LibraryStore.open(options.dataDir, { logger: scopeLogger(logger, 'library'), now })
  ])

  const newsOptions: NewsServiceOptions = {
    cacheDir: options.cacheDir,
    getPack: getCountryPack,
    getSettings: () => settings.get(),
    appVersion: options.appVersion,
    logger: scopeLogger(logger, 'news'),
    now,
    fetch: fetchImpl,
    manualRefresh: options.manualRefresh ?? false,
    onUpdated: (update) => events.emit('newsUpdated', update),
    onStatus: (status) => events.emit('newsStatus', status),
    onBreaking: (articles) => events.emit('breaking', articles)
  }
  const news: NewsService = createNewsService(newsOptions)

  const reader = createReaderService({ fetch: fetchImpl, logger: scopeLogger(logger, 'reader'), now })

  settings.onChange((prev, next) => {
    try {
      news.settingsChanged(prev, next)
    } catch (error) {
      logger.error('News service failed to apply settings', error)
    }
    events.emit('settings', next)
  })
  library.onChange((next) => events.emit('library', next))

  let running = false

  return {
    settings: {
      get: () => settings.get(),
      update: (patch) => settings.update(patch),
      reset: () => settings.reset()
    },
    news: {
      snapshot: () => news.snapshot(),
      status: () => news.status(),
      refresh: (force) => news.refresh(force),
      resolveImage: (articleId) => news.resolveImage(articleId),
      detail: (articleId) => news.detail(articleId)
    },
    library: {
      get: () => library.get(),
      toggleSave: (article) => library.toggleSave(article),
      markRead: (article) => library.markRead(article),
      clearHistory: () => library.clearHistory()
    },
    reader: {
      extract: (url) => reader.extract(url),
      probe: (url) => reader.probe(url)
    },
    on: (event, listener) => events.on(event, listener),
    async start() {
      if (running) return
      running = true
      await news.start()
    },
    async stop() {
      if (running) {
        running = false
        await news.stop().catch((error: unknown) => logger.error('News service failed to stop', error))
      }
      await Promise.all([settings.flush(), library.flush()])
    }
  }
}

/** node:events with typed payloads; a throwing listener is logged instead of breaking the emitter. */
class TypedEmitter<Events extends object> {
  private readonly emitter = new EventEmitter()

  constructor(private readonly logger: Logger) {
    // Every web-mode client (SSE connection) subscribes to each event.
    this.emitter.setMaxListeners(100)
  }

  on<E extends keyof Events & string>(event: E, listener: (payload: Events[E]) => void): () => void {
    const wrapped = (payload: Events[E]): void => {
      try {
        listener(payload)
      } catch (error) {
        this.logger.error(`Listener for "${event}" failed`, error)
      }
    }
    this.emitter.on(event, wrapped)
    return () => void this.emitter.off(event, wrapped)
  }

  emit<E extends keyof Events & string>(event: E, payload: Events[E]): void {
    this.emitter.emit(event, payload)
  }
}
