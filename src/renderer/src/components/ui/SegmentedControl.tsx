import { useId, useRef } from 'react'
import { motion } from 'motion/react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/cn'

export interface SegmentedOption<T extends string> {
  value: T
  label: React.ReactNode
  icon?: LucideIcon
  disabled?: boolean
}

export interface SegmentedControlProps<T extends string> {
  value: T
  onChange: (value: T) => void
  options: readonly SegmentedOption<T>[]
  /** Accessible name of the group. */
  'aria-label': string
  size?: 'sm' | 'md'
  /** Stretch segments to fill the container. */
  fullWidth?: boolean
  className?: string
}

/** Radio-group of pill segments with a sliding thumb. Arrow keys move the selection. */
export function SegmentedControl<T extends string>({
  value,
  onChange,
  options,
  size = 'md',
  fullWidth = false,
  className,
  ...aria
}: SegmentedControlProps<T>): React.JSX.Element {
  const thumbId = useId()
  const refs = useRef<(HTMLButtonElement | null)[]>([])

  const move = (from: number, step: 1 | -1): void => {
    for (let i = 1; i <= options.length; i++) {
      const next = (from + step * i + options.length) % options.length
      if (!options[next].disabled) {
        onChange(options[next].value)
        refs.current[next]?.focus()
        return
      }
    }
  }

  return (
    <div
      role="radiogroup"
      aria-label={aria['aria-label']}
      className={cn(
        'relative inline-flex items-center gap-0.5 rounded-full bg-muted p-1',
        fullWidth && 'flex w-full',
        className
      )}
    >
      {options.map((option, index) => {
        const active = option.value === value
        const Icon = option.icon
        return (
          <button
            key={option.value}
            ref={(el) => {
              refs.current[index] = el
            }}
            type="button"
            role="radio"
            aria-checked={active}
            tabIndex={active ? 0 : -1}
            disabled={option.disabled}
            onClick={() => onChange(option.value)}
            onKeyDown={(e) => {
              if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                e.preventDefault()
                move(index, 1)
              } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                e.preventDefault()
                move(index, -1)
              }
            }}
            className={cn(
              'relative z-0 inline-flex items-center justify-center gap-1.5 rounded-full font-ui font-medium whitespace-nowrap transition-colors duration-150 select-none',
              'text-fg-muted hover:text-fg disabled:pointer-events-none disabled:opacity-45 aria-checked:text-fg',
              size === 'sm' ? 'h-7 px-3 text-[12.5px]' : 'h-8 px-3.5 text-[13.5px]',
              fullWidth && 'flex-1'
            )}
          >
            {active && (
              <motion.span
                layoutId={thumbId}
                aria-hidden
                className="absolute inset-0 -z-10 rounded-full bg-surface shadow-soft dark:bg-subtle"
                transition={{ type: 'spring', bounce: 0.15, duration: 0.35 }}
              />
            )}
            {Icon && <Icon size={size === 'sm' ? 14 : 16} strokeWidth={1.75} aria-hidden />}
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
