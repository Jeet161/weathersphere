'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth.store';

export default function RegisterPage() {
  const router = useRouter();
  const { register, isLoading } = useAuthStore();
  const [form, setForm] = useState({ email: '', password: '', displayName: '' });
  const [error, setError] = useState('');

  const update = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await register(form.email, form.password, form.displayName || undefined);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err?.response?.data?.error?.message ?? 'Registration failed');
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 via-indigo-750 to-slate-900 p-4 overflow-hidden">
      {/* Dynamic Weather Orbs */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-amber-400 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-pulse pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-pulse pointer-events-none" style={{ animationDelay: '2s' }} />

      <div className="relative w-full max-w-md bg-white/10 dark:bg-slate-900/30 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-slate-800/30 p-8 transition-all duration-300 hover:shadow-blue-500/10">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3 drop-shadow-[0_4px_12px_rgba(250,204,21,0.4)] animate-bounce" style={{ animationDuration: '4s' }}>🌤</div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-blue-100 to-indigo-200 bg-clip-text text-transparent drop-shadow-sm">
            Create account
          </h1>
          <p className="text-slate-200/70 text-sm mt-1">Start tracking weather today</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-500/20 border border-red-500/30 text-red-200 text-sm rounded-xl p-3 backdrop-blur-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Display name <span className="text-slate-400 font-normal">(optional)</span>
            </label>
            <input
              type="text"
              value={form.displayName}
              onChange={update('displayName')}
              className="w-full bg-white/5 dark:bg-slate-950/20 border border-white/10 dark:border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Alex"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Email
            </label>
            <input
              type="email"
              value={form.email}
              onChange={update('email')}
              className="w-full bg-white/5 dark:bg-slate-950/20 border border-white/10 dark:border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="you@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Password <span className="text-slate-400 font-normal">(min 8 characters)</span>
            </label>
            <input
              type="password"
              value={form.password}
              onChange={update('password')}
              className="w-full bg-white/5 dark:bg-slate-950/20 border border-white/10 dark:border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="••••••••"
              minLength={8}
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl py-3 text-sm transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-600/30 mt-4"
          >
            {isLoading ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className="text-center text-sm text-slate-400 mt-6">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
