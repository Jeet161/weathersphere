'use client';

import { useState, useRef, useEffect } from 'react';
import { Search, X, Clock, MapPin } from 'lucide-react';
import { City, RecentSearch } from '@/types';
import api from '@/lib/api';

interface CitySearchProps {
  onSelect: (city: City) => void;
  recentSearches?: RecentSearch[];
}

export function CitySearch({ onSelect, recentSearches = [] }: CitySearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<City[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout>();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }

    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const { data } = await api.get(`/weather/search?q=${encodeURIComponent(query)}`);
        setResults(data.data);
      } catch {
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 350);

    return () => clearTimeout(debounceRef.current);
  }, [query]);

  const handleSelect = async (city: City) => {
    setQuery('');
    setIsOpen(false);
    setResults([]);
    onSelect(city);

    // Save to recent searches
    try {
      await api.post('/recent-searches', {
        query,
        cityName: city.name,
        country: city.country,
        lat: city.lat,
        lon: city.lon,
      });
    } catch {
      // non-critical
    }
  };

  const showRecents = query.length < 2 && recentSearches.length > 0;

  return (
    <div className="relative w-full max-w-xl">
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onBlur={() => setTimeout(() => setIsOpen(false), 200)}
          placeholder="Search for a city…"
          className="input-field pl-10 pr-10"
        />
        {query && (
          <button
            onClick={() => { setQuery(''); setResults([]); }}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {isOpen && (showRecents || results.length > 0 || isSearching) && (
        <div className="absolute top-full mt-2 w-full bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-700 overflow-hidden z-50">
          {isSearching && (
            <div className="px-4 py-3 text-sm text-slate-500">Searching…</div>
          )}

          {!isSearching && results.length > 0 && (
            <ul>
              {results.map((city, i) => (
                <li key={`${city.lat}-${city.lon}-${i}`}>
                  <button
                    onMouseDown={() => handleSelect(city)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700 text-left transition-colors"
                  >
                    <MapPin className="w-4 h-4 text-blue-500 shrink-0" />
                    <span className="text-sm">
                      <span className="font-medium text-slate-900 dark:text-white">{city.name}</span>
                      {city.state && <span className="text-slate-500">, {city.state}</span>}
                      <span className="text-slate-400"> · {city.country}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}

          {showRecents && !isSearching && (
            <>
              <div className="px-4 pt-3 pb-1 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Recent
              </div>
              <ul>
                {recentSearches.slice(0, 5).map((r) => (
                  <li key={r.id}>
                    <button
                      onMouseDown={() => handleSelect({ name: r.cityName, country: r.country, state: null, lat: r.lat, lon: r.lon })}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700 text-left transition-colors"
                    >
                      <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                      <span className="text-sm">
                        <span className="font-medium text-slate-900 dark:text-white">{r.cityName}</span>
                        <span className="text-slate-400"> · {r.country}</span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}
    </div>
  );
}
