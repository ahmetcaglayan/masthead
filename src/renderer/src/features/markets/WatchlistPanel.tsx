import { Settings2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { ASSET_KINDS, type Quote, type WatchItem } from '@shared/markets'
import type { Article } from '@shared/types'
import { IconButton } from '@/components/ui/IconButton'
import { localeFor } from '@/i18n'
import { cn } from '@/lib/cn'
import { formatChange, formatPrice } from '@/lib/format'
import { clock } from '@/lib/time'
import { useAssetName } from './hooks'

const DAY = 24 * 3_600_000

/** "▲ +0.25%" in the up colour, "▼ −1.10%" in the down colour, a dash when unknown. */
export function Change({
  value,
  className
}: {
  value: number | null
  className?: string
}): React.JSX.Element {
  const { t, i18n } = useTranslation('news')
  if (value === null) {
    return (
      <span className={cn('text-fg-subtle', className)} title={t('markets.noChange')}>
        —
      </span>
    )
  }
  const tone = value > 0 ? 'text-up' : value < 0 ? 'text-down' : 'text-fg-muted'
  return (
    <span className={cn('whitespace-nowrap tabular-nums', tone, className)}>
      <span aria-hidden className="text-[0.8em]">
        {value > 0 ? '▲ ' : value < 0 ? '▼ ' : ''}
      </span>
      {formatChange(value, i18n.language)}
    </span>
  )
}

interface RowProps {
  item: WatchItem
  quote?: Quote
  /** Stories about it today. */
  today: number
  selected: boolean
  onSelect: () => void
}

/** One line of the watchlist: name and code, then price and change — or, for a company, today's stories. */
function Row({ item, quote, today, selected, onSelect }: RowProps): React.JSX.Element {
  const { t, i18n } = useTranslation('news')
  const name = useAssetName()(item)
  const code = item.kind === 'equity' ? (item.code !== item.name ? item.code : '') : item.code
  const unit = quote?.unit ? t(`markets.unit.${quote.unit}`) : ''
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onSelect}
      className={cn(
        'flex w-full items-baseline gap-3 rounded-lg px-2.5 py-1.5 text-left font-ui text-[13px] transition-colors outline-none focus-visible:ring-3 focus-visible:ring-accent-soft',
        selected ? 'bg-accent-soft' : 'hover:bg-muted'
      )}
    >
      <span className="min-w-0 flex-1 truncate">
        <span className={cn('font-medium', selected ? 'text-accent' : 'text-fg')}>{name}</span>
        {(code || unit) && (
          <span className="ml-1.5 text-[11px] text-fg-subtle">
            {[code, unit].filter(Boolean).join(' · ')}
          </span>
        )}
      </span>
      {item.kind === 'equity' ? (
        <span className="shrink-0 text-[12px] text-fg-subtle tabular-nums">
          {today > 0 ? t('markets.stories', { count: today }) : '—'}
        </span>
      ) : quote ? (
        <span className="flex shrink-0 items-baseline gap-2">
          <span className="font-semibold text-fg tabular-nums">
            {formatPrice(quote.price, quote.currency, i18n.language)}
          </span>
          <Change value={quote.change} className="w-[4.5rem] text-right text-[12px]" />
        </span>
      ) : (
        <span className="shrink-0 text-[12px] text-fg-subtle">…</span>
      )}
    </button>
  )
}

export interface WatchlistPanelProps {
  items: readonly WatchItem[]
  quotes: ReadonlyMap<string, Quote>
  byItem: ReadonlyMap<string, Article[]>
  selected: string | null
  onSelect: (id: string | null) => void
  onEdit: () => void
  now: number
  fetchedAt?: number
  /** Day of the ECB rates in use, `YYYY-MM-DD`. */
  ratesDate: string | null
  failed: boolean
  className?: string
}

/**
 * The watchlist as a compact panel: a line per item, kinds set apart by thin rules. A line
 * narrows the news to that item (again to show all). The foot says how fresh the prices are.
 */
export function WatchlistPanel({
  items,
  quotes,
  byItem,
  selected,
  onSelect,
  onEdit,
  now,
  fetchedAt,
  ratesDate,
  failed,
  className
}: WatchlistPanelProps): React.JSX.Element {
  const { t, i18n } = useTranslation('news')
  const groups = ASSET_KINDS.map((kind) => items.filter((item) => item.kind === kind)).filter(
    (list) => list.length > 0
  )
  const rates = ratesDate
    ? new Intl.DateTimeFormat(localeFor(i18n.language), {
        day: 'numeric',
        month: 'short',
        timeZone: 'UTC'
      }).format(new Date(`${ratesDate}T00:00:00Z`))
    : null

  return (
    <section
      aria-labelledby="markets-watchlist"
      className={cn('rounded-panel border border-line bg-surface p-2 shadow-soft', className)}
    >
      <div className="flex items-center justify-between gap-2 py-0.5 pl-2.5">
        <h2
          id="markets-watchlist"
          className="font-ui text-[11px] font-semibold tracking-wider text-fg-subtle uppercase"
        >
          {t('markets.watchlist')}
        </h2>
        <IconButton size="sm" icon={Settings2} label={t('markets.edit')} onClick={onEdit} />
      </div>
      {/* Beside the news: one column. Above it (narrower windows): two. */}
      <div className="columns-1 gap-x-4 sm:max-lg:columns-2">
        {groups.map((list) => (
          <ul key={list[0].kind} className="break-inside-avoid border-t border-line py-1">
            {list.map((item) => (
              <li key={item.id}>
                <Row
                  item={item}
                  quote={quotes.get(item.id)}
                  today={(byItem.get(item.id) ?? []).filter((a) => now - a.publishedAt <= DAY).length}
                  selected={selected === item.id}
                  onSelect={() => onSelect(selected === item.id ? null : item.id)}
                />
              </li>
            ))}
          </ul>
        ))}
      </div>
      <p
        aria-live="polite"
        className="flex flex-wrap items-center gap-x-1.5 border-t border-line px-2.5 pt-2 pb-1 font-ui text-[11.5px] text-fg-subtle"
      >
        <span aria-hidden className="size-1.5 rounded-full bg-live" />
        <span className="font-semibold text-live">{t('markets.live')}</span>
        <span aria-hidden>·</span>
        {failed ? (
          <span className="text-warning">{t('markets.failed')}</span>
        ) : (
          <span className="tabular-nums">
            {fetchedAt ? clock(fetchedAt, i18n.language) : t('markets.loading')}
          </span>
        )}
        {rates && (
          <>
            <span aria-hidden>·</span>
            <span>{t('markets.ratesDate', { date: rates })}</span>
          </>
        )}
      </p>
    </section>
  )
}
