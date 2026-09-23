import { useId } from 'react'
import { Download, RefreshCw, RotateCw } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { UpdateStatus } from '@shared/ipc'
import { Button } from '@/components/ui/Button'
import { Switch } from '@/components/ui/Switch'
import { SettingRow, SettingsCard } from '@/features/settings/SettingsLayout'
import { useAppInfo } from '@/hooks/useAppInfo'
import { useNowSelect } from '@/hooks/useNow'
import { api } from '@/lib/api'
import { relativeTime } from '@/lib/time'
import { useSettings } from '@/stores/settings'
import { RELEASES_URL, useUpdates } from '@/stores/updates'

/** One line on where the updater stands: "Up to date · checked 5 min ago", "Downloading 0.4.0 · 42%"… */
function useStatusText(status: UpdateStatus | null, host: 'electron' | 'web' | undefined): string {
  const { t, i18n } = useTranslation('settings')
  return useNowSelect(60_000, (now) => {
    if (!status) return ''
    const { version, percent, checkedAt } = status
    if (status.mode === 'none') return host === 'web' ? t('appUpdates.web') : t('appUpdates.development')
    switch (status.state) {
      case 'checking':
        return t('appUpdates.checking')
      case 'downloading':
        return t('appUpdates.downloading', { version, percent: percent ?? 0 })
      case 'ready':
        return t('appUpdates.ready', { version })
      case 'available':
        return status.mode === 'manual'
          ? t('appUpdates.availableManual', { version })
          : t('appUpdates.available', { version })
      case 'error':
        return t('appUpdates.failed')
      case 'idle':
        return checkedAt
          ? t('appUpdates.upToDate', { time: relativeTime(checkedAt, i18n.language, now) })
          : t('appUpdates.hourly')
    }
  })
}

/** Settings → Data & About: the running version, automatic installs and a manual check. */
export function AppUpdatesCard(): React.JSX.Element {
  const { t } = useTranslation('settings')
  const info = useAppInfo()
  const status = useUpdates((s) => s.status)
  const auto = useSettings((s) => s.settings.appUpdates.auto)
  const update = useSettings((s) => s.update)
  const autoSwitch = useId()
  const text = useStatusText(status, info?.host)
  const mode = status?.mode ?? 'none'
  const state = status?.state ?? 'idle'

  const action = (): React.ReactNode => {
    if (mode === 'none') return null
    if (state === 'ready') {
      return (
        <Button variant="primary" icon={RotateCw} onClick={() => void useUpdates.getState().install()}>
          {t('appUpdates.restart')}
        </Button>
      )
    }
    if (state === 'available') {
      return mode === 'manual' ? (
        <Button variant="primary" icon={Download} onClick={() => void api.reader.openExternal(RELEASES_URL)}>
          {t('appUpdates.download')}
        </Button>
      ) : (
        <Button variant="primary" icon={Download} onClick={() => void useUpdates.getState().download()}>
          {t('appUpdates.install')}
        </Button>
      )
    }
    return (
      <Button
        variant="outline"
        icon={RefreshCw}
        loading={state === 'checking' || state === 'downloading'}
        onClick={() => void useUpdates.getState().check()}
      >
        {t('appUpdates.check')}
      </Button>
    )
  }

  return (
    <SettingsCard>
      <SettingRow
        label={t('appUpdates.version', { version: status?.current ?? info?.version ?? '' })}
        description={
          <>
            {text}
            {mode === 'manual' && (
              <span className="mt-1 block text-fg-subtle">{t('appUpdates.manualNote')}</span>
            )}
          </>
        }
        control={action()}
      />
      {mode === 'auto' && (
        <SettingRow
          htmlFor={autoSwitch}
          label={t('appUpdates.auto.label')}
          description={t('appUpdates.auto.description')}
          control={
            <Switch
              id={autoSwitch}
              checked={auto}
              onCheckedChange={(next) => void update({ appUpdates: { auto: next } })}
            />
          }
        />
      )}
    </SettingsCard>
  )
}
