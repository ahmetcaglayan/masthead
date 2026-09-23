import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { ArrowRight, Check, MapPin } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { COUNTRY_OPTIONS, getCountryPack, hasLocalNews } from '@shared/countries'
import type { UiLanguage } from '@shared/settings'
import type { Article } from '@shared/types'
import { SourceCountBadge } from '@/components/news/ArticleMeta'
import { ArticleImage } from '@/components/ui/ArticleImage'
import { Button } from '@/components/ui/Button'
import { Chip } from '@/components/ui/Chip'
import { Logo } from '@/components/ui/Logo'
import { SourceLogo } from '@/components/ui/SourceLogo'
import { ChoiceCards } from '@/features/settings/ChoiceCards'
import { CountryFlag } from '@/features/settings/CountryFlag'
import { InterestPicker } from '@/features/settings/InterestPicker'
import { locationLabel } from '@/features/settings/location'
import { ProvinceList } from '@/features/settings/ProvincePicker'
import { ThemeCards } from '@/features/settings/ThemeCards'
import { useNewsView } from '@/hooks/useArticles'
import { useHotkeys } from '@/hooks/useHotkeys'
import { useNow } from '@/hooks/useNow'
import { useSource } from '@/hooks/useSources'
import i18n from '@/i18n'
import { buildHome } from '@/lib/curation'
import { tameCaps } from '@/lib/format'
import { clock } from '@/lib/time'
import { useNews } from '@/stores/news'
import { useSettings } from '@/stores/settings'
import { useUi } from '@/stores/ui'
import { Backdrop } from './Backdrop'
import { OrPressEnter, Question, StepDots } from './Question'

type Step = 'language' | 'theme' | 'country' | 'interests' | 'city'

const AVAILABLE = COUNTRY_OPTIONS.filter((o) => o.available)
/** With a single country on offer there is nothing to decide: that step is left out. */
const SINGLE_COUNTRY = AVAILABLE.length === 1
const ALL_STEPS: readonly Step[] = SINGLE_COUNTRY
  ? ['language', 'theme', 'interests', 'city']
  : ['language', 'theme', 'country', 'interests', 'city']

const LANGUAGES: readonly { value: UiLanguage; name: string; monogram: string }[] = [
  { value: 'en', name: 'English', monogram: 'EN' },
  { value: 'tr', name: 'Türkçe', monogram: 'TR' },
  { value: 'de', name: 'Deutsch', monogram: 'DE' },
  { value: 'pt', name: 'Português', monogram: 'PT' },
  { value: 'hi', name: 'हिन्दी', monogram: 'हि' }
]

function Monogram({ children }: { children: React.ReactNode }): React.JSX.Element {
  return (
    <div className="flex h-24 items-center justify-center bg-muted text-fg-muted transition-colors duration-200 group-aria-checked/choice:bg-accent-soft group-aria-checked/choice:text-accent">
      <span className="headline text-[2.5rem] leading-none font-semibold tracking-tight">{children}</span>
    </div>
  )
}

function Headline({ article }: { article: Article }): React.JSX.Element {
  const source = useSource(article.sourceId)
  return (
    <li className="flex items-start gap-3 py-2.5">
      <time className="w-10 shrink-0 pt-px font-ui text-[12.5px] font-semibold text-fg-muted tabular-nums">
        {clock(article.publishedAt, i18n.language)}
      </time>
      <SourceLogo source={source} size="xs" className="mt-0.5" />
      <span lang={source?.language ?? 'tr'} className="headline min-w-0 text-[14.5px] leading-snug font-medium text-pretty text-fg">
        {tameCaps(article.title)}
      </span>
    </li>
  )
}

