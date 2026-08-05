// Impact Page — Server Component
// All data from Supabase impact_metrics table.
// Leaderboard disabled (per product requirements) — replaced with category breakdown.

import { createClient } from '@/lib/supabase/server';
import { getTranslations } from 'next-intl/server';
import {
  getCumulativeImpact,
  getMonthlyImpact,
  getCategoryBreakdown,
} from '@/lib/repositories/impact.repository';
import { cn } from '@/lib/utils';

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmt(n: number, decimals = 0): string {
  return n.toLocaleString('en-EU', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}
function fmtEur(n: number): string {
  return `€${fmt(Math.round(n))}`;
}
function fmtKg(n: number): string {
  return n >= 1000 ? `${(n / 1000).toFixed(2)} t` : `${fmt(n)} kg`;
}

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const CATEGORY_COLORS: Record<string, string> = {
  Vegetables: 'bg-primary',
  Fruits:     'bg-emerald-400',
  Dairy:      'bg-blue-400',
  Bakery:     'bg-amber-400',
  Meat:       'bg-red-400',
  Seafood:    'bg-cyan-400',
  Other:      'bg-gray-400',
};

function categoryColor(cat: string): string {
  return CATEGORY_COLORS[cat] ?? 'bg-gray-400';
}

// ─── Empty State ──────────────────────────────────────────────────────────────
import { Link } from '@/i18n/routing';

function NoImpactState({ t }: { t: (k: string) => string }) {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">{t('title')}</h2>
        <p className="text-sm text-gray-500 mt-1">Track your contribution to reducing food waste and its real-world environmental effect.</p>
      </div>
      <div className="bg-primary-light border border-primary/20 rounded-xl p-8 text-center">
        <p className="text-base font-semibold text-primary-dark mb-2">No impact data yet</p>
        <p className="text-sm text-gray-600 mb-4">
          Upload your inventory file and generate a forecast to start tracking your environmental impact.
        </p>
        <Link
          href="/upload"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white font-semibold rounded-lg hover:bg-primary-dark transition-colors shadow-sm"
        >
          Upload Data →
        </Link>
      </div>
    </div>
  );
}

