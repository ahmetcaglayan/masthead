import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/cn'
import { Tooltip } from './Tooltip'

export type IconButtonVariant = 'ghost' | 'secondary' | 'outline' | 'primary' | 'glass'
export type IconButtonSize = 'sm' | 'md' | 'lg'

const VARIANTS: Record<IconButtonVariant, string> = {
  ghost: 'text-fg-muted hover:bg-muted hover:text-fg',
  secondary: 'bg-muted text-fg hover:bg-subtle',
  outline: 'border border-line-strong bg-surface text-fg-muted shadow-soft hover:bg-muted hover:text-fg',
  primary: 'bg-accent text-on-accent shadow-soft hover:bg-accent-hover',
  glass: 'border border-line bg-glass text-fg shadow-soft backdrop-blur-md hover:bg-surface'
}

const SIZES: Record<IconButtonSize, { box: string; icon: number }> = {
  sm: { box: 'size-7', icon: 16 },
  md: { box: 'size-8', icon: 18 },
  lg: { box: 'size-10', icon: 18 }
}

export interface IconButtonProps extends Omit<React.ComponentProps<'button'>, 'aria-label'> {
  /** Accessible name; also the tooltip text unless `tooltip` says otherwise. */
  label: string
  icon: LucideIcon
  variant?: IconButtonVariant
  size?: IconButtonSize
  /** `true` (default) shows `label` as a tooltip, a node shows that instead, `false` shows none. */
  tooltip?: boolean | React.ReactNode
  tooltipSide?: 'top' | 'right' | 'bottom' | 'left'
  /** Shortcut hint in the tooltip, e.g. `Mod+,`. */
  shortcut?: string
  /** Toggle state: sets `aria-pressed` and the accent look. */
  pressed?: boolean
  /** Extra classes for the icon (e.g. `animate-spin`). */
  iconClassName?: string
}

/** Square-ish round button holding a single icon; always labelled for screen readers. */
export function IconButton({
  label,
  icon: Icon,
  variant = 'ghost',
  size = 'md',
  tooltip = true,
  tooltipSide,
  shortcut,
  pressed,
  iconClassName,
  className,
  type = 'button',
  ...props
}: IconButtonProps): React.JSX.Element {
  const { box, icon } = SIZES[size]
  const button = (
    <button
      type={type}
      aria-label={label}
      aria-pressed={pressed}
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-full transition-[background-color,color,transform] duration-150 ease-out select-none active:scale-95',
        'disabled:pointer-events-none disabled:opacity-45',
        VARIANTS[variant],
        pressed && 'bg-accent-soft text-accent hover:bg-accent-soft hover:text-accent',
        box,
        className
      )}
      {...props}
    >
      <Icon size={icon} strokeWidth={1.75} aria-hidden className={iconClassName} />
    </button>
  )
  if (tooltip === false) return button
  return (
    <Tooltip content={tooltip === true ? label : tooltip} shortcut={shortcut} side={tooltipSide}>
      {button}
    </Tooltip>
  )
}
