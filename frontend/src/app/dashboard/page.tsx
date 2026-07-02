'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { CitySearch } from '@/components/weather/CitySearch';
import { CurrentWeatherCard } from '@/components/weather/CurrentWeatherCard';
import { ForecastCard } from '@/components/weather/ForecastCard';
import { AirQualityCard } from '@/components/weather/AirQualityCard';
import { FavoritesPanel } from '@/components/weather/FavoritesPanel';
import { useAuthStore } from '@/store/auth.store';
import { useWeatherStore } from '@/store/weather.store';
import { useSettingsStore } from '@/store/settings.store';
import { City, Favorite, RecentSearch } from '@/types';
import api from '@/lib/api';

export default function DashboardPage() {
  const router = useRouter();
  const { isAuthenticated, _hasHydrated } = useAuthStore();
  const { currentWeather, forecast, airQuality, units, setUnits, isLoading, error, fetchWeatherForCity } =
    useWeatherStore();
  const { settings, fetchSettings } = useSettingsStore();

  // Derive units from settings
  const apiUnits = settings?.tempUnit === 'fahrenheit' ? 'imperial' : 'metric';
  const windUnit = (settings?.windUnit as 'kmh' | 'mph' | 'ms') ?? 'kmh';

  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);

  // Redirect if not authenticated — wait for hydration first
  useEffect(() => {
    if (!_hasHydrated) return;
    if (!isAuthenticated) router.replace('/auth/login');
  }, [_hasHydrated, isAuthenticated, router]);

  // Load favorites + recents + settings
  useEffect(() => {
    if (!isAuthenticated) return;
    api.get('/favorites').then(({ data }) => setFavorites(data.data)).catch(() => {});
    api.get('/recent-searches').then(({ data }) => setRecentSearches(data.data)).catch(() => {});
    fetchSettings();
  }, [isAuthenticated]);

  // Sync weather units when settings change
  useEffect(() => {
    if (settings) {
      const newUnits = settings.tempUnit === 'fahrenheit' ? 'imperial' : 'metric';
      setUnits(newUnits);
    }
  }, [settings?.tempUnit]);

  // Geolocation on first load
  useEffect(() => {
    if (!isAuthenticated || currentWeather) return;
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        ({ coords }) => fetchWeatherForCity({ name: '', country: '', state: null, lat: coords.latitude, lon: coords.longitude }),
        () => fetchWeatherForCity({ name: 'London', country: 'GB', state: null, lat: 51.5074, lon: -0.1278 }),
      );
    } else {
      fetchWeatherForCity({ name: 'London', country: 'GB', state: null, lat: 51.5074, lon: -0.1278 });
    }
  }, [isAuthenticated]);

  const handleCitySelect = async (city: City) => {
    await fetchWeatherForCity(city);
    // Refresh recents
    api.get('/recent-searches').then(({ data }) => setRecentSearches(data.data)).catch(() => {});
  };

  const isFavorite = currentWeather
    ? favorites.some((f) => Math.abs(f.lat - currentWeather.lat) < 0.01 && Math.abs(f.lon - currentWeather.lon) < 0.01)
    : false;

  const handleToggleFavorite = async () => {
    if (!currentWeather) return;
    if (isFavorite) {
      const fav = favorites.find((f) => Math.abs(f.lat - currentWeather.lat) < 0.01);
      if (fav) {
        await api.delete(`/favorites/${fav.id}`);
        setFavorites((prev) => prev.filter((f) => f.id !== fav.id));
      }
    } else {
      const { data } = await api.post('/favorites', {
        cityName: currentWeather.cityName,
        country: currentWeather.country,
        lat: currentWeather.lat,
        lon: currentWeather.lon,
      });
      setFavorites((prev) => [data.data, ...prev]);
    }
  };

  const handleRemoveFavorite = async (id: string) => {
    await api.delete(`/favorites/${id}`);
    setFavorites((prev) => prev.filter((f) => f.id !== id));
  };

  // Show a spinner while the store is hydrating from localStorage
  if (!_hasHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="animate-spin text-4xl">🌀</div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 py-6">
        {/* Search bar */}
        <div className="mb-6">
          <CitySearch onSelect={handleCitySelect} recentSearches={recentSearches} />
        </div>

        {isLoading && (
          <div className="flex items-center justify-center py-20 text-slate-400">
            <div className="animate-spin text-3xl">🌀</div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-2xl p-4 text-sm mb-4">
            {error}
          </div>
        )}

        {!isLoading && currentWeather && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Left column */}
            <div className="lg:col-span-2 space-y-4">
              <CurrentWeatherCard
                weather={currentWeather}
                units={apiUnits}
                windUnit={windUnit}
                isFavorite={isFavorite}
                onToggleFavorite={handleToggleFavorite}
              />
              {forecast && <ForecastCard forecast={forecast} units={units} />}
              {airQuality && <AirQualityCard airQuality={airQuality} />}
            </div>

            {/* Right column */}
            <div className="space-y-4">
              <FavoritesPanel
                favorites={favorites}
                onSelect={handleCitySelect}
                onRemove={handleRemoveFavorite}
              />
            </div>
          </div>
        )}

        {!isLoading && !currentWeather && !error && (
          <div className="text-center py-20 text-slate-400">
            <div className="text-5xl mb-4">🌍</div>
            <p className="text-lg font-medium">Search for a city to get started</p>
          </div>
        )}
      </main>
    </div>
  );
}
