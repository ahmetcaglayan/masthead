import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { useTranslation } from 'react-i18next'
import { TOPIC_CATEGORIES, type CategoryId } from '@shared/categories'
import { ToggleChip } from '@/components/ui/Chip'
import { CATEGORY_ICONS, categoryLabel } from '@/lib/categories'
import { useSettings } from '@/stores/settings'

export interface InterestPickerProps {
  value: readonly CategoryId[]
  /** The new selection, in the canonical topic order. */
  onChange: (value: CategoryId[]) => void
  size?: 'sm' | 'md'
  className?: string
  'aria-label'?: string
  'aria-labelledby'?: string
}

/**
 * Topic chips with icons. At least one topic always stays selected; trying to
 * clear the last one shows a short hint instead.
 */
export function InterestPicker({
  value,
  onChange,
  size = 'md',
  className,
  ...aria
}: InterestPickerProps): React.JSX.Element {
  const { t } = useTranslation('settings')
  const country = useSettings((s) => s.settings.country)
  const [blocked, setBlocked] = useState(false)

  useEffect(() => {
    if (!blocked) return
    const timer = setTimeout(() => setBlocked(false), 2400)
    return () => clearTimeout(timer)
  }, [blocked])

  const toggle = (id: CategoryId, on: boolean): void => {
    if (!on && value.length <= 1) {
      setBlocked(true)
      return
    }
    const next = new Set(value)
    if (on) next.add(id)
    else next.delete(id)
    onChange(TOPIC_CATEGORIES.filter((c) => next.has(c)))
  }

  return (
    <div className={className}>
      <div role="group" {...aria} className="flex flex-wrap gap-2">
        {TOPIC_CATEGORIES.map((id) => (
          <ToggleChip
            key={id}
            size={size}
            icon={CATEGORY_ICONS[id]}
            selected={value.includes(id)}
            onSelectedChange={(on) => toggle(id, on)}
          >
            {categoryLabel(t, id, country)}
          </ToggleChip>
        ))}
      </div>
      <AnimatePresence initial={false}>
        {blocked && (
          <motion.p
            role="status"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="overflow-hidden text-[13px] text-warning"
          >
            <span className="block pt-3">{t('interests.keepOne')}</span>
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}
