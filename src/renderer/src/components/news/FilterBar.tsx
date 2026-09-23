import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import { ArrowUpDown, Check, ChevronDown, EyeOff, Image, ListFilter, MapPin, Rss, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { getProvince } from '@shared/countries'
import { TIME_RANGES, type TimeRange } from '@shared/settings'
import type { SourceDef } from '@shared/types'
import { Button } from '@/components/ui/Button'
import { ToggleChip } from '@/components/ui/Chip'
import { Divider } from '@/components/ui/Divider'
import { Menu, MenuContent, MenuRadioGroup, MenuRadioItem, MenuTrigger } from '@/components/ui/Menu'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/Popover'
import { SearchInput } from '@/components/ui/SearchInput'
import { SegmentedControl } from '@/components/ui/SegmentedControl'
import { SourceLogo } from '@/components/ui/SourceLogo'
import { useNewsView } from '@/hooks/useArticles'
import { useSources } from '@/hooks/useSources'
import { formatNumber } from '@/lib/format'
import { foldText } from '@/lib/search'
import { cn } from '@/lib/cn'
import { useSettings } from '@/stores/settings'
import { useUi, type Filters, type SortOrder } from '@/stores/ui'
import { LocationPicker, type LocationCounts } from './LocationPicker'

export type FilterControl = 'time' | 'sources' | 'location' | 'sort' | 'images' | 'read'

const SORTS: readonly SortOrder[] = ['latest', 'popular']

interface Counts extends LocationCounts {
  sources: ReadonlyMap<string, number>
}

const sizes = (lists: ReadonlyMap<string, readonly unknown[]>): Map<string, number> =>
  new Map([...lists].map(([key, list]) => [key, list.length]))

/** Stories per source, province and region among the enabled sources' articles (from the news index). */
function useCounts(): Counts {
  const view = useNewsView()
  return useMemo(
    () => ({
      sources: sizes(view.bySource),
      provinces: sizes(view.byProvince),
      regions: sizes(view.byRegion)
    }),
    [view]
  )
}

const setFilters = (patch: Partial<Filters>): void => useUi.getState().setFilters(patch)

/** Trigger styling that shows whether its filter is in use. */
const triggerClass = (active: boolean): string =>
  cn(active && 'bg-accent-soft text-accent hover:bg-accent-soft hover:text-accent')

function CheckRow({
  checked,
  onToggle,
  children,
  count
}: {
  checked: boolean
  onToggle: () => void
  children: React.ReactNode
  count?: number
}): React.JSX.Element {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={onToggle}
      className="flex h-9 w-full items-center gap-2.5 rounded-lg px-2 text-left font-ui text-[13.5px] text-fg transition-colors duration-150 hover:bg-muted"
    >
      <span
        aria-hidden
        className={cn(
          'flex size-4 shrink-0 items-center justify-center rounded-[5px] border transition-colors duration-150',
          checked ? 'border-accent bg-accent text-on-accent' : 'border-line-strong bg-surface'
        )}
      >
        {checked && <Check size={12} strokeWidth={3} />}
      </span>
      <span className="flex min-w-0 flex-1 items-center gap-2">{children}</span>
      {count !== undefined && count > 0 && (
        <span className="text-[11.5px] text-fg-subtle tabular-nums">{count}</span>
      )}
    </button>
  )
}