/** The real front page arriving while the feeds load: the manşet and the newest three headlines. */
function FirstFrontPage(): React.JSX.Element | null {
  const view = useNewsView()
  const interests = useSettings((s) => s.settings.interests)
  const country = useSettings((s) => s.settings.country)
  // The preview shows the chosen country's own headlines, so they carry its language.
  const lang = getCountryPack(country)?.language ?? 'tr'
  const now = useNow(60_000)
  const home = useMemo(() => buildHome(view, { interests }, now), [view, interests, now])
  const hero = home.hero
  if (!hero) return null
  const newest = home.latest.filter((a) => a.id !== hero.lead.id).slice(0, 3)
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="mt-6 overflow-hidden rounded-card border border-line bg-surface text-left shadow-soft"
    >
      <ArticleImage
        article={hero.lead}
        preferResolved
        priority
        zoomOnHover={false}
        className="flex aspect-[16/9] flex-col justify-end"
      >
        <div
          aria-hidden
          className="absolute inset-0 bg-linear-to-t from-scrim via-scrim/40 via-45% to-transparent"
        />
        <div className="relative z-10 flex flex-col gap-2 p-4">
          <p lang={lang} className="headline text-xl leading-tight font-semibold text-pretty text-on-scrim">
            {tameCaps(hero.lead.title)}
          </p>
          {hero.sourceCount > 1 && (
            <SourceCountBadge count={hero.sourceCount} inverse className="self-start" />
          )}
        </div>
      </ArticleImage>
      {newest.length > 0 && (
        <ul className="divide-y divide-line px-4">
          {newest.map((a) => (
            <Headline key={a.id} article={a} />
          ))}
        </ul>
      )}
    </motion.div>
  )
}

