import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion, useIsPresent } from 'motion/react'
import { Dialog as RDialog } from 'radix-ui'
import type { ReaderNavigation } from '@shared/ipc'
import type { ReaderMode } from '@shared/settings'
import type { Article, ReaderEvent } from '@shared/types'
import { useAppInfo } from '@/hooks/useAppInfo'
import { useHotkeys } from '@/hooks/useHotkeys'
import { useSource } from '@/hooks/useSources'
import { api, isElectron } from '@/lib/api'
import { domain, tameCaps } from '@/lib/format'
import { useLibrary } from '@/stores/library'
import { useNews } from '@/stores/news'
import { useUi, type ReaderState } from '@/stores/ui'
import { useExtraction, useFrameProbe } from './content'
import { ReaderHeader, type PageNavigation } from './ReaderHeader'
import { ReaderPane } from './ReaderPane'
import { EmbedBlocked, FramePage, NativePage, PageError, PageLoading, PagePreview } from './WebPane'

type Host = 'electron' | 'web'

/** Put the native page in front once it has committed for this long, even before DOMContentLoaded. */
const REVEAL_AFTER_COMMIT_MS = 1200
/** Treat the dialog as open after this long even if the enter animation never reports completion. */
const OPEN_FALLBACK_MS = 450
const EASE_OUT = [0.22, 1, 0.36, 1] as const

/** The page shown in Web mode (native view or iframe) for one target. */
interface PageState {
  /** Id of the target this state belongs to; any other target starts fresh. */
  key: string
  loading: boolean
  progress: number
  /** Enough has painted to bring the page in front of the preview. */
  ready: boolean
  failure: { description: string } | null
  nav: { url: string; title: string; canGoBack: boolean; canGoForward: boolean } | null
}

const freshPage = (key: string): PageState => ({
  key,
  loading: true,
  progress: 0,
  ready: false,
  failure: null,
  nav: null
})

/** Fold a native page event into the page state. */
function reducePage(state: PageState, event: ReaderEvent): PageState {
  switch (event.type) {
    case 'loading':
      return event.loading
        ? { ...state, loading: true, progress: 0 }
        : { ...state, loading: false, progress: 1, ready: true }
    case 'progress':
      return { ...state, progress: event.value, ready: state.ready || event.value >= 0.6 }
    case 'navigated': {
      const { url, title, canGoBack, canGoForward } = event
      return { ...state, failure: null, nav: { url, title, canGoBack, canGoForward } }
    }
    case 'failed':
      return { ...state, loading: false, failure: { description: event.description } }
    default:
      return state
  }
}

/** The nearest article `step` away in the queue that can still be found (snapshot, then library). */
function neighbour(queue: readonly string[], id: string, step: 1 | -1): Article | undefined {
  const index = queue.indexOf(id)
  if (index < 0) return undefined
  const { byId } = useNews.getState()
  const { saved, history } = useLibrary.getState().library
  for (let i = index + step; i >= 0 && i < queue.length; i += step) {
    const candidate = queue[i]
    const found =
      byId.get(candidate) ??
      saved.find((entry) => entry.article.id === candidate)?.article ??
      history.find((entry) => entry.article.id === candidate)?.article
    if (found) return found
  }
  return undefined
}

/**
 * The list to step through from `article`: the queue it was opened with, or,
 * when it is not in it (another outlet's report opened from a story), that
 * queue with the article placed after a report of the same story (else last),
 * so previous / next keep working.
 */
function queueWith(queue: string[], article: Article): string[] {
  if (queue.includes(article.id)) return queue
  const { byId } = useNews.getState()
  const sibling = article.clusterId
    ? queue.findIndex((id) => byId.get(id)?.clusterId === article.clusterId)
    : -1
  return sibling < 0
    ? [...queue, article.id]
    : [...queue.slice(0, sibling + 1), article.id, ...queue.slice(sibling + 1)]
}

