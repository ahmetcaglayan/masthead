import { useId, useRef } from 'react'
import { Check, Rows3, Rows2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { ACCENTS, type AccentId, type CardStyle, type Density } from '@shared/settings'
import { SegmentedControl } from '@/components/ui/SegmentedControl'
import { Switch } from '@/components/ui/Switch'
import { Tooltip } from '@/components/ui/Tooltip'
import { useResolvedTheme } from '@/hooks/useResolvedTheme'
import { cn } from '@/lib/cn'
import { useSettings } from '@/stores/settings'
import { ChoiceCards, type ChoiceOption } from './ChoiceCards'
import { SettingRow, SettingsCard, SettingsSection } from './SettingsLayout'
import { ThemeCards } from './ThemeCards'

/**
 * The five accent colours. Each swatch carries its own `data-accent` (and the
 * current `data-theme`), so `bg-accent` inside it resolves to that accent.
 */
function AccentSwatches({
  value,
  onChange,
  labelledBy
}: {
  value: AccentId
  onChange: (value: AccentId) => void
  labelledBy: string
}): React.JSX.Element {
  const { t } = useTranslation('settings')
  const theme = useResolvedTheme()
  const refs = useRef<(HTMLButtonElement | null)[]>([])

  const move = (from: number, step: 1 | -1): void => {
    const next = (from + step + ACCENTS.length) % ACCENTS.length
    onChange(ACCENTS[next])
    refs.current[next]?.focus()
  }

  return (
    <div role="radiogroup" aria-labelledby={labelledBy} className="flex items-center gap-3">
      {ACCENTS.map((id, index) => {
        const selected = id === value
        const name = t(`appearance.accent.${id}`)
        return (
          <Tooltip key={id} content={name}>
            <button
              ref={(el) => {
                refs.current[index] = el
              }}
              type="button"
              role="radio"
              aria-checked={selected}
              aria-label={name}
              tabIndex={selected ? 0 : -1}
              data-theme={theme}
              data-accent={id}
              onClick={() => onChange(id)}
              onKeyDown={(e) => {
                if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                  e.preventDefault()
                  move(index, 1)
                } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                  e.preventDefault()
                  move(index, -1)
                }
              }}
              className={cn(
                'flex size-8 items-center justify-center rounded-full bg-accent text-on-accent shadow-soft',
                'transition-[transform,box-shadow] duration-150 ease-out hover:scale-110 active:scale-95',
                selected && 'ring-2 ring-accent ring-offset-2 ring-offset-surface'
              )}
            >
              {selected && <Check size={14} strokeWidth={3} aria-hidden />}
            </button>
          </Tooltip>
        )
      })}
    </div>
  )
}