// ─── Main Server Component ────────────────────────────────────────────────────
export default async function ImpactPage() {
  const t = await getTranslations('impact.page');
  
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const userId = user.id;

  const [cumulative, monthly, categoryBreakdown] = await Promise.all([
    getCumulativeImpact(userId),
    getMonthlyImpact(userId, 6),
    getCategoryBreakdown(userId),
  ]);

  if (!cumulative) return <NoImpactState t={t} />;

  const wasteKg     = Number(cumulative.waste_kg_prevented);
  const revenueSaved = Number(cumulative.revenue_saved_eur);
  const co2Saved    = Number(cumulative.co2_saved_kg);
  const water       = Number(cumulative.water_saved_litres);
  const meals       = Number(cumulative.meals_equivalent);

  // Monthly chart
  const maxBar = Math.max(...monthly.map((m) => Number(m.waste_kg_prevented)), 1);

  // Category chart
  const totalCategoryKg = Object.values(categoryBreakdown).reduce((a, b) => a + b, 0) || 1;
  const sortedCategories = Object.entries(categoryBreakdown)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 7);

  return (
    <div className="max-w-5xl mx-auto space-y-6">

      {/* ── Page Header ────────────────────────────────────────────────────── */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800">{t('title')}</h2>
        <p className="text-sm text-gray-500 mt-1">
          Track your contribution to reducing food waste and its real-world environmental effect.
        </p>
      </div>

      {/* ── 1. Hero Banner ───────────────────────────────────────────────── */}
      <div className="relative bg-gradient-to-r from-primary to-emerald-600 rounded-2xl p-8 text-white overflow-hidden">
        {/* Decorative leaf */}
        <div className="absolute right-8 top-1/2 -translate-y-1/2 hidden sm:block opacity-[0.12]">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-48 w-48" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1-2.3A4.49 4.49 0 008 20C19 20 22 3 22 3c-1 2-8 5.5-8 5.5z" />
          </svg>
        </div>
        <div className="relative z-10 max-w-lg">
          <p className="text-sm font-medium opacity-80 tracking-wide uppercase">Your Environmental Impact</p>
          <p className="text-5xl font-bold mt-2 leading-none">{fmtKg(wasteKg)}</p>
          <p className="mt-2 text-base opacity-90">of food saved from waste since you joined FreshFlow</p>
          <div className="flex flex-wrap gap-3 mt-6">
            {[
              { icon: '🌍', label: `${fmtKg(co2Saved)} CO₂ avoided` },
              { icon: '💧', label: `${fmtKg(water)} water saved` },
              { icon: '🍽️', label: `${fmt(meals)} meals equivalent` },
            ].map(({ icon, label }) => (
              <div key={label} className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2 flex items-center gap-2">
                <span className="text-base">{icon}</span>
                <span className="text-sm font-medium">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── 2. Summary Cards ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'Food Saved', value: fmtKg(wasteKg),
            sub: `${fmt(meals)} meals equivalent`,
            subColor: 'text-primary',
            iconBg: 'bg-primary-light', iconColor: 'text-primary',
            icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" /></svg>,
          },
          {
            label: t('stats.co2Avoided'), value: fmtKg(co2Saved),
            sub: `${(co2Saved / 1000).toFixed(2)} tonnes total`,
            subColor: 'text-gray-400',
            iconBg: 'bg-blue-100', iconColor: 'text-blue-500',
            icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1-2.3A4.49 4.49 0 008 20C19 20 22 3 22 3c-1 2-8 5.5-8 5.5z" /></svg>,
          },
          {
            label: 'Water Saved', value: `${fmt(water)} L`,
            sub: 'Freshwater equivalent',
            subColor: 'text-gray-400',
            iconBg: 'bg-cyan-100', iconColor: 'text-cyan-500',
            icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 3c-4.97 5.23-7 8.37-7 11a7 7 0 0014 0c0-2.63-2.03-5.77-7-11z" /></svg>,
          },
          {
            label: t('stats.revenueSaved'), value: fmtEur(revenueSaved),
            sub: 'vs. full write-off losses',
            subColor: 'text-gray-400',
            iconBg: 'bg-purple-100', iconColor: 'text-purple-500',
            icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
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

      {/* ── 3. Monthly Bar Chart ──────────────────────────────────────────── */}
      {monthly.length > 0 && (
        <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-6">
          <h3 className="text-base font-semibold text-gray-800 mb-6">Monthly Food Saved (kg)</h3>
          <div className="flex items-end gap-4 h-48">
            {monthly.map((m) => {
              const value    = Number(m.waste_kg_prevented);
              const heightPct = Math.round((value / maxBar) * 100);
              const label    = `${MONTH_NAMES[(m.period_month ?? 1) - 1]} ${m.period_year ?? ''}`;
              const isLatest = m === monthly[monthly.length - 1];
              return (
                <div key={`${m.period_year}-${m.period_month}`} className="flex-1 flex flex-col items-center gap-2 min-w-0">
                  <span className={cn('text-xs font-semibold', isLatest ? 'text-primary-dark' : 'text-gray-400')}>
                    {fmtKg(value)}
                  </span>
                  <div className="w-full flex items-end" style={{ height: '160px' }}>
                    <div
                      className={cn('w-full rounded-t-lg transition-all', isLatest ? 'bg-primary-dark' : 'bg-primary/70')}
                      style={{ height: `${heightPct}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-400 font-medium truncate w-full text-center">{label}</span>
                </div>
              );
            })}
          </div>
          {monthly.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-8">No monthly data yet.</p>
          )}
        </div>
      )}

      {/* ── 4. Category Breakdown ────────────────────────────────────────── */}
      {sortedCategories.length > 0 && (
        <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-6">
          <h3 className="text-base font-semibold text-gray-800 mb-5">Impact by Category</h3>
          <div className="space-y-4">
            {sortedCategories.map(([cat, kg]) => {
              const pct = Math.round((kg / totalCategoryKg) * 100);
              return (
                <div key={cat}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-medium text-gray-700">{cat}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400">{fmtKg(kg)}</span>
                      <span className="text-xs font-semibold text-gray-600">{pct}%</span>
                    </div>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={cn('h-full rounded-full transition-all', categoryColor(cat))}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-500">Total</span>
            <span className="text-base font-bold text-gray-800">{fmtKg(wasteKg)}</span>
          </div>
        </div>
      )}

      {/* ── 5. Leaderboard — Disabled ─────────────────────────────────────── */}
      <div className="bg-gray-50 border border-gray-200 border-dashed rounded-xl p-6 text-center">
        <p className="text-sm font-semibold text-gray-500 mb-1">🏆 City Leaderboard</p>
        <p className="text-xs text-gray-400">
          Coming soon — compare your impact with other businesses in your city.
        </p>
      </div>

    </div>
  );
}