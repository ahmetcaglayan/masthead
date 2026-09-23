import { cn } from '@/lib/cn'

export interface DividerProps {
  orientation?: 'horizontal' | 'vertical'
  /** Centred caption on a horizontal rule (kicker style). */
  label?: React.ReactNode
  /** Use the stronger line colour. */
  strong?: boolean
  className?: string
}

/** Hairline separator. */
export function Divider({
  orientation = 'horizontal',
  label,
  strong,
  className
}: DividerProps): React.JSX.Element {
  const line = strong ? 'bg-line-strong' : 'bg-line'
  if (orientation === 'vertical') {
    return (
      <div
        role="separator"
        aria-orientation="vertical"
        className={cn('w-px self-stretch', line, className)}
      />
    )
  }
  if (label) {
    return (
      <div role="separator" className={cn('flex items-center gap-3', className)}>
        <span className={cn('h-px flex-1', line)} />
        <span className="text-[11px] font-semibold tracking-wider text-fg-subtle uppercase">{label}</span>
        <span className={cn('h-px flex-1', line)} />
      </div>
    )
  }
  return <div role="separator" className={cn('h-px w-full', line, className)} />
}
