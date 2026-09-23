import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  HISTORY_LIMIT,
  LibraryStore,
  normalizeArticle,
  SAVED_LIMIT
} from '../../../src/core/stores/library-store'
import type { Article, Library } from '../../../src/shared/types'

function article(n: number, extra: Partial<Article> = {}): Article {
  return {
    id: `a${n}`,
    url: `https://haber.example/${n}`,
    title: `Haber ${n}`,
    summary: `Özet ${n}`,
    hasDetail: false,
    publishedAt: 1_000 + n,
    fetchedAt: 2_000 + n,
    sourceId: 'kaynak',
    categories: ['national'],
    isBreaking: false,
    isHeadline: false,
    provinces: ['34'],
    regions: ['marmara'],
    ...extra
  }
}

let dir: string
let clock: number
const now = (): number => ++clock

beforeEach(async () => {
  dir = await mkdtemp(join(tmpdir(), 'masthead-library-'))
  clock = 10_000
})

afterEach(async () => {
  await rm(dir, { recursive: true, force: true })
})

const ids = (entries: { article: Article }[]): string[] => entries.map((entry) => entry.article.id)

describe('LibraryStore', () => {
  it('starts empty', async () => {
    const store = await LibraryStore.open(dir)
    expect(store.get()).toEqual({ saved: [], history: [] })
  })

  it('toggles saved articles, newest first', async () => {
    const store = await LibraryStore.open(dir, { now })
    store.toggleSave(article(1))
    const library = store.toggleSave(article(2))
    expect(ids(library.saved)).toEqual(['a2', 'a1'])
    expect(library.saved[0].savedAt).toBe(10_002)
    expect(store.isSaved('a1')).toBe(true)

    expect(ids(store.toggleSave(article(1)).saved)).toEqual(['a2'])
    expect(store.isSaved('a1')).toBe(false)
  })

  it(`keeps at most ${SAVED_LIMIT} saved articles, dropping the oldest`, async () => {
    const store = await LibraryStore.open(dir, { now })
    for (let n = 1; n <= SAVED_LIMIT + 5; n++) store.toggleSave(article(n))
    const { saved } = store.get()
    expect(saved).toHaveLength(SAVED_LIMIT)
    expect(saved[0].article.id).toBe(`a${SAVED_LIMIT + 5}`)
    expect(saved.at(-1)?.article.id).toBe('a6')
  })

  it('records reads newest first and moves re-read articles to the top', async () => {
    const store = await LibraryStore.open(dir, { now })
    store.markRead(article(1))
    store.markRead(article(2))
    const library = store.markRead(article(1, { title: 'Güncellenmiş başlık' }))
    expect(ids(library.history)).toEqual(['a1', 'a2'])
    expect(library.history[0]).toEqual({
      article: article(1, { title: 'Güncellenmiş başlık' }),
      readAt: 10_003
    })
  })

  it(`keeps at most ${HISTORY_LIMIT} history entries`, async () => {
    const store = await LibraryStore.open(dir, { now })
    for (let n = 1; n <= HISTORY_LIMIT + 3; n++) store.markRead(article(n))
    const { history } = store.get()
    expect(history).toHaveLength(HISTORY_LIMIT)
    expect(history[0].article.id).toBe(`a${HISTORY_LIMIT + 3}`)
    expect(new Set(ids(history)).size).toBe(HISTORY_LIMIT)
  })

  it('clears history but keeps saved articles', async () => {
    const store = await LibraryStore.open(dir, { now })
    store.toggleSave(article(1))
    store.markRead(article(2))
    expect(store.clearHistory()).toEqual({ saved: store.get().saved, history: [] })
    expect(ids(store.get().saved)).toEqual(['a1'])
  })

  it('notifies listeners on every change but not on no-ops', async () => {
    const store = await LibraryStore.open(dir, { now })
    const listener = vi.fn()
    const unsubscribe = store.onChange(listener)
    store.toggleSave(article(1))
    store.markRead(article(1))
    store.clearHistory()
    store.clearHistory()
    store.toggleSave({ id: '' } as Article)
    expect(listener).toHaveBeenCalledTimes(3)
    expect(listener).toHaveBeenLastCalledWith({ saved: store.get().saved, history: [] })
    unsubscribe()
    store.markRead(article(3))
    expect(listener).toHaveBeenCalledTimes(3)
  })

  it('persists across instances', async () => {
    const store = await LibraryStore.open(dir, { now })
    store.toggleSave(article(1))
    store.markRead(article(2))
    await store.flush()
    const reopened = await LibraryStore.open(dir)
    expect(reopened.get()).toEqual(store.get())
  })

  it('validates the file on load: drops junk, dedupes, sorts newest first', async () => {
    const raw = {
      saved: [
        { article: article(1), savedAt: 5 },
        { article: article(2), savedAt: 9 },
        { article: article(1), savedAt: 7 },
        { article: { id: 'no-url', title: 'x', sourceId: 's' }, savedAt: 8 },
        { article: article(3), savedAt: 'yesterday' },
        null,
        'junk'
      ],
      history: { not: 'an array' }
    }
    await writeFile(join(dir, 'library.json'), JSON.stringify(raw))
    const store = await LibraryStore.open(dir)
    expect(store.get().saved.map((entry) => [entry.article.id, entry.savedAt])).toEqual([
      ['a2', 9],
      ['a1', 7]
    ])
    expect(store.get().history).toEqual([])
  })

  it('recovers from a corrupt file with an empty library', async () => {
    await writeFile(join(dir, 'library.json'), 'not json at all')
    const logger = { info: vi.fn(), warn: vi.fn(), error: vi.fn() }
    const store = await LibraryStore.open(dir, { logger })
    expect(store.get()).toEqual({ saved: [], history: [] })
    store.toggleSave(article(1))
    await store.flush()
    const onDisk = JSON.parse(await readFile(join(dir, 'library.json'), 'utf8')) as Library
    expect(ids(onDisk.saved)).toEqual(['a1'])
  })
})

describe('normalizeArticle', () => {
  it('keeps known, well-typed fields only', () => {
    const input = {
      ...article(1),
      image: 'https://img.example/1.jpg',
      clusterId: 'c1',
      secret: 'x',
      categories: ['sports', 'bogus']
    }
    const normalized = normalizeArticle(input)
    expect(normalized).toEqual({ ...article(1), image: 'https://img.example/1.jpg', categories: ['sports'] })
    expect(normalized).not.toHaveProperty('secret')
    expect(normalized).not.toHaveProperty('clusterId')
  })

  it('fills defaults for missing optional data', () => {
    expect(
      normalizeArticle({ id: 'x', url: 'https://a.example', title: 'T', sourceId: 's', fetchedAt: 42 })
    ).toEqual({
      id: 'x',
      url: 'https://a.example',
      title: 'T',
      summary: '',
      hasDetail: false,
      publishedAt: 42,
      fetchedAt: 42,
      sourceId: 's',
      categories: [],
      isBreaking: false,
      isHeadline: false,
      provinces: [],
      regions: []
    })
  })

  it.each([null, 'a', [], { id: 'x' }, { id: 'x', url: 'u', title: 1, sourceId: 's' }])(
    'rejects %j',
    (value) => {
      expect(normalizeArticle(value)).toBeNull()
    }
  )
})