function SourcePicker({
  sources,
  selected,
  counts
}: {
  sources: readonly SourceDef[]
  selected: readonly string[]
  counts: ReadonlyMap<string, number>
}): React.JSX.Element {
  const { t } = useTranslation('news')
  const [query, setQuery] = useState('')
  const q = foldText(query.trim())
  const listed = useMemo(
    () =>
      sources
        .filter((s) => (counts.get(s.id) ?? 0) > 0 || selected.includes(s.id))
        .filter((s) => !q || foldText(s.name).includes(q))
        .sort((a, b) => a.name.localeCompare(b.name, 'tr')),
    [sources, counts, selected, q]
  )
  const toggle = (id: string): void =>
    setFilters({ sourceIds: selected.includes(id) ? selected.filter((s) => s !== id) : [...selected, id] })

  return (
    <div className="flex flex-col gap-2">
      <SearchInput
        size="sm"
        value={query}
        onValueChange={setQuery}
        placeholder={t('filters.searchSources')}
        aria-label={t('filters.searchSources')}
        autoFocus
      />
      {!q && (
        <CheckRow checked={selected.length === 0} onToggle={() => setFilters({ sourceIds: [] })}>
          <span className="font-semibold">{t('filters.allSources')}</span>
        </CheckRow>
      )}
      <div className="-mx-1 max-h-72 overflow-y-auto px-1">
        {listed.map((source) => (
          <CheckRow
            key={source.id}
            checked={selected.includes(source.id)}
            onToggle={() => toggle(source.id)}
            count={counts.get(source.id)}
          >
            <SourceLogo source={source} size="xs" />
            <span className="min-w-0 truncate">{source.name}</span>
          </CheckRow>
        ))}
        {listed.length === 0 && (
          <p className="px-2 py-3 font-ui text-[13px] text-fg-muted">{t('filters.noSources')}</p>
        )}
      </div>
    </div>
  )
}

function ActiveChip({ label, onRemove }: { label: string; onRemove: () => void }): React.JSX.Element {
  const { t } = useTranslation('news')
  return (
    <span className="inline-flex h-7 items-center gap-1 rounded-full bg-accent-soft pr-1 pl-3 font-ui text-[12.5px] font-medium text-accent">
      {label}
      <button
        type="button"
        aria-label={t('filters.remove', { label })}
        onClick={onRemove}
        className="flex size-5 items-center justify-center rounded-full transition-colors duration-150 hover:bg-accent hover:text-on-accent"
      >
        <X size={13} strokeWidth={2.25} aria-hidden />
      </button>
    </span>
  )
}

interface ActiveFilter {
  key: string
  /** Chip label under the bar ("Last 6 hours"). */
  label: string
  /** Terse label for the page-header summary ("6h"). */
  short: string
  remove: () => void
}

interface ActiveFilters {
  filters: Filters
  sourcesLabel: string
  locationLabel: string | undefined
  active: ActiveFilter[]
  /** Reset every control the page shows. */
  clearAll: () => void
}

/** The current page's filters as removable entries, skipping the controls the page hides. */
function useActiveFilters(hide: readonly FilterControl[]): ActiveFilters {
  const { t } = useTranslation('news')
  const filters = useUi((s) => s.filters)
  const country = useSettings((s) => s.settings.country)
  const { byId } = useSources()
  const shows = (control: FilterControl): boolean => !hide.includes(control)

  const province = filters.provinceCode ? getProvince(country, filters.provinceCode) : undefined
  const locationLabel = province
    ? province.name
    : filters.regionId
      ? t(`common:region.${filters.regionId}`)
      : undefined
  const selectedSources = filters.sourceIds
  const sourcesLabel =
    selectedSources.length === 0
      ? t('filters.sources')
      : selectedSources.length === 1
        ? (byId.get(selectedSources[0])?.name ?? selectedSources[0])
        : t('filters.sourcesCount', { count: selectedSources.length })

  const active: ActiveFilter[] = []
  if (shows('time') && filters.timeRange !== 'all') {
    active.push({
      key: 'time',
      label: t(`filters.timeLong.${filters.timeRange}`),
      short: t(`filters.time.${filters.timeRange}`),
      remove: () => setFilters({ timeRange: 'all' })
    })
  }
  if (shows('sources')) {
    if (selectedSources.length > 2) {
      active.push({
        key: 'sources',
        label: sourcesLabel,
        short: sourcesLabel,
        remove: () => setFilters({ sourceIds: [] })
      })
    } else {
      for (const id of selectedSources) {
        const name = byId.get(id)?.name ?? id
        active.push({
          key: `source-${id}`,
          label: name,
          short: name,
          remove: () => setFilters({ sourceIds: selectedSources.filter((s) => s !== id) })
        })
      }
    }
  }
  if (shows('location') && locationLabel) {
    active.push({
      key: 'location',
      label: locationLabel,
      short: locationLabel,
      remove: () => setFilters({ provinceCode: null, regionId: null })
    })
  }
  if (shows('sort') && filters.sort !== 'latest') {
    const label = t(`filters.sort.${filters.sort}`)
    active.push({ key: 'sort', label, short: label, remove: () => setFilters({ sort: 'latest' }) })
  }
  if (shows('images') && filters.withImagesOnly) {
    const label = t('filters.withImages')
    active.push({ key: 'images', label, short: label, remove: () => setFilters({ withImagesOnly: false }) })
  }
  if (shows('read') && filters.hideRead) {
    const label = t('filters.hideRead')
    active.push({ key: 'read', label, short: label, remove: () => setFilters({ hideRead: false }) })
  }

  const clearAll = (): void =>
    setFilters({
      ...(shows('time') && { timeRange: 'all' as TimeRange }),
      ...(shows('sources') && { sourceIds: [] }),
      ...(shows('location') && { provinceCode: null, regionId: null }),
      ...(shows('sort') && { sort: 'latest' as SortOrder }),
      ...(shows('images') && { withImagesOnly: false }),
      ...(shows('read') && { hideRead: false })
    })

  return { filters, sourcesLabel, locationLabel, active, clearAll }
}

