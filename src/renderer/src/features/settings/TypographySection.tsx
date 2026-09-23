import { ChevronsUpDown, RotateCcw } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { DEFAULT_SETTINGS, FONTS, fontById, type FontDef, type FontId } from '@shared/settings'
import { Button, buttonClass } from '@/components/ui/Button'
import {
  Menu,
  MenuContent,
  MenuLabel,
  MenuRadioGroup,
  MenuRadioItem,
  MenuSeparator,
  MenuTrigger
} from '@/components/ui/Menu'
import { Slider } from '@/components/ui/Slider'
import { cn } from '@/lib/cn'
import { formatPercent } from '@/lib/format'
import { useSettings } from '@/stores/settings'
import { SettingRow, SettingsCard, SettingsSection } from './SettingsLayout'

type FontRole = 'uiFont' | 'headlineFont' | 'readingFont'

const ROLES: readonly FontRole[] = ['uiFont', 'headlineFont', 'readingFont']
const GROUPS: readonly FontDef['style'][] = ['sans', 'serif']

/** A font menu whose trigger and options are each set in their own face. */
function FontSelect({
  role,
  value,
  onChange
}: {
  role: FontRole
  value: FontId
  onChange: (value: FontId) => void
}): React.JSX.Element {
  const { t } = useTranslation('settings')
  const current = fontById(value)
  const fallback = DEFAULT_SETTINGS.typography[role]
  return (
    <Menu>
      <MenuTrigger asChild>
        <button
          type="button"
          aria-label={`${t(`typography.${role}.label`)}: ${current.label}`}
          className={cn(buttonClass('outline', 'md'), 'w-56 justify-between pr-3 pl-4')}
        >
          <span className="truncate text-[15px]" style={{ fontFamily: current.stack }}>
            {current.label}
          </span>
          <ChevronsUpDown size={15} strokeWidth={1.75} aria-hidden className="text-fg-subtle" />
        </button>
      </MenuTrigger>
      <MenuContent className="max-h-(--radix-dropdown-menu-content-available-height) w-64 overflow-y-auto">
        <MenuRadioGroup
          value={value}
          onValueChange={(next) => {
            const font = FONTS.find((f) => f.id === next)
            if (font) onChange(font.id)
          }}
        >
          {GROUPS.map((style, index) => (
            <div key={style}>
              {index > 0 && <MenuSeparator />}
              <MenuLabel>{t(`typography.${style}`)}</MenuLabel>
              {FONTS.filter((f) => f.style === style).map((font) => (
                <MenuRadioItem key={font.id} value={font.id} className="h-9 text-[15px]">
                  <span style={{ fontFamily: font.stack }}>{font.label}</span>
                  {font.id === fallback && (
                    <span className="ml-2 font-ui text-[11px] text-fg-subtle">{t('typography.default')}</span>
                  )}
                </MenuRadioItem>
              ))}
            </div>
          ))}
        </MenuRadioGroup>
      </MenuContent>
    </Menu>
  )
}

/** How the chosen faces and size look together: a news card, a reader paragraph and Turkish glyphs. */
function TypographyPreview(): React.JSX.Element {
  const { t } = useTranslation('settings')
  const specimen = 'Ğğ Şş İı Çç Öö Üü'
  return (
    <div className="@container rounded-card border border-line bg-canvas p-6 in-data-[density=compact]:p-5">
      <div className="grid gap-6 @xl:grid-cols-[1.15fr_1fr] @xl:gap-8">
        <article>
          <div className="text-[11px] font-semibold tracking-wider text-accent uppercase">
            {t('typography.preview.kicker')}
          </div>
          <h3 className="headline mt-2 text-[1.625rem] leading-[1.15] font-semibold text-fg">
            {t('typography.preview.headline')}
          </h3>
          <p className="mt-2.5 text-[15px] leading-relaxed text-fg-muted text-pretty">
            {t('typography.preview.summary')}
          </p>
          <p className="mt-3 text-xs text-fg-subtle">{t('typography.preview.meta')}</p>
        </article>
        <div className="border-line @xl:border-l @xl:pl-8">
          <div className="text-[11px] font-semibold tracking-wider text-fg-subtle uppercase">
            {t('typography.preview.readerLabel')}
          </div>
          <p className="mt-2 font-reading text-[17px] leading-[1.7] text-fg text-pretty">
            {t('typography.preview.body')}
          </p>
        </div>
      </div>
      <div className="mt-6 flex flex-wrap gap-x-8 gap-y-3 border-t border-line pt-4">
        {(['ui', 'headline', 'reading'] as const).map((face) => (
          <div key={face} className="flex items-baseline gap-2.5">
            <span className="text-[11px] font-semibold tracking-wider text-fg-subtle uppercase">
              {t(`typography.preview.faces.${face}`)}
            </span>
            <span
              className={cn(
                'text-lg text-fg',
                face === 'ui' && 'font-ui',
                face === 'headline' && 'headline',
                face === 'reading' && 'font-reading'
              )}
            >
              {specimen}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

/** Interface, headline and reading fonts, text size and a live preview. */
export function TypographySection(): React.JSX.Element {
  const { t, i18n } = useTranslation('settings')
  const typography = useSettings((s) => s.settings.typography)
  const update = useSettings((s) => s.update)
  // "110%" in English, "%110" in Turkish.
  const percent = formatPercent(typography.scale, i18n.language)
  const defaults = DEFAULT_SETTINGS.typography
  const isDefault = (Object.keys(defaults) as (keyof typeof defaults)[]).every(
    (k) => typography[k] === defaults[k]
  )

  return (
    <SettingsSection
      id="typography"
      title={t('nav.typography')}
      description={t('typography.description')}
      action={
        <Button
          size="sm"
          variant="ghost"
          icon={RotateCcw}
          disabled={isDefault}
          onClick={() => void update({ typography: defaults })}
        >
          {t('typography.reset')}
        </Button>
      }
    >
      <SettingsCard>
        {ROLES.map((role) => (
          <SettingRow
            key={role}
            label={t(`typography.${role}.label`)}
            description={t(`typography.${role}.description`)}
            control={
              <FontSelect
                role={role}
                value={typography[role]}
                onChange={(font) => void update({ typography: { [role]: font } })}
              />
            }
          />
        ))}
        <SettingRow
          label={t('typography.scale.label')}
          description={t('typography.scale.description')}
          control={
            <div className="flex w-72 items-center gap-3">
              <span aria-hidden className="text-xs font-medium text-fg-subtle">
                A
              </span>
              <Slider
                value={typography.scale}
                min={0.85}
                max={1.3}
                step={0.05}
                onValueChange={(scale) =>
                  void update({ typography: { scale: Math.round(scale * 100) / 100 } })
                }
                aria-label={t('typography.scale.label')}
                valueText={percent}
              />
              <span aria-hidden className="text-lg font-medium text-fg-subtle">
                A
              </span>
              <span className="w-11 text-right text-sm font-medium text-fg tabular-nums">{percent}</span>
            </div>
          }
        />
        <div className="p-4 in-data-[density=compact]:p-3">
          <TypographyPreview />
        </div>
      </SettingsCard>
    </SettingsSection>
  )
}
