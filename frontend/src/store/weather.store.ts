import { create } from 'zustand';
import { CurrentWeather, Forecast, AirQuality, City } from '@/types';
import api from '@/lib/api';

interface WeatherState {
  currentWeather: CurrentWeather | null;
  forecast: Forecast | null;
  airQuality: AirQuality | null;
  selectedCity: City | null;
  units: 'metric' | 'imperial';
  isLoading: boolean;
  error: string | null;

  setUnits: (units: 'metric' | 'imperial') => void;
  setSelectedCity: (city: City) => void;
  fetchWeather: (lat: number, lon: number) => Promise<void>;
  fetchWeatherForCity: (city: City) => Promise<void>;
}

export const useWeatherStore = create<WeatherState>((set, get) => ({
  currentWeather: null,
  forecast: null,
  airQuality: null,
  selectedCity: null,
  units: 'metric',
  isLoading: false,
  error: null,

  setUnits: (units) => set({ units }),

  setSelectedCity: (city) => set({ selectedCity: city }),

  fetchWeather: async (lat, lon) => {
    const { units } = get();
    set({ isLoading: true, error: null });
    try {
      const [weatherRes, forecastRes, aqiRes] = await Promise.all([
        api.get(`/weather/current?lat=${lat}&lon=${lon}&units=${units}`),
        api.get(`/weather/forecast?lat=${lat}&lon=${lon}&units=${units}`),
        api.get(`/weather/air-quality?lat=${lat}&lon=${lon}`),
      ]);
      set({
        currentWeather: weatherRes.data.data,
        forecast: forecastRes.data.data,
        airQuality: aqiRes.data.data,
      });
    } catch (err: any) {
      set({ error: err?.response?.data?.error?.message ?? 'Failed to fetch weather' });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchWeatherForCity: async (city) => {
    set({ selectedCity: city });
    await get().fetchWeather(city.lat, city.lon);
  },
}));
