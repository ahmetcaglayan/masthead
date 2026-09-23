import { cn } from '@/lib/cn'

export type BadgeVariant = 'neutral' | 'accent' | 'breaking' | 'live' | 'solid'

const VARIANTS: Record<BadgeVariant, string> = {
  neutral: 'bg-muted text-fg-muted',
  accent: 'bg-accent-soft text-accent-ink',
  breaking: 'bg-breaking-soft text-breaking',
  live: 'bg-muted text-fg',
  solid: 'bg-breaking text-on-breaking'
}

const DOTS: Record<BadgeVariant, string> = {
  neutral: 'bg-fg-subtle',
  accent: 'bg-accent',
  breaking: 'bg-breaking animate-pulse-dot',
  live: 'bg-live',
  solid: 'bg-on-accent'
}

export interface BadgeProps extends React.ComponentProps<'span'> {
  variant?: BadgeVariant
  /** Leading status dot; pulses for `breaking`. */
  dot?: boolean
  /** `sm` is a kicker-sized uppercase label, `md` a regular pill. Default `sm`. */
  size?: 'sm' | 'md'
}

/** Compact status label: "SON DAKİKA", "CANLI", "Web", counts. */
export function Badge({
  variant = 'neutral',
  dot = false,
  size = 'sm',
  className,
  children,
  ...props
}: BadgeProps): React.JSX.Element {
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center gap-1.5 rounded-full font-ui whitespace-nowrap',
        size === 'sm'
          ? 'h-5 px-2 text-[10.5px] font-semibold tracking-wider uppercase'
          : 'h-6 px-2.5 text-xs font-medium',
        VARIANTS[variant],
        className
      )}
      {...props}
    >
      {dot && <span aria-hidden className={cn('size-1.5 rounded-full', DOTS[variant])} />}
      {children}
    </span>
  )
}
