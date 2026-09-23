import { memo, useCallback, useId, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ChevronRight, CircleSlash, RotateCcw, SearchX, ToggleLeft, ToggleRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { TFunction } from 'i18next'
import type { CategoryId } from '@shared/categories'
import type { CountryPack } from '@shared/countries'
import type { CountryCode, SourceDef, SourceKind } from '@shared/types'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { ToggleChip } from '@/components/ui/Chip'
import { EmptyState } from '@/components/ui/EmptyState'
import { IconButton } from '@/components/ui/IconButton'
import { SearchInput } from '@/components/ui/SearchInput'
import { SourceLogo } from '@/components/ui/SourceLogo'
import { Switch } from '@/components/ui/Switch'
import { toast } from '@/components/ui/Toaster'
import { Tooltip } from '@/components/ui/Tooltip'
import { ProvincePicker } from '@/features/settings/ProvincePicker'
import { foldSearch } from '@/features/settings/text'
import {
  restoreSources,
  setSourcesEnabled,
  useCountryPack,
  useLocalUnit,
  useSources
} from '@/hooks/useSources'
import { useNowSelect } from '@/hooks/useNow'
import { useProgressive } from '@/hooks/useProgressive'
import { categoryLabel } from '@/lib/categories'
import { domain, formatNumber } from '@/lib/format'
import { atSourceDefaults, sourceDefaults } from '@/lib/sources'
import { relativeTime } from '@/lib/time'
import { cn } from '@/lib/cn'
import { useSettings } from '@/stores/settings'
import { useUi } from '@/stores/ui'
import { healthState, useSourceStats, type SourceHealth } from './stats'

/** Group order: public service and agencies first, then the press by kind; local papers last. */
const KIND_ORDER: readonly SourceKind[] = [
  'public',
  'agency',
  'mainstream',
  'independent',
  'international',
  'business',
  'sports',
  'technology',
  'aggregator',
  'local'
]

const MAX_TAGS = 6

const HEALTH_DOT = {
  ok: 'bg-live',
  partial: 'bg-warning',
  failing: 'bg-breaking',
  idle: 'bg-transparent ring-1 ring-line-strong ring-inset'
} as const

/** Province codes a local source covers; `all` when it has a feed for every province. */
function coverage(source: SourceDef, pack: CountryPack | undefined): string[] | 'all' {
  const codes = new Set(source.provinces ?? [])
  for (const feed of source.feeds) {
    if (feed.province) codes.add(feed.province)
    else if (feed.region)
      for (const code of pack?.regions.find((r) => r.id === feed.region)?.provinces ?? []) codes.add(code)
  }
  const provinceCount = pack?.provinces.length ?? 0
  return provinceCount > 0 && codes.size >= provinceCount ? 'all' : [...codes]
}

/** Topic categories of a source's regular (non-city) feeds, in feed order. */
function feedCategories(source: SourceDef): CategoryId[] {
  return [...new Set(source.feeds.filter((f) => !f.province).map((f) => f.category))]
}

function Tag({ children }: { children: React.ReactNode }): React.JSX.Element {
  return (
    <span className="inline-flex h-[22px] items-center rounded-full bg-muted px-2 text-[11.5px] leading-none text-fg-muted">
      {children}
    </span>
  )
}

function Tags({ labels }: { labels: string[] }): React.JSX.Element | null {
  if (labels.length === 0) return null
  const shown = labels.slice(0, MAX_TAGS)
  const rest = labels.slice(MAX_TAGS)
  return (
    <div className="mt-1.5 flex flex-wrap gap-1">
      {shown.map((label) => (
        <Tag key={label}>{label}</Tag>
      ))}
      {rest.length > 0 && (
        <Tooltip content={rest.join(' · ')}>
          <span className="inline-flex h-[22px] items-center rounded-full px-1.5 text-[11.5px] leading-none text-fg-subtle">
            +{rest.length}
          </span>
        </Tooltip>
      )}
    </div>
  )
}

/** One line on how a source's feeds are doing: "All 4 feeds working · checked 5 min ago". */
function healthSummary(
  t: TFunction,
  health: SourceHealth | undefined,
  lang: string,
  now: number,
  local: boolean,
  context: string | undefined
): string {
  const state = healthState(health)
  if (!health || state === 'idle')
    return local ? t('sources.health.localIdle', { context }) : t('sources.health.idle')
  const time = relativeTime(health.checkedAt, lang, now)
  const total = health.ok + health.failing
  if (state === 'ok') return t('sources.health.ok', { count: total, time })
  return state === 'failing'
    ? t('sources.health.failing', { count: total, time })
    : t('sources.health.partial', { failing: health.failing, count: total, time })
}

interface SourceRowProps {
  source: SourceDef
  enabled: boolean
  health: SourceHealth | undefined
  articles: number
  /** Category or coverage labels under the name. */
  tags: string[]
  yourCity: boolean
  onToggle: (id: string, on: boolean) => void
}

const SourceRow = memo(function SourceRow({
  source,
  enabled,
  health,
  articles,
  tags,
  yourCity,
  onToggle
}: SourceRowProps): React.JSX.Element {
  const { t, i18n } = useTranslation('settings')
  const context = useLocalUnit()
  const state = healthState(health)
  const local = source.kind === 'local'
  // "checked 5 min ago": follows the shared clock, re-rendering the row only when the text changes.
  const summary = useNowSelect(60_000, (now) => healthSummary(t, health, i18n.language, now, local, context))
  const detail = state === 'partial' || state === 'failing' ? health?.lastError : undefined

  return (
    <li className="flex items-center gap-4 px-5 py-3.5 in-data-[density=compact]:py-2.5">
      <SourceLogo
        source={source}
        size="md"
        className={cn('transition-[opacity,filter] duration-200', !enabled && 'opacity-50 grayscale')}
      />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <button
            type="button"
            onClick={() => useUi.getState().navigate({ name: 'source', id: source.id })}
            className={cn(
              'text-left text-[15px] font-medium transition-colors duration-150 hover:text-accent',
              enabled ? 'text-fg' : 'text-fg-muted'
            )}
          >
            {source.name}
          </button>
          <span className="text-[13px] text-fg-subtle">{domain(source.homepage)}</span>
          {yourCity && (
            <Badge variant="accent" className="self-center">
              {t('sources.yourCity', { context })}
            </Badge>
          )}
        </div>
        <Tags labels={tags} />
      </div>
      <div className="flex shrink-0 items-center gap-4">
        {enabled && (
          <Tooltip
            content={
              <span className="flex flex-col gap-0.5">
                <span>{summary}</span>
                {detail && <span className="font-normal text-canvas/70">{detail}</span>}
              </span>
            }
            side="left"
          >
            <span className="flex items-center gap-2 text-[12.5px] text-fg-muted tabular-nums">
              <span aria-hidden className={cn('size-2 rounded-full', HEALTH_DOT[state])} />
              <span className="sr-only">{summary}</span>
              {articles > 0
                ? t('sources.stories', { count: articles, formatted: formatNumber(articles, i18n.language) })
                : ''}
            </span>
          </Tooltip>
        )}
        <Switch
          checked={enabled}
          onCheckedChange={(on) => onToggle(source.id, on)}
          aria-label={t('sources.toggle', { name: source.name })}
        />
      </div>
    </li>
  )
})

interface GroupData {
  kind: SourceKind
  sources: SourceDef[]
}

interface SourceGroupProps {
  group: GroupData
  open: boolean
  onOpenChange: (open: boolean) => void
  isEnabled: (id: string) => boolean
  rowProps: (source: SourceDef) => Omit<SourceRowProps, 'onToggle' | 'enabled' | 'source'>
  onToggle: (id: string, on: boolean) => void
  note?: React.ReactNode
  /** Rows rendered so far (the list fills in over a few frames). */
  rowLimit: number
}

function SourceGroup({
  group,
  open,
  onOpenChange,
  isEnabled,
  rowProps,
  onToggle,
  note,
  rowLimit
}: SourceGroupProps): React.JSX.Element {
  const { t } = useTranslation('settings')
  const bodyId = useId()
  const title = t(`common:sourceKind.${group.kind}`)
  const on = group.sources.filter((s) => isEnabled(s.id)).length
  // A partly-on group shows a mixed switch, not "off"; pressing it switches the rest on.
  const state = on === group.sources.length ? true : on === 0 ? false : 'indeterminate'

  return (
    <section className="rounded-panel border border-line bg-surface shadow-soft">
      <header className="flex items-center gap-3 py-3 pr-5 pl-3 in-data-[density=compact]:py-2">
        <button
          type="button"
          aria-expanded={open}
          aria-controls={bodyId}
          onClick={() => onOpenChange(!open)}
          className="flex min-w-0 flex-1 items-center gap-2 rounded-lg py-1 pr-2 pl-2 text-left transition-colors duration-150 hover:bg-muted"
        >
          <ChevronRight
            size={16}
            strokeWidth={1.75}
            aria-hidden
            className={cn(
              'shrink-0 text-fg-subtle transition-transform duration-200 ease-out',
              open && 'rotate-90'
            )}
          />
          <h3 className="headline text-lg leading-tight font-semibold text-fg">{title}</h3>
          <span className="ml-1 text-[12.5px] text-fg-subtle tabular-nums">
            {t('sources.groupCount', { on, count: group.sources.length })}
          </span>
        </button>
        <Switch
          size="sm"
          checked={state}
          onCheckedChange={(next) => {
            const ids = group.sources.map((s) => s.id)
            const previous = setSourcesEnabled(ids, next)
            toast(t(next ? 'sources.toast.groupOn' : 'sources.toast.groupOff', { group: title }), {
              action: { label: t('sources.undo'), onClick: () => restoreSources(previous) }
            })
          }}
          aria-label={t('sources.groupToggle', { group: title })}
        />
      </header>
      {note && <div className="-mt-1 px-5 pb-3.5 text-[13px] text-fg-muted">{note}</div>}
      <AnimatePresence initial={false}>
        {open && (
          <motion.ul
            id={bodyId}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="divide-y divide-line overflow-hidden border-t border-line"
          >
            {group.sources.slice(0, rowLimit).map((source) => (
              <SourceRow
                key={source.id}
                source={source}
                enabled={isEnabled(source.id)}
                onToggle={onToggle}
                {...rowProps(source)}
              />
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </section>
  )
}

function LocalNote({ country }: { country: CountryCode }): React.JSX.Element {
  const { t } = useTranslation('settings')
  const context = useLocalUnit()
  const location = useSettings((s) => s.settings.location)
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
      <span className="text-pretty">{t('sources.localNote', { context })}</span>
      <ProvincePicker
        value={location}
        country={country}
        align="start"
        onChange={(next) => void useSettings.getState().update({ location: next })}
        className="h-8 min-w-40 text-[13px]"
      />
    </div>
  )
}

export interface SourcesListProps {
  className?: string
}

/**
 * Every source of the selected country with a persistent on/off switch,
 * grouped by kind, with search, bulk actions, feed health and article counts.
 * Switched-off sources are never fetched.
 */
export function SourcesList({ className }: SourcesListProps): React.JSX.Element {
  const { t } = useTranslation('settings')
  const country = useSettings((s) => s.settings.country)
  const provinceCode = useSettings((s) => s.settings.location.provinceCode)
  const prefs = useSettings((s) => s.settings.sources)
  const { sources, enabled, isEnabled } = useSources()
  const pack = useCountryPack()
  const stats = useSourceStats()
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState<ReadonlySet<SourceKind>>(
    () => new Set(KIND_ORDER.filter((kind) => kind !== 'local'))
  )

  const provinceCount = pack?.provinces.length ?? 0
  const provinceNames = useMemo(() => new Map(pack?.provinces.map((p) => [p.code, p.name])), [pack])

  // Labels under each name and a folded search string, rebuilt only when the language or pack changes.
  const meta = useMemo(() => {
    const map = new Map<string, { tags: string[]; search: string; covers: string[] | 'all' | null }>()
    for (const source of sources) {
      const covers = source.kind === 'local' ? coverage(source, pack) : null
      const tags =
        covers === null
          ? feedCategories(source).map((id) => categoryLabel(t, id, country))
          : covers === 'all'
            ? [t('sources.allProvinces', { count: provinceCount, context: pack?.localUnit })]
            : covers.map((code) => provinceNames.get(code) ?? code)
      const search = foldSearch(
        [source.name, domain(source.homepage), t(`common:sourceKind.${source.kind}`), ...tags].join(' ')
      )
      map.set(source.id, { tags, search, covers })
    }
    return map
  }, [sources, t, country, pack, provinceCount, provinceNames])

  // Switched on but nothing in the current news: "delivering" matches the front page's source count.
  // Local outlets that are only fetched for their own city are counted apart.
  const coversCity = useCallback(
    (s: SourceDef): boolean => {
      const covers = meta.get(s.id)?.covers
      return (
        covers === 'all' || (provinceCode !== null && Array.isArray(covers) && covers.includes(provinceCode))
      )
    },
    [meta, provinceCode]
  )
  const delivery = useMemo(() => {
    let delivering = 0
    let cityOnly = 0
    const quiet = new Set<string>()
    for (const source of enabled) {
      if ((stats.articles.get(source.id) ?? 0) > 0) delivering++
      else if (source.kind === 'local' && !coversCity(source)) cityOnly++
      else quiet.add(source.id)
    }
    return { delivering, cityOnly, quiet }
  }, [enabled, stats, coversCity])
  const [quietOnly, setQuietOnly] = useState(false)
  const showQuiet = quietOnly && delivery.quiet.size > 0

  const q = foldSearch(query.trim())
  const visible = useMemo(
    () =>
      sources.filter(
        (s) => (!q || meta.get(s.id)?.search.includes(q)) && (!showQuiet || delivery.quiet.has(s.id))
      ),
    [sources, meta, q, showQuiet, delivery]
  )

  const groups = useMemo(() => {
    const byKind = new Map<SourceKind, SourceDef[]>()
    for (const source of visible) {
      const list = byKind.get(source.kind) ?? []
      list.push(source)
      byKind.set(source.kind, list)
    }
    const local = byKind.get('local')
    if (local && provinceCode) {
      // Outlets that cover the user's city come first.
      byKind.set('local', [...local.filter(coversCity), ...local.filter((s) => !coversCity(s))])
    }
    return KIND_ORDER.filter((kind) => byKind.has(kind)).map((kind) => ({ kind, sources: byKind.get(kind)! }))
  }, [visible, provinceCode, coversCity])

  const onToggle = useCallback((id: string, on: boolean) => void setSourcesEnabled([id], on), [])

  const rowProps = useCallback(
    (source: SourceDef) => {
      const info = meta.get(source.id)
      const covers = info?.covers
      return {
        health: stats.health.get(source.id),
        articles: stats.articles.get(source.id) ?? 0,
        tags: info?.tags ?? [],
        yourCity: provinceCode !== null && Array.isArray(covers) && covers.includes(provinceCode)
      }
    },
    [meta, stats, provinceCode]
  )

  const bulk = (on: boolean): void => {
    const ids = visible.filter((s) => isEnabled(s.id) !== on).map((s) => s.id)
    if (ids.length === 0) return
    const allOff = !on && sources.every((s) => !isEnabled(s.id) || ids.includes(s.id))
    const previous = setSourcesEnabled(ids, on)
    toast(t(on ? 'sources.toast.enabled' : 'sources.toast.disabled', { count: ids.length }), {
      description: allOff ? t('sources.toast.allOffHint') : undefined,
      action: { label: t('sources.undo'), onClick: () => restoreSources(previous) }
    })
  }

  const atDefaults = atSourceDefaults(sources, prefs)
  const restoreDefaults = (): void => {
    const previous = prefs
    restoreSources(sourceDefaults(sources, prefs))
    toast(t('sources.toast.restored'), {
      action: { label: t('sources.undo'), onClick: () => restoreSources(previous) }
    })
  }

  // Group headers render at once; their rows fill in one group per frame.
  const filledGroups = useProgressive(groups.length, 2, 1)

  const searching = q !== '' || showQuiet
  const summary = [
    t('sources.summary', { on: enabled.length, count: sources.length }),
    stats.feeds.total > 0 && t('sources.delivering', { count: delivery.delivering }),
    delivery.cityOnly > 0 && t('sources.cityOnly', { count: delivery.cityOnly, context: pack?.localUnit }),
    stats.feeds.total > 0 && t('sources.feeds', { count: stats.feeds.total }),
    stats.feeds.failing > 0 && t('sources.failing', { count: stats.feeds.failing })
  ]
    .filter((part): part is string => Boolean(part))
    .join(' · ')

  return (
    <div className={cn('flex flex-col gap-5', className)}>
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <SearchInput
            value={query}
            onValueChange={setQuery}
            placeholder={t('sources.search')}
            className="min-w-56 flex-1"
          />
          <div className="flex items-center gap-1">
            <Button size="sm" variant="ghost" icon={ToggleRight} onClick={() => bulk(true)}>
              {t(searching ? 'sources.enableMatches' : 'sources.enableAll')}
            </Button>
            <Button size="sm" variant="ghost" icon={ToggleLeft} onClick={() => bulk(false)}>
              {t(searching ? 'sources.disableMatches' : 'sources.disableAll')}
            </Button>
            <IconButton
              size="sm"
              icon={RotateCcw}
              label={t('sources.restoreDefaults')}
              disabled={atDefaults}
              onClick={restoreDefaults}
            />
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 px-1">
          <p className="text-[13px] text-fg-muted" aria-live="polite">
            {summary}
          </p>
          {stats.feeds.total > 0 && delivery.quiet.size > 0 && (
            <ToggleChip
              size="sm"
              icon={CircleSlash}
              showCheck
              selected={quietOnly}
              onSelectedChange={setQuietOnly}
              className="ml-auto"
            >
              {t('sources.notDelivering', { count: delivery.quiet.size })}
            </ToggleChip>
          )}
        </div>
      </div>

      {groups.length === 0 ? (
        <EmptyState
          compact
          icon={SearchX}
          title={t('common:states.noResults')}
          description={t('common:states.noResultsFor', { query: query.trim() })}
        />
      ) : (
        groups.map((group, index) => (
          <SourceGroup
            key={group.kind}
            group={group}
            rowLimit={index < filledGroups ? group.sources.length : 0}
            open={searching || open.has(group.kind)}
            onOpenChange={(next) =>
              setOpen((prev) => {
                const copy = new Set(prev)
                if (next) copy.add(group.kind)
                else copy.delete(group.kind)
                return copy
              })
            }
            isEnabled={isEnabled}
            rowProps={rowProps}
            onToggle={onToggle}
            note={group.kind === 'local' ? <LocalNote country={country} /> : undefined}
          />
        ))
      )}
    </div>
  )
}
