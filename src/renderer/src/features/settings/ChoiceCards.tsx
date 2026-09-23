import { useRef } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Check } from 'lucide-react'
import { cn } from '@/lib/cn'

export interface ChoiceOption<T extends string> {
  value: T
  label: React.ReactNode
  description?: React.ReactNode
  /** Artwork shown above the text: a theme preview, a layout sketch, a monogram. */
  visual?: React.ReactNode
  disabled?: boolean
}

export interface ChoiceCardsProps<T extends string> {
  value: T
  options: readonly ChoiceOption<T>[]
  /** Selection moved, by pointer or arrow keys. */
  onChange: (value: T) => void
  /** A card was clicked or activated with Enter/Space: a deliberate choice (arrow keys don't count). */
  onPick?: (value: T) => void
  'aria-label'?: string
  'aria-labelledby'?: string
  /** Grid columns; defaults to one per option. */
  columns?: number
  /** Larger text for the first-run flow. */
  size?: 'md' | 'lg'
  className?: string
}

/**
 * A radio group of selectable cards with optional artwork. Arrow keys move the
 * selection (roving focus); the chosen card gets an accent ring and a check.
 */
export function ChoiceCards<T extends string>({
  value,
  options,
  onChange,
  onPick,
  columns,
  size = 'md',
  className,
  ...aria
}: ChoiceCardsProps<T>): React.JSX.Element {
  const refs = useRef<(HTMLButtonElement | null)[]>([])
  const selectedIndex = options.findIndex((o) => o.value === value)

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
      {...aria}
      style={{ gridTemplateColumns: `repeat(${columns ?? options.length}, minmax(0, 1fr))` }}
      className={cn('grid gap-3 in-data-[density=compact]:gap-2.5', className)}
    >
      {options.map((option, index) => {
        const selected = option.value === value
        const focusable = selected || (selectedIndex === -1 && index === 0)
        return (
          <button
            key={option.value}
            ref={(el) => {
              refs.current[index] = el
            }}
            type="button"
            role="radio"
            aria-checked={selected}
            tabIndex={focusable ? 0 : -1}
            disabled={option.disabled}
            onClick={() => {
              onChange(option.value)
              onPick?.(option.value)
            }}
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
              'group/choice relative flex flex-col rounded-card border bg-surface p-2 text-left font-ui',
              'transition-[border-color,box-shadow,transform] duration-200 ease-out active:scale-[0.985]',
              'disabled:pointer-events-none disabled:opacity-50',
              selected
                ? 'border-accent shadow-card ring-3 ring-accent-soft'
                : 'border-line shadow-soft hover:border-line-strong hover:shadow-card'
            )}
          >
            {option.visual && <div className="relative overflow-hidden rounded-[9px]">{option.visual}</div>}
            <div
              className={cn(
                'flex flex-col gap-0.5',
                size === 'lg' ? 'pt-3 pb-1.5 pl-2.5' : 'pt-2.5 pb-1 pl-1.5',
                // Room for the check mark in the corner.
                'pr-8',
                !option.visual && 'pt-1.5'
              )}
            >
              <span className={cn('font-medium text-fg', size === 'lg' ? 'text-[15px]' : 'text-[13.5px]')}>
                {option.label}
              </span>
              {option.description && (
                <span className={cn('text-fg-muted', size === 'lg' ? 'text-[13px]' : 'text-xs')}>
                  {option.description}
                </span>
              )}
            </div>
            <AnimatePresence initial={false}>
              {selected && (
                <motion.span
                  aria-hidden
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  transition={{ duration: 0.18, ease: 'easeOut' }}
                  className={cn(
                    'absolute right-3 flex size-5 items-center justify-center rounded-full bg-accent text-on-accent shadow-soft',
                    option.visual ? 'bottom-3' : 'top-3'
                  )}
                >
                  <Check size={12} strokeWidth={3} />
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        )
      })}
    </div>
  )
}
