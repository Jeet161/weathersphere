'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import api from '@/lib/api';

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setAuth, isAuthenticated } = useAuthStore();

  useEffect(() => {
    const token = searchParams.get('token');

    if (token) {
      // Google OAuth landing: token passed as query param.
      // Store it first so the API interceptor can attach it.
      localStorage.setItem('access_token', token);

      // Fetch user info to fully hydrate the auth store.
      api.get('/users/me')
        .then(({ data }) => {
          setAuth(data.data, token);
          router.replace('/dashboard');
        })
        .catch(() => {
          // Token invalid — go to login
          localStorage.removeItem('access_token');
          router.replace('/auth/login');
        });
    } else if (isAuthenticated) {
      // Already logged in — go straight to dashboard
      router.replace('/dashboard');
    } else {
      router.replace('/auth/login');
    }
  }, [router, searchParams, setAuth, isAuthenticated]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
      <div className="animate-spin text-4xl">🌀</div>
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="animate-spin text-4xl">🌀</div>
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}