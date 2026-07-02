// ─── User ─────────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  displayName: string | null;
  avatarUrl: string | null;
  createdAt: string;
}

export interface Settings {
  id: string;
  userId: string;
  tempUnit: 'celsius' | 'fahrenheit';
  windUnit: 'kmh' | 'mph' | 'ms';
  theme: 'light' | 'dark' | 'system';
  defaultCity: string | null;
  defaultLat: number | null;
  defaultLon: number | null;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface AuthResponse {
  user: User;
  accessToken: string;
}

// ─── Weather ──────────────────────────────────────────────────────────────────

export interface WeatherCondition {
  id: number;
  main: string;
  description: string;
  icon: string;
}

export interface CurrentWeather {
  cityName: string;
  country: string;
  lat: number;
  lon: number;
  temp: number;
  feelsLike: number;
  tempMin: number;
  tempMax: number;
  humidity: number;
  pressure: number;
  visibility: number;
  windSpeed: number;
  windDeg: number;
  cloudiness: number;
  weather: WeatherCondition;
  sunrise: number;
  sunset: number;
  timezone: number;
  units: string;
  dt: number;
}

export interface ForecastItem {
  dt: number;
  temp: number;
  feelsLike: number;
  tempMin: number;
  tempMax: number;
  humidity: number;
  pressure: number;
  windSpeed: number;
  windDeg: number;
  cloudiness: number;
  pop: number;
  rain: number;
  snow: number;
  weather: WeatherCondition;
}

export interface Forecast {
  city: {
    name: string;
    country: string;
    lat: number;
    lon: number;
    timezone: number;
    sunrise: number;
    sunset: number;
  };
  units: string;
  list: ForecastItem[];
}

export interface AirQuality {
  main: { aqi: number };
  components: {
    co: number;
    no: number;
    no2: number;
    o3: number;
    so2: number;
    pm2_5: number;
    pm10: number;
    nh3: number;
  };
  dt: number;
}

// ─── Location ─────────────────────────────────────────────────────────────────

export interface City {
  name: string;
  country: string;
  state: string | null;
  lat: number;
  lon: number;
}

// ─── Favorites / Recents ─────────────────────────────────────────────────────

export interface Favorite {
  id: string;
  userId: string;
  cityName: string;
  country: string;
  lat: number;
  lon: number;
  createdAt: string;
}

export interface RecentSearch {
  id: string;
  userId: string;
  query: string;
  cityName: string;
  country: string;
  lat: number;
  lon: number;
  searchedAt: string;
}

// ─── API wrapper ─────────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
}
