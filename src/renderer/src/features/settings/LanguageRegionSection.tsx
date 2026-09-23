import { ChevronsUpDown } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { COUNTRY_OPTIONS, hasLocalNews } from '@shared/countries'
import type { UiLanguage } from '@shared/settings'
import type { CountryCode } from '@shared/types'
import { Badge } from '@/components/ui/Badge'
import { buttonClass } from '@/components/ui/Button'
import { Menu, MenuContent, MenuRadioGroup, MenuRadioItem, MenuTrigger } from '@/components/ui/Menu'
import { cn } from '@/lib/cn'
import { useSettings } from '@/stores/settings'
import { CountryFlag } from './CountryFlag'
import { ProvincePicker } from './ProvincePicker'
import { SettingRow, SettingsCard, SettingsSection } from './SettingsLayout'

/** Language names are written in their own language, whatever the UI language is. */
const LANGUAGE_OPTIONS = [
  { value: 'en', label: 'English' },
  { value: 'tr', label: 'Türkçe' },
  { value: 'de', label: 'Deutsch' },
  { value: 'pt', label: 'Português' },
  { value: 'hi', label: 'हिन्दी' }
] as const satisfies readonly { value: UiLanguage; label: string }[]

function LanguageSelect({
  value,
  onChange
}: {
  value: UiLanguage
  onChange: (value: UiLanguage) => void
}): React.JSX.Element {
  const { t } = useTranslation('settings')
  const label = LANGUAGE_OPTIONS.find((o) => o.value === value)?.label ?? value
  return (
    <Menu>
      <MenuTrigger asChild>
        <button
          type="button"
          aria-label={`${t('locale.language.label')}: ${label}`}
          className={cn(buttonClass('outline', 'md'), 'min-w-48 justify-between pr-3 pl-3.5')}
        >
          <span className="truncate">{label}</span>
          <ChevronsUpDown size={15} strokeWidth={1.75} aria-hidden className="text-fg-subtle" />
        </button>
      </MenuTrigger>
      <MenuContent className="w-56">
        <MenuRadioGroup value={value} onValueChange={(next) => onChange(next as UiLanguage)}>
          {LANGUAGE_OPTIONS.map((option) => (
            <MenuRadioItem key={option.value} value={option.value}>
              <span lang={option.value}>{option.label}</span>
            </MenuRadioItem>
          ))}
        </MenuRadioGroup>
      </MenuContent>
    </Menu>
  )
}

function CountrySelect({
  value,
  onChange
}: {
  value: CountryCode
  onChange: (value: CountryCode) => void
}): React.JSX.Element {
  const { t } = useTranslation('settings')
  return (
    <Menu>
      <MenuTrigger asChild>
        <button
          type="button"
          aria-label={`${t('locale.country.label')}: ${t(`common:country.${value}`)}`}
          className={cn(buttonClass('outline', 'md'), 'min-w-48 justify-between pr-3 pl-3.5')}
        >
          <span className="flex min-w-0 items-center gap-2.5">
            <CountryFlag code={value} />
            <span className="truncate">{t(`common:country.${value}`)}</span>
          </span>
          <ChevronsUpDown size={15} strokeWidth={1.75} aria-hidden className="text-fg-subtle" />
        </button>
      </MenuTrigger>
      <MenuContent className="w-72">
        <MenuRadioGroup
          value={value}
          onValueChange={(next) => {
            const option = COUNTRY_OPTIONS.find((o) => o.code === next && o.available)
            if (option) onChange(option.code)
          }}
        >
          {COUNTRY_OPTIONS.map((option) => (
            <MenuRadioItem key={option.code} value={option.code} disabled={!option.available}>
              <span className="flex items-center gap-2.5">
                <CountryFlag code={option.code} />
                <span className="min-w-0 flex-1 truncate">{t(`common:country.${option.code}`)}</span>
                {!option.available && <Badge>{t('locale.country.soon')}</Badge>}
              </span>
            </MenuRadioItem>
          ))}
        </MenuRadioGroup>
      </MenuContent>
    </Menu>
  )
}

/** Interface language, news country and the city or region for local news. */
export function LanguageRegionSection(): React.JSX.Element {
  const { t } = useTranslation('settings')
  const language = useSettings((s) => s.settings.language)
  const country = useSettings((s) => s.settings.country)
  const location = useSettings((s) => s.settings.location)
  const update = useSettings((s) => s.update)

  return (
    <SettingsSection id="language" title={t('nav.language')} description={t('locale.description')}>
      <SettingsCard>
        <SettingRow
          label={t('locale.language.label')}
          description={t('locale.language.description')}
          control={
            <LanguageSelect value={language} onChange={(next) => void update({ language: next })} />
          }
        />
        <SettingRow
          label={t('locale.country.label')}
          description={t('locale.country.description')}
          control={
            <CountrySelect
              value={country}
              onChange={(next) => {
                // Province codes belong to a country, so the local-news choice starts over.
                if (next !== country)
                  void update({ country: next, location: { provinceCode: null, regionId: null } })
              }}
            />
          }
        />
        {/* Countries without a province pack have no Local page to fill. */}
        {hasLocalNews(country) && (
          <SettingRow
            label={t('locale.city.label')}
            description={t('locale.city.description')}
            control={
              <ProvincePicker
                value={location}
                country={country}
                onChange={(next) => void update({ location: next })}
              />
            }
          />
        )}
      </SettingsCard>
    </SettingsSection>
  )
}