/** Close the dialog. The native page is hidden at once: it cannot fade out with the panel. */
function closeReader(host: Host): void {
  if (host === 'electron') api.reader.setVisible(false)
  useUi.getState().closeArticle()
}

let linkCount = 0

/**
 * The article reader: a large centred dialog showing the publisher's page inside
 * the app (a native view in Electron, an iframe in the browser) or a clean
 * Reader-mode version. Always mounted; opens whenever `useUi().reader` is set.
 * Esc closes, Alt+←/→ step through the list it was opened from, Alt+R switches
 * between Web and Reader.
 */
export function ArticleDialog(): React.JSX.Element {
  const reader = useUi((s) => s.reader)
  const info = useAppInfo()
  const host: Host = info?.host ?? (isElectron ? 'electron' : 'web')
  const open = reader !== null

  // Park the native page (stopping it, audio included) once the dialog closes.
  useEffect(() => {
    if (!open || host !== 'electron') return
    return () => {
      void api.reader.close().catch(() => undefined)
    }
  }, [open, host])

  return (
    <RDialog.Root open={open} onOpenChange={(next) => !next && closeReader(host)}>
      <AnimatePresence>
        {reader && (
          <RDialog.Portal forceMount key="article-dialog">
            <RDialog.Overlay asChild forceMount>
              <motion.div
                className="no-drag fixed inset-0 z-50 bg-overlay backdrop-blur-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
              />
            </RDialog.Overlay>
            <ArticlePanel reader={reader} host={host} />
          </RDialog.Portal>
        )}
      </AnimatePresence>
    </RDialog.Root>
  )
}

