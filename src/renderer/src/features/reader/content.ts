import { useEffect, useState } from 'react'
import type { ReaderProbe } from '@shared/ipc'
import type { ArticleDetail, ReaderContent } from '@shared/types'
import { api } from '@/lib/api'
import { useNews } from '@/stores/news'

const EXTRACT_CACHE_SIZE = 24

/** Successful extractions, oldest first (a small LRU so switching modes or articles back is instant). */
const extracted = new Map<string, ReaderContent>()
const extracting = new Map<string, Promise<ReaderContent | null>>()
const probes = new Map<string, Promise<ReaderProbe>>()

function remember(url: string, content: ReaderContent): void {
  extracted.delete(url)
  extracted.set(url, content)
  if (extracted.size > EXTRACT_CACHE_SIZE) extracted.delete(extracted.keys().next().value as string)
}

function extract(url: string): Promise<ReaderContent | null> {
  let pending = extracting.get(url)
  if (!pending) {
    pending = api.reader
      .extract(url)
      .catch(() => null)
      .then((content) => {
        extracting.delete(url)
        if (content) remember(url, content)
        return content
      })
    extracting.set(url, pending)
  }
  return pending
}

export type ExtractionState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'ready'; content: ReaderContent }
  | { status: 'failed' }

/**
 * Reader-mode content for `url`; pass null while it is not needed. Successful
 * results are cached for the session, and `retry` asks again after a failure.
 */
export function useExtraction(url: string | null): { state: ExtractionState; retry: () => void } {
  const [attempt, setAttempt] = useState(0)
  const [result, setResult] = useState<{ url: string; attempt: number; content: ReaderContent | null }>()
  const cached = url ? extracted.get(url) : undefined

  useEffect(() => {
    if (!url || extracted.has(url)) return
    let alive = true
    void extract(url).then((content) => {
      if (alive) setResult({ url, attempt, content })
    })
    return () => {
      alive = false
    }
  }, [url, attempt])

  let state: ExtractionState = { status: 'loading' }
  if (!url) state = { status: 'idle' }
  else if (cached) state = { status: 'ready', content: cached }
  else if (result?.url === url && result.attempt === attempt && !result.content) state = { status: 'failed' }
  return { state, retry: () => setAttempt((n) => n + 1) }
}

/** Whether the page may be shown in an iframe (web host only); a failed check counts as "no". */
function probe(url: string): Promise<ReaderProbe> {
  let pending = probes.get(url)
  if (!pending) {
    pending = api.reader.probe(url).catch(() => {
      probes.delete(url)
      return { frameable: false, finalUrl: url }
    })
    probes.set(url, pending)
  }
  return pending
}

/** The iframe check for `url`, undefined while it runs (or when `url` is null). */
export function useFrameProbe(url: string | null): ReaderProbe | undefined {
  const [result, setResult] = useState<{ url: string; probe: ReaderProbe }>()
  useEffect(() => {
    if (!url) return
    let alive = true
    void probe(url).then((value) => {
      if (alive) setResult({ url, probe: value })
    })
    return () => {
      alive = false
    }
  }, [url])
  return result && result.url === url ? result.probe : undefined
}

/** The feed's long-form body: undefined while loading or disabled, null when there is none. */
export function useArticleDetail(id: string, enabled: boolean): ArticleDetail | null | undefined {
  const [result, setResult] = useState<{ id: string; detail: ArticleDetail | null }>()
  useEffect(() => {
    if (!enabled) return
    let alive = true
    void useNews
      .getState()
      .detail(id)
      .then((detail) => {
        if (alive) setResult({ id, detail })
      })
    return () => {
      alive = false
    }
  }, [id, enabled])
  return enabled && result?.id === id ? result.detail : undefined
}
