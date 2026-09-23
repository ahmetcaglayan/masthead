import { useEffect, useState } from 'react'

const START = 0.08
const CEILING = 0.92
const TRICKLE_MS = 350
const FADE_MS = 280

/** One trickle step: a little closer to the ceiling each time, never reaching it. */
function trickle(p: number): number {
  const from = Math.max(p, START)
  return Math.min(CEILING, from + (CEILING - from) * 0.07)
}

export interface ProgressLineProps {
  /** A load is in progress. */
  active: boolean
  /** Known progress (0–1); the bar creeps ahead of it while nothing is reported. */
  value?: number
}

/** Thin accent loading bar along the bottom edge of its (positioned) parent. */
export function ProgressLine({ active, value = 0 }: ProgressLineProps): React.JSX.Element {
  const [progress, setProgress] = useState(0)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (active) {
      setVisible(true)
      setProgress((p) => (p >= 1 ? START : Math.max(p, START)))
      const timer = window.setInterval(() => setProgress(trickle), TRICKLE_MS)
      return () => window.clearInterval(timer)
    }
    // Finish the bar, fade it out, then rewind it while invisible.
    setProgress((p) => (p > 0 ? 1 : 0))
    const fade = window.setTimeout(() => setVisible(false), FADE_MS)
    const rewind = window.setTimeout(() => setProgress(0), FADE_MS * 2.5)
    return () => {
      window.clearTimeout(fade)
      window.clearTimeout(rewind)
    }
  }, [active])

  useEffect(() => {
    if (active) setProgress((p) => Math.max(p, Math.min(value, 1)))
  }, [active, value])

  return (
    <div aria-hidden className="pointer-events-none absolute inset-x-0 -bottom-px h-[2px] overflow-hidden">
      <div
        className="h-full origin-left bg-accent transition-[transform,opacity] duration-300 ease-out"
        style={{ transform: `scaleX(${progress})`, opacity: visible ? 1 : 0 }}
      />
    </div>
  )
}
