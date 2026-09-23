import { useTranslation } from 'react-i18next'
import type { ThemeMode } from '@shared/settings'
import { ChoiceCards, type ChoiceOption } from './ChoiceCards'

/*
 * The previews draw each theme as it looks regardless of the theme on screen,
 * so they carry their own copies of the paper and ink palettes. This is the
 * one place colours are spelled out; keep them in step with globals.css.
 */
const PALETTES = {
  light: {
    canvas: '#f6f4ef',
    surface: '#ffffff',
    muted: '#e9e5dc',
    line: 'rgb(40 34 24 / 0.1)',
    ink: '#1b1915',
    faint: '#d5cfc3',
    image: 'linear-gradient(140deg, #f3cfa9 0%, #e39a74 55%, #b9604d 100%)'
  },
  dark: {
    canvas: '#13120f',
    surface: '#1d1c19',
    muted: '#272521',
    line: 'rgb(255 245 230 / 0.08)',
    ink: '#e6e2d9',
    faint: '#3b3832',
    image: 'linear-gradient(140deg, #4a4238 0%, #5d4a42 60%, #8a5a43 100%)'
  }
} as const

type Palette = (typeof PALETTES)[keyof typeof PALETTES]

/** A miniature Masthead window: title bar, sidebar, a manşet card and two small stories. */
function MiniApp({ palette: p, className }: { palette: Palette; className?: string }): React.JSX.Element {
  const bar = (width: string, color: string = p.faint, height = '5%'): React.JSX.Element => (
    <span className="block rounded-full" style={{ width, height, background: color }} />
  )
  return (
    <div className={className} style={{ background: p.canvas }}>
      <div
        className="flex h-[15%] items-center gap-[4%] px-[5%]"
        style={{ borderBottom: `1px solid ${p.line}` }}
      >
        <span className="aspect-square h-[42%] rounded-[3px] bg-accent" />
        <span className="mx-auto h-[38%] w-[36%] rounded-full" style={{ background: p.muted }} />
        <span className="aspect-square h-[32%] rounded-full" style={{ background: p.faint }} />
      </div>
      <div className="flex h-[85%]">
        <div
          className="flex w-[23%] flex-col gap-[9%] px-[4%] pt-[8%]"
          style={{ borderRight: `1px solid ${p.line}` }}
        >
          <span className="block h-[7%] w-full rounded-full bg-accent-soft" />
          {bar('80%')}
          {bar('64%')}
          {bar('72%')}
          {bar('52%')}
        </div>
        <div className="flex flex-1 gap-[5%] p-[5%]">
          <div
            className="flex flex-[1.55] flex-col gap-[5%] rounded-[4px] p-[4%]"
            style={{ background: p.surface, boxShadow: `0 0 0 1px ${p.line}` }}
          >
            <span className="block h-[52%] rounded-[3px]" style={{ background: p.image }} />
            {bar('92%', p.ink, '6%')}
            {bar('70%', p.ink, '6%')}
            {bar('84%')}
            {bar('60%')}
          </div>
          <div className="flex flex-1 flex-col gap-[7%]">
            {[0, 1].map((i) => (
              <div
                key={i}
                className="flex flex-1 flex-col gap-[9%] rounded-[4px] p-[7%]"
                style={{ background: p.surface, boxShadow: `0 0 0 1px ${p.line}` }}
              >
                <span className="block h-[38%] rounded-[2px]" style={{ background: p.muted }} />
                {bar('90%', p.ink, '9%')}
                {bar('64%', p.faint, '8%')}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

/** Picture of a theme choice; `system` is split diagonally between paper and ink. */
export function ThemePreview({ mode }: { mode: ThemeMode }): React.JSX.Element {
  return (
    <div aria-hidden className="relative aspect-[16/10] w-full overflow-hidden rounded-[9px]">
      <MiniApp palette={mode === 'dark' ? PALETTES.dark : PALETTES.light} className="absolute inset-0" />
      {mode === 'system' && (
        <MiniApp
          palette={PALETTES.dark}
          className="absolute inset-0 [clip-path:polygon(58%_0,100%_0,100%_100%,42%_100%)]"
        />
      )}
      <span className="pointer-events-none absolute inset-0 rounded-[inherit] ring-1 ring-line ring-inset" />
    </div>
  )
}

const MODES: readonly ThemeMode[] = ['light', 'dark', 'system']

export interface ThemeCardsProps {
  value: ThemeMode
  onChange: (value: ThemeMode) => void
  /** A card was clicked (not just moved to with the arrow keys). */
  onPick?: (value: ThemeMode) => void
  size?: 'md' | 'lg'
  className?: string
  'aria-labelledby'?: string
}

/** Light / Dark / System cards, each with a small drawing of the app in that theme. */
export function ThemeCards({
  value,
  onChange,
  onPick,
  size,
  className,
  ...aria
}: ThemeCardsProps): React.JSX.Element {
  const { t } = useTranslation('settings')
  const options: ChoiceOption<ThemeMode>[] = MODES.map((mode) => ({
    value: mode,
    label: t(`common:theme.${mode}`),
    description: t(`appearance.theme.${mode}Hint`),
    visual: <ThemePreview mode={mode} />
  }))
  return (
    <ChoiceCards
      value={value}
      options={options}
      onChange={onChange}
      onPick={onPick}
      size={size}
      className={className}
      aria-label={aria['aria-labelledby'] ? undefined : t('common:theme.label')}
      aria-labelledby={aria['aria-labelledby']}
    />
  )
}
