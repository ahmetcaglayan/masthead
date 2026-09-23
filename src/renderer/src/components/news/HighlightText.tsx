import { useMemo } from 'react'
import { cn } from '@/lib/cn'
import { highlightRanges } from '@/lib/search'

export interface HighlightTextProps {
  text: string
  /** Folded search terms (from `parseQuery`); nothing is marked when empty. */
  terms?: readonly string[]
  /** Also set matches in semibold (summaries; headlines are bold already). */
  strong?: boolean
}

/** Text with every search-term match in a soft highlighter `<mark>` (no underline, calm to scan). */
export function HighlightText({ text, terms, strong = false }: HighlightTextProps): React.JSX.Element {
  const parts = useMemo(() => {
    const ranges = terms?.length ? highlightRanges(text, terms) : []
    if (ranges.length === 0) return null
    const out: React.ReactNode[] = []
    let cursor = 0
    for (const [start, end] of ranges) {
      if (start > cursor) out.push(text.slice(cursor, start))
      out.push(
        <mark
          key={start}
          className={cn(
            'rounded-[2px] bg-mark px-px text-inherit box-decoration-clone',
            strong && 'font-semibold'
          )}
        >
          {text.slice(start, end)}
        </mark>
      )
      cursor = end
    }
    if (cursor < text.length) out.push(text.slice(cursor))
    return out
  }, [text, terms, strong])

  return <>{parts ?? text}</>
}
