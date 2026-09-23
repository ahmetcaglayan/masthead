import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { Check, ChevronsUpDown, Map as MapIcon, MapPin, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { getCountryPack } from '@shared/countries'
import type { CountryCode, Province, RegionId } from '@shared/types'
import { buttonClass } from '@/components/ui/Button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/Popover'
import { SearchInput } from '@/components/ui/SearchInput'
import { cn } from '@/lib/cn'
import { useSettings } from '@/stores/settings'
import { locationLabel, type LocationValue } from './location'
import { foldSearch } from './text'

type Option =
  | { kind: 'region'; key: string; regionId: RegionId; label: string; count: number }
  | { kind: 'province'; key: string; province: Province }

interface Group {
  regionId: RegionId
  label: string
  options: Option[]
  /** Best match score in the group (lower is better). */
  score: number
}

const collator = new Intl.Collator('tr')
const NO_MATCH = Infinity

/**
 * How well a province matches a folded query: 0 name or plate code starts with
 * it, 1 an alias does (`Antep`), 2 the name contains it, 3 an alias does.
 */
function matchScore(province: Province, query: string): number {
  if (/^\d+$/.test(query)) {
    return province.code.startsWith(query) || Number(province.code) === Number(query) ? 0 : NO_MATCH
  }
  const name = foldSearch(province.name)
  const aliases = province.aliases.map(foldSearch)
  if (name.startsWith(query)) return 0
  if (aliases.some((alias) => alias.startsWith(query))) return 1
  if (name.includes(query)) return 2
  if (aliases.some((alias) => alias.includes(query))) return 3
  return NO_MATCH
}

/**
 * Regions, each with a "whole region" option and its provinces A–Z. While
 * searching, only matches are kept and the best matches come first.
 */
function useProvinceGroups(country: CountryCode, query: string): Group[] {
  const { t } = useTranslation('common')
  const pack = useMemo(() => getCountryPack(country), [country])
  const sorted = useMemo(
    () => [...(pack?.provinces ?? [])].sort((a, b) => collator.compare(a.name, b.name)),
    [pack]
  )
  return useMemo(() => {
    if (!pack) return []
    const q = foldSearch(query.trim())
    const groups = pack.regions.map((region): Group => {
      const label = t(`region.${region.id}`)
      const regionHit = q !== '' && foldSearch(label).includes(q)
      const scored = sorted
        .filter((p) => p.region === region.id)
        .map((province) => ({ province, score: q === '' || regionHit ? 0 : matchScore(province, q) }))
        .filter((entry) => entry.score !== NO_MATCH)
        .sort((a, b) => a.score - b.score)
      const options: Option[] = scored.map(({ province }) => ({
        kind: 'province',
        key: `p-${province.code}`,
        province
      }))
      if (q === '' || regionHit) {
        options.unshift({
          kind: 'region',
          key: `r-${region.id}`,
          regionId: region.id,
          label,
          count: region.provinces.length
        })
      }
      const score = regionHit ? 0 : (scored[0]?.score ?? NO_MATCH)
      return { regionId: region.id, label, options, score }
    })
    return groups
      .filter((group) => group.options.length > 0)
      .sort((a, b) => (q === '' ? 0 : a.score - b.score))
  }, [pack, sorted, query, t])
}

function isSelected(option: Option, value: LocationValue): boolean {
  return option.kind === 'province'
    ? value.provinceCode === option.province.code
    : !value.provinceCode && value.regionId === option.regionId
}

function toValue(option: Option): LocationValue {
  return option.kind === 'province'
    ? { provinceCode: option.province.code, regionId: option.province.region }
    : { provinceCode: null, regionId: option.regionId }
}

export interface ProvinceListProps {
  value: LocationValue
  onSelect: (value: LocationValue) => void
  /** Defaults to the country in settings. */
  country?: CountryCode
  autoFocus?: boolean
  /** Enter pressed while no option is highlighted (e.g. to move on without choosing). */
  onEnterEmpty?: () => void
  className?: string
  /** Classes for the scrolling list, e.g. its max height. */
  listClassName?: string
}

/**
 * Searchable list of a country's provinces grouped by region, with a "whole
 * region" choice per group. Search ignores case and Turkish accents and knows
 * aliases (`Antep`) and plate codes (`35`). ↑/↓ move, Enter picks.
 */
export function ProvinceList({
  value,
  onSelect,
  country: countryProp,
  autoFocus,
  onEnterEmpty,
  className,
  listClassName
}: ProvinceListProps): React.JSX.Element {
  const { t } = useTranslation('settings')
  const settingsCountry = useSettings((s) => s.settings.country)
  const country = countryProp ?? settingsCountry
  const [query, setQuery] = useState('')
  const [active, setActive] = useState<string | null>(null)
  const groups = useProvinceGroups(country, query)
  const options = useMemo(() => groups.flatMap((g) => g.options), [groups])
  const listRef = useRef<HTMLDivElement>(null)
  const uid = useId()
  const listId = `${uid}-list`
  const optionId = (key: string): string => `${uid}-${key}`

  // Open on the current choice.
  useEffect(() => {
    const list = listRef.current
    const selected = list?.querySelector<HTMLElement>('[aria-selected="true"]')
    if (list && selected)
      list.scrollTop = selected.offsetTop - (list.clientHeight - selected.offsetHeight) / 2
  }, [])

  // Follow the pointer/keys; while searching, fall back to the best match so Enter just works.
  const current =
    active && options.some((o) => o.key === active) ? active : query.trim() ? (options[0]?.key ?? null) : null

  const focusOption = (index: number): void => {
    const option = options[Math.max(0, Math.min(options.length - 1, index))]
    if (!option) return
    setActive(option.key)
    document.getElementById(optionId(option.key))?.scrollIntoView({ block: 'nearest' })
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    const index = current ? options.findIndex((o) => o.key === current) : -1
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      focusOption(index + 1)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      focusOption(index <= 0 ? 0 : index - 1)
    } else if (e.key === 'PageDown' || e.key === 'PageUp') {
      e.preventDefault()
      focusOption(index + (e.key === 'PageDown' ? 8 : -8))
    } else if (e.key === 'Enter') {
      const option = options.find((o) => o.key === current)
      if (option || onEnterEmpty) e.preventDefault()
      if (option) onSelect(toValue(option))
      else onEnterEmpty?.()
    }
  }

  return (
    <div className={cn('flex min-h-0 flex-col', className)}>
      <div className="p-2.5 pb-1.5">
        <SearchInput
          value={query}
          onValueChange={(next) => {
            setQuery(next)
            setActive(null)
          }}
          placeholder={t('province.search')}
          aria-label={t('province.search')}
          autoFocus={autoFocus}
          role="combobox"
          aria-expanded
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={current ? optionId(current) : undefined}
          onKeyDown={onKeyDown}
        />
      </div>
      <div
        ref={listRef}
        id={listId}
        role="listbox"
        aria-label={t('province.label')}
        className={cn('relative min-h-0 overflow-y-auto overscroll-contain px-1.5 pb-1.5', listClassName)}
      >
        {groups.map((group) => (
          <div key={group.regionId} role="group" aria-labelledby={`${uid}-g-${group.regionId}`}>
            <div
              id={`${uid}-g-${group.regionId}`}
              className="sticky top-0 z-10 bg-surface/95 px-2.5 pt-3 pb-1.5 text-[11px] font-semibold tracking-wider text-fg-subtle uppercase backdrop-blur-sm"
            >
              {group.label}
            </div>
            {group.options.map((option) => {
              const selected = isSelected(option, value)
              return (
                <div
                  key={option.key}
                  id={optionId(option.key)}
                  role="option"
                  aria-selected={selected}
                  data-active={option.key === current || undefined}
                  onPointerMove={() => option.key !== active && setActive(option.key)}
                  onClick={() => onSelect(toValue(option))}
                  className={cn(
                    'flex h-9 items-center gap-3 rounded-lg px-2.5 text-sm transition-colors duration-100 in-data-[density=compact]:h-8',
                    'data-active:bg-muted',
                    selected ? 'font-medium text-accent' : 'text-fg'
                  )}
                >
                  {option.kind === 'province' ? (
                    <>
                      <span className="w-6 text-[11px] font-medium text-fg-subtle tabular-nums">
                        {option.province.code}
                      </span>
                      <span className="min-w-0 flex-1 truncate">{option.province.name}</span>
                    </>
                  ) : (
                    <>
                      <MapIcon size={15} strokeWidth={1.75} aria-hidden className="w-6 text-fg-subtle" />
                      <span className="min-w-0 flex-1 truncate">
                        {t('province.wholeRegion', { region: option.label })}
                      </span>
                      <span className="text-xs text-fg-subtle">
                        {t('province.cities', { count: option.count })}
                      </span>
                    </>
                  )}
                  {selected && <Check size={16} strokeWidth={2.25} aria-hidden className="shrink-0" />}
                </div>
              )
            })}
          </div>
        ))}
        {groups.length === 0 && (
          <p className="px-4 py-10 text-center text-sm text-fg-muted">
            {t('province.noMatch', { query: query.trim() })}
          </p>
        )}
      </div>
    </div>
  )
}

