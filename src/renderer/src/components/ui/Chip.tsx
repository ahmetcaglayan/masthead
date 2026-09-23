import { Check, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/cn'

type ChipSize = 'sm' | 'md'

const BASE =
  'inline-flex shrink-0 items-center gap-1.5 rounded-full border font-ui font-medium whitespace-nowrap select-none transition-[background-color,border-color,color,transform] duration-150 ease-out'

const SIZES: Record<ChipSize, string> = {
  sm: 'h-7 px-2.5 text-[12.5px] in-data-[density=compact]:h-6',
  md: 'h-9 px-3.5 text-sm in-data-[density=compact]:h-8'
}

function Count({ value, selected }: { value: number | string; selected?: boolean }): React.JSX.Element {
  return (
    <span className={cn('text-[11px] tabular-nums', selected ? 'text-on-accent/75' : 'text-fg-subtle')}>
      {value}
    </span>
  )
}

export interface ChipProps extends Omit<React.ComponentProps<'button'>, 'children'> {
  icon?: LucideIcon
  /** Small trailing number (article count…). */
  count?: number | string
  size?: ChipSize
  children: React.ReactNode
}

/** Neutral pill. Renders a `<button>` when `onClick` is set, otherwise a `<span>`. */
export function Chip({
  icon: Icon,
  count,
  size = 'sm',
  className,
  children,
  onClick,
  type = 'button',
  ...props
}: ChipProps): React.JSX.Element {
  const classes = cn(BASE, SIZES[size], 'border-line bg-surface text-fg-muted', className)
  const content = (
    <>
      {Icon && <Icon size={size === 'sm' ? 14 : 16} strokeWidth={1.75} aria-hidden />}
      {children}
      {count !== undefined && <Count value={count} />}
    </>
  )
  if (!onClick) return <span className={classes}>{content}</span>
  return (
    <button
      type={type}
      onClick={onClick}
      className={cn(classes, 'hover:border-line-strong hover:bg-muted hover:text-fg active:scale-[0.97]')}
      {...props}
    >
      {content}
    </button>
  )
}

export interface ToggleChipProps extends Omit<React.ComponentProps<'button'>, 'onChange' | 'children'> {
  selected: boolean
  onSelectedChange: (selected: boolean) => void
  icon?: LucideIcon
  count?: number | string
  size?: ChipSize
  /** Show a check mark in place of the icon while selected. */
  showCheck?: boolean
  children: React.ReactNode
}

/** Selectable pill (`aria-pressed`) for interests, filters and quick toggles. */
export function ToggleChip({
  selected,
  onSelectedChange,
  icon: Icon,
  count,
  size = 'sm',
  showCheck = false,
  className,
  children,
  type = 'button',
  ...props
}: ToggleChipProps): React.JSX.Element {
  const LeadIcon = selected && showCheck ? Check : Icon
  return (
    <button
      type={type}
      aria-pressed={selected}
      onClick={() => onSelectedChange(!selected)}
      className={cn(
        BASE,
        SIZES[size],
        'active:scale-[0.97]',
        selected
          ? 'border-transparent bg-accent text-on-accent shadow-soft hover:bg-accent-hover'
          : 'border-line-strong bg-surface text-fg hover:bg-muted',
        className
      )}
      {...props}
    >
      {LeadIcon && (
        <LeadIcon
          size={size === 'sm' ? 14 : 16}
          strokeWidth={selected && showCheck ? 2.25 : 1.75}
          aria-hidden
        />
      )}
      {children}
      {count !== undefined && <Count value={count} selected={selected} />}
    </button>
  )
}
