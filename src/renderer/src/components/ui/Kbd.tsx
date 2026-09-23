import { hotkeyParts } from '@/lib/hotkeys'
import { cn } from '@/lib/cn'

export interface KbdProps {
  /** A combo like `Mod+K`, rendered for the current platform (`Ctrl K` / `⌘ K`). */
  combo?: string
  /** Literal key label(s) when not using `combo`. */
  children?: React.ReactNode
  className?: string
}

const KEY =
  'inline-flex h-[1.35rem] min-w-[1.35rem] items-center justify-center rounded-md border border-line-strong bg-surface px-1.5 font-ui text-[11px] leading-none font-medium text-fg-muted shadow-[inset_0_-1px_0_var(--line)]'

/** Keyboard key cap(s). */
export function Kbd({ combo, children, className }: KbdProps): React.JSX.Element {
  if (combo) {
    return (
      <span className={cn('inline-flex items-center gap-0.5', className)} aria-hidden>
        {hotkeyParts(combo).map((part, i) => (
          <kbd key={i} className={KEY}>
            {part}
          </kbd>
        ))}
      </span>
    )
  }
  return <kbd className={cn(KEY, className)}>{children}</kbd>
}
