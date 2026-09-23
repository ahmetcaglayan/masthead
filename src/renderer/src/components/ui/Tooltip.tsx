import { useState } from 'react'
import { Tooltip as RTooltip } from 'radix-ui'
import { hotkeyParts } from '@/lib/hotkeys'
import { cn } from '@/lib/cn'
import './ui.css'

/** Mount once near the root; shares open delays between all tooltips. */
export function TooltipProvider({ children }: { children: React.ReactNode }): React.JSX.Element {
  return (
    <RTooltip.Provider delayDuration={450} skipDelayDuration={250}>
      {children}
    </RTooltip.Provider>
  )
}

export interface TooltipProps {
  /** Tooltip text. Empty/undefined/false switches the tooltip off (the trigger stays mounted). */
  content: React.ReactNode
  /** A single focusable element (it receives the trigger props via `asChild`). */
  children: React.ReactElement
  /** Shortcut shown after the text, e.g. `Mod+K`. */
  shortcut?: string
  side?: 'top' | 'right' | 'bottom' | 'left'
  align?: 'start' | 'center' | 'end'
  sideOffset?: number
  /** Override the provider's open delay (ms). */
  delay?: number
  disabled?: boolean
  className?: string
}

/** Small inverted label on hover/focus. */
export function Tooltip({
  content,
  children,
  shortcut,
  side = 'bottom',
  align = 'center',
  sideOffset = 6,
  delay,
  disabled,
  className
}: TooltipProps): React.JSX.Element {
  const [open, setOpen] = useState(false)
  // Stay mounted when switched off so the trigger keeps its identity (and focus).
  const off = disabled || content === undefined || content === null || content === '' || content === false
  return (
    <RTooltip.Root delayDuration={delay} open={open && !off} onOpenChange={setOpen}>
      <RTooltip.Trigger asChild>{children}</RTooltip.Trigger>
      {!off && (
        <RTooltip.Portal>
          <RTooltip.Content
            side={side}
            align={align}
            sideOffset={sideOffset}
            collisionPadding={8}
            className={cn(
              'mh-float z-50 flex max-w-72 items-center gap-2 rounded-lg bg-fg px-2.5 py-1.5 font-ui text-xs leading-snug font-medium text-canvas shadow-card select-none',
              className
            )}
          >
            <span>{content}</span>
            {shortcut && (
              <span className="flex items-center gap-0.5 text-canvas/65">
                {hotkeyParts(shortcut).map((part, i) => (
                  <kbd key={i} className="font-ui text-[11px]">
                    {part}
                  </kbd>
                ))}
              </span>
            )}
          </RTooltip.Content>
        </RTooltip.Portal>
      )}
    </RTooltip.Root>
  )
}
