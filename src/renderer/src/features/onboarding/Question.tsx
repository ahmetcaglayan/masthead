import { AnimatePresence, motion } from 'motion/react'
import { ArrowRight, Check } from 'lucide-react'
import { Trans, useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/Button'
import { Kbd } from '@/components/ui/Kbd'
import { cn } from '@/lib/cn'

export interface QuestionProps {
  index: number
  kicker: string
  title: string
  hint?: string
  /** Answered questions show a check in place of their number. */
  answered: boolean
  /** The newest question shows the Continue row. */
  current: boolean
  onContinue: () => void
  continueLabel?: string
  children: React.ReactNode
  ref?: React.Ref<HTMLElement>
}

/** "or press ⏎", with the key cap inside the sentence (Turkish puts the verb after it). */
export function OrPressEnter(): React.JSX.Element {
  const { t } = useTranslation('onboarding')
  return (
    <span className="flex items-center gap-1.5 text-xs text-fg-subtle">
      <Trans t={t} i18nKey="orPress" components={[<Kbd key="enter" combo="Enter" />]} />
    </span>
  )
}

/** One onboarding question: numbered kicker, serif title, hint, its controls and a Continue row. */
export function Question({
  index,
  kicker,
  title,
  hint,
  answered,
  current,
  onContinue,
  continueLabel,
  children,
  ref
}: QuestionProps): React.JSX.Element {
  const { t } = useTranslation('onboarding')
  const titleId = `onboarding-q${index}`
  return (
    <motion.section
      ref={ref}
      tabIndex={-1}
      aria-labelledby={titleId}
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="scroll-my-24 outline-none"
    >
      <div className="mb-2 flex items-center gap-2 text-[11px] font-semibold tracking-wider text-accent uppercase">
        <span className="flex size-4 items-center justify-center tabular-nums">
          {answered ? <Check size={13} strokeWidth={2.75} aria-hidden /> : String(index + 1).padStart(2, '0')}
        </span>
        <span className="h-px w-4 bg-accent/40" aria-hidden />
        <span>{kicker}</span>
      </div>
      <h2 id={titleId} className="headline text-[1.75rem] leading-tight font-semibold text-fg">
        {title}
      </h2>
      {hint && <p className="mt-1.5 text-[15px] leading-relaxed text-fg-muted text-pretty">{hint}</p>}
      <div className="mt-6">{children}</div>
      <AnimatePresence initial={false}>
        {current && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="overflow-hidden"
          >
            <div className="flex items-center gap-3 pt-6">
              <Button variant="primary" iconRight={ArrowRight} onClick={onContinue}>
                {continueLabel ?? t('continue')}
              </Button>
              <OrPressEnter />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  )
}

/** One dot per step: done steps filled, the current one stretched into a pill. */
export function StepDots({ current, total }: { current: number; total: number }): React.JSX.Element {
  const { t } = useTranslation('onboarding')
  const step = Math.min(current + 1, total)
  return (
    <div
      role="progressbar"
      aria-valuemin={1}
      aria-valuemax={total}
      aria-valuenow={step}
      aria-label={t('progress', { current: step, total })}
      className="flex items-center gap-1.5"
    >
      {Array.from({ length: total }, (_, i) => (
        <motion.span
          key={i}
          initial={false}
          animate={{ width: i === current ? 22 : 6 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className={cn(
            'block h-1.5 rounded-full transition-colors duration-200',
            i <= current ? 'bg-accent' : 'bg-line-strong'
          )}
        />
      ))}
    </div>
  )
}