/**
 * A compact "Filtered: Sözcü · 6h ✕" chip for a page header, so the page's
 * active filters show before the filter bar scrolls into view. Nothing when no
 * filter is set. Pass the same `hide` list as to the page's `FilterBar`.
 */
export function FilterSummary({ hide = [] }: { hide?: readonly FilterControl[] }): React.JSX.Element | null {
  const { t } = useTranslation('news')
  const { active, clearAll } = useActiveFilters(hide)
  if (active.length === 0) return null
  const label = active.map((f) => f.short).join(' · ')
  return (
    <span className="inline-flex h-8 max-w-80 items-center gap-1.5 rounded-full bg-accent-soft pr-1 pl-3 font-ui text-[12.5px] font-medium text-accent">
      <ListFilter size={14} strokeWidth={2} aria-hidden className="shrink-0" />
      <span className="truncate">{t('filters.filtered', { filters: label })}</span>
      <button
        type="button"
        aria-label={t('filters.clearAll')}
        onClick={clearAll}
        className="flex size-6 shrink-0 items-center justify-center rounded-full transition-colors duration-150 hover:bg-accent hover:text-on-accent"
      >
        <X size={13} strokeWidth={2.25} aria-hidden />
      </button>
    </span>
  )
}

/** Gap between the stuck filter bar and what sticks below it (the feed's hour rules). */
const STICKY_GAP = 8

/**
 * Publish the bar's stuck bottom edge as `--feed-sticky-top` on its parent, so
 * the feed's sticky hour rules sit just below it instead of under it.
 */
function useStickyOffset(ref: React.RefObject<HTMLElement | null>): void {
  useLayoutEffect(() => {
    const el = ref.current
    const parent = el?.parentElement
    if (!el || !parent) return
    const top = parseFloat(getComputedStyle(el).top) || 0
    const observer = new ResizeObserver(([entry]) => {
      const height = entry?.borderBoxSize?.[0]?.blockSize ?? el.offsetHeight
      parent.style.setProperty('--feed-sticky-top', `${Math.round(top + height + STICKY_GAP)}px`)
    })
    observer.observe(el)
    return () => {
      observer.disconnect()
      parent.style.removeProperty('--feed-sticky-top')
    }
  }, [ref])
}

export interface FilterBarProps {
  /** Controls a page fixes itself (e.g. `sources` on a source page); they also get no chip. */
  hide?: readonly FilterControl[]
  /** Result count shown on the right. */
  count?: number
  className?: string
}

/**
 * Sticky glass bar with the news filters: time range, sources, region or
 * province, sort order, image-only and hide-read, plus removable chips for
 * what is active and "Clear all". Reads and writes the current page's
 * `useUi.filters`.
 */
