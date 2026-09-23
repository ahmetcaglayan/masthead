import { mkdtemp, readdir, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { Logger } from '../../../src/core/backend'
import { JsonFile } from '../../../src/core/stores/json-file'

interface Doc {
  count: number
  name: string
}

const FALLBACK: Doc = { count: 0, name: 'varsayılan' }

function validateDoc(raw: unknown): Doc {
  const value = raw as Partial<Doc>
  if (typeof value?.count !== 'number' || typeof value.name !== 'string') throw new Error('invalid doc')
  return { count: value.count, name: value.name }
}

const silent = (): Logger => ({ info: vi.fn(), warn: vi.fn(), error: vi.fn() })

let dir: string

beforeEach(async () => {
  dir = await mkdtemp(join(tmpdir(), 'masthead-json-'))
})

afterEach(async () => {
  await rm(dir, { recursive: true, force: true })
})

describe('JsonFile', () => {
  it('returns the fallback for a missing file without creating it', async () => {
    const file = new JsonFile<Doc>(join(dir, 'doc.json'))
    await expect(file.load(FALLBACK, validateDoc)).resolves.toEqual(FALLBACK)
    expect(await readdir(dir)).toEqual([])
  })

  it('round-trips a value through save and flush, creating missing directories', async () => {
    const path = join(dir, 'nested', 'deeper', 'doc.json')
    const file = new JsonFile<Doc>(path)
    file.save({ count: 3, name: 'Çağlayan' })
    await file.flush()
    await expect(new JsonFile<Doc>(path).load(FALLBACK, validateDoc)).resolves.toEqual({
      count: 3,
      name: 'Çağlayan'
    })
    expect(await readdir(join(dir, 'nested', 'deeper'))).toEqual(['doc.json'])
  })

  it('moves a corrupt file aside and uses the fallback', async () => {
    const path = join(dir, 'doc.json')
    await writeFile(path, '{"count": 3, "name": ')
    const logger = silent()
    await expect(new JsonFile<Doc>(path, { logger }).load(FALLBACK, validateDoc)).resolves.toEqual(FALLBACK)
    const files = await readdir(dir)
    expect(files).toHaveLength(1)
    expect(files[0]).toMatch(/^doc\.corrupt-\d+\.json$/)
    expect(await readFile(join(dir, files[0]), 'utf8')).toBe('{"count": 3, "name": ')
    expect(logger.warn).toHaveBeenCalled()
  })

  it('treats a file that fails validation as corrupt', async () => {
    const path = join(dir, 'doc.json')
    await writeFile(path, JSON.stringify({ count: 'many' }))
    await expect(new JsonFile<Doc>(path, { logger: silent() }).load(FALLBACK, validateDoc)).resolves.toEqual(
      FALLBACK
    )
    expect((await readdir(dir))[0]).toMatch(/^doc\.corrupt-\d+\.json$/)
  })

  it('accepts a UTF-8 byte order mark', async () => {
    const path = join(dir, 'doc.json')
    await writeFile(path, '﻿{"count": 1, "name": "bom"}')
    await expect(new JsonFile<Doc>(path).load(FALLBACK, validateDoc)).resolves.toEqual({
      count: 1,
      name: 'bom'
    })
  })

  it('debounces saves and writes only the latest value', async () => {
    const path = join(dir, 'doc.json')
    const file = new JsonFile<Doc>(path, { debounceMs: 40 })
    file.save({ count: 1, name: 'a' })
    file.save({ count: 2, name: 'b' })
    file.save({ count: 3, name: 'c' })
    expect(await readdir(dir)).toEqual([])
    await vi.waitFor(async () =>
      expect(JSON.parse(await readFile(path, 'utf8'))).toEqual({ count: 3, name: 'c' })
    )
    expect(await readdir(dir)).toEqual(['doc.json'])
  })

  it('flush writes a pending value immediately and is a no-op otherwise', async () => {
    const path = join(dir, 'doc.json')
    const file = new JsonFile<Doc>(path, { debounceMs: 60_000 })
    await file.flush()
    expect(await readdir(dir)).toEqual([])
    file.save({ count: 7, name: 'hemen' })
    await file.flush()
    expect(JSON.parse(await readFile(path, 'utf8'))).toEqual({ count: 7, name: 'hemen' })
  })

  it('keeps successive writes in order', async () => {
    const path = join(dir, 'doc.json')
    const file = new JsonFile<Doc>(path)
    for (let count = 1; count <= 5; count++) {
      file.save({ count, name: 'sıra' })
      void file.flush()
    }
    await file.flush()
    expect(JSON.parse(await readFile(path, 'utf8'))).toEqual({ count: 5, name: 'sıra' })
    expect(await readdir(dir)).toEqual(['doc.json'])
  })

  it('pretty-prints on request', async () => {
    const path = join(dir, 'doc.json')
    const file = new JsonFile<Doc>(path, { pretty: true })
    file.save({ count: 1, name: 'x' })
    await file.flush()
    expect(await readFile(path, 'utf8')).toBe('{\n  "count": 1,\n  "name": "x"\n}\n')
  })

  it('logs write failures instead of throwing', async () => {
    const blocker = join(dir, 'not-a-dir')
    await writeFile(blocker, '')
    const logger = silent()
    const file = new JsonFile<Doc>(join(blocker, 'doc.json'), { logger })
    file.save({ count: 1, name: 'x' })
    await expect(file.flush()).resolves.toBeUndefined()
    expect(logger.error).toHaveBeenCalled()
  })
})
