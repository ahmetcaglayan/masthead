import { motion } from 'motion/react'

/** Film grain: fractal noise, desaturated, tiled at low opacity. */
const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")"

const glow = (token: string, percent: number): React.CSSProperties => ({
  background: `radial-gradient(closest-side, color-mix(in oklab, var(${token}) ${percent}%, transparent), transparent)`
})

/** Soft, slowly drifting accent-tinted light over the canvas, with a whisper of grain. */
export function Backdrop(): React.JSX.Element {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <motion.div
        className="absolute -top-[26rem] -left-[18rem] size-[56rem] rounded-full dark:opacity-70"
        style={glow('--accent', 26)}
        animate={{ x: [0, 70, 0], y: [0, 40, 0] }}
        transition={{ duration: 26, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute top-[18%] -right-[20rem] size-[46rem] rounded-full dark:opacity-60"
        style={glow('--warning', 18)}
        animate={{ x: [0, -50, 0], y: [0, 60, 0] }}
        transition={{ duration: 30, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute -bottom-[24rem] left-[12%] size-[50rem] rounded-full dark:opacity-60"
        style={glow('--accent', 14)}
        animate={{ x: [0, 40, 0], y: [0, -40, 0] }}
        transition={{ duration: 34, repeat: Infinity, ease: 'easeInOut' }}
      />
      <div
        className="absolute inset-0 opacity-[0.07] mix-blend-multiply dark:opacity-[0.045] dark:mix-blend-screen"
        style={{ backgroundImage: GRAIN, backgroundSize: '180px 180px' }}
      />
    </div>
  )
}
