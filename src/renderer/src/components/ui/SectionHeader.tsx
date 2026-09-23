import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/cn'

export interface SectionHeaderProps {
  title: React.ReactNode
  /** Small uppercase label above the title ("SON DAKİKA", "GÜNDEM"). */
  kicker?: React.ReactNode
  /** Kicker colour: accent (default), breaking red or muted. */
  kickerTone?: 'accent' | 'breaking' | 'muted'
  /** Icon before the title. */
  icon?: LucideIcon
  /** One line under the title. */
  description?: React.ReactNode
  /** Right-aligned slot: "See all →" link, filters, a count. */
  action?: React.ReactNode
  /** `md` for sections inside a page (text-2xl, hairline rule), `lg` for page titles (text-4xl). Default `md`. */
  size?: 'md' | 'lg'
  /** Heading element; defaults to h2 for `md` and h1 for `lg`. */
  as?: 'h1' | 'h2' | 'h3'
  id?: string
  className?: string
}

const KICKER_TONES = {
  accent: 'text-accent-ink',
  breaking: 'text-breaking',
  muted: 'text-fg-subtle'
} as const

/** Editorial section head: kicker, serif title, optional action on the right. */
export function SectionHeader({
  title,
  kicker,
  kickerTone = 'accent',
  icon: Icon,
  description,
  action,
  size = 'md',
  as,
  id,
  className
}: SectionHeaderProps): React.JSX.Element {
  const Heading = as ?? (size === 'lg' ? 'h1' : 'h2')
  const lg = size === 'lg'
  return (
    <header
      className={cn(
        'flex items-end justify-between gap-4',
        lg ? 'pb-2' : 'border-b border-line pb-3',
        className
      )}
    >
      <div className="min-w-0">
        {kicker && (
          <div
            className={cn(
              'mb-1.5 flex items-center gap-1.5 font-ui text-[11px] font-semibold tracking-wider uppercase',
              KICKER_TONES[kickerTone]
            )}
          >
            {kicker}
          </div>
        )}
        <Heading
          id={id}
          className={cn(
            'headline flex items-center gap-2.5 font-semibold text-fg',
            lg ? 'text-4xl leading-[1.1] in-data-[density=compact]:text-3xl' : 'text-2xl leading-tight'
          )}
        >
          {Icon && (
            <Icon
              size={lg ? 28 : 20}
              strokeWidth={1.75}
              aria-hidden
              className={cn('shrink-0', lg ? 'text-accent-ink' : 'text-fg-subtle')}
            />
          )}
          <span className="min-w-0">{title}</span>
        </Heading>
        {description && (
          <p className={cn('text-fg-muted text-pretty', lg ? 'mt-2 text-[15px]' : 'mt-1 text-sm')}>
            {description}
          </p>
        )}
      </div>
      {action && <div className="flex shrink-0 items-center gap-2 font-ui">{action}</div>}
    </header>
  )
}