function FinishCard({ onStart }: { onStart: () => void }): React.JSX.Element {
  const { t } = useTranslation('onboarding')
  const status = useNews((s) => s.status)
  const stories = useNews((s) => s.snapshot?.articles.length ?? 0)
  const refreshing = status.state === 'refreshing' && status.total > 0

  return (
    <div className="rounded-panel border border-line bg-glass px-8 pt-9 pb-8 text-center shadow-card backdrop-blur-xl">
      <div className="mx-auto mb-5 flex size-12 items-center justify-center rounded-full bg-accent-soft text-accent">
        <Check size={22} strokeWidth={2.25} aria-hidden />
      </div>
      <h2 className="headline text-3xl leading-tight font-semibold text-fg">{t('finish.title')}</h2>
      <p className="mt-2 text-[15px] text-fg-muted" aria-live="polite">
        {refreshing
          ? t('finish.fetching', { done: status.done, total: status.total })
          : stories > 0
            ? t('finish.ready', { count: stories })
            : t('finish.soon')}
      </p>
      <AnimatePresence initial={false}>
        {refreshing && (
          <motion.div
            aria-hidden
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mx-auto mt-4 h-1 w-48 overflow-hidden rounded-full bg-subtle"
          >
            <motion.div
              className="h-full origin-left rounded-full bg-accent"
              initial={false}
              animate={{ scaleX: Math.max(0.04, status.done / status.total) }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            />
          </motion.div>
        )}
      </AnimatePresence>
      <FirstFrontPage />
      <div className="mt-8 flex flex-col items-center gap-3">
        <Button variant="primary" size="lg" iconRight={ArrowRight} onClick={onStart} className="px-7">
          {t('finish.cta')}
        </Button>
        <OrPressEnter />
      </div>
      <p className="mt-6 text-[13px] text-fg-subtle">{t('finish.later')}</p>
    </div>
  )
}

/**
 * First run: short questions revealed one after another (language, theme,
 * country when there is a choice, interests, city), each applied as soon as it
 * is answered. News starts loading as early as possible (at once when only one
 * country is on offer, else once it is confirmed), so the closing card can
 * already show the real front page. Enter always moves on.
 */
export function Onboarding(): React.JSX.Element {
  const { t } = useTranslation('onboarding')
  const settings = useSettings((s) => s.settings)
  const update = useSettings((s) => s.update)
  const reducedMotion = useReducedMotion()
  // Questions shown so far; FINISH + 1 means the closing card is shown too.
  const [revealed, setRevealed] = useState(1)
  const [leaving, setLeaving] = useState(false)
  const sections = useRef<(HTMLElement | null)[]>([])
  const newsStarted = useRef(false)
  const current = revealed - 1
  // Countries without a province pack have no Local page, so they skip the city question.
  const steps = useMemo(
    () => (hasLocalNews(settings.country) ? ALL_STEPS : ALL_STEPS.filter((step) => step !== 'city')),
    [settings.country]
  )
  const finish = steps.length

  // Bring each newly revealed question into view and move focus into it.
  useEffect(() => {
    if (revealed <= 1) return
    const el = sections.current[revealed - 1]
    if (!el) return
    const frame = requestAnimationFrame(() => {
      el.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'center' })
      ;(el.querySelector<HTMLElement>('input') ?? el).focus({ preventScroll: true })
    })
    return () => cancelAnimationFrame(frame)
  }, [revealed, reducedMotion])

  // Settings keep only the user's own switches; off-by-default sources need no seeding
  // (see isSourceEnabled), so fetching can start as soon as the country is known.
  const startNews = (): void => {
    if (newsStarted.current) return
    newsStarted.current = true
    useNews
      .getState()
      .refresh()
      .catch(() => undefined)
  }

  // Only one country to choose from: it is known already, so start fetching right away.
  useEffect(() => {
    if (!SINGLE_COUNTRY || newsStarted.current) return
    newsStarted.current = true
    useNews
      .getState()
      .refresh()
      .catch(() => undefined)
  }, [])

  /** Answer question `index` and reveal the next one (answering an earlier question again reveals nothing new). */
  const confirm = (index: number): void => {
    if (index === finish) {
      startNews() // normally already running
      setLeaving(true)
      return
    }
    if (steps[index] === 'country') startNews()
    setRevealed((n) => Math.max(n, index + 2))
  }

  // Let the fade-out play, then hand over to the app on the front page. A timer rather than an
  // animation callback, so it completes even when the window is hidden mid-animation.
  useEffect(() => {
    if (!leaving) return
    const timer = setTimeout(
      () => {
        useUi.setState({ route: { name: 'home' }, history: [] })
        void useSettings.getState().update({ onboardingCompleted: true })
      },
      reducedMotion ? 0 : 220
    )
    return () => clearTimeout(timer)
  }, [leaving, reducedMotion])

  useHotkeys([
    {
      combo: 'Enter',
      preventDefault: false,
      enabled: !leaving,
      handler: (e) => {
        // Enter on a button or option keeps its own meaning.
        if (e.target instanceof Element && e.target.closest('button, a, [role="option"]')) return
        e.preventDefault()
        confirm(Math.min(current, finish))
      }
    }
  ])

  const pack = getCountryPack(settings.country)
  const place = locationLabel(t, settings.country, settings.location)
  const onlyCountry = SINGLE_COUNTRY ? AVAILABLE[0].code : undefined
  const questionProps = (index: number) => ({
    index,
    kicker: t(`${steps[index]}.kicker`),
    title: t(`${steps[index]}.title`),
    hint: t(`${steps[index]}.hint`),
    answered: index < current,
    current: index === current,
    onContinue: () => confirm(index),
    ref: (el: HTMLElement | null) => {
      sections.current[index] = el
    }
  })

  const question = (step: Step, index: number): React.ReactNode => {
    const labelledBy = `onboarding-q${index}`
    switch (step) {
      case 'language':
        return (
          <ChoiceCards<UiLanguage>
            size="lg"
            columns={2}
            aria-labelledby={labelledBy}
            value={settings.language}
            onChange={(language) => void update({ language })}
            onPick={() => confirm(index)}
            options={LANGUAGES.map((l) => ({
              value: l.value,
              label: l.name,
              // Each card speaks its own language.
              description: i18n.getFixedT(l.value, 'onboarding')('language.cardHint'),
              visual: <Monogram>{l.monogram}</Monogram>
            }))}
          />
        )
      case 'theme':
        return (
          <ThemeCards
            size="lg"
            aria-labelledby={labelledBy}
            value={settings.theme}
            onChange={(theme) => void update({ theme })}
            onPick={() => confirm(index)}
          />
        )
      case 'country':
        return (
          <>
            <ChoiceCards
              size="lg"
              columns={1}
              aria-labelledby={labelledBy}
              value={settings.country}
              onChange={(country) => void update({ country })}
              onPick={() => confirm(index)}
              options={AVAILABLE.map((o) => ({
                value: o.code,
                label: (
                  <span className="flex items-center gap-3 text-base">
                    <CountryFlag code={o.code} className="h-5 w-[30px]" />
                    {t(`common:country.${o.code}`)}
                  </span>
                ),
                description: t('country.stats', {
                  sources: getCountryPack(o.code)?.sources.length ?? 0,
                  cities: getCountryPack(o.code)?.provinces.length ?? 0
                })
              }))}
            />
            <div className="mt-5">
              <div className="mb-2.5 text-[11px] font-semibold tracking-wider text-fg-subtle uppercase">
                {t('country.comingSoon')}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {COUNTRY_OPTIONS.filter((o) => !o.available).map((o) => (
                  <Chip key={o.code} className="opacity-60">
                    {t(`common:country.${o.code}`)}
                  </Chip>
                ))}
              </div>
            </div>
          </>
        )
      case 'interests':
        return (
          <InterestPicker
            aria-labelledby={labelledBy}
            value={settings.interests}
            onChange={(interests) => void update({ interests })}
          />
        )
      case 'city':
        return (
          <>
            {pack && (
              <div className="overflow-hidden rounded-card border border-line bg-surface shadow-soft">
                <ProvinceList
                  value={settings.location}
                  country={settings.country}
                  onSelect={(location) => {
                    void update({ location })
                    confirm(index)
                  }}
                  onEnterEmpty={() => confirm(index)}
                  listClassName="max-h-72"
                />
              </div>
            )}
            {place && (
              <p className="mt-3 flex items-center gap-2 text-sm text-fg-muted">
                <MapPin size={15} strokeWidth={1.75} aria-hidden className="text-accent" />
                {t('city.chosen', { place })}
              </p>
            )}
          </>
        )
    }
  }

  return (
    <motion.div
      className="relative h-full overflow-hidden bg-canvas text-fg"
      initial={{ opacity: 0 }}
      animate={leaving ? { opacity: 0, scale: 0.985 } : { opacity: 1, scale: 1 }}
      transition={{ duration: leaving ? 0.2 : 0.4, ease: 'easeOut' }}
    >
      <Backdrop />

      <div className="drag absolute inset-x-0 top-0 z-20 flex h-(--titlebar-height) items-center justify-center bg-linear-to-b from-canvas to-transparent">
        <StepDots current={current} total={steps.length} />
      </div>

      <div className="relative z-10 h-full overflow-y-auto">
        <main className="mx-auto flex max-w-xl flex-col px-6 pt-[max(6rem,14vh)] pb-[40vh]">
          <motion.header
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: 'easeOut', delay: 0.05 }}
          >
            <Logo size={30} className="text-[19px]" />
            <h1 className="headline mt-9 text-5xl leading-[1.05] font-semibold tracking-tight text-fg">
              {t('intro.headline')}
            </h1>
            <p className="mt-4 text-lg leading-relaxed text-fg-muted text-pretty">
              {t(steps.length > 4 ? 'intro.subtitleWithCountry' : 'intro.subtitle')}
            </p>
            {onlyCountry && (
              <p className="mt-3 flex items-center gap-2 text-[13px] text-fg-subtle">
                <CountryFlag code={onlyCountry} className="h-3 w-[18px] rounded-[2px]" />
                {t('intro.country', {
                  country: t(`common:country.${onlyCountry}`),
                  sources: getCountryPack(onlyCountry)?.sources.length ?? 0
                })}
              </p>
            )}
          </motion.header>

          <div className="mt-16 flex flex-col gap-20">
            {steps.map(
              (step, index) =>
                revealed > index && (
                  <Question
                    key={step}
                    {...questionProps(index)}
                    continueLabel={step === 'city' ? (place ? t('continue') : t('city.skip')) : undefined}
                  >
                    {question(step, index)}
                  </Question>
                )
            )}

            {revealed > finish && (
              <motion.section
                ref={(el) => {
                  sections.current[finish] = el
                }}
                tabIndex={-1}
                aria-label={t('finish.title')}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="scroll-my-24 outline-none"
              >
                <FinishCard onStart={() => confirm(finish)} />
              </motion.section>
            )}
          </div>
        </main>
      </div>
    </motion.div>
  )
}
