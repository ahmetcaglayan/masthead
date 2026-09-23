import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/cn'

export interface EmptyStateProps {
  icon?: LucideIcon
  title: React.ReactNode
  description?: React.ReactNode
  /** Buttons or links below the text. */
  action?: React.ReactNode
  /** `accent` tints the icon, `error` uses the breaking colour. Default `neutral`. */
  tone?: 'neutral' | 'accent' | 'error'
  /** Less vertical room, for use inside cards and popovers. */
  compact?: boolean
  className?: string
}

const TONES = {
  neutral: 'bg-muted text-fg-muted',
  accent: 'bg-accent-soft text-accent',
  error: 'bg-breaking-soft text-breaking'
} as const

/** Centred message for empty lists, errors and "nothing found". */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  tone = 'neutral',
  compact = false,
  className
}: EmptyStateProps): React.JSX.Element {
  return (
    <div
      className={cn(
        'mx-auto flex max-w-md flex-col items-center text-center',
        compact ? 'gap-2 py-8' : 'gap-3 py-20',
        className
      )}
    >
      {Icon && (
        <div
          className={cn(
            'mb-1 flex items-center justify-center rounded-full',
            compact ? 'size-11' : 'size-14',
            TONES[tone]
          )}
        >
          <Icon size={compact ? 20 : 24} strokeWidth={1.75} aria-hidden />
        </div>
      )}
      <h2 className={cn('headline font-semibold text-fg', compact ? 'text-lg' : 'text-2xl')}>{title}</h2>
      {description && <p className="text-sm leading-relaxed text-fg-muted text-pretty">{description}</p>}
      {action && <div className="mt-3 flex flex-wrap items-center justify-center gap-2">{action}</div>}
    </div>
  )
}
