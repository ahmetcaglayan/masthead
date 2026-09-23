import { useSyncExternalStore } from 'react'

interface Ticker {
  subscribe: (onChange: () => void) => () => void
  getSnapshot: () => number
}

const tickers = new Map<number, Ticker>()

function ticker(interval: number): Ticker {
  let t = tickers.get(interval)
  if (t) return t
  let now = Date.now()
  let timer: ReturnType<typeof setInterval> | null = null
  const listeners = new Set<() => void>()
  t = {
    subscribe(onChange) {
      listeners.add(onChange)
      if (!timer) {
        timer = setInterval(() => {
          now = Date.now()
          listeners.forEach((l) => l())
        }, interval)
      }
      return () => {
        listeners.delete(onChange)
        if (listeners.size === 0 && timer) {
          clearInterval(timer)
          timer = null
        }
      }
    },
    getSnapshot: () => {
      // Catch up after an idle period with no subscribers, without changing mid-render.
      if (!timer && Date.now() - now >= interval) now = Date.now()
      return now
    }
  }
  tickers.set(interval, t)
  return t
}

/**
 * Current time (epoch ms), re-rendering every `interval` ms. All components
 * asking for the same interval share one timer, so thousands of relative
 * timestamps cost a single interval.
 */
export function useNow(interval = 30_000): number {
  const { subscribe, getSnapshot } = ticker(interval)
  return useSyncExternalStore(subscribe, getSnapshot)
}

/**
 * Something derived from the shared clock, e.g. a "5 min ago" label or the
 * start of today. `select` must return a primitive: the component re-renders
 * only when that value changes, not on every tick.
 */
export function useNowSelect<T extends string | number | boolean>(
  interval: number,
  select: (now: number) => T
): T {
  const { subscribe, getSnapshot } = ticker(interval)
  return useSyncExternalStore(subscribe, () => select(getSnapshot()))
}