function ArticlePanel({ reader, host }: { reader: ReaderState; host: Host }): React.JSX.Element {
  const present = useIsPresent()
  const native = host === 'electron'
  const { article } = reader
  const queue = useMemo(() => queueWith(reader.queue, article), [reader.queue, article])
  const source = useSource(article.sourceId)

  const panelRef = useRef<HTMLDivElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const [opener] = useState(() =>
    document.activeElement instanceof HTMLElement ? document.activeElement : null
  )
  const [opened, setOpened] = useState(false)
  const [popoverOpen, setPopoverOpen] = useState(false)
  const [announcement, setAnnouncement] = useState('')

  // A link followed from Reader mode (Electron) is browsed in Web mode until Reader mode or another article.
  const [link, setLink] = useState<{ from: string; article: Article } | null>(null)
  // Stepping to another article forgets it, so stepping back shows the article again, not the link.
  if (link && link.from !== article.id) setLink(null)
  const target = link?.from === article.id ? link.article : article

  // Web host: a site that refuses framing falls back to Reader mode, unless Web was asked for explicitly.
  const probe = useFrameProbe(native ? null : article.url)
  const blocked = probe?.frameable === false
  const [insistWeb, setInsistWeb] = useState<string | null>(null)
  const autoReader = reader.mode === 'web' && blocked && insistWeb !== article.id
  const mode: ReaderMode = autoReader ? 'reader' : reader.mode

  const extraction = useExtraction(mode === 'reader' ? article.url : null)

  const [pageState, setPageState] = useState(() => freshPage(target.id))
  const page = pageState.key === target.id ? pageState : freshPage(target.id)
  const updatePage = useCallback((key: string, update: (state: PageState) => PageState) => {
    setPageState((s) => update(s.key === key ? s : freshPage(key)))
  }, [])

  const setMode = useCallback(
    (next: ReaderMode) => {
      if (next === 'web' && blocked) setInsistWeb(article.id)
      // Back to Web: the iframe reloads, and a failed native page gets a fresh try.
      if (next === 'web' && (!native || page.failure)) setPageState(freshPage(target.id))
      if (next === 'reader') setLink(null)
      useUi.getState().setReaderMode(next)
    },
    [blocked, native, page.failure, article.id, target.id]
  )

  const toggleMode = useCallback(() => setMode(mode === 'web' ? 'reader' : 'web'), [mode, setMode])

  const step = useCallback(
    (direction: 1 | -1) => {
      const next = neighbour(queue, article.id, direction)
      if (next) useUi.getState().openArticle(next, queue)
    },
    [queue, article.id]
  )

  const close = useCallback(() => closeReader(host), [host])

  const openOriginal = useCallback(() => {
    void api.reader.openExternal(article.url).catch(() => undefined)
  }, [article.url])

  const followLink = useCallback(
    (url: string, external: boolean) => {
      if (!url) return
      if (external || !native) {
        void api.reader.openExternal(url).catch(() => undefined)
        return
      }
      linkCount += 1
      setLink({ from: article.id, article: { ...article, id: `${article.id}~${linkCount}`, url, title: '' } })
      useUi.getState().setReaderMode('web')
    },
    [native, article]
  )

  const retryPage = useCallback(() => {
    setPageState(freshPage(target.id))
    api.reader.navigate('reload')
  }, [target.id])

  const navigatePage = useCallback(
    (action: ReaderNavigation) => {
      if (action === 'reload' && page.failure) retryPage()
      else api.reader.navigate(action)
    },
    [page.failure, retryPage]
  )

  const onFrameLoad = useCallback(
    () => updatePage(target.id, (s) => ({ ...s, loading: false, progress: 1, ready: true })),
    [target.id, updatePage]
  )

  // Every article shown counts as read.
  useEffect(() => {
    void useLibrary
      .getState()
      .markRead(article)
      .catch(() => undefined)
  }, [article])

  useEffect(() => {
    const timer = window.setTimeout(() => setOpened(true), OPEN_FALLBACK_MS)
    return () => window.clearTimeout(timer)
  }, [])

  // Electron: load the target into the native view (hidden until it is ready and the dialog is open).
  useEffect(() => {
    if (!native || !present) return
    void api.reader.open({ article: target, mode }).catch(() => undefined)
  }, [native, present, target, mode])

  const committed = page.nav !== null
  useEffect(() => {
    if (!native || !committed || page.ready) return
    const key = page.key
    const timer = window.setTimeout(
      () => updatePage(key, (s) => ({ ...s, ready: true })),
      REVEAL_AFTER_COMMIT_MS
    )
    return () => window.clearTimeout(timer)
  }, [native, committed, page.ready, page.key, updatePage])

  // The DOM cannot draw over the native view: it shows only when nothing of ours needs that area.
  const pageShown =
    native && present && opened && mode === 'web' && page.ready && !page.failure && !popoverOpen
  useEffect(() => {
    if (native) api.reader.setVisible(pageShown)
  }, [native, pageShown])

  // Events from the native view: page state, plus Esc and shortcuts pressed while the page has focus.
  const latest = useRef({ key: target.id, close, step, toggleMode, popoverOpen })
  useLayoutEffect(() => {
    latest.current = { key: target.id, close, step, toggleMode, popoverOpen }
  })

  useEffect(() => {
    if (!native || !present) return
    return api.reader.onEvent((event) => {
      const actions = latest.current
      if (event.type === 'escape') actions.close()
      else if (event.type === 'shortcut') {
        if (event.key === 'next') actions.step(1)
        else if (event.key === 'prev') actions.step(-1)
        else if (event.key === 'reader') actions.toggleMode()
      } else updatePage(actions.key, (s) => reducePage(s, event))
    })
  }, [native, present, updatePage])

  // Esc closes from anywhere in the app, ahead of other handlers; an open popover gets it first.
  useEffect(() => {
    if (!present) return
    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key !== 'Escape' || event.isComposing || latest.current.popoverOpen) return
      event.preventDefault()
      event.stopPropagation()
      latest.current.close()
    }
    window.addEventListener('keydown', onKeyDown, true)
    return () => window.removeEventListener('keydown', onKeyDown, true)
  }, [present])

  useHotkeys(
    [
      { combo: 'Alt+ArrowLeft', handler: () => step(-1) },
      { combo: 'Alt+ArrowRight', handler: () => step(1) },
      { combo: 'Alt+R', handler: toggleMode }
    ],
    present
  )

  const previous = neighbour(queue, article.id, -1)
  const next = neighbour(queue, article.id, 1)
  const browsing = native && mode === 'web'
  const away = browsing && (target !== article || page.nav?.canGoBack === true)
  const title = away ? page.nav?.title || domain(page.nav?.url ?? target.url) : tameCaps(article.title)
  const pageUrl = away ? (page.nav?.url ?? target.url) : article.url
  const navigation: PageNavigation | undefined = browsing
    ? {
        canGoBack: page.nav?.canGoBack ?? false,
        canGoForward: page.nav?.canGoForward ?? false,
        onNavigate: navigatePage
      }
    : undefined
  const progress =
    mode === 'reader'
      ? { active: extraction.state.status === 'loading' }
      : native
        ? { active: page.loading && !page.failure, value: page.progress }
        : { active: !blocked && !page.ready, value: page.progress }

  let content: React.ReactNode
  if (mode === 'reader') {
    content = (
      <ReaderPane
        article={article}
        source={source}
        extraction={extraction.state}
        onRetry={extraction.retry}
        onShowWeb={blocked ? undefined : () => setMode('web')}
        onOpenOriginal={openOriginal}
        onLink={followLink}
        blockedNotice={autoReader}
        scrollRef={scrollRef}
      />
    )
  } else if (native) {
    content = (
      <NativePage measured={opened}>
        {page.failure ? (
          <PageError
            url={target.url}
            detail={page.failure.description}
            onRetry={retryPage}
            onReader={() => setMode('reader')}
          />
        ) : pageShown ? null : target === article ? (
          <PagePreview article={article} source={source} />
        ) : (
          <PageLoading url={target.url} />
        )}
      </NativePage>
    )
  } else if (blocked) {
    content = <EmbedBlocked url={article.url} onReader={() => setMode('reader')} />
  } else {
    content = (
      <FramePage
        url={probe ? probe.finalUrl || article.url : undefined}
        article={article}
        source={source}
        loaded={page.ready}
        onLoad={onFrameLoad}
      />
    )
  }

  return (
    <RDialog.Content
      asChild
      forceMount
      aria-describedby={undefined}
      onOpenAutoFocus={(event) => {
        event.preventDefault()
        ;(scrollRef.current ?? panelRef.current)?.focus({ preventScroll: true })
      }}
      onCloseAutoFocus={(event) => {
        event.preventDefault()
        if (opener?.isConnected) opener.focus({ preventScroll: true })
      }}
      onEscapeKeyDown={(event) => event.preventDefault()}
    >
      <motion.div
        ref={panelRef}
        className="fixed top-1/2 left-1/2 z-50 flex -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-panel border border-line bg-surface font-ui text-fg shadow-float outline-none"
        style={{
          width: 'min(1280px, 94vw)',
          height: 'min(92vh, calc(100vh - 2 * var(--titlebar-height)))'
        }}
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.98 }}
        transition={{ duration: 0.18, ease: EASE_OUT }}
        onAnimationComplete={() => {
          if (present) setOpened(true)
        }}
      >
        <ReaderHeader
          article={article}
          source={source}
          title={title}
          url={pageUrl}
          mode={mode}
          onModeChange={setMode}
          nativeView={browsing}
          navigation={navigation}
          progress={progress}
          queue={queue}
          previous={previous}
          next={next}
          onStep={step}
          onClose={close}
          onPopoverChange={setPopoverOpen}
          announce={setAnnouncement}
        />
        <div className="relative min-h-0 flex-1">
          <motion.div
            key={`${mode}:${target.id}`}
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.16, ease: 'easeOut' }}
          >
            {content}
          </motion.div>
        </div>
        <div aria-live="polite" className="sr-only">
          {announcement}
        </div>
      </motion.div>
    </RDialog.Content>
  )
}
