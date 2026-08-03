import { cn } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────────
interface MonthBar {
  month: string;
  value: number;
  isHighlight?: boolean;
}

interface LeaderboardEntry {
  rank: number;
  medal?: '🥇' | '🥈' | '🥉';
  name: string;
  category: string;
  kgSaved: number;
  badge?: string;
  badgeStyle?: string;
  isYou?: boolean;
  rowBg?: string;
}

interface CategoryBar {
  label: string;
  kg: number;
  pct: number;
  color: string;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────────
const MONTHLY_DATA: MonthBar[] = [
  { month: 'Feb', value: 280 },
  { month: 'Mar', value: 320 },
  { month: 'Apr', value: 390 },
  { month: 'May', value: 450 },
  { month: 'Jun', value: 520, isHighlight: true },
  { month: 'Jul', value: 380 },
];
const MAX_BAR = Math.max(...MONTHLY_DATA.map((d) => d.value));

const LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, medal: '🥇', name: 'GreenMart Amsterdam', category: 'Retail',     kgSaved: 890, badge: 'City Champion', badgeStyle: 'bg-yellow-100 text-yellow-700', rowBg: 'bg-yellow-50' },
  { rank: 2, medal: '🥈', name: 'FreshHub Noord',      category: 'Wholesale',  kgSaved: 720, badge: 'Runner Up',    badgeStyle: 'bg-gray-100 text-gray-600',    rowBg: 'bg-gray-50' },
  { rank: 3, medal: '🥉', name: 'Bistro Verde',        category: 'Restaurant', kgSaved: 610, badge: 'Top 3',       badgeStyle: 'bg-orange-100 text-orange-700', rowBg: 'bg-orange-50' },
  { rank: 4, name: 'Albert Deli',        category: 'Retail',     kgSaved: 480 },
  { rank: 5, name: 'Noord Bakery',       category: 'Bakery',     kgSaved: 390 },
  { rank: 6, name: 'Harbor Fish Market', category: 'Wholesale',  kgSaved: 340 },
  { rank: 7, name: 'Cafe Central',       category: 'Restaurant', kgSaved: 290 },
  { rank: 8, name: '[Your Business]',    category: 'Retail',     kgSaved: 245, badge: 'You', badgeStyle: 'bg-primary-light text-primary-dark', isYou: true },
  { rank: 9, name: 'Bloem & Zaad',       category: 'Retail',     kgSaved: 210 },
  { rank: 10, name: 'De Keuken',         category: 'Restaurant', kgSaved: 180 },
];

const CATEGORIES: CategoryBar[] = [
  { label: 'Vegetables', kg: 890, pct: 38, color: 'bg-primary' },
  { label: 'Fruits',     kg: 620, pct: 26, color: 'bg-emerald-400' },
  { label: 'Dairy',      kg: 480, pct: 21, color: 'bg-blue-400' },
  { label: 'Bakery',     kg: 230, pct: 10, color: 'bg-amber-400' },
  { label: 'Other',      kg: 120, pct:  5, color: 'bg-gray-400' },
];

