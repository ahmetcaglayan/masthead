import { contextBridge, ipcRenderer, type IpcRendererEvent } from 'electron'
import type { IPC, MastheadApi, Unsubscribe } from '@shared/ipc'

// Sandboxed preload: only `electron` at runtime. Channel names are checked against
// `IPC` at compile time instead of importing it.
type Channel = (typeof IPC)[keyof typeof IPC]

const invoke = <T>(channel: Channel, arg?: unknown): Promise<T> =>
  ipcRenderer.invoke(channel, arg) as Promise<T>

const send = (channel: Channel, arg: unknown): void => ipcRenderer.send(channel, arg)

function subscribe<T>(channel: Channel, callback: (payload: T) => void): Unsubscribe {
  const listener = (_event: IpcRendererEvent, payload: T): void => callback(payload)
  ipcRenderer.on(channel, listener)
  return () => {
    ipcRenderer.removeListener(channel, listener)
  }
}

/**
 * Articles the host asks to open. Kept until the app subscribes: a window opened from a clicked
 * notification gets its article as soon as the page loads, well before the app has booted.
 */
const OPEN_ARTICLE: Channel = 'news:open-article'
const openRequests: string[] = []
const openListeners = new Set<(articleId: string) => void>()
ipcRenderer.on(OPEN_ARTICLE, (_event, articleId: string) => {
  if (openListeners.size === 0) openRequests.push(articleId)
  for (const listener of openListeners) listener(articleId)
})

function onOpenArticle(callback: (articleId: string) => void): Unsubscribe {
  openListeners.add(callback)
  for (const articleId of openRequests.splice(0)) callback(articleId)
  return () => {
    openListeners.delete(callback)
  }
}

const api: MastheadApi = {
  app: {
    info: () => invoke('app:info')
  },
  settings: {
    get: () => invoke('settings:get'),
    update: (patch) => invoke('settings:update', patch),
    reset: () => invoke('settings:reset'),
    onChange: (callback) => subscribe('settings:changed', callback)
  },
  news: {
    snapshot: () => invoke('news:snapshot'),
    refresh: (force) => invoke('news:refresh', force),
    onUpdated: (callback) => subscribe('news:updated', callback),
    onStatus: (callback) => subscribe('news:status', callback),
    resolveImage: (articleId) => invoke('news:resolve-image', articleId),
    detail: (articleId) => invoke('news:detail', articleId),
    onOpenArticle
  },
  reader: {
    open: (request) => invoke('reader:open', request),
    close: () => invoke('reader:close'),
    setBounds: (bounds) => send('reader:bounds', bounds),
    setVisible: (visible) => send('reader:visible', visible),
    navigate: (action) => send('reader:navigate', action),
    extract: (url) => invoke('reader:extract', url),
    probe: (url) => invoke('reader:probe', url),
    openExternal: (url) => invoke('reader:open-external', url),
    onEvent: (callback) => subscribe('reader:event', callback)
  },
  library: {
    get: () => invoke('library:get'),
    toggleSave: (article) => invoke('library:toggle-save', article),
    markRead: (article) => invoke('library:mark-read', article),
    clearHistory: () => invoke('library:clear-history'),
    onChange: (callback) => subscribe('library:changed', callback)
  },
  window: {
    setTitleBarColors: (colors) => send('window:title-bar', colors),
    state: () => invoke('window:state'),
    onState: (callback) => subscribe('window:state', callback)
  }
}

contextBridge.exposeInMainWorld('masthead', api)
