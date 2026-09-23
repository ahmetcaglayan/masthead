import { useId } from 'react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/cn'

/**
 * The Masthead mark (assets/logo.svg): an ember-gradient tile with a white M
 * and the masthead rule. Brand colours are fixed on purpose — the mark does not
 * follow the accent setting.
 */
export function LogoMark({ size = 24, className }: { size?: number; className?: string }): React.JSX.Element {
  const id = `logo-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}-`
  return (
    <svg
      width={size}
      height={size}
      viewBox="64 64 896 896"
      fill="none"
      aria-hidden
      className={cn('shrink-0', className)}
    >
      <defs>
        <linearGradient id={`${id}bg`} x1="96" y1="64" x2="928" y2="960" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#FF8A4C" />
          <stop offset="0.55" stopColor="#F4502F" />
          <stop offset="1" stopColor="#D92D4B" />
        </linearGradient>
        <radialGradient
          id={`${id}glow`}
          cx="0"
          cy="0"
          r="1"
          gradientUnits="userSpaceOnUse"
          gradientTransform="translate(300 180) rotate(55) scale(760 620)"
        >
          <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.28" />
          <stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect x="64" y="64" width="896" height="896" rx="212" fill={`url(#${id}bg)`} />
      <rect x="64" y="64" width="896" height="896" rx="212" fill={`url(#${id}glow)`} />
      <path
        d="M300 690 V340 L512 572 L724 340 V690"
        stroke="#FFFFFF"
        strokeWidth="112"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect x="244" y="778" width="536" height="30" rx="15" fill="#FFFFFF" fillOpacity="0.92" />
      <rect x="244" y="834" width="330" height="22" rx="11" fill="#FFFFFF" fillOpacity="0.45" />
    </svg>
  )
}

/** Logo mark plus the app name as a wordmark in the headline face. */
export function Logo({ size = 24, className }: { size?: number; className?: string }): React.JSX.Element {
  const { t } = useTranslation('common')
  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <LogoMark size={size} />
      <span className="headline text-[1.2em] leading-none font-semibold tracking-[-0.02em] text-fg">
        {t('app.name')}
      </span>
    </span>
  )
}
