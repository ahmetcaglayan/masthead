import { cn } from '@/lib/cn'

const WIDTHS = {
  /** Reading-width column. */
  narrow: 'max-w-3xl',
  /** Every page: the frame stays put when navigating. */
  default: 'max-w-[1320px]',
  /** Edge-to-edge grids. */
  wide: 'max-w-[1680px]'
} as const

/** Line length of a page's content, starting at the same left gutter as every other page. */
const MEASURES = {
  full: undefined,
  '6xl': 'max-w-6xl',
  '5xl': 'max-w-5xl',
  '4xl': 'max-w-4xl'
} as const

export interface PageProps extends React.ComponentProps<'div'> {
  width?: keyof typeof WIDTHS
  /**
   * Narrower content for text-first pages (digest, settings, saved…). Set on an
   * inner column that is not centred, so titles start on the same 32px gutter
   * as on every other page. Default `full`.
   */
  measure?: keyof typeof MEASURES
}

/** Standard page gutter and max width inside the scroller; tightens in compact density. */
export function Page({
  width = 'default',
  measure = 'full',
  className,
  children,
  ...props
}: PageProps): React.JSX.Element {
  const inner = MEASURES[measure]
  return (
    <div
      className={cn(
        'mx-auto w-full px-8 pt-8 pb-16 in-data-[density=compact]:px-6 in-data-[density=compact]:pt-6',
        WIDTHS[width],
        className
      )}
      {...props}
    >
      {inner ? <div className={inner}>{children}</div> : children}
    </div>
  )
}
