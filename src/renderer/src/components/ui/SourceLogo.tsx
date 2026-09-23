import { useState } from 'react'
import type { SourceDef } from '@shared/types'
import { sourceInitials, sourceInk, sourceTint } from '@/lib/sources'
import { cn } from '@/lib/cn'

export type SourceLogoSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

const SIZES: Record<SourceLogoSize, { box: string; pad: string; text: string }> = {
  xs: { box: 'size-4 rounded-[4px]', pad: 'p-0', text: 'text-[7px]' },
  sm: { box: 'size-5 rounded-[5px]', pad: 'p-[2px]', text: 'text-[8.5px]' },
  md: { box: 'size-7 rounded-lg', pad: 'p-1', text: 'text-[11px]' },
  lg: { box: 'size-10 rounded-xl', pad: 'p-1.5', text: 'text-sm' },
  xl: { box: 'size-14 rounded-2xl', pad: 'p-2', text: 'text-lg' }
}

export interface SourceLogoProps {
  /** The source; undefined renders a neutral "?" tile. */
  source: Pick<SourceDef, 'name' | 'icon' | 'color'> | undefined
  size?: SourceLogoSize
  /** Expose the source name to screen readers (default: decorative, since a name is usually next to it). */
  labelled?: boolean
  className?: string
}

/**
 * The source's favicon in a rounded tile; falls back to a monogram on a wash
 * of the brand colour when there is no icon or it fails to load.
 */
export function SourceLogo({
  source,
  size = 'sm',
  labelled = false,
  className
}: SourceLogoProps): React.JSX.Element {
  const [broken, setBroken] = useState<string | null>(null)
  const { box, pad, text } = SIZES[size]
  const icon = source?.icon && source.icon !== broken ? source.icon : undefined
  const a11y = labelled && source ? { role: 'img', 'aria-label': source.name } : { 'aria-hidden': true }

  if (icon) {
    return (
      <span
        {...a11y}
        className={cn(
          'inline-flex shrink-0 items-center justify-center overflow-hidden bg-logo-tile ring-1 ring-line dark:ring-line-strong',
          box,
          pad,
          className
        )}
      >
        <img
          src={icon}
          alt=""
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          draggable={false}
          onError={() => setBroken(icon)}
          className="size-full rounded-[inherit] object-contain"
        />
      </span>
    )
  }

  return (
    <span
      {...a11y}
      style={{ background: sourceTint(source?.color, 20), color: sourceInk(source?.color) }}
      className={cn(
        'inline-flex shrink-0 items-center justify-center font-ui leading-none font-bold tracking-tight ring-1 ring-line',
        box,
        text,
        className
      )}
    >
      {source ? sourceInitials(source.name) : '?'}
    </span>
  )
}
