'use client';

import { usePathname } from 'next/navigation';

// Sayfa adlarını pathname'den çıkarmak için yardımcı
const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/upload': 'Upload Data',
  '/forecast': 'Forecast',
  '/surplus': 'Surplus Management',
  '/offers': 'Offers',
  '/impact': 'Impact Report',
  '/settings': 'Settings',
};

export default function Header() {
  const pathname = usePathname();
  const title = pageTitles[pathname] ?? 'FreshFlow';

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100 px-8 py-4 flex items-center justify-between">
      {/* Page Title */}
      <div>
        <h1 className="text-lg font-semibold text-gray-800">{title}</h1>
        <p className="text-xs text-gray-400 mt-0.5">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Right Side: User Avatar Placeholder */}
      <div className="flex items-center gap-4">
        {/* Notification Bell */}
        <button className="relative p-2 rounded-xl text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors duration-150">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full" />
        </button>

        {/* Divider */}
        <div className="h-8 w-px bg-gray-200" />

        {/* User Avatar */}
        <div className="flex items-center gap-3 cursor-pointer group">
          <div className="flex flex-col items-end">
            <span className="text-sm font-medium text-gray-700 leading-tight">John Doe</span>
            <span className="text-xs text-gray-400">Admin</span>
          </div>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white text-sm font-bold shadow-sm group-hover:shadow-md transition-shadow duration-150">
            JD
          </div>
        </div>
      </div>
    </header>
  );
}
