'use client';

import { useMemo } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useUser } from '@/lib/hooks/useUser';
import { createClient } from '@/lib/supabase/client';

// Sayfa adlarını pathname'den çıkarmak için yardımcı
const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/upload':    'Upload Data',
  '/forecast':  'Forecast',
  '/surplus':   'Surplus Management',
  '/offers':    'Offers',
  '/impact':    'Impact Report',
  '/settings':  'Settings',
};

// Avatar için baş harfleri hesapla
function getInitials(
  name: string | null | undefined,
  email: string | null | undefined,
): string {
  if (name && name.trim()) {
    const parts = name.trim().split(' ');
    return parts.length >= 2
      ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
      : parts[0].slice(0, 2).toUpperCase();
  }
  if (email) return email.slice(0, 2).toUpperCase();
  return '??';
}

export default function Header() {
  const pathname = usePathname();
  const router   = useRouter();
  const title    = pageTitles[pathname] ?? 'FreshFlow';

  const { user, profile, loading } = useUser();

  // Client tek instance olarak oluştur
  const supabase = useMemo(() => createClient(), []);

  // Aşamalı gösterim:
  //  - profile yüklendiyse → full_name / business_name
  //  - session varsa ama profil henüz gelmemişse → email göster
  //  - ikisi de yoksa → boş / skeleton
  const displayName = profile?.full_name    || user?.email  || '';
  const displaySub  = profile?.business_name || (user ? 'Loading…' : 'FreshFlow');
  const initials    = getInitials(profile?.full_name, user?.email);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100 px-8 py-4 flex items-center justify-between">
      {/* Page Title */}
      <div>
        <h1 className="text-lg font-semibold text-gray-800">{title}</h1>
        <p className="text-xs text-gray-400 mt-0.5">
          {new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            year:    'numeric',
            month:   'long',
            day:     'numeric',
          })}
        </p>
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-4">
        {/* Notification Bell */}
        <button className="relative p-2 rounded-xl text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors duration-150">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full" />
        </button>

        {/* Divider */}
        <div className="h-8 w-px bg-gray-200" />

        {/* User section */}
        {loading && !user ? (
          /* Full skeleton — henüz session bile belli değil */
          <div className="flex items-center gap-3">
            <div className="flex flex-col items-end gap-1">
              <div className="h-3.5 w-24 bg-gray-200 animate-pulse rounded" />
              <div className="h-3 w-16 bg-gray-100 animate-pulse rounded" />
            </div>
            <div className="w-9 h-9 rounded-xl bg-gray-200 animate-pulse" />
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="flex flex-col items-end">
              {/* Session varsa email'i hemen göster; profil gelince full_name */}
              <span className="text-sm font-medium text-gray-700 leading-tight max-w-[160px] truncate">
                {displayName}
              </span>
              {/* Profil yükleniyorken subtle animasyon */}
              <span className={`text-xs max-w-[160px] truncate ${loading ? 'text-gray-300 animate-pulse' : 'text-gray-400'}`}>
                {displaySub}
              </span>
            </div>

            {/* Avatar */}
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white text-sm font-bold shadow-sm">
              {initials}
            </div>

            {/* Sign Out */}
            <button
              onClick={handleSignOut}
              title="Sign out"
              className="p-2 rounded-xl text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors duration-150"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
