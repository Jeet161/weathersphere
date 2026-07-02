import { create } from 'zustand';
import { Settings } from '@/types';
import api from '@/lib/api';

interface SettingsState {
  settings: Settings | null;
  isLoading: boolean;
  fetchSettings: () => Promise<void>;
  updateSettings: (settingsUpdate: Partial<Settings>) => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  settings: null,
  isLoading: false,
  fetchSettings: async () => {
    set({ isLoading: true });
    try {
      const { data } = await api.get('/settings');
      const theme = data.data.theme;
      if (typeof window !== 'undefined') {
        localStorage.setItem('theme', theme);
      }
      set({ settings: data.data });
    } catch (err) {
      // Ignore or handle
    } finally {
      set({ isLoading: false });
    }
  },
  updateSettings: async (settingsUpdate) => {
    try {
      const { data } = await api.patch('/settings', settingsUpdate);
      const theme = data.data.theme;
      if (typeof window !== 'undefined') {
        localStorage.setItem('theme', theme);
      }
      set({ settings: data.data });
    } catch (err) {
      // Ignore or handle
    }
  },

}));
