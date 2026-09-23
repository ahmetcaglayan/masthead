import { Fragment, useCallback, useEffect, useId, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import {
  Bell,
  ChartCandlestick,
  Database,
  EyeOff,
  Languages,
  Palette,
  RefreshCw,
  Rss,
  Settings as SettingsIcon,
  Sparkles,
  BookOpen,
  Type,
  type LucideIcon
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Page } from '@/components/layout/Page'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { Switch } from '@/components/ui/Switch'
import { SourcesList } from '@/features/sources/SourcesList'
import { useMainScroll } from '@/hooks/useMainScroll'
import { useProgressive } from '@/hooks/useProgressive'
import { cn } from '@/lib/cn'
import { useSettings } from '@/stores/settings'
import { AppearanceSection } from './AppearanceSection'
import { DataSection } from './DataSection'
import { InterestPicker } from './InterestPicker'
import { LanguageRegionSection } from './LanguageRegionSection'
import { MarketsSection } from './MarketsSection'
import { MutedSection } from './MutedSection'
import { NotificationsSection, ReadingSection, UpdatesSection } from './ReadingSections'
import { SETTINGS_SECTIONS, sectionElementId, type SettingsSectionId } from './sections'
import { SettingRow, SettingsCard, SettingsSection } from './SettingsLayout'
import { TypographySection } from './TypographySection'

const ICONS: Record<SettingsSectionId, LucideIcon> = {
  appearance: Palette,
  typography: Type,
  language: Languages,
  interests: Sparkles,
  muted: EyeOff,
  markets: ChartCandlestick,
  sources: Rss,
  reading: BookOpen,
  notifications: Bell,
  updates: RefreshCw,
  data: Database
}

const isSection = (id: string | undefined): id is SettingsSectionId =>
  (SETTINGS_SECTIONS as readonly (string | undefined)[]).includes(id)

/** How far below the scroller's top edge a section counts as the one being read. */
const READING_LINE = 140

/**
 * The section being read in the page scroller: the last one whose top has
 * passed the reading line, or the last section once the page bottoms out.
 */
function useActiveSection(
  scroller: HTMLElement | null
): [SettingsSectionId, (id: SettingsSectionId) => void] {
  const [active, setActive] = useState<SettingsSectionId>(SETTINGS_SECTIONS[0])
  // While a nav click scrolls smoothly, keep the clicked item lit instead of flickering through the others.
  const pinnedUntil = useRef(0)

  useEffect(() => {
    if (!scroller) return
    let frame = 0
    const measure = (): void => {
      frame = 0
      if (Date.now() < pinnedUntil.current) return
      const top = scroller.getBoundingClientRect().top + READING_LINE
      let current: SettingsSectionId = SETTINGS_SECTIONS[0]
      for (const id of SETTINGS_SECTIONS) {
        const el = document.getElementById(sectionElementId(id))
        if (el && el.getBoundingClientRect().top <= top) current = id
      }
      if (scroller.scrollTop + scroller.clientHeight >= scroller.scrollHeight - 2) {
        current = SETTINGS_SECTIONS[SETTINGS_SECTIONS.length - 1]
      }
      setActive(current)
    }
    const onScroll = (): void => {
      if (!frame) frame = requestAnimationFrame(measure)
    }
    const onScrollEnd = (): void => {
      pinnedUntil.current = 0
      onScroll()
    }
    scroller.addEventListener('scroll', onScroll, { passive: true })
    scroller.addEventListener('scrollend', onScrollEnd)
    measure()
    return () => {
      scroller.removeEventListener('scroll', onScroll)
      scroller.removeEventListener('scrollend', onScrollEnd)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [scroller])

  const pin = useCallback((id: SettingsSectionId) => {
    pinnedUntil.current = Date.now() + 1200
    setActive(id)
  }, [])

  return [active, pin]
}

function SectionNav({
  active,
  onSelect
}: {
  active: SettingsSectionId
  onSelect: (id: SettingsSectionId) => void
}): React.JSX.Element {
  const { t } = useTranslation('settings')
  return (
    <nav aria-label={t('page.sections')} className="sticky top-8 hidden self-start @3xl:block">
      <ul className="flex flex-col gap-0.5">
        {SETTINGS_SECTIONS.map((id) => {
          const Icon = ICONS[id]
          const current = id === active
          return (
            <li key={id}>
              <a
                href={`#${sectionElementId(id)}`}
                aria-current={current ? 'location' : undefined}
                onClick={(e) => {
                  e.preventDefault()
                  onSelect(id)
                }}
                className={cn(
                  'relative z-0 flex h-9 items-center gap-3 rounded-xl px-3 text-[13.5px] font-medium transition-colors duration-150 in-data-[density=compact]:h-8',
                  current ? 'text-fg' : 'text-fg-muted hover:text-fg'
                )}
              >
                {current && (
                  <motion.span
                    layoutId="settings-nav-active"
                    aria-hidden
                    className="absolute inset-0 -z-10 rounded-xl bg-surface shadow-soft ring-1 ring-line"
                    transition={{ type: 'spring', bounce: 0.15, duration: 0.35 }}
                  />
                )}
                <Icon
                  size={17}
                  strokeWidth={1.75}
                  aria-hidden
                  className={cn('shrink-0 transition-colors', current ? 'text-accent-ink' : 'text-fg-subtle')}
                />
                <span className="truncate">{t(`nav.${id}`)}</span>
              </a>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

function InterestsSection(): React.JSX.Element {
  const { t } = useTranslation('settings')
  const interests = useSettings((s) => s.settings.interests)
  const historyOn = useSettings((s) => s.settings.personalization.useHistory)
  const historyId = useId()
  return (
    <SettingsSection id="interests" title={t('nav.interests')} description={t('interests.description')}>
      <SettingsCard>
        <div className="px-6 py-5 in-data-[density=compact]:px-5 in-data-[density=compact]:py-4">
          <InterestPicker
            value={interests}
            onChange={(next) => void useSettings.getState().update({ interests: next })}
            aria-label={t('nav.interests')}
          />
        </div>
        <SettingRow
          label={t('interests.history')}
          description={t('interests.historyHint')}
          htmlFor={historyId}
          control={
            <Switch
              id={historyId}
              checked={historyOn}
              onCheckedChange={(on) =>
                void useSettings.getState().update({ personalization: { useHistory: on } })
              }
            />
          }
        />
      </SettingsCard>
    </SettingsSection>
  )
}

/**
 * Settings: a sticky section index on the left and grouped cards on the right.
 * Every change is saved immediately. `section` scrolls to that section
 * (see SETTINGS_SECTIONS), also when the route changes while the page is open.
 */
export function SettingsPage({ section }: { section?: string }): React.JSX.Element {
  const { t } = useTranslation('settings')
  const { element: scroller } = useMainScroll()
  const [active, pin] = useActiveSection(scroller)
  const reducedMotion = useReducedMotion()
  const mounted = useRef(false)
  // The first sections paint at once and the rest follow a frame at a time; a requested section
  // (and everything above it) is there from the start so it can be scrolled to.
  const needed = isSection(section) ? SETTINGS_SECTIONS.indexOf(section) + 1 : 0
  const shown = useProgressive(SETTINGS_SECTIONS.length, Math.max(2, needed), 1)
  const reachable = shown >= needed

  const scrollTo = useCallback(
    (id: SettingsSectionId, behavior: ScrollBehavior) => {
      const el = document.getElementById(sectionElementId(id))
      if (!el) return
      pin(id)
      el.scrollIntoView({ behavior: reducedMotion ? 'auto' : behavior, block: 'start' })
    },
    [pin, reducedMotion]
  )

  useEffect(() => {
    if (!reachable) return
    if (isSection(section)) scrollTo(section, mounted.current ? 'smooth' : 'auto')
    mounted.current = true
  }, [section, scrollTo, reachable])

  const sections: Record<SettingsSectionId, React.ReactNode> = {
    appearance: <AppearanceSection />,
    typography: <TypographySection />,
    language: <LanguageRegionSection />,
    interests: <InterestsSection />,
    muted: <MutedSection />,
    markets: <MarketsSection />,
    sources: (
      <SettingsSection id="sources" title={t('nav.sources')} description={t('sources.description')}>
        <SourcesList />
      </SettingsSection>
    ),
    reading: <ReadingSection />,
    notifications: <NotificationsSection />,
    updates: <UpdatesSection />,
    data: <DataSection />
  }

  return (
    <Page measure="5xl">
      <div className="@container">
        <SectionHeader
          size="lg"
          kicker={t('page.kicker')}
          icon={SettingsIcon}
          title={t('page.title')}
          description={t('page.description')}
        />
        <div className="mt-10 grid gap-10 @3xl:grid-cols-[13rem_minmax(0,1fr)] @3xl:gap-12">
          <SectionNav active={active} onSelect={(id) => scrollTo(id, 'smooth')} />
          <div className="flex min-w-0 flex-col gap-14 in-data-[density=compact]:gap-10">
            {SETTINGS_SECTIONS.slice(0, shown).map((id) => (
              <Fragment key={id}>{sections[id]}</Fragment>
            ))}
          </div>
        </div>
      </div>
    </Page>
  )
}
