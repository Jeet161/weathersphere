import { format, fromUnixTime } from 'date-fns';

export const WEATHER_ICON_URL = (icon: string, size: '2x' | '4x' = '2x') =>
  `https://openweathermap.org/img/wn/${icon}@${size}.png`;

export const AQI_LABELS: Record<number, { label: string; color: string }> = {
  1: { label: 'Good', color: 'text-green-500' },
  2: { label: 'Fair', color: 'text-yellow-400' },
  3: { label: 'Moderate', color: 'text-orange-400' },
  4: { label: 'Poor', color: 'text-red-500' },
  5: { label: 'Very Poor', color: 'text-purple-600' },
};

export function formatTemp(temp: number, unit: 'metric' | 'imperial' = 'metric') {
  const rounded = Math.round(temp);
  return `${rounded}°${unit === 'metric' ? 'C' : 'F'}`;
}

export function formatWindSpeed(speed: number, unit: 'metric' | 'imperial' = 'metric') {
  // OWM returns m/s for metric, mph for imperial
  if (unit === 'imperial') return `${Math.round(speed)} mph`;
  const kmh = Math.round(speed * 3.6);
  return `${kmh} km/h`;
}

export function formatTime(unixTs: number, timezone = 0) {
  const date = fromUnixTime(unixTs + timezone);
  return format(date, 'HH:mm');
}

export function formatDay(unixTs: number) {
  return format(fromUnixTime(unixTs), 'EEE');
}

export function formatDate(unixTs: number) {
  return format(fromUnixTime(unixTs), 'MMM d');
}

export function windDirection(deg: number): string {
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  return dirs[Math.round(deg / 45) % 8];
}

// Group 3-hour forecast items into daily summaries
export function groupForecastByDay(list: any[]) {
  const days: Record<string, any[]> = {};
  list.forEach((item) => {
    const day = format(fromUnixTime(item.dt), 'yyyy-MM-dd');
    if (!days[day]) days[day] = [];
    days[day].push(item);
  });
  return Object.entries(days).map(([date, items]) => ({
    date,
    items,
    tempMin: Math.min(...items.map((i) => i.tempMin)),
    tempMax: Math.max(...items.map((i) => i.tempMax)),
    icon: items[Math.floor(items.length / 2)]?.weather?.icon ?? '',
    description: items[Math.floor(items.length / 2)]?.weather?.description ?? '',
    pop: Math.max(...items.map((i) => i.pop ?? 0)),
  }));
}