export function FilterBar({ hide = [], count, className }: FilterBarProps): React.JSX.Element {
  const { t, i18n } = useTranslation('news')
  const { enabled } = useSources()
  const counts = useCounts()
  const ref = useRef<HTMLDivElement>(null)
  useStickyOffset(ref)
  const { filters, sourcesLabel, locationLabel, active: chips, clearAll } = useActiveFilters(hide)
  const selectedSources = filters.sourceIds
  const shows = (control: FilterControl): boolean => !hide.includes(control)

  const timeOptions = useMemo(
    () => TIME_RANGES.map((value) => ({ value, label: t(`filters.time.${value}`) })),
    [t]
  )

  return (
    <div
      ref={ref}
      role="toolbar"
      aria-label={t('filters.label')}
      className={cn(
        'sticky top-3 z-20 rounded-panel border border-line bg-glass shadow-soft backdrop-blur-xl',
        className
      )}
    >
      <div className="flex flex-wrap items-center gap-x-2 gap-y-2 p-2">
        {shows('time') && (
          <SegmentedControl<TimeRange>
            size="sm"
            aria-label={t('filters.timeRange')}
            value={filters.timeRange}
            onChange={(timeRange) => setFilters({ timeRange })}
            options={timeOptions}
          />
        )}
        {shows('time') && (shows('sources') || shows('location') || shows('sort')) && (
          <Divider orientation="vertical" className="mx-1 h-6 self-center" />
        )}

        {shows('sources') && (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                icon={Rss}
                iconRight={ChevronDown}
                className={triggerClass(selectedSources.length > 0)}
              >
                {sourcesLabel}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-3">
              <SourcePicker sources={enabled} selected={selectedSources} counts={counts.sources} />
            </PopoverContent>
          </Popover>
        )}

        {shows('location') && (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                icon={MapPin}
                iconRight={ChevronDown}
                className={triggerClass(Boolean(locationLabel))}
              >
                {locationLabel ?? t('filters.location')}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[22rem] p-3">
              <LocationPicker
                value={{ provinceCode: filters.provinceCode, regionId: filters.regionId }}
                onChange={(next) => setFilters(next)}
                counts={counts}
                autoFocus
              />
            </PopoverContent>
          </Popover>
        )}

        {shows('sort') && (
          <Menu>
            <MenuTrigger asChild>
              <Button variant="ghost" size="sm" icon={ArrowUpDown} iconRight={ChevronDown}>
                {t(`filters.sort.${filters.sort}`)}
              </Button>
            </MenuTrigger>
            <MenuContent align="start">
              <MenuRadioGroup
                value={filters.sort}
                onValueChange={(value) => setFilters({ sort: value as SortOrder })}
              >
                {SORTS.map((sort) => (
                  <MenuRadioItem key={sort} value={sort}>
                    {t(`filters.sort.${sort}`)}
                  </MenuRadioItem>
                ))}
              </MenuRadioGroup>
            </MenuContent>
          </Menu>
        )}

        {(shows('images') || shows('read')) && (
          <Divider orientation="vertical" className="mx-1 h-6 self-center" />
        )}
        {shows('images') && (
          <ToggleChip
            selected={filters.withImagesOnly}
            onSelectedChange={(withImagesOnly) => setFilters({ withImagesOnly })}
            icon={Image}
            showCheck
          >
            {t('filters.withImages')}
          </ToggleChip>
        )}
        {shows('read') && (
          <ToggleChip
            selected={filters.hideRead}
            onSelectedChange={(hideRead) => setFilters({ hideRead })}
            icon={EyeOff}
            showCheck
          >
            {t('filters.hideRead')}
          </ToggleChip>
        )}

        {count !== undefined && (
          <span aria-live="polite" className="ml-auto px-2 font-ui text-[12.5px] text-fg-subtle tabular-nums">
            {t('filters.results', { count, formatted: formatNumber(count, i18n.language) })}
          </span>
        )}
      </div>

      {chips.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 border-t border-line px-3 py-2">
          {chips.map((chip) => (
            <ActiveChip key={chip.key} label={chip.label} onRemove={chip.remove} />
          ))}
          <Button variant="ghost" size="sm" onClick={clearAll} className="ml-1">
            {t('filters.clearAll')}
          </Button>
        </div>
      )}
    </div>
  )
}
