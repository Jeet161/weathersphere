'use client';

import { Favorite, City } from '@/types';
import { Trash2, MapPin } from 'lucide-react';

interface FavoritesPanelProps {
  favorites: Favorite[];
  onSelect: (city: City) => void;
  onRemove: (id: string) => void;
}

export function FavoritesPanel({ favorites, onSelect, onRemove }: FavoritesPanelProps) {
  if (favorites.length === 0) {
    return (
      <div className="weather-card text-center py-8">
        <div className="text-3xl mb-2">🤍</div>
        <p className="text-sm text-slate-500">No favorites yet.</p>
        <p className="text-xs text-slate-400 mt-1">Tap the heart icon on any city to save it.</p>
      </div>
    );
  }

  return (
    <div className="weather-card">
      <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Favorites</h3>
      <ul className="divide-y divide-slate-100 dark:divide-slate-700">
        {favorites.map((fav) => (
          <li key={fav.id} className="flex items-center gap-2 py-2.5 first:pt-0 last:pb-0">
            <button
              onClick={() => onSelect({ name: fav.cityName, country: fav.country, state: null, lat: fav.lat, lon: fav.lon })}
              className="flex-1 flex items-center gap-2 text-left hover:text-blue-600 transition-colors"
            >
              <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <span className="text-sm font-medium text-slate-800 dark:text-slate-200">{fav.cityName}</span>
              <span className="text-xs text-slate-400">{fav.country}</span>
            </button>
            <button
              onClick={() => onRemove(fav.id)}
              className="p-1 text-slate-300 hover:text-red-400 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
