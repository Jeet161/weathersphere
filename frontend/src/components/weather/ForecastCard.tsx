'use client';

import Image from 'next/image';
import { Forecast } from '@/types';
import { WEATHER_ICON_URL, formatTemp, formatDay, formatDate, groupForecastByDay } from '@/lib/weather-utils';

interface ForecastCardProps {
  forecast: Forecast;
  units: 'metric' | 'imperial';
}

export function ForecastCard({ forecast, units }: ForecastCardProps) {
  const days = groupForecastByDay(forecast.list).slice(0, 5);
  const fmt = (t: number) => formatTemp(t, units);

  return (
    <div className="weather-card">
      <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">
        5-Day Forecast
      </h3>
      <div className="divide-y divide-slate-100 dark:divide-slate-700">
        {days.map((day) => (
          <div key={day.date} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
            <div className="w-16 text-sm font-medium text-slate-700 dark:text-slate-300">
              <div>{formatDay(new Date(day.date + 'T12:00:00').getTime() / 1000)}</div>
              <div className="text-xs text-slate-400">{formatDate(new Date(day.date + 'T12:00:00').getTime() / 1000)}</div>
            </div>

            <Image
              src={WEATHER_ICON_URL(day.icon)}
              alt={day.description}
              width={40}
              height={40}
              unoptimized
            />

            <div className="flex-1 text-xs text-slate-500 capitalize hidden sm:block">
              {day.description}
            </div>

            {day.pop > 0.1 && (
              <div className="text-xs text-blue-500 w-10 text-right">
                💧{Math.round(day.pop * 100)}%
              </div>
            )}

            <div className="text-sm font-medium text-slate-500 w-8 text-right">{fmt(day.tempMin)}</div>
            <div className="w-16 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full mx-2 hidden sm:block">
              {/* temperature range bar — visual only */}
            </div>
            <div className="text-sm font-semibold text-slate-800 dark:text-white w-8">{fmt(day.tempMax)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
