import { describe, expect, it } from 'vitest'
import { createWidgetsService } from '../../../src/core/widgets'
import { fakeFetch, silentLogger as logger } from './fake-fetch'

const NOW = Date.UTC(2026, 8, 23, 12, 0, 0)

const place = (name: string, admin1: string, extra: Record<string, unknown> = {}) => ({
  name,
  latitude: 30,
  longitude: -95,
  admin1,
  ...extra
})

const forecast = {
  current: {
    temperature_2m: 21.4,
    apparent_temperature: 20.1,
    weather_code: 3,
    wind_speed_10m: 12,
    is_day: 1
  },
  daily: {
    time: ['2026-09-23', '2026-09-24'],
    weather_code: [3, 61],
    temperature_2m_max: [24, 19],
    temperature_2m_min: [12, 10],
    precipitation_probability_max: [10, 80]
  }
}

describe('weather', () => {
  it("takes a state's weather from its biggest city, not a village named like the state", async () => {
    const { fetch, calls } = fakeFetch({
      'geocoding-api.open-meteo.com': (url) =>
        ({
          Texas: {
            results: [place('Colfax', 'West Virginia'), place('Texas City', 'Texas', { population: 45_000 })]
          },
          Houston: { results: [place('Houston', 'Texas', { population: 2_300_000, feature_code: 'PPLA2' })] }
        })[url.searchParams.get('name') ?? ''],
      'api.open-meteo.com': () => forecast
    })
    const widgets = createWidgetsService({ fetch, logger, now: () => NOW })
    const report = await widgets.weather('us', 'TX')
    expect(report?.place).toBe('Houston')
    expect(report?.units).toBe('imperial')
    expect(report?.current).toEqual({ temperature: 21.4, feelsLike: 20.1, code: 3, wind: 12, isDay: true })
    expect(report?.days[1]).toEqual({ date: '2026-09-24', code: 61, max: 19, min: 10, rain: 80 })
    const forecastUrl = new URL(calls.find((c) => c.includes('api.open-meteo.com/v1/forecast'))!)
    expect(forecastUrl.searchParams.get('temperature_unit')).toBe('fahrenheit')

    // Cached: a second look asks nothing new.
    const before = calls.length
    await widgets.weather('us', 'TX')
    expect(calls.length).toBe(before)
  })

  it('finds a Turkish city by its province name, in metric units', async () => {
    const { fetch } = fakeFetch({
      'geocoding-api.open-meteo.com': (url) =>
        url.searchParams.get('name') === 'Erzurum'
          ? { results: [place('Erzurum', 'Erzurum', { population: 420_000, feature_code: 'PPLA' })] }
          : { results: [] },
      'api.open-meteo.com': () => forecast
    })
    const report = await createWidgetsService({ fetch, logger, now: () => NOW }).weather('tr', '25')
    expect(report?.place).toBe('Erzurum')
    expect(report?.units).toBe('metric')
  })

  it('gives null, not an error, when the services fail or the province is unknown', async () => {
    const { fetch } = fakeFetch({})
    const widgets = createWidgetsService({ fetch, logger, now: () => NOW })
    await expect(widgets.weather('tr', '25')).resolves.toBeNull()
    await expect(widgets.weather('tr', '99')).resolves.toBeNull()
  })
})
