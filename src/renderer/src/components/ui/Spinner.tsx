import { LoaderCircle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/cn'

export interface SpinnerProps {
  /** Icon size in px. Default 16. */
  size?: number
  className?: string
  /** Accessible label; defaults to "Loading…". Pass `null` when a parent already announces it. */
  label?: string | null
}

/** Indeterminate spinner in the current text colour. */
export function Spinner({ size = 16, className, label }: SpinnerProps): React.JSX.Element {
  const { t } = useTranslation('common')
  const text = label === undefined ? t('states.loading') : label
  return (
    <LoaderCircle
      size={size}
      strokeWidth={1.75}
      className={cn('shrink-0 animate-spin', className)}
      role={text ? 'status' : undefined}
      aria-label={text ?? undefined}
      aria-hidden={text ? undefined : true}
    />
  )
}
