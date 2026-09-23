import { cn } from '@/lib/cn'

export interface SkeletonProps extends React.ComponentProps<'div'> {
  /** Round the corners like a card image (`card`), a text line (`line`) or fully (`full`). Default `line`. */
  shape?: 'line' | 'card' | 'full'
}

/** Shimmering placeholder block; size it with className (`h-4 w-2/3`, `aspect-[16/9]`…). */
export function Skeleton({ shape = 'line', className, ...props }: SkeletonProps): React.JSX.Element {
  return (
    <div
      aria-hidden
      className={cn(
        'skeleton',
        shape === 'line' && 'h-3.5 rounded-md',
        shape === 'card' && 'rounded-card',
        shape === 'full' && 'rounded-full',
        className
      )}
      {...props}
    />
  )
}

/** A few ragged text lines (last one shorter). */
export function SkeletonText({
  lines = 3,
  className
}: {
  lines?: number
  className?: string
}): React.JSX.Element {
  return (
    <div aria-hidden className={cn('flex flex-col gap-2', className)}>
      {Array.from({ length: lines }, (_, i) => (
        <Skeleton key={i} className={i === lines - 1 && lines > 1 ? 'w-3/5' : 'w-full'} />
      ))}
    </div>
  )
}
