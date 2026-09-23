import type { CountryCode } from '@shared/types'
import { cn } from '@/lib/cn'

/**
 * A country's flag as inline artwork (emoji flags don't render on Windows).
 * Flags keep their official colours. Returns null for countries without one yet.
 */
export function CountryFlag({
  code,
  className
}: {
  code: CountryCode
  className?: string
}): React.JSX.Element | null {
  if (code !== 'tr') return null
  // Proportions from the Turkish Flag Law: 3:2, crescent circles of G/2 and 2/5 G, star circle of G/4.
  return (
    <svg
      viewBox="0 -30000 90000 60000"
      aria-hidden
      className={cn('h-4 w-6 shrink-0 rounded-[3px] shadow-[0_0_0_1px_var(--line)]', className)}
    >
      <rect x="0" y="-30000" width="90000" height="60000" fill="#E30A17" />
      <path
        fill="#FFFFFF"
        d="m41750 0 13568-4408-8386 11541V-7133l8386 11541zm925 8021a15000 15000 0 1 1 0-16042 12000 12000 0 1 0 0 16042z"
      />
    </svg>
  )
}
