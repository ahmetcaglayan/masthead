import { useState } from 'react'
import { Bug, CodeXml, History, RotateCcw } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/Button'
import { ConfirmDialog } from '@/components/ui/Dialog'
import { LogoMark } from '@/components/ui/Logo'
import { toast } from '@/components/ui/Toaster'
import { useAppInfo } from '@/hooks/useAppInfo'
import { api } from '@/lib/api'
import { useLibrary } from '@/stores/library'
import { useSettings } from '@/stores/settings'
import { useUi } from '@/stores/ui'
import { SettingRow, SettingsCard, SettingsSection } from './SettingsLayout'

const REPOSITORY = 'https://github.com/ahmetcaglayan/masthead'

function About(): React.JSX.Element {
  const { t } = useTranslation('settings')
  const info = useAppInfo()
  const runtime = !info
    ? ''
    : info.host === 'web'
      ? t('about.webMode')
      : t('about.runtime', { electron: info.electron, chrome: info.chrome })

  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-4 px-6 py-6 in-data-[density=compact]:px-5 in-data-[density=compact]:py-5">
      <LogoMark size={56} className="drop-shadow-sm" />
      <div className="min-w-0 flex-1 basis-56">
        <div className="headline text-2xl leading-tight font-semibold text-fg">{t('common:app.name')}</div>
        <p className="mt-0.5 text-sm text-fg-muted">{t('common:app.tagline')}</p>
        <p className="mt-2 text-[13px] text-fg-subtle tabular-nums">
          {[info && t('about.version', { version: info.version }), runtime, t('about.license')]
            .filter(Boolean)
            .join(' · ')}
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          variant="outline"
          icon={CodeXml}
          onClick={() => void api.reader.openExternal(REPOSITORY)}
        >
          {t('about.github')}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          icon={Bug}
          onClick={() => void api.reader.openExternal(`${REPOSITORY}/issues`)}
        >
          {t('about.issue')}
        </Button>
      </div>
    </div>
  )
}

/** Reading history, factory reset and the about card. */
export function DataSection(): React.JSX.Element {
  const { t } = useTranslation('settings')
  const historyCount = useLibrary((s) => s.library.history.length)
  const [confirm, setConfirm] = useState<'history' | 'reset' | null>(null)

  const clearHistory = async (): Promise<void> => {
    await useLibrary.getState().clearHistory()
    toast.success(t('data.history.done'))
  }

  const resetAll = async (): Promise<void> => {
    await useSettings.getState().reset()
    // Onboarding runs again; start from the front page afterwards.
    useUi.setState({ route: { name: 'home' }, history: [] })
  }

  return (
    <SettingsSection id="data" title={t('nav.data')} description={t('data.description')}>
      <div className="flex flex-col gap-5">
        <SettingsCard>
          <SettingRow
            label={t('data.history.label')}
            description={t('data.history.description', { count: historyCount })}
            control={
              <Button
                variant="outline"
                icon={History}
                disabled={historyCount === 0}
                onClick={() => setConfirm('history')}
              >
                {t('data.history.action')}
              </Button>
            }
          />
          <SettingRow
            label={t('data.reset.label')}
            description={t('data.reset.description')}
            control={
              <Button variant="danger" icon={RotateCcw} onClick={() => setConfirm('reset')}>
                {t('data.reset.action')}
              </Button>
            }
          />
        </SettingsCard>
        <SettingsCard>
          <About />
        </SettingsCard>
      </div>

      <ConfirmDialog
        open={confirm === 'history'}
        onOpenChange={(open) => !open && setConfirm(null)}
        title={t('data.history.confirmTitle')}
        description={t('data.history.confirmDescription', { count: historyCount })}
        confirmLabel={t('data.history.action')}
        danger
        onConfirm={clearHistory}
      />
      <ConfirmDialog
        open={confirm === 'reset'}
        onOpenChange={(open) => !open && setConfirm(null)}
        title={t('data.reset.confirmTitle')}
        description={t('data.reset.confirmDescription')}
        confirmLabel={t('data.reset.action')}
        danger
        onConfirm={resetAll}
      />
    </SettingsSection>
  )
}
