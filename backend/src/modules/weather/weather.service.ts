import { Injectable, BadGatewayException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';

@Injectable()
export class WeatherService {
  private readonly http: AxiosInstance;
  private readonly apiKey: string;

  constructor(private readonly config: ConfigService) {
    const baseURL = this.config.get<string>('openWeather.baseUrl');
    this.apiKey = this.config.get<string>('openWeather.apiKey') ?? '';

    this.http = axios.create({ baseURL });
    this.http.interceptors.response.use(
      (res) => res,
      (err) => {
        const msg = err?.response?.data?.message ?? 'Weather API error';
        throw new BadGatewayException(msg);
      },
    );
  }

  // ─── Current Weather ──────────────────────────────────────────────────────

  async getCurrentWeather(lat: number, lon: number, units = 'metric') {
    const { data } = await this.http.get('/data/2.5/weather', {
      params: { lat, lon, units, appid: this.apiKey },
    });
    return this.normalizeCurrentWeather(data, units);
  }

  // ─── 5-Day / 3-Hour Forecast ──────────────────────────────────────────────

  async getForecast(lat: number, lon: number, units = 'metric') {
    const { data } = await this.http.get('/data/2.5/forecast', {
      params: { lat, lon, units, cnt: 40, appid: this.apiKey },
    });
    return this.normalizeForecast(data, units);
  }

  // ─── Air Quality ──────────────────────────────────────────────────────────

  async getAirQuality(lat: number, lon: number) {
    const { data } = await this.http.get('/data/2.5/air_pollution', {
      params: { lat, lon, appid: this.apiKey },
    });
    return data.list?.[0] ?? null;
  }

  // ─── Geocoding / City Search ──────────────────────────────────────────────

  async searchCities(query: string) {
    if (!query || query.trim().length < 2) {
      throw new BadRequestException('Query must be at least 2 characters');
    }

    const { data } = await this.http.get('/geo/1.0/direct', {
      params: { q: query, limit: 8, appid: this.apiKey },
    });

    return (data as any[]).map((item) => ({
      name: item.name,
      country: item.country,
      state: item.state ?? null,
      lat: item.lat,
      lon: item.lon,
    }));
  }

  async reverseGeocode(lat: number, lon: number) {
    const { data } = await this.http.get('/geo/1.0/reverse', {
      params: { lat, lon, limit: 1, appid: this.apiKey },
    });
    const place = (data as any[])[0];
    if (!place) return null;
    return {
      name: place.name,
      country: place.country,
      state: place.state ?? null,
      lat: place.lat,
      lon: place.lon,
    };
  }

  // ─── Normalizers ──────────────────────────────────────────────────────────

  private normalizeCurrentWeather(raw: any, units: string) {
    return {
      cityName: raw.name,
      country: raw.sys?.country,
      lat: raw.coord?.lat,
      lon: raw.coord?.lon,
      temp: raw.main?.temp,
      feelsLike: raw.main?.feels_like,
      tempMin: raw.main?.temp_min,
      tempMax: raw.main?.temp_max,
      humidity: raw.main?.humidity,
      pressure: raw.main?.pressure,
      visibility: raw.visibility,
      windSpeed: raw.wind?.speed,
      windDeg: raw.wind?.deg,
      cloudiness: raw.clouds?.all,
      weather: {
        id: raw.weather?.[0]?.id,
        main: raw.weather?.[0]?.main,
        description: raw.weather?.[0]?.description,
        icon: raw.weather?.[0]?.icon,
      },
      sunrise: raw.sys?.sunrise,
      sunset: raw.sys?.sunset,
      timezone: raw.timezone,
      units,
      dt: raw.dt,
    };
  }

  private normalizeForecast(raw: any, units: string) {
    return {
      city: {
        name: raw.city?.name,
        country: raw.city?.country,
        lat: raw.city?.coord?.lat,
        lon: raw.city?.coord?.lon,
        timezone: raw.city?.timezone,
        sunrise: raw.city?.sunrise,
        sunset: raw.city?.sunset,
      },
      units,
      list: (raw.list as any[]).map((item) => ({
        dt: item.dt,
        temp: item.main?.temp,
        feelsLike: item.main?.feels_like,
        tempMin: item.main?.temp_min,
        tempMax: item.main?.temp_max,
        humidity: item.main?.humidity,
        pressure: item.main?.pressure,
        windSpeed: item.wind?.speed,
        windDeg: item.wind?.deg,
        cloudiness: item.clouds?.all,
        pop: item.pop, // probability of precipitation
        rain: item.rain?.['3h'] ?? 0,
        snow: item.snow?.['3h'] ?? 0,
        weather: {
          id: item.weather?.[0]?.id,
          main: item.weather?.[0]?.main,
          description: item.weather?.[0]?.description,
          icon: item.weather?.[0]?.icon,
        },
      })),
    };
  }
}
