import { useState } from 'react'
import { AlertDialog, Dialog as RDialog } from 'radix-ui'
import { X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/cn'
import { Button } from './Button'
import { IconButton } from './IconButton'
import './ui.css'

const OVERLAY = 'mh-overlay fixed inset-0 z-50 bg-overlay backdrop-blur-[3px]'
const PANEL =
  'mh-dialog fixed top-1/2 left-1/2 z-50 flex max-h-[calc(100vh-4rem)] w-[calc(100vw-2rem)] -translate-x-1/2 -translate-y-1/2 flex-col rounded-panel border border-line bg-surface font-ui text-fg shadow-float outline-none'

const WIDTHS = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl' } as const

export interface DialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: React.ReactNode
  description?: React.ReactNode
  /** Right-aligned action row (buttons). */
  footer?: React.ReactNode
  size?: keyof typeof WIDTHS
  /** Hide the × button in the corner. */
  hideClose?: boolean
  className?: string
  children?: React.ReactNode
}

/** Centred modal panel over a blurred backdrop (Radix Dialog); Esc and outside click close it. */
export function Dialog({
  open,
  onOpenChange,
  title,
  description,
  footer,
  size = 'md',
  hideClose = false,
  className,
  children
}: DialogProps): React.JSX.Element {
  const { t } = useTranslation('common')
  return (
    <RDialog.Root open={open} onOpenChange={onOpenChange}>
      <RDialog.Portal>
        <RDialog.Overlay className={OVERLAY} />
        <RDialog.Content className={cn(PANEL, WIDTHS[size], className)}>
          <div className="flex items-start gap-4 px-6 pt-6">
            <div className="min-w-0 flex-1">
              <RDialog.Title className="headline text-xl leading-tight font-semibold">{title}</RDialog.Title>
              {description ? (
                <RDialog.Description className="mt-1.5 text-sm leading-relaxed text-fg-muted text-pretty">
                  {description}
                </RDialog.Description>
              ) : (
                <RDialog.Description className="sr-only">{title}</RDialog.Description>
              )}
            </div>
            {!hideClose && (
              <RDialog.Close asChild>
                <IconButton
                  label={t('actions.close')}
                  icon={X}
                  size="sm"
                  tooltip={false}
                  className="-mt-1 -mr-2"
                />
              </RDialog.Close>
            )}
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto px-6 pt-4 pb-6">{children}</div>
          {footer && (
            <div className="flex items-center justify-end gap-2 border-t border-line px-6 py-4">{footer}</div>
          )}
        </RDialog.Content>
      </RDialog.Portal>
    </RDialog.Root>
  )
}

export interface ConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: React.ReactNode
  description?: React.ReactNode
  /** Defaults to "Confirm". */
  confirmLabel?: string
  /** Defaults to "Cancel". */
  cancelLabel?: string
  /** Red confirm button for destructive actions. */
  danger?: boolean
  /** May return a promise; the button shows a spinner until it settles, then the dialog closes. */
  onConfirm: () => void | Promise<void>
}

/** Yes/no confirmation (Radix AlertDialog): focus starts on Cancel, Esc cancels. */
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  cancelLabel,
  danger = false,
  onConfirm
}: ConfirmDialogProps): React.JSX.Element {
  const { t } = useTranslation('common')
  const [busy, setBusy] = useState(false)

  const confirm = async (): Promise<void> => {
    setBusy(true)
    try {
      await onConfirm()
      onOpenChange(false)
    } finally {
      setBusy(false)
    }
  }

  return (
    <AlertDialog.Root open={open} onOpenChange={(next) => !busy && onOpenChange(next)}>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className={OVERLAY} />
        <AlertDialog.Content className={cn(PANEL, 'max-w-md p-6')}>
          <AlertDialog.Title className="headline text-xl leading-tight font-semibold">
            {title}
          </AlertDialog.Title>
          {description ? (
            <AlertDialog.Description className="mt-2 text-sm leading-relaxed text-fg-muted text-pretty">
              {description}
            </AlertDialog.Description>
          ) : (
            <AlertDialog.Description className="sr-only">{title}</AlertDialog.Description>
          )}
          <div className="mt-6 flex justify-end gap-2">
            <AlertDialog.Cancel asChild>
              <Button variant="ghost" disabled={busy}>
                {cancelLabel ?? t('actions.cancel')}
              </Button>
            </AlertDialog.Cancel>
            <Button
              variant={danger ? 'danger' : 'primary'}
              className={
                danger ? 'bg-breaking text-on-breaking hover:bg-breaking hover:opacity-90' : undefined
              }
              loading={busy}
              onClick={() => void confirm()}
            >
              {confirmLabel ?? t('actions.confirm')}
            </Button>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  )
}
