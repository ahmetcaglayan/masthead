import { useState } from 'react'
import { Download, RotateCw } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/Button'
import { Dialog } from '@/components/ui/Dialog'
import { api } from '@/lib/api'
import { useSettings } from '@/stores/settings'
import { RELEASES_URL, useUpdates } from '@/stores/updates'

/**
 * Speaks up when a new version needs the user: downloaded and waiting for a restart, or
 * out but not installable by this copy (portable, macOS, .deb) or by choice (automatic
 * installs off). "Later" hides it for that version until the next start.
 */
export function UpdateDialog(): React.JSX.Element | null {
  const { t } = useTranslation('common')
  const status = useUpdates((s) => s.status)
  const auto = useSettings((s) => s.settings.appUpdates.auto)
  const [dismissed, setDismissed] = useState<string | null>(null)
  const [restarting, setRestarting] = useState(false)

  if (!status?.version) return null
  const ready = status.state === 'ready'
  const offer = status.state === 'available' && (status.mode === 'manual' || !auto)
  if (!ready && !offer) return null
  const key = `${status.state}:${status.version}`
  const open = dismissed !== key
  const version = status.version
  const later = (): void => setDismissed(key)

  const restart = (): void => {
    setRestarting(true)
    void useUpdates
      .getState()
      .install()
      .catch(() => setRestarting(false))
  }

  if (ready) {
    return (
      <Dialog
        open={open}
        onOpenChange={(next) => !next && later()}
        size="sm"
        title={t('update.ready.title', { version })}
        description={t('update.ready.description')}
        footer={
          <>
            <Button variant="ghost" onClick={later} disabled={restarting}>
              {t('update.later')}
            </Button>
            <Button variant="primary" icon={RotateCw} loading={restarting} onClick={restart}>
              {t('update.ready.restart')}
            </Button>
          </>
        }
      >
        <p className="text-[13px] leading-relaxed text-fg-subtle">{t('update.ready.laterNote')}</p>
      </Dialog>
    )
  }

  const manual = status.mode === 'manual'
  return (
    <Dialog
      open={open}
      onOpenChange={(next) => !next && later()}
      size="sm"
      title={t('update.available.title', { version })}
      description={manual ? t('update.available.manual') : t('update.available.auto')}
      footer={
        <>
          <Button variant="ghost" onClick={later}>
            {t('update.later')}
          </Button>
          <Button
            variant="primary"
            icon={Download}
            onClick={() => {
              later()
              if (manual) void api.reader.openExternal(RELEASES_URL)
              else void useUpdates.getState().download()
            }}
          >
            {manual ? t('update.available.download') : t('update.available.install')}
          </Button>
        </>
      }
    />
  )
}
