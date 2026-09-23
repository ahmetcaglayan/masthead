import { Toaster as Sonner } from 'sonner'
import { CircleAlert, CircleCheck, Info, TriangleAlert } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useResolvedTheme } from '@/hooks/useResolvedTheme'
import { Spinner } from './Spinner'

export { toast } from 'sonner'

const TOKENS = {
  '--normal-bg': 'var(--surface)',
  '--normal-border': 'var(--line-strong)',
  '--normal-text': 'var(--fg)',
  '--success-bg': 'var(--surface)',
  '--success-border': 'var(--line-strong)',
  '--success-text': 'var(--fg)',
  '--info-bg': 'var(--surface)',
  '--info-border': 'var(--line-strong)',
  '--info-text': 'var(--fg)',
  '--warning-bg': 'var(--surface)',
  '--warning-border': 'var(--line-strong)',
  '--warning-text': 'var(--fg)',
  '--error-bg': 'var(--surface)',
  '--error-border': 'var(--line-strong)',
  '--error-text': 'var(--fg)',
  '--border-radius': 'var(--radius-card)'
} as React.CSSProperties

/**
 * App-wide toast host (sonner), themed with the design tokens. Mount once;
 * show toasts with `toast('…')`, `toast.success('…')`, `toast.error('…')` from this module.
 */
export function Toaster(): React.JSX.Element {
  const theme = useResolvedTheme()
  const { t } = useTranslation('common')
  return (
    <Sonner
      theme={theme}
      position="bottom-right"
      offset={20}
      gap={10}
      visibleToasts={4}
      style={TOKENS}
      containerAriaLabel={t('a11y.notifications')}
      icons={{
        success: <CircleCheck size={17} strokeWidth={1.75} className="text-live" />,
        info: <Info size={17} strokeWidth={1.75} className="text-accent-ink" />,
        warning: <TriangleAlert size={17} strokeWidth={1.75} className="text-warning" />,
        error: <CircleAlert size={17} strokeWidth={1.75} className="text-breaking" />,
        loading: <Spinner size={17} label={null} className="text-fg-muted" />
      }}
      toastOptions={{
        closeButtonAriaLabel: t('actions.close'),
        classNames: {
          toast: 'font-ui shadow-float! gap-2.5! px-4! py-3!',
          title: 'text-[13.5px]! font-medium! leading-snug!',
          description: 'text-[12.5px]! text-fg-muted!',
          actionButton: 'rounded-full! bg-accent! text-on-accent! font-medium!',
          cancelButton: 'rounded-full! bg-muted! text-fg!'
        }
      }}
    />
  )
}
