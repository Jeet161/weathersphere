'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Settings } from '@/types';
import { useAuthStore } from '@/store/auth.store';
import { useSettingsStore } from '@/store/settings.store';

export default function SettingsPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const { settings: storeSettings, fetchSettings, updateSettings } = useSettingsStore();
  const [settings, setSettings] = useState<Settings | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) { router.replace('/auth/login'); return; }
    if (!storeSettings) {
      fetchSettings();
    }
  }, [isAuthenticated, storeSettings, fetchSettings, router]);

  useEffect(() => {
    if (storeSettings) {
      setSettings(storeSettings);
    }
  }, [storeSettings]);

  const update = (field: keyof Settings) => (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSettings((s) => s ? { ...s, [field]: e.target.value } : s);
  };

  const handleSave = async () => {
    if (!settings) return;
    await updateSettings({
      tempUnit: settings.tempUnit,
      windUnit: settings.windUnit,
      theme: settings.theme,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };


  if (!settings) return null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Link href="/dashboard" className="flex items-center gap-2 text-slate-500 hover:text-slate-700 mb-6 text-sm">
          <ArrowLeft className="w-4 h-4" /> Back to dashboard
        </Link>

        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Settings</h1>

        <div className="space-y-4">
          <SettingsSection title="Account">
            <div className="text-sm text-slate-600 dark:text-slate-400">
              <span className="font-medium">{user?.displayName ?? 'No name set'}</span>
              <span className="ml-2 text-slate-400">{user?.email}</span>
            </div>
          </SettingsSection>

          <SettingsSection title="Units & Display">
            <div className="space-y-4">
              <SelectRow
                label="Temperature"
                value={settings.tempUnit}
                onChange={update('tempUnit')}
                options={[
                  { value: 'celsius', label: '°C — Celsius' },
                  { value: 'fahrenheit', label: '°F — Fahrenheit' },
                ]}
              />
              <SelectRow
                label="Wind speed"
                value={settings.windUnit}
                onChange={update('windUnit')}
                options={[
                  { value: 'kmh', label: 'km/h' },
                  { value: 'mph', label: 'mph' },
                  { value: 'ms', label: 'm/s' },
                ]}
              />
              <SelectRow
                label="Theme"
                value={settings.theme}
                onChange={update('theme')}
                options={[
                  { value: 'system', label: 'System default' },
                  { value: 'light', label: 'Light' },
                  { value: 'dark', label: 'Dark' },
                ]}
              />
            </div>
          </SettingsSection>
        </div>

        <button onClick={handleSave} className="btn-primary mt-6">
          {saved ? '✓ Saved' : 'Save settings'}
        </button>
      </div>
    </div>
  );
}

function SettingsSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-5">
      <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">{title}</h2>
      {children}
    </div>
  );
}

function SelectRow({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="flex items-center justify-between">
      <label className="text-sm text-slate-700 dark:text-slate-300">{label}</label>
      <select
        value={value}
        onChange={onChange}
        className="text-sm bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600
                   rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}
