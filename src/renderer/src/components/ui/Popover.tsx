import { Popover as RPopover } from 'radix-ui'
import { cn } from '@/lib/cn'
import './ui.css'

/** Popover root (Radix): `open`, `onOpenChange`, `modal`. */
export const Popover = RPopover.Root
/** Wrap the trigger element: `<PopoverTrigger asChild><Button …/></PopoverTrigger>`. */
export const PopoverTrigger = RPopover.Trigger
export const PopoverAnchor = RPopover.Anchor
export const PopoverClose = RPopover.Close

export type PopoverContentProps = React.ComponentProps<typeof RPopover.Content>

/** The floating panel, portalled. Defaults: `align="start"`, `sideOffset={8}`; add padding via className. */
export function PopoverContent({
  className,
  align = 'start',
  sideOffset = 8,
  collisionPadding = 12,
  ...props
}: PopoverContentProps): React.JSX.Element {
  return (
    <RPopover.Portal>
      <RPopover.Content
        align={align}
        sideOffset={sideOffset}
        collisionPadding={collisionPadding}
        className={cn(
          'mh-float z-50 max-h-[var(--radix-popover-content-available-height)] overflow-auto rounded-panel border border-line bg-surface p-4 font-ui text-sm text-fg shadow-float outline-none',
          className
        )}
        {...props}
      />
    </RPopover.Portal>
  )
}