export interface ProvincePickerProps {
  value: LocationValue
  onChange: (value: LocationValue) => void
  /** Defaults to the country in settings. */
  country?: CountryCode
  /** Trigger text when nothing is chosen. Defaults to "Choose a city". */
  placeholder?: string
  align?: 'start' | 'center' | 'end'
  className?: string
}

/** A button showing the chosen city or region that opens a searchable ProvinceList in a popover. */
export function ProvincePicker({
  value,
  onChange,
  country: countryProp,
  placeholder,
  align = 'end',
  className
}: ProvincePickerProps): React.JSX.Element {
  const { t } = useTranslation('settings')
  const settingsCountry = useSettings((s) => s.settings.country)
  const country = countryProp ?? settingsCountry
  const [open, setOpen] = useState(false)
  const label = locationLabel(t, country, value)
  const chosen = label !== null

  const pick = (next: LocationValue): void => {
    onChange(next)
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(buttonClass('outline', 'md'), 'min-w-48 justify-start pr-3 pl-3.5', className)}
        >
          <MapPin
            size={16}
            strokeWidth={1.75}
            aria-hidden
            className={cn('shrink-0', chosen ? 'text-accent' : 'text-fg-subtle')}
          />
          <span className={cn('min-w-0 flex-1 truncate text-left', !chosen && 'text-fg-muted')}>
            {label ?? placeholder ?? t('province.placeholder')}
          </span>
          <ChevronsUpDown size={15} strokeWidth={1.75} aria-hidden className="shrink-0 text-fg-subtle" />
        </button>
      </PopoverTrigger>
      <PopoverContent align={align} className="flex w-[22rem] flex-col overflow-hidden p-0">
        <ProvinceList
          value={value}
          onSelect={pick}
          country={country}
          autoFocus
          listClassName="max-h-[min(22rem,calc(var(--radix-popover-content-available-height)-7rem))]"
        />
        {chosen && (
          <div className="border-t border-line p-1.5">
            <button
              type="button"
              onClick={() => pick({ provinceCode: null, regionId: null })}
              className="flex h-9 w-full items-center gap-3 rounded-lg px-2.5 text-sm text-fg-muted transition-colors hover:bg-muted hover:text-fg"
            >
              <X size={15} strokeWidth={1.75} aria-hidden className="w-6" />
              {t('province.clear')}
            </button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}
