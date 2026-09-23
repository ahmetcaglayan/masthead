/**
 * The optional weather card: the forecast for the user's city from Open-Meteo (free for
 * non-commercial use, no key). Nothing about the user is sent but the city's name and
 * coordinates, and only while the card is switched on.
 */
import { getCountryPack } from '../shared/countries'
import { foldText } from '../shared/fold'
import type { CountryCode, Province } from '../shared/types'
import { IMPERIAL_COUNTRIES, type WeatherReport } from '../shared/widgets'
import type { Logger } from './backend'
import { Cache, fetchJson, finite, orNull } from './json-api'

const MINUTE = 60_000
const WEATHER_TTL = 30 * MINUTE
const DAYS = 4

export interface WidgetsService {
  weather(country: CountryCode, provinceCode: string): Promise<WeatherReport | null>
}

export interface WidgetsOptions {
  fetch?: typeof fetch
  logger: Logger
  now?: () => number
}

interface Place {
  name: string
  latitude: number
  longitude: number
}

interface GeoResult extends Place {
  feature_code?: string
  population?: number
  admin1?: string
  admin2?: string
}

/** Seats of government first, then the other populated places. */
const FEATURE_RANK: Record<string, number> = { PPLC: 3, PPLA: 2, PPLA2: 1 }

const byPopulation = (a: GeoResult, b: GeoResult): number =>
  (b.population ?? 0) - (a.population ?? 0) ||
  (FEATURE_RANK[b.feature_code ?? ''] ?? 0) - (FEATURE_RANK[a.feature_code ?? ''] ?? 0)

export function createWidgetsService(options: WidgetsOptions): WidgetsService {
  const { logger } = options
  const now = options.now ?? Date.now
  const getJson = <T>(url: string): Promise<T> => fetchJson<T>(url, options.fetch)

  async function search(name: string, country: CountryCode, language: string): Promise<GeoResult[]> {
    const url = new URL('https://geocoding-api.open-meteo.com/v1/search')
    url.search = new URLSearchParams({
      name,
      count: '10',
      language: language.slice(0, 2),
      format: 'json',
      countryCode: country.toUpperCase()
    }).toString()
    const body = await getJson<{ results?: GeoResult[] }>(url.toString())
    return (body.results ?? []).filter((r) => finite(r.latitude) && finite(r.longitude))
  }

  /**
   * Where to take the weather for a province: the biggest place among those named like it
   * and lying in it ("Erzurum", the city "São Paulo") and its first listed city ("Houston"
   * for Texas, "München" for Bayern) — a state's name alone finds villages called "Bayern".
   */
  async function locate(country: CountryCode, province: Province): Promise<Place | null> {
    const pack = getCountryPack(country)
    if (!pack) return null
    const names = new Set([province.name, ...province.aliases].map(foldText))
    const inProvince = (r: GeoResult): boolean =>
      [r.admin1, r.admin2].some((admin) => admin !== undefined && names.has(foldText(admin)))
    const city = pack.districts.find((d) => d.provinceCode === province.code)?.name

    const [named, listed] = await Promise.all([
      search(province.name, country, pack.language),
      city ? search(city, country, pack.language) : Promise.resolve([])
    ])
    const candidates = [
      ...named.filter(inProvince),
      // Listed cities are unambiguous within the country; prefer the one in the province.
      ...listed.filter(inProvince).slice(0, 1),
      ...(listed.some(inProvince) ? [] : listed.slice(0, 1))
    ]
    const best = candidates.sort(byPopulation)[0]
    return best ? { name: best.name, latitude: best.latitude, longitude: best.longitude } : null
  }

  async function forecast(place: Place, imperial: boolean): Promise<WeatherReport> {
    const url = new URL('https://api.open-meteo.com/v1/forecast')
    url.search = new URLSearchParams({
      latitude: place.latitude.toFixed(4),
      longitude: place.longitude.toFixed(4),
      current: 'temperature_2m,apparent_temperature,weather_code,wind_speed_10m,is_day',
      daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max',
      timezone: 'auto',
      forecast_days: String(DAYS),
      ...(imperial ? { temperature_unit: 'fahrenheit', wind_speed_unit: 'mph' } : {})
    }).toString()
    const body = await getJson<{
      current?: Record<string, number>
      daily?: Record<string, (number | string | null)[]>
    }>(url.toString())
    const current = body.current ?? {}
    const daily = body.daily ?? {}
    if (!finite(current.temperature_2m) || !Array.isArray(daily.time)) {
      throw new Error('Unexpected forecast response')
    }
    const days = daily.time.map((date, i) => ({
      date: String(date),
      code: Number(daily.weather_code?.[i] ?? 0),
      max: Number(daily.temperature_2m_max?.[i]),
      min: Number(daily.temperature_2m_min?.[i]),
      rain: finite(daily.precipitation_probability_max?.[i])
        ? (daily.precipitation_probability_max[i] as number)
        : null
    }))
    return {
      place: place.name,
      units: imperial ? 'imperial' : 'metric',
      current: {
        temperature: current.temperature_2m,
        feelsLike: finite(current.apparent_temperature)
          ? current.apparent_temperature
          : current.temperature_2m,
        code: finite(current.weather_code) ? current.weather_code : 0,
        wind: finite(current.wind_speed_10m) ? current.wind_speed_10m : 0,
        isDay: current.is_day !== 0
      },
      days: days.filter((d) => finite(d.max) && finite(d.min)),
      fetchedAt: now()
    }
  }

  const places = new Cache<Place>(now, 7 * 24 * 60 * MINUTE)
  const weather = new Cache<WeatherReport>(now, WEATHER_TTL)
  const guard = <T>(what: string, load: () => Promise<T | null>) => orNull(what, logger, load)

  return {
    weather(country, provinceCode) {
      const province = getCountryPack(country)?.provinces.find((p) => p.code === provinceCode)
      if (!province) return Promise.resolve(null)
      const key = `${country}:${provinceCode}`
      return weather.get(
        key,
        guard('Weather', async () => {
          const place = await places.get(
            key,
            guard('Geocoding', () => locate(country, province))
          )
          return place ? forecast(place, IMPERIAL_COUNTRIES.includes(country)) : null
        })
      )
    }
  }
}
