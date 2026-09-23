import { useTranslation } from 'react-i18next'
import { ASSET_KINDS, type AssetKind, type Quote, type WatchItem } from '@shared/markets'
import type { Article } from '@shared/types'
import { cn } from '@/lib/cn'
import { formatChange, formatPrice, tameCaps } from '@/lib/format'
import { relativeTime } from '@/lib/time'
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
      <span aria-hidden>{value > 0 ? '▲ ' : value < 0 ? '▼ ' : ''}</span>
      {formatChange(value, i18n.language)}
    </span>
  )
}

interface TileProps {
  item: WatchItem
  quote?: Quote
  /** Stories about it, newest first. */
  news: readonly Article[]
  selected: boolean
  onSelect: () => void
  now: number
}

const TILE =
  'group flex min-h-[7.5rem] w-full flex-col rounded-card border bg-surface p-4 text-left transition-[border-color,box-shadow] duration-150 outline-none focus-visible:ring-3 focus-visible:ring-accent-soft in-data-[density=compact]:min-h-[6.5rem] in-data-[density=compact]:p-3'

function Tile({ item, quote, news, selected, onSelect, now }: TileProps): React.JSX.Element {
  const { t, i18n } = useTranslation('news')
  const name = useAssetName()(item)
  const today = news.filter((a) => now - a.publishedAt <= DAY)
  const code = item.kind === 'equity' ? (item.code !== item.name ? item.code : '') : item.code
  const unit = quote?.unit ? t(`markets.unit.${quote.unit}`) : ''

  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onSelect}
      className={cn(
        TILE,
        selected ? 'border-accent shadow-card' : 'border-line hover:border-line-strong hover:shadow-soft'
      )}
    >
      <span className="flex w-full items-baseline justify-between gap-2">
        <span className="min-w-0 truncate font-ui text-[13.5px] font-semibold text-fg">{name}</span>
        <span className="shrink-0 font-ui text-[11px] font-medium tracking-wide text-fg-subtle uppercase">
          {[code, unit].filter(Boolean).join(' · ')}
        </span>
      </span>
      {item.kind === 'equity' ? (
        <>
          <span className="mt-2 font-ui text-[12px] text-fg-muted tabular-nums">
            {today.length > 0 ? t('markets.newsToday', { count: today.length }) : t('markets.noNewsToday')}
          </span>
          {news[0] && (
            <span className="mt-1 line-clamp-2 text-[13.5px] leading-snug text-fg">
              {tameCaps(news[0].title)}{' '}
              <span className="font-ui text-[11.5px] whitespace-nowrap text-fg-subtle">
                · {relativeTime(news[0].publishedAt, i18n.language, now)}
              </span>
            </span>
          )}
        </>
      ) : quote ? (
        <>
          <span className="mt-2 font-ui text-[1.35rem] leading-tight font-semibold text-fg tabular-nums">
            {formatPrice(quote.price, quote.currency, i18n.language)}
          </span>
          <span className="mt-auto flex flex-wrap items-center justify-between gap-x-2 gap-y-0.5 pt-2 font-ui text-[12.5px]">
            <Change value={quote.change} className="font-semibold" />
            {today.length > 0 && (
              <span className="whitespace-nowrap text-fg-subtle tabular-nums">
                {t('markets.newsToday', { count: today.length })}
              </span>
            )}
          </span>
        </>
      ) : (
        <span className="mt-2 font-ui text-[12.5px] text-fg-subtle">{t('markets.noPrice')}</span>
      )}
    </button>
  )
}

export interface QuoteBoardProps {
  items: readonly WatchItem[]
  quotes: ReadonlyMap<string, Quote>
  byItem: ReadonlyMap<string, Article[]>
  selected: string | null
  onSelect: (id: string | null) => void
  now: number
}

/**
 * The watchlist as tiles, grouped by kind: currencies, metals and crypto with price and
 * change; companies and markets with how often and what the news said about them today.
 * A tile picks its news below (and picking it again shows all the news).
 */
export function QuoteBoard({
  items,
  quotes,
  byItem,
  selected,
  onSelect,
  now
}: QuoteBoardProps): React.JSX.Element {
  const { t } = useTranslation('news')
  const groups = ASSET_KINDS.map((kind): [AssetKind, WatchItem[]] => [
    kind,
    items.filter((item) => item.kind === kind)
  ]).filter(([, list]) => list.length > 0)

  return (
    <div className="flex flex-col gap-7 in-data-[density=compact]:gap-5">
      {groups.map(([kind, list]) => (
        <section key={kind} aria-labelledby={`markets-${kind}`}>
          <h3
            id={`markets-${kind}`}
            className="mb-2.5 font-ui text-[11px] font-semibold tracking-wider text-fg-subtle uppercase"
          >
            {t(`markets.kinds.${kind}`)}
          </h3>
          {/* As many columns as the page has room for, whatever the window or sidebar. */}
          <ul className="grid grid-cols-[repeat(auto-fill,minmax(10.5rem,1fr))] gap-3">
            {list.map((item) => (
              <li key={item.id} className="min-w-0">
                <Tile
                  item={item}
                  quote={quotes.get(item.id)}
                  news={byItem.get(item.id) ?? []}
                  selected={selected === item.id}
                  onSelect={() => onSelect(selected === item.id ? null : item.id)}
                  now={now}
                />
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}
