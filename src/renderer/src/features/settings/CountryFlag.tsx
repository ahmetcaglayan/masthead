import type { CountryCode } from '@shared/types'
import { cn } from '@/lib/cn'

/**
 * A country's flag as inline artwork (emoji flags don't render on Windows).
 * Drawn on a 3:2 field at chip size, so the fine detail of a flag — the exact
 * star grid, the chakra spokes, the motto on Brazil's band — is simplified.
 * Returns null for countries without artwork yet.
 */
export function CountryFlag({
  code,
  className
}: {
  code: CountryCode
  className?: string
}): React.JSX.Element | null {
  const art = FLAGS[code]
  if (!art) return null
  return (
    <svg
      viewBox="0 0 90 60"
      aria-hidden
      className={cn('h-4 w-6 shrink-0 rounded-[3px] shadow-[0_0_0_1px_var(--line)]', className)}
    >
      {art}
    </svg>
  )
}

/** Turkey: proportions from the Flag Law (crescent circles of G/2 and 2/5 G, star circle of G/4). */
const turkey = (
  <>
    <rect width="90" height="60" fill="#E30A17" />
    <g transform="translate(0 30) scale(0.001)">
      <path
        fill="#FFFFFF"
        d="m41750 0 13568-4408-8386 11541V-7133l8386 11541zm925 8021a15000 15000 0 1 1 0-16042 12000 12000 0 1 0 0 16042z"
      />
    </g>
  </>
)

/** United States: 13 stripes and a canton of 50 stars, drawn as dots at this size. */
const unitedStates = (
  <>
    <rect width="90" height="60" fill="#FFFFFF" />
    {Array.from({ length: 7 }, (_, i) => (
      <rect key={i} y={(i * 60) / 6.5} width="90" height={60 / 13} fill="#B22234" />
    ))}
    <rect width="36" height={(60 / 13) * 7} fill="#3C3B6E" />
    {Array.from({ length: 9 }, (_, row) =>
      Array.from({ length: row % 2 === 0 ? 6 : 5 }, (_, col) => (
        <circle
          key={`${row}-${col}`}
          cx={3.3 + col * 6 + (row % 2 === 0 ? 0 : 3)}
          cy={2.6 + row * 3.5}
          r="1.05"
          fill="#FFFFFF"
        />
      ))
    )}
  </>
)

/** United Kingdom: the Union Flag, with the red saltire centred rather than counterchanged. */
const unitedKingdom = (
  <>
    <rect width="90" height="60" fill="#012169" />
    <g stroke="#FFFFFF" strokeWidth="12">
      <path d="M0 0 90 60M90 0 0 60" />
    </g>
    <g stroke="#C8102E" strokeWidth="4">
      <path d="M0 0 90 60M90 0 0 60" />
    </g>
    <path d="M45 0v60M0 30h90" stroke="#FFFFFF" strokeWidth="20" />
    <path d="M45 0v60M0 30h90" stroke="#C8102E" strokeWidth="12" />
  </>
)

/** India: saffron, white and green with the navy Ashoka chakra. */
const india = (
  <>
    <rect width="90" height="20" fill="#FF9933" />
    <rect y="20" width="90" height="20" fill="#FFFFFF" />
    <rect y="40" width="90" height="20" fill="#138808" />
    <g stroke="#000080" fill="none">
      <circle cx="45" cy="30" r="8" strokeWidth="1.4" />
      <circle cx="45" cy="30" r="1.6" fill="#000080" stroke="none" />
      {Array.from({ length: 12 }, (_, i) => (
        <path key={i} d="M45 22.4V37.6" strokeWidth="0.7" transform={`rotate(${i * 15} 45 30)`} />
      ))}
    </g>
  </>
)

/** Germany: black, red and gold. */
const germany = (
  <>
    <rect width="90" height="20" fill="#000000" />
    <rect y="20" width="90" height="20" fill="#DD0000" />
    <rect y="40" width="90" height="20" fill="#FFCE00" />
  </>
)

/** Brazil: green field, gold rhombus and blue globe; the band carries no motto at this size. */
const brazil = (
  <>
    <rect width="90" height="60" fill="#009C3B" />
    <path d="M45 7 83 30 45 53 7 30Z" fill="#FFDF00" />
    <circle cx="45" cy="30" r="13.5" fill="#002776" />
    <path d="M32.2 25.6a26 26 0 0 1 25.6 8.6 26 26 0 0 0-25.1-6.3Z" fill="#FFFFFF" />
  </>
)

const FLAGS: Partial<Record<CountryCode, React.JSX.Element>> = {
  tr: turkey,
  us: unitedStates,
  gb: unitedKingdom,
  in: india,
  de: germany,
  br: brazil
}
