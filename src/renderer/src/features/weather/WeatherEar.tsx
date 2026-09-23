import { useEffect, useState } from 'react'
import {
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudLightning,
  CloudMoon,
  CloudRain,
  CloudSnow,
  CloudSun,
  MapPin,
  Moon,
  Sun,
  type LucideIcon
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { WeatherReport } from '@shared/widgets'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/Popover'
import { localeFor } from '@/i18n'
import { api } from '@/lib/api'
import { cn } from '@/lib/cn'
import { useSettings } from '@/stores/settings'
import { useUi } from '@/stores/ui'

/** The forecast changes slowly; the host caches it for half an hour too. */
const WEATHER_POLL_MS = 30 * 60_000

type Condition =
  | 'clear'
  | 'mainlyClear'
  | 'partlyCloudy'
  | 'overcast'
  | 'fog'
  | 'drizzle'
  | 'rain'
  | 'showers'
  | 'snow'
  | 'thunderstorm'

/** WMO weather interpretation codes (as Open-Meteo reports them) in plain words. */
function condition(code: number): Condition {
  if (code === 0) return 'clear'
  if (code === 1) return 'mainlyClear'
  if (code === 2) return 'partlyCloudy'
  if (code === 3) return 'overcast'
  if (code === 45 || code === 48) return 'fog'
  if (code >= 51 && code <= 57) return 'drizzle'
  if ((code >= 61 && code <= 67) || code === 80 || code === 81 || code === 82) {
    return code >= 80 ? 'showers' : 'rain'
  }
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return 'snow'
  if (code >= 95) return 'thunderstorm'
  return 'overcast'
}

function conditionIcon(kind: Condition, isDay: boolean): LucideIcon {
  switch (kind) {
    case 'clear':
    case 'mainlyClear':
      return isDay ? Sun : Moon
    case 'partlyCloudy':
      return isDay ? CloudSun : CloudMoon
    case 'overcast':
      return Cloud
    case 'fog':
      return CloudFog
    case 'drizzle':
      return CloudDrizzle
    case 'rain':
    case 'showers':
      return CloudRain
    case 'snow':
      return CloudSnow
    case 'thunderstorm':
      return CloudLightning
  }
}

const degrees = (value: number): string => `${Math.round(value)}°`

/** The forecast for the selected city, asked for on start, every half hour and when the city changes. */
function useWeather(enabled: boolean, provinceCode: string | null): WeatherReport | null {
  const [report, setReport] = useState<WeatherReport | null>(null)
  useEffect(() => {
    if (!enabled || !provinceCode) return
    let alive = true
    const load = (): void =>
      void api.widgets.weather().then(
        (next) => alive && setReport(next),
        () => undefined
      )
    load()
    const timer = setInterval(load, WEATHER_POLL_MS)
    return () => {
      alive = false
      clearInterval(timer)
    }
  }, [enabled, provinceCode])
  return enabled && provinceCode ? report : null
}

/**
 * The weather in the front page's dateline, like a newspaper's ear: now, and today's high
 * and low; the next days open from it. Only there when switched on in Settings (it asks
 * Open-Meteo, an outside service), and it asks for a city when none is chosen.
 */
export function WeatherEar({ className }: { className?: string }): React.JSX.Element | null {
  const { t, i18n } = useTranslation('news')
  const enabled = useSettings((s) => s.settings.widgets.weather)
  const provinceCode = useSettings((s) => s.settings.location.provinceCode)
  const report = useWeather(enabled, provinceCode)
  if (!enabled) return null

  const base = cn('inline-flex items-center gap-1.5 font-ui text-[13px] text-fg-muted', className)
  if (!provinceCode) {
    return (
      <button
        type="button"
        onClick={() => useUi.getState().navigate({ name: 'settings', section: 'language' })}
        className={cn(base, 'rounded-full hover:text-fg')}
      >
        <MapPin size={14} strokeWidth={1.75} aria-hidden />
        {t('weather.chooseCity')}
      </button>
    )
  }
  if (!report) return null

  const now = condition(report.current.code)
  const Icon = conditionIcon(now, report.current.isDay)
  const today = report.days[0]
  const weekday = new Intl.DateTimeFormat(localeFor(i18n.language), { weekday: 'short' })
  const wind = report.units === 'imperial' ? 'mph' : 'km/h'

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={t('weather.label', {
            place: report.place,
            temp: degrees(report.current.temperature),
            sky: t(`weather.sky.${now}`)
          })}
          className={cn(
            base,
            '-mx-2 rounded-full px-2 py-0.5 transition-colors hover:bg-muted hover:text-fg data-[state=open]:bg-muted'
          )}
        >
          <Icon size={16} strokeWidth={1.75} aria-hidden className="text-accent-ink" />
          <span className="font-semibold text-fg tabular-nums">{degrees(report.current.temperature)}</span>
          <span>{report.place}</span>
          {today && (
            <span className="text-fg-subtle tabular-nums">
              {degrees(today.max)} / {degrees(today.min)}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-72" align="start">
        <p className="font-ui text-[11px] font-semibold tracking-wider text-fg-subtle uppercase">
          {report.place}
        </p>
        <div className="mt-2 flex items-center gap-3">
          <Icon size={32} strokeWidth={1.5} aria-hidden className="text-accent-ink" />
          <div>
            <p className="font-ui text-2xl leading-tight font-semibold tabular-nums">
              {degrees(report.current.temperature)}
            </p>
            <p className="text-[13px] text-fg-muted">
              {t(`weather.sky.${now}`)} ·{' '}
              {t('weather.feelsLike', { temp: degrees(report.current.feelsLike) })}
            </p>
          </div>
        </div>
        <p className="mt-2 text-[12.5px] text-fg-muted tabular-nums">
          {t('weather.wind', { speed: Math.round(report.current.wind), unit: wind })}
        </p>
        <ul className="mt-3 divide-y divide-line border-t border-line">
          {report.days.map((day, i) => {
            const sky = condition(day.code)
            const DayIcon = conditionIcon(sky, true)
            return (
              <li key={day.date} className="flex items-center gap-3 py-2 text-[13px]">
                <span className="w-16 text-fg first-letter:uppercase">
                  {i === 0 ? t('weather.today') : weekday.format(new Date(`${day.date}T12:00:00`))}
                </span>
                <DayIcon size={16} strokeWidth={1.75} aria-hidden className="text-fg-muted" />
                <span className="sr-only">{t(`weather.sky.${sky}`)}</span>
                <span className="w-10 text-fg-subtle tabular-nums">
                  {day.rain !== null && day.rain >= 20 ? `${day.rain}%` : ''}
                </span>
                <span className="ml-auto font-semibold tabular-nums">{degrees(day.max)}</span>
                <span className="w-9 text-right text-fg-subtle tabular-nums">{degrees(day.min)}</span>
              </li>
            )
          })}
        </ul>
        <p className="mt-2 text-[11.5px] text-fg-subtle">
          {t('weather.source')}{' '}
          <a
            href="https://open-meteo.com/"
            target="_blank"
            rel="noreferrer"
            className="underline underline-offset-2 hover:text-fg"
          >
            Open-Meteo
          </a>
        </p>
      </PopoverContent>
    </Popover>
  )
}
