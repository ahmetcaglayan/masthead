import { afterEach, describe, expect, it, vi } from 'vitest'
import { createLogger, describeError, scopeLogger, type LogEntry } from '../../../src/core/log'
import { LruCache } from '../../../src/core/reader/lru'

afterEach(() => {
  vi.restoreAllMocks()
})

describe('createLogger', () => {
  it('sends timestamped, scoped entries to the sink', () => {
    const entries: LogEntry[] = []
    const logger = createLogger('news', (entry) => entries.push(entry))
    const error = new Error('boom')
    logger.info('refreshed', 12)
    logger.warn('slow feed')
    logger.error('failed', error)
    expect(entries.map(({ level, scope, message, details }) => ({ level, scope, message, details }))).toEqual(
      [
        { level: 'info', scope: 'news', message: 'refreshed', details: [12] },
        { level: 'warn', scope: 'news', message: 'slow feed', details: [] },
        { level: 'error', scope: 'news', message: 'failed', details: [error] }
      ]
    )
    expect(entries[0].time).toBeTypeOf('number')
  })

  it('writes to the matching console method by default', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    createLogger('reader').warn('blocked', 'x')
    expect(warn).toHaveBeenCalledOnce()
    expect(warn.mock.calls[0][0]).toMatch(/^\d{4}-\d{2}-\d{2}T[\d:.]+Z WARN {2}\[reader\] blocked$/)
    expect(warn.mock.calls[0][1]).toBe('x')
  })

  it('never throws, even when the sink does', () => {
    const logger = createLogger('x', () => {
      throw new Error('disk full')
    })
    expect(() => logger.error('still fine')).not.toThrow()
  })

  it('scopeLogger prefixes messages', () => {
    const entries: LogEntry[] = []
    const logger = scopeLogger(
      createLogger('core', (entry) => entries.push(entry)),
      'library'
    )
    logger.info('saved')
    expect(entries[0]).toMatchObject({ scope: 'core', message: '[library] saved' })
  })

  it('describeError includes the cause', () => {
    expect(describeError(new Error('fetch failed', { cause: new Error('ECONNRESET') }))).toBe(
      'fetch failed (ECONNRESET)'
    )
    expect(describeError('plain')).toBe('plain')
  })
})

describe('LruCache', () => {
  it('evicts the least recently used entry', () => {
    const cache = new LruCache<string, number>(2)
    cache.set('a', 1)
    cache.set('b', 2)
    expect(cache.get('a')).toBe(1)
    cache.set('c', 3)
    expect(cache.get('b')).toBeUndefined()
    expect(cache.get('a')).toBe(1)
    expect(cache.get('c')).toBe(3)
    expect(cache.size).toBe(2)
    cache.delete('a')
    expect(cache.size).toBe(1)
  })
})
