import type { CountryCode } from './types'

/** Today's weather and the next days for the user's city (from Open-Meteo). */
export interface WeatherReport {
  /** The place the forecast is for, as the geocoder names it ("Erzurum", "Houston"). */
  place: string
  /** `imperial`: °F and mph (the US); otherwise °C and km/h. */
  units: 'metric' | 'imperial'
  current: {
    temperature: number
    feelsLike: number
    /** WMO weather interpretation code. */
    code: number
    wind: number
    isDay: boolean
  }
  /** Today first. */
  days: {
    /** Local date, `YYYY-MM-DD`. */
    date: string
    code: number
    max: number
    min: number
    /** Highest chance of precipitation that day, in percent. */
    rain: number | null
  }[]
  fetchedAt: number
}

/** Countries that measure temperature in °F. */
export const IMPERIAL_COUNTRIES: readonly CountryCode[] = ['us']
