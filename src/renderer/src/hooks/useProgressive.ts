import { startTransition, useEffect, useState } from 'react'

/** Run `fn` once the current frame has been painted (or after `fallbackMs` when frames are paused). */
function afterPaint(fn: () => void, fallbackMs = 50): () => void {
  let done = false
  const run = (): void => {
    if (done) return
    done = true
    fn()
  }
  let timer: ReturnType<typeof setTimeout> | undefined
  const frame = requestAnimationFrame(() => {
    timer = setTimeout(run, 0)
  })
  const fallback = setTimeout(run, fallbackMs)
  return () => {
    done = true
    cancelAnimationFrame(frame)
    clearTimeout(timer)
    clearTimeout(fallback)
  }
}

/**
 * How many of `total` items to render: `initial` in the first commit, then
 * `step` more per low-priority update (a transition started after the frame
 * was painted) until all are there. Keeps a route switch from building every
 * card of a long page in one task: what is on screen paints first, the rest
 * follows in small slices the browser can interleave with input. Starts over
 * from `initial` when `resetKey` changes.
 */
export function useProgressive(total: number, initial: number, step = initial, resetKey?: unknown): number {
  const [count, setCount] = useState(initial)
  const [key, setKey] = useState(resetKey)
  if (key !== resetKey) {
    setKey(resetKey)
    setCount(initial)
  }

  const pending = count < total
  useEffect(() => {
    if (!pending) return
    return afterPaint(() =>
      startTransition(() => setCount((c) => Math.min(total, Math.max(c, initial) + step)))
    )
  }, [pending, count, total, initial, step])

  return Math.min(count, total)
}
