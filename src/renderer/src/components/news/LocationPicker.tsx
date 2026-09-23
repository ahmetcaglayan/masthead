import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Check, ChevronDown, Globe, MapPin } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { Province } from '@shared/types'
import { SearchInput } from '@/components/ui/SearchInput'
import { useCountryPack, useLocalUnit } from '@/hooks/useSources'
import { foldText } from '@/lib/search'
import { cn } from '@/lib/cn'

export interface LocationValue {
  provinceCode: string | null
  regionId: string | null
}

export interface LocationCounts {
  provinces: ReadonlyMap<string, number>
  regions: ReadonlyMap<string, number>
}

export interface LocationPickerProps {
  value: LocationValue
  /** A province choice always carries its region. */
  onChange: (next: LocationValue) => void
  /** Offer whole regions and "Anywhere" as choices (filters). Default true. */
  allowRegion?: boolean
  /** Story counts shown beside names. */
  counts?: LocationCounts
  /** Taller province list for use on a page rather than in a popover. */
  spacious?: boolean
  autoFocus?: boolean
  className?: string
}

const ROW =
  'flex w-full items-center gap-2 rounded-lg px-2.5 text-left font-ui transition-colors duration-150 hover:bg-muted'

function Count({ value }: { value?: number }): React.JSX.Element | null {
  if (!value) return null
  return <span className="ml-auto pl-2 text-[11.5px] text-fg-subtle tabular-nums">{value}</span>
}

function ProvinceButton({
  province,
  selected,
  count,
  onSelect
}: {
  province: Province
  selected: boolean
  count?: number
  onSelect: () => void
}): React.JSX.Element {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onSelect}
      className={cn(
        ROW,
        'h-8 text-[13px]',
        selected ? 'bg-accent-soft font-semibold text-accent hover:bg-accent-soft' : 'text-fg'
      )}
    >
      {selected && <Check size={14} strokeWidth={2.25} aria-hidden className="-ml-0.5 shrink-0" />}
      <span className="min-w-0">{province.name}</span>
      <Count value={count} />
    </button>
  )
}

/**
 * Region → province chooser for the country pack: a search over province names
 * and their aliases, and the regions as an accordion of provinces.
 */
export function LocationPicker({
  value,
  onChange,
  allowRegion = true,
  counts,
  spacious = false,
  autoFocus = false,
  className
}: LocationPickerProps): React.JSX.Element {
  const { t } = useTranslation('news')
  const pack = useCountryPack()
  const context = useLocalUnit()
  const [query, setQuery] = useState('')
  const selectedRegion =
    value.regionId ?? pack?.provinces.find((p) => p.code === value.provinceCode)?.region ?? null
  const [open, setOpen] = useState<string | null>(selectedRegion)

  const byRegion = useMemo(() => {
    const map = new Map<string, Province[]>()
    for (const p of [...(pack?.provinces ?? [])].sort((a, b) => a.name.localeCompare(b.name, pack?.locale))) {
      const list = map.get(p.region)
      if (list) list.push(p)
      else map.set(p.region, [p])
    }
    return map
  }, [pack])

  const matches = useMemo(() => {
    const q = foldText(query.trim())
    if (!q || !pack) return []
    const scored: { province: Province; rank: number }[] = []
    for (const province of pack.provinces) {
      const names = [province.name, ...province.aliases].map(foldText)
      if (names.some((n) => n.startsWith(q))) scored.push({ province, rank: 0 })
      else if (names.some((n) => n.includes(q))) scored.push({ province, rank: 1 })
    }
    return scored
      .sort((a, b) => a.rank - b.rank || a.province.name.localeCompare(b.province.name, pack?.locale))
      .map((s) => s.province)
  }, [query, pack])

  const pick = (province: Province): void =>
    onChange({ provinceCode: province.code, regionId: province.region })
  const grid = cn('grid gap-0.5', spacious ? 'grid-cols-2 sm:grid-cols-3' : 'grid-cols-2')

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <SearchInput
        size="sm"
        value={query}
        onValueChange={setQuery}
        placeholder={t('location.search', { context })}
        aria-label={t('location.search', { context })}
        autoFocus={autoFocus}
      />
      {query.trim() ? (
        matches.length > 0 ? (
          <div className={grid}>
            {matches.map((province) => (
              <ProvinceButton
                key={province.code}
                province={province}
                selected={value.provinceCode === province.code}
                count={counts?.provinces.get(province.code)}
                onSelect={() => pick(province)}
              />
            ))}
          </div>
        ) : (
          <p className="px-2.5 py-3 font-ui text-[13px] text-fg-muted">
            {t('location.noMatch', { context })}
          </p>
        )
      ) : (
        <ul className="flex flex-col">
          {allowRegion && (
            <li>
              <button
                type="button"
                aria-pressed={!value.provinceCode && !value.regionId}
                onClick={() => onChange({ provinceCode: null, regionId: null })}
                className={cn(
                  ROW,
                  'h-9 text-[13.5px] font-medium',
                  !value.provinceCode && !value.regionId ? 'text-accent' : 'text-fg'
                )}
              >
                <Globe size={16} strokeWidth={1.75} aria-hidden className="shrink-0 text-fg-subtle" />
                {t('location.anywhere')}
              </button>
            </li>
          )}
          {pack?.regions.map((region) => {
            const expanded = open === region.id
            const regionSelected = !value.provinceCode && value.regionId === region.id
            const panelId = `region-${region.id}`
            return (
              <li key={region.id}>
                <div className="flex items-center gap-0.5">
                  <button
                    type="button"
                    aria-pressed={allowRegion ? regionSelected : undefined}
                    aria-expanded={allowRegion ? undefined : expanded}
                    aria-controls={allowRegion ? undefined : panelId}
                    onClick={() =>
                      allowRegion
                        ? onChange({ provinceCode: null, regionId: region.id })
                        : setOpen(expanded ? null : region.id)
                    }
                    className={cn(
                      ROW,
                      'h-9 flex-1 text-[13.5px] font-medium',
                      regionSelected ? 'text-accent' : 'text-fg'
                    )}
                  >
                    <MapPin
                      size={16}
                      strokeWidth={1.75}
                      aria-hidden
                      className={cn('shrink-0', regionSelected ? 'text-accent' : 'text-fg-subtle')}
                    />
                    {t(`common:region.${region.id}`)}
                    <Count value={counts?.regions.get(region.id)} />
                  </button>
                  <button
                    type="button"
                    aria-label={t('location.showProvinces', {
                      region: t(`common:region.${region.id}`),
                      context
                    })}
                    aria-expanded={expanded}
                    aria-controls={panelId}
                    onClick={() => setOpen(expanded ? null : region.id)}
                    className="flex size-8 shrink-0 items-center justify-center rounded-lg text-fg-subtle transition-colors duration-150 hover:bg-muted hover:text-fg"
                  >
                    <ChevronDown
                      size={16}
                      strokeWidth={1.75}
                      aria-hidden
                      className={cn('transition-transform duration-200', expanded && 'rotate-180')}
                    />
                  </button>
                </div>
                <AnimatePresence initial={false}>
                  {expanded && (
                    <motion.div
                      id={panelId}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden"
                    >
                      <div className={cn(grid, 'pt-0.5 pb-2 pl-6')}>
                        {(byRegion.get(region.id) ?? []).map((province) => (
                          <ProvinceButton
                            key={province.code}
                            province={province}
                            selected={value.provinceCode === province.code}
                            count={counts?.provinces.get(province.code)}
                            onSelect={() => pick(province)}
                          />
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