/** Tiny wireframe of a card style, drawn with theme tokens. */
function LayoutSketch({ style }: { style: CardStyle }): React.JSX.Element {
  const image = 'rounded-[3px] bg-subtle'
  const ink = 'block rounded-full bg-fg/55'
  const text = 'block rounded-full bg-fg/15'
  return (
    <div
      aria-hidden
      className="aspect-[16/10] w-full rounded-[9px] bg-canvas p-[7%] ring-1 ring-line ring-inset"
    >
      {style === 'magazine' && (
        <div className="flex h-full gap-[6%]">
          <div className="flex w-[58%] flex-col gap-[6%]">
            <span className={cn(image, 'h-[54%]')} />
            <span className={cn(ink, 'h-[7%] w-full')} />
            <span className={cn(ink, 'h-[7%] w-2/3')} />
            <span className={cn(text, 'h-[5%] w-full')} />
            <span className={cn(text, 'h-[5%] w-5/6')} />
          </div>
          <div className="flex flex-1 flex-col gap-[8%]">
            {[0, 1].map((i) => (
              <div key={i} className="flex flex-1 flex-col gap-[9%]">
                <span className={cn(ink, 'h-[9%] w-full')} />
                <span className={cn(text, 'h-[7%] w-full')} />
                <span className={cn(text, 'h-[7%] w-full')} />
                <span className={cn(text, 'h-[7%] w-3/5')} />
              </div>
            ))}
          </div>
        </div>
      )}
      {style === 'grid' && (
        <div className="grid h-full grid-cols-3 grid-rows-2 gap-[6%]">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex flex-col gap-[10%]">
              <span className={cn(image, 'flex-1')} />
              <span className={cn(ink, 'h-[11%] w-4/5')} />
            </div>
          ))}
        </div>
      )}
      {style === 'list' && (
        <div className="flex h-full flex-col justify-between">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="flex h-[19%] items-center gap-[5%]">
              <span className={cn(image, 'aspect-[4/3] h-full')} />
              <div className="flex flex-1 flex-col gap-[14%]">
                <span className={cn(ink, 'h-[24%] w-4/5')} />
                <span className={cn(text, 'h-[20%] w-full')} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const CARD_STYLES: readonly CardStyle[] = ['magazine', 'grid', 'list']

/** Theme, accent colour, density, card style and sidebar width. */
export function AppearanceSection(): React.JSX.Element {
  const { t } = useTranslation('settings')
  const theme = useSettings((s) => s.settings.theme)
  const accent = useSettings((s) => s.settings.accent)
  const layout = useSettings((s) => s.settings.layout)
  const update = useSettings((s) => s.update)
  const themeLabel = useId()
  const accentLabel = useId()
  const cardLabel = useId()
  const sidebarSwitch = useId()

  const cardOptions: ChoiceOption<CardStyle>[] = CARD_STYLES.map((style) => ({
    value: style,
    label: t(`appearance.cardStyle.${style}`),
    description: t(`appearance.cardStyle.${style}Hint`),
    visual: <LayoutSketch style={style} />
  }))

  return (
    <SettingsSection id="appearance" title={t('nav.appearance')} description={t('appearance.description')}>
      <SettingsCard>
        <SettingRow
          labelId={themeLabel}
          label={t('appearance.theme.label')}
          description={t('appearance.theme.description')}
        >
          <ThemeCards
            value={theme}
            onChange={(next) => void update({ theme: next })}
            aria-labelledby={themeLabel}
          />
        </SettingRow>
        <SettingRow
          labelId={accentLabel}
          label={t('appearance.accent.label')}
          description={t('appearance.accent.description')}
          control={
            <AccentSwatches
              value={accent}
              onChange={(next) => void update({ accent: next })}
              labelledBy={accentLabel}
            />
          }
        />
        <SettingRow
          label={t('appearance.density.label')}
          description={t('appearance.density.description')}
          control={
            <SegmentedControl<Density>
              aria-label={t('appearance.density.label')}
              value={layout.density}
              onChange={(density) => void update({ layout: { density } })}
              options={[
                { value: 'comfortable', label: t('appearance.density.comfortable'), icon: Rows2 },
                { value: 'compact', label: t('appearance.density.compact'), icon: Rows3 }
              ]}
            />
          }
        />
        <SettingRow
          labelId={cardLabel}
          label={t('appearance.cardStyle.label')}
          description={t('appearance.cardStyle.description')}
        >
          <ChoiceCards
            value={layout.cardStyle}
            options={cardOptions}
            onChange={(cardStyle) => void update({ layout: { cardStyle } })}
            aria-labelledby={cardLabel}
          />
        </SettingRow>
        <SettingRow
          htmlFor={sidebarSwitch}
          label={t('appearance.sidebar.label')}
          description={t('appearance.sidebar.description')}
          control={
            <Switch
              id={sidebarSwitch}
              checked={layout.sidebarCollapsed}
              onCheckedChange={(sidebarCollapsed) => void update({ layout: { sidebarCollapsed } })}
            />
          }
        />
      </SettingsCard>
    </SettingsSection>
  )
}
