import { Switch as RSwitch } from 'radix-ui'
import { cn } from '@/lib/cn'

export interface SwitchProps extends Omit<React.ComponentProps<typeof RSwitch.Root>, 'children' | 'checked'> {
  size?: 'sm' | 'md'
  /**
   * On, off, or `indeterminate` for a group that is partly on: the thumb rests
   * midway and `aria-checked` is "mixed"; pressing it switches everything on.
   */
  checked?: boolean | 'indeterminate'
}

/**
 * On/off toggle (Radix Switch). Controlled via `checked` + `onCheckedChange`.
 * Give it an accessible name with `aria-label` or a `<label htmlFor>`.
 */
export function Switch({ size = 'md', checked, className, ...props }: SwitchProps): React.JSX.Element {
  const sm = size === 'sm'
  const mixed = checked === 'indeterminate'
  return (
    <RSwitch.Root
      checked={mixed ? false : checked}
      className={cn(
        'relative inline-flex shrink-0 items-center rounded-full p-0.5 transition-colors duration-200 ease-out',
        'bg-subtle data-[state=checked]:bg-accent disabled:opacity-45',
        mixed && 'bg-accent/45',
        sm ? 'h-5 w-8' : 'h-6 w-10',
        className
      )}
      {...props}
      {...(mixed && { 'aria-checked': 'mixed' as const })}
    >
      <RSwitch.Thumb
        className={cn(
          'block rounded-full bg-surface shadow-soft transition-transform duration-200 ease-out-soft dark:bg-fg',
          sm ? 'size-4 data-[state=checked]:translate-x-3' : 'size-5 data-[state=checked]:translate-x-4',
          mixed && (sm ? 'translate-x-1.5' : 'translate-x-2')
        )}
      />
    </RSwitch.Root>
  )
}
