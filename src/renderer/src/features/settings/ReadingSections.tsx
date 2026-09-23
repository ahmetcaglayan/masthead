import { useId } from 'react'
import { BookOpen, Globe, RefreshCw } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { REFRESH_INTERVALS, type ReaderMode } from '@shared/settings'
import { Button } from '@/components/ui/Button'
import { SegmentedControl } from '@/components/ui/SegmentedControl'
import { Switch } from '@/components/ui/Switch'
import { toast } from '@/components/ui/Toaster'
import { Tooltip } from '@/components/ui/Tooltip'
import { useAppInfo } from '@/hooks/useAppInfo'
import { useNow } from '@/hooks/useNow'
import { isElectron } from '@/lib/api'
import { fullDate, relativeTime } from '@/lib/time'
import { useNews } from '@/stores/news'
import { useSettings } from '@/stores/settings'
import { SettingRow, SettingsCard, SettingsSection } from './SettingsLayout'

/** True in the desktop app; false in the browser preview, where host-only features are off. */
function useDesktopHost(): boolean {
  const info = useAppInfo()
  return info ? info.host === 'electron' : isElectron
}

function DesktopOnly({ children }: { children: React.ReactNode }): React.JSX.Element {
  const { t } = useTranslation('settings')
  const desktop = useDesktopHost()
  return (
    <>
      {children}
      {!desktop && <span className="mt-1 block text-fg-subtle">{t('desktopOnly')}</span>}
    </>
  )
}

/** How articles open, and ad blocking in the built-in browser. */
export function ReadingSection(): React.JSX.Element {
  const { t } = useTranslation('settings')
  const reader = useSettings((s) => s.settings.reader)
  const update = useSettings((s) => s.update)
  const desktop = useDesktopHost()
  const adsSwitch = useId()

  return (
    <SettingsSection id="reading" title={t('nav.reading')} description={t('reading.description')}>
      <SettingsCard>
        <SettingRow
          label={t('reading.mode.label')}
          description={t('reading.mode.description')}
          control={
            <SegmentedControl<ReaderMode>
              aria-label={t('reading.mode.label')}
              value={reader.defaultMode}
              onChange={(defaultMode) => void update({ reader: { defaultMode } })}
              options={[
                { value: 'web', label: t('reading.mode.web'), icon: Globe },
                { value: 'reader', label: t('reading.mode.reader'), icon: BookOpen }
              ]}
            />
          }
        />
        <SettingRow
          htmlFor={adsSwitch}
          label={t('reading.ads.label')}
          description={<DesktopOnly>{t('reading.ads.description')}</DesktopOnly>}
          control={
            <Switch
              id={adsSwitch}
              checked={reader.blockAds}
              disabled={!desktop}
              onCheckedChange={(blockAds) => void update({ reader: { blockAds } })}
            />
          }
        />
      </SettingsCard>
    </SettingsSection>
  )
}

/** Desktop notifications for breaking news. */
export function NotificationsSection(): React.JSX.Element {
  const { t } = useTranslation('settings')
  const breaking = useSettings((s) => s.settings.notifications.breaking)
  const update = useSettings((s) => s.update)
  const desktop = useDesktopHost()
  const breakingSwitch = useId()

  return (
    <SettingsSection
      id="notifications"
      title={t('nav.notifications')}
      description={t('notifications.description')}
    >
      <SettingsCard>
        <SettingRow
          htmlFor={breakingSwitch}
          label={t('notifications.breaking.label')}
          description={<DesktopOnly>{t('notifications.breaking.description')}</DesktopOnly>}
          control={
            <Switch
              id={breakingSwitch}
              checked={breaking}
              disabled={!desktop}
              onCheckedChange={(next) => void update({ notifications: { breaking: next } })}
            />
          }
        />
      </SettingsCard>
    </SettingsSection>
  )
}

function RefreshStatusText(): React.JSX.Element {
  const { t, i18n } = useTranslation('settings')
  const status = useNews((s) => s.status)
  const snapshotUpdatedAt = useNews((s) => s.snapshot?.updatedAt ?? 0)
  const now = useNow(30_000)
  const last = status.lastCompletedAt || snapshotUpdatedAt

  if (status.state === 'refreshing') {
    return (
      <span aria-live="polite">
        {status.total
          ? t('updates.refreshing', { done: status.done, total: status.total })
          : t('common:actions.refreshing')}
      </span>
    )
  }
  if (!last) return <span>{t('common:titlebar.neverUpdated')}</span>
  return (
    <Tooltip content={fullDate(last, i18n.language)} side="bottom" align="start">
      <span className="underline decoration-line-strong decoration-dotted underline-offset-4">
        {now - last < 60_000
          ? t('common:titlebar.updatedJustNow')
          : t('common:titlebar.updated', { time: relativeTime(last, i18n.language, now) })}
      </span>
    </Tooltip>
  )
}

/** Refresh interval and a manual refresh with its status. */
export function UpdatesSection(): React.JSX.Element {
  const { t } = useTranslation('settings')
  const interval = useSettings((s) => s.settings.refresh.intervalMinutes)
  const update = useSettings((s) => s.update)
  const refreshing = useNews((s) => s.status.state === 'refreshing')

  const refreshNow = (): void => {
    useNews
      .getState()
      .refresh(true)
      .catch(() => toast.error(t('updates.failed')))
  }

  return (
    <SettingsSection id="updates" title={t('nav.updates')} description={t('updates.description')}>
      <SettingsCard>
        <SettingRow
          label={t('updates.interval.label')}
          description={t('updates.interval.description')}
          control={
            <SegmentedControl<string>
              aria-label={t('updates.interval.label')}
              value={String(interval)}
              onChange={(minutes) => void update({ refresh: { intervalMinutes: Number(minutes) } })}
              options={REFRESH_INTERVALS.map((minutes) => ({
                value: String(minutes),
                label: t('updates.interval.minutes', { count: minutes })
              }))}
            />
          }
        />
        <SettingRow
          label={t('updates.now.label')}
          description={<RefreshStatusText />}
          control={
            <Button icon={RefreshCw} loading={refreshing} onClick={refreshNow}>
              {t('updates.now.action')}
            </Button>
          }
        />
      </SettingsCard>
    </SettingsSection>
  )
}
