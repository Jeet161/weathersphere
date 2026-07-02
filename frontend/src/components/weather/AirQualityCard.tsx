'use client';

import { AirQuality } from '@/types';
import { AQI_LABELS } from '@/lib/weather-utils';

interface AirQualityCardProps {
  airQuality: AirQuality;
}

export function AirQualityCard({ airQuality }: AirQualityCardProps) {
  const aqi = airQuality.main.aqi;
  const aqiInfo = AQI_LABELS[aqi] ?? { label: 'Unknown', color: 'text-slate-500' };
  const { components } = airQuality;

  const pollutants = [
    { label: 'PM2.5', value: components.pm2_5.toFixed(1), unit: 'μg/m³' },
    { label: 'PM10', value: components.pm10.toFixed(1), unit: 'μg/m³' },
    { label: 'O₃', value: components.o3.toFixed(1), unit: 'μg/m³' },
    { label: 'NO₂', value: components.no2.toFixed(1), unit: 'μg/m³' },
    { label: 'CO', value: (components.co / 1000).toFixed(2), unit: 'mg/m³' },
    { label: 'SO₂', value: components.so2.toFixed(1), unit: 'μg/m³' },
  ];

  return (
    <div className="weather-card">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Air Quality</h3>
        <span className={`text-sm font-semibold ${aqiInfo.color}`}>{aqiInfo.label}</span>
      </div>

      {/* AQI bar */}
      <div className="flex gap-1 mb-4">
        {[1, 2, 3, 4, 5].map((level) => (
          <div
            key={level}
            className={`h-2 flex-1 rounded-full ${
              level <= aqi
                ? level === 1 ? 'bg-green-400'
                : level === 2 ? 'bg-yellow-400'
                : level === 3 ? 'bg-orange-400'
                : level === 4 ? 'bg-red-500'
                : 'bg-purple-600'
                : 'bg-slate-100 dark:bg-slate-700'
            }`}
          />
        ))}
      </div>

      <div className="grid grid-cols-3 gap-2">
        {pollutants.map((p) => (
          <div key={p.label} className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-2.5 text-center">
            <div className="text-xs text-slate-400 mb-0.5">{p.label}</div>
            <div className="text-sm font-semibold text-slate-700 dark:text-slate-200">{p.value}</div>
            <div className="text-xs text-slate-400">{p.unit}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
