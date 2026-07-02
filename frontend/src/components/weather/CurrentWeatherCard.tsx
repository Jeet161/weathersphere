'use client';

import Image from 'next/image';
import { Heart, Wind, Droplets, Eye, Gauge } from 'lucide-react';
import { CurrentWeather } from '@/types';
import {
  WEATHER_ICON_URL,
  formatTemp,
  formatWindSpeed,
  formatTime,
  windDirection,
} from '@/lib/weather-utils';

interface CurrentWeatherCardProps {
  weather: CurrentWeather;
  units: 'metric' | 'imperial';
  windUnit?: 'kmh' | 'mph' | 'ms';
  isFavorite: boolean;
  onToggleFavorite: () => void;
}

export function CurrentWeatherCard({
  weather,
  units,
  windUnit = 'kmh',
  isFavorite,
  onToggleFavorite,
}: CurrentWeatherCardProps) {
  const fmt = (t: number) => formatTemp(t, units);

  return (
    <div className="weather-card">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            {weather.cityName}
            <span className="text-slate-400 font-normal text-base ml-2">{weather.country}</span>
          </h2>
          <p className="text-slate-500 text-sm capitalize mt-0.5">{weather.weather.description}</p>
        </div>
        <button
          onClick={onToggleFavorite}
          className={`p-2 rounded-xl transition-colors ${
            isFavorite
              ? 'text-red-500 bg-red-50 dark:bg-red-900/20'
              : 'text-slate-400 hover:text-red-400 hover:bg-slate-100 dark:hover:bg-slate-700'
          }`}
          title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Heart className="w-5 h-5" fill={isFavorite ? 'currentColor' : 'none'} />
        </button>
      </div>

      {/* Main temp */}
      <div className="flex items-center gap-3 mb-6">
        <Image
          src={WEATHER_ICON_URL(weather.weather.icon, '4x')}
          alt={weather.weather.description}
          width={80}
          height={80}
          className="-ml-2"
          unoptimized
        />
        <div>
          <div className="text-6xl font-thin text-slate-900 dark:text-white">
            {fmt(weather.temp)}
          </div>
          <div className="text-sm text-slate-500 mt-1">
            Feels like {fmt(weather.feelsLike)} · {fmt(weather.tempMin)} / {fmt(weather.tempMax)}
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3">
        <Stat icon={<Wind className="w-4 h-4" />} label="Wind">
          {formatWindSpeed(weather.windSpeed, units, windUnit)} {windDirection(weather.windDeg)}
        </Stat>
        <Stat icon={<Droplets className="w-4 h-4" />} label="Humidity">
          {weather.humidity}%
        </Stat>
        <Stat icon={<Eye className="w-4 h-4" />} label="Visibility">
          {(weather.visibility / 1000).toFixed(1)} km
        </Stat>
        <Stat icon={<Gauge className="w-4 h-4" />} label="Pressure">
          {weather.pressure} hPa
        </Stat>
      </div>

      {/* Sunrise / Sunset */}
      <div className="flex gap-4 mt-4 pt-4 border-t border-slate-100 dark:border-slate-700 text-sm text-slate-500">
        <span>🌅 {formatTime(weather.sunrise, weather.timezone)}</span>
        <span>🌇 {formatTime(weather.sunset, weather.timezone)}</span>
      </div>
    </div>
  );
}

function Stat({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-700/50 rounded-xl p-3">
      <span className="text-blue-500">{icon}</span>
      <div>
        <div className="text-xs text-slate-400">{label}</div>
        <div className="text-sm font-medium text-slate-700 dark:text-slate-200">{children}</div>
      </div>
    </div>
  );
}
