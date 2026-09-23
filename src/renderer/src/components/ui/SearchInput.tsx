import { useState } from 'react'
import { Search, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/cn'
import { Kbd } from './Kbd'

export interface SearchInputProps extends Omit<
  React.ComponentProps<'input'>,
  'value' | 'onChange' | 'size' | 'onSubmit' | 'type'
> {
  value: string
  onValueChange: (value: string) => void
  /** Enter pressed. */
  onSubmit?: (value: string) => void
  /** After the value was cleared with the × button or Esc. */
  onClear?: () => void
  /** Shortcut hint shown while empty and unfocused, e.g. `Mod+K`. */
  shortcut?: string
  size?: 'sm' | 'md'
  /** Classes for the outer pill. */
  className?: string
}

/**
 * Pill search field with icon, clear button and shortcut hint. Esc clears a
 * non-empty field, a second Esc blurs it. The ref points at the `<input>`.
 */
export function SearchInput({
  value,
  onValueChange,
  onSubmit,
  onClear,
  shortcut,
  size = 'md',
  className,
  placeholder,
  onKeyDown,
  onFocus,
  onBlur,
  ...props
}: SearchInputProps): React.JSX.Element {
  const { t } = useTranslation('common')
  const [focused, setFocused] = useState(false)

  const clear = (): void => {
    onValueChange('')
    onClear?.()
  }

  return (
    <div
      className={cn(
        'group relative flex items-center rounded-full border border-transparent bg-muted text-fg transition-[background-color,border-color,box-shadow] duration-150 ease-out',
        'hover:border-line focus-within:border-line-strong focus-within:bg-surface focus-within:shadow-soft focus-within:ring-3 focus-within:ring-accent-soft',
        size === 'sm' ? 'h-8' : 'h-9',
        className
      )}
    >
      <Search
        size={size === 'sm' ? 15 : 16}
        strokeWidth={1.75}
        aria-hidden
        className="pointer-events-none absolute left-3 text-fg-subtle transition-colors group-focus-within:text-fg-muted"
      />
      <input
        type="search"
        value={value}
        placeholder={placeholder ?? t('actions.search')}
        aria-label={props['aria-label'] ?? placeholder ?? t('actions.search')}
        spellCheck={false}
        autoComplete="off"
        onChange={(e) => onValueChange(e.target.value)}
        onFocus={(e) => {
          setFocused(true)
          onFocus?.(e)
        }}
        onBlur={(e) => {
          setFocused(false)
          onBlur?.(e)
        }}
        onKeyDown={(e) => {
          onKeyDown?.(e)
          if (e.defaultPrevented || e.nativeEvent.isComposing) return
          if (e.key === 'Enter') {
            e.preventDefault()
            onSubmit?.(value)
          } else if (e.key === 'Escape') {
            e.preventDefault()
            if (value) clear()
            else e.currentTarget.blur()
          }
        }}
        className={cn(
          'selectable size-full min-w-0 bg-transparent font-ui text-fg outline-none placeholder:text-fg-subtle focus-visible:outline-none',
          '[&::-webkit-search-cancel-button]:hidden',
          size === 'sm' ? 'pr-8 pl-8.5 text-[13px]' : 'pr-9 pl-9.5 text-sm'
        )}
        {...props}
      />
      {value ? (
        <button
          type="button"
          aria-label={t('actions.clear')}
          onMouseDown={(e) => e.preventDefault()}
          onClick={clear}
          className="absolute right-1.5 flex size-6 items-center justify-center rounded-full text-fg-subtle transition-colors hover:bg-subtle hover:text-fg"
        >
          <X size={14} strokeWidth={2} aria-hidden />
        </button>
      ) : (
        shortcut &&
        !focused && <Kbd combo={shortcut} className="pointer-events-none absolute right-2.5 opacity-80" />
      )}
    </div>
  )
}