// ─── Main Component ───────────────────────────────────────────────────────────────
export default function ImpactPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-6">

      {/* ── Page Header ──────────────────────────────────────────────────────── */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Impact Report</h2>
        <p className="text-sm text-gray-500 mt-1">
          Track your contribution to reducing food waste and its real-world environmental effect.
        </p>
      </div>

      {/* ── 1. Hero Impact Banner ─────────────────────────────────────────────── */}
      <div className="relative bg-gradient-to-r from-primary to-emerald-600 rounded-2xl p-8 text-white overflow-hidden">

        {/* Decorative leaf / checkmark (right side) */}
        <div className="absolute right-8 top-1/2 -translate-y-1/2 hidden sm:block opacity-[0.12]">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-48 w-48" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1-2.3A4.49 4.49 0 008 20C19 20 22 3 22 3c-1 2-8 5.5-8 5.5z" />
          </svg>
        </div>

        <div className="relative z-10 max-w-lg">
          <p className="text-sm font-medium opacity-80 tracking-wide uppercase">Your Environmental Impact</p>
          <p className="text-5xl font-bold mt-2 leading-none">2,340 kg</p>
          <p className="mt-2 text-base opacity-90">of food saved from waste since you joined FreshFlow</p>

          {/* Mini stats */}
          <div className="flex flex-wrap gap-3 mt-6">
            {[
              { icon: '🌍', label: '4.7 tonnes CO₂ avoided' },
              { icon: '💧', label: '2,340 L water saved' },
              { icon: '🍽️', label: '1,170 meals equivalent' },
            ].map(({ icon, label }) => (
              <div key={label} className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2 flex items-center gap-2">
                <span className="text-base">{icon}</span>
                <span className="text-sm font-medium">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── 2. Summary Cards ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'Food Saved',
            value: '2,340 kg',
            sub: '+340 kg this month',
            subColor: 'text-primary',
            iconBg: 'bg-primary-light', iconColor: 'text-primary',
            icon: (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
              </svg>
            ),
          },
          {
            label: 'CO₂ Avoided',
            value: '4.7 tonnes',
            sub: 'Equivalent to 2 car trips around Earth',
            subColor: 'text-gray-400',
            iconBg: 'bg-blue-100', iconColor: 'text-blue-500',
            icon: (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
              </svg>
            ),
          },
          {
            label: 'Offers Completed',
            value: '28',
            sub: 'Avg. 4.2 per week',
            subColor: 'text-gray-400',
            iconBg: 'bg-amber-100', iconColor: 'text-amber-500',
            icon: (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ),
          },
          {
            label: 'Money Saved',
            value: '€3,120',
            sub: 'vs. full write-off losses',
            subColor: 'text-gray-400',
            iconBg: 'bg-purple-100', iconColor: 'text-purple-500',
            icon: (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ),
          },
        ].map((card) => (
          <div key={card.label} className="bg-white border border-gray-100 rounded-xl shadow-sm p-5">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide truncate">{card.label}</p>
                <p className="text-2xl font-bold text-gray-800 mt-1.5">{card.value}</p>
                <p className={cn('text-xs mt-1 leading-tight', card.subColor)}>{card.sub}</p>
              </div>
              <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0', card.iconBg, card.iconColor)}>
                {card.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── 3. Monthly Bar Chart ──────────────────────────────────────────────── */}
      <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-6">
        <h3 className="text-base font-semibold text-gray-800 mb-6">Monthly Food Saved (kg)</h3>
        <div className="flex items-end gap-4 h-48">
          {MONTHLY_DATA.map((bar) => {
            const heightPct = Math.round((bar.value / MAX_BAR) * 100);
            return (
              <div key={bar.month} className="flex-1 flex flex-col items-center gap-2 min-w-0">
                {/* Value label */}
                <span className={cn(
                  'text-xs font-semibold',
                  bar.isHighlight ? 'text-primary-dark' : 'text-gray-400'
                )}>
                  {bar.value}
                </span>
                {/* Bar */}
                <div className="w-full flex items-end" style={{ height: '160px' }}>
                  <div
                    className={cn(
                      'w-full rounded-t-lg transition-all',
                      bar.isHighlight ? 'bg-primary-dark' : 'bg-primary/70'
                    )}
                    style={{ height: `${heightPct}%` }}
                  />
                </div>
                {/* Month label */}
                <span className="text-xs text-gray-400 font-medium">{bar.month}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── 4. Leaderboard + 5. Category Breakdown (side by side on lg) ──────── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* ── 4. Leaderboard (3/5 width) ──────────────────────────────────── */}
        <div className="lg:col-span-3 bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-100 flex items-start justify-between gap-3">
            <div>
              <h3 className="text-base font-semibold text-gray-800">Amsterdam Leaderboard — August 2026</h3>
              <p className="text-xs text-gray-400 mt-0.5">Monthly competition — top businesses by food saved</p>
            </div>
            <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 rounded-full px-3 py-1 flex-shrink-0">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-xs font-semibold text-amber-700">🏆 Live</span>
            </div>
          </div>

          {/* Rows */}
          <div className="divide-y divide-gray-50">
            {LEADERBOARD.map((entry) => (
              <div
                key={entry.rank}
                className={cn(
                  'flex items-center gap-3 px-5 py-3 transition-colors',
                  entry.isYou
                    ? 'bg-primary-light border-l-4 border-primary'
                    : entry.rowBg ?? 'hover:bg-gray-50',
                )}
              >
                {/* Rank */}
                <div className="w-7 flex-shrink-0 text-center">
                  {entry.medal
                    ? <span className="text-base leading-none">{entry.medal}</span>
                    : <span className="text-sm font-semibold text-gray-400">{entry.rank}</span>
                  }
                </div>

                {/* Name + Category */}
                <div className="flex-1 min-w-0">
                  <p className={cn(
                    'text-sm font-semibold truncate',
                    entry.isYou ? 'text-primary-dark' : 'text-gray-800'
                  )}>
                    {entry.name}
                  </p>
                  <p className="text-xs text-gray-400 truncate">{entry.category}</p>
                </div>

                {/* kg */}
                <span className="text-sm font-bold text-gray-700 flex-shrink-0">
                  {entry.kgSaved.toLocaleString()} kg
                </span>

                {/* Badge */}
                {entry.badge && (
                  <span className={cn(
                    'text-xs font-semibold px-2.5 py-0.5 rounded-full flex-shrink-0',
                    entry.badgeStyle
                  )}>
                    {entry.badge}
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="px-5 py-4 bg-gray-50 border-t border-gray-100 space-y-1">
            <p className="text-xs text-gray-600 font-medium">
              🏆 Top prize this month: <span className="font-bold">€75 Amazon voucher</span> for City Champion
            </p>
            <p className="text-xs text-gray-400">
              Competition resets on Sep 1, 2026 · <span className="font-medium text-gray-500">29 days remaining</span>
            </p>
          </div>
        </div>

        {/* ── 5. Impact by Category (2/5 width) ───────────────────────────── */}
        <div className="lg:col-span-2 bg-white border border-gray-100 rounded-xl shadow-sm p-6">
          <h3 className="text-base font-semibold text-gray-800 mb-5">Impact by Category</h3>
          <div className="space-y-4">
            {CATEGORIES.map((cat) => (
              <div key={cat.label}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-medium text-gray-700">{cat.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">{cat.kg} kg</span>
                    <span className="text-xs font-semibold text-gray-600">{cat.pct}%</span>
                  </div>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={cn('h-full rounded-full transition-all', cat.color)}
                    style={{ width: `${cat.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Total */}
          <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-500">Total</span>
            <span className="text-base font-bold text-gray-800">2,340 kg</span>
          </div>
        </div>

      </div>

    </div>
  );
}