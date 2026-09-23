import { Rss } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Page } from '@/components/layout/Page'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { CountryFlag } from '@/features/settings/CountryFlag'
import { useSettings } from '@/stores/settings'
import { SourcesList } from './SourcesList'

/** The Sources page: every outlet of the selected country with its on/off switch. */
export function SourcesPage(): React.JSX.Element {
  const { t } = useTranslation('settings')
  const country = useSettings((s) => s.settings.country)
  return (
    <Page measure="4xl">
      <SectionHeader
        size="lg"
        icon={Rss}
        kicker={
          <>
            <CountryFlag code={country} className="h-3 w-[18px] rounded-[2px]" />
            {/* A Turkish name: upper-case it with Turkish rules (TÜRKİYE) in any UI language. */}
            <span lang={country === 'tr' ? 'tr' : undefined}>{t(`common:country.${country}`)}</span>
          </>
        }
        title={t('sources.page.title')}
        description={t('sources.page.description')}
      />
      <SourcesList headingLevel="h2" className="mt-8" />
    </Page>
  )
}
