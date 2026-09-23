import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/cn'
import { Spinner } from './Spinner'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger'
export type ButtonSize = 'sm' | 'md' | 'lg'

const VARIANTS: Record<ButtonVariant, string> = {
  primary: 'bg-accent text-on-accent shadow-soft hover:bg-accent-hover',
  secondary: 'bg-muted text-fg hover:bg-subtle',
  ghost: 'text-fg-muted hover:bg-muted hover:text-fg',
  outline: 'border border-line-strong bg-surface text-fg shadow-soft hover:bg-muted',
  danger: 'bg-breaking-soft text-breaking hover:bg-breaking hover:text-on-breaking'
}

const SIZES: Record<ButtonSize, string> = {
  sm: 'h-8 gap-1.5 px-3 text-[13px] in-data-[density=compact]:h-7',
  md: 'h-9 gap-2 px-4 text-sm in-data-[density=compact]:h-8',
  lg: 'h-11 gap-2 px-5 text-[15px] in-data-[density=compact]:h-10'
}

const ICON_SIZES: Record<ButtonSize, number> = { sm: 15, md: 16, lg: 18 }

/** Class names of a button, for links and other elements that should look like one. */
export function buttonClass(
  variant: ButtonVariant = 'secondary',
  size: ButtonSize = 'md',
  className?: string
): string {
  return cn(
    'inline-flex shrink-0 items-center justify-center rounded-full font-ui font-medium whitespace-nowrap select-none',
    'transition-[background-color,color,box-shadow,opacity,transform] duration-150 ease-out active:scale-[0.98]',
    'disabled:pointer-events-none disabled:opacity-50',
    VARIANTS[variant],
    SIZES[size],
    className
  )
}

export interface ButtonProps extends React.ComponentProps<'button'> {
  variant?: ButtonVariant
  size?: ButtonSize
  /** Leading icon. */
  icon?: LucideIcon
  /** Trailing icon (e.g. a chevron). */
  iconRight?: LucideIcon
  /** Shows a spinner in place of the leading icon and disables the button. */
  loading?: boolean
}

/** Pill-shaped text button. Defaults to `type="button"`. */
export function Button({
  variant = 'secondary',
  size = 'md',
  icon: Icon,
  iconRight: IconRight,
  loading = false,
  disabled,
  className,
  children,
  type = 'button',
  ...props
}: ButtonProps): React.JSX.Element {
  const iconSize = ICON_SIZES[size]
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={buttonClass(variant, size, className)}
      {...props}
    >
      {loading ? (
        <Spinner size={iconSize} label={null} />
      ) : (
        Icon && <Icon size={iconSize} strokeWidth={1.75} aria-hidden className="-ml-0.5 shrink-0" />
      )}
      {children}
      {IconRight && <IconRight size={iconSize} strokeWidth={1.75} aria-hidden className="-mr-1 shrink-0" />}
    </button>
  )
}
