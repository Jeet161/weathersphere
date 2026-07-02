'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Settings, LogOut } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';

export function Navbar() {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    router.push('/auth/login');
  };

  return (
    <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold text-slate-900 dark:text-white">
          <span className="text-xl">🌤</span>
          <span>WeatherSphere</span>
        </Link>

        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-500 hidden sm:block">
            {user?.displayName ?? user?.email}
          </span>
          <Link href="/settings" className="btn-ghost p-2">
            <Settings className="w-4 h-4" />
          </Link>
          <button onClick={handleLogout} className="btn-ghost p-2 text-slate-500">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
