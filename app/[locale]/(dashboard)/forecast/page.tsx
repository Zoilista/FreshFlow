// Forecast Page — Server Component + Client filter island
// All data from Supabase. No mock data.

import { Link } from '@/i18n/routing';
import { createClient } from '@/lib/supabase/server';
import { getLatestUpload } from '@/lib/repositories/uploads.repository';
import {
  getSurplusPredictions,
  countHighRiskItems,
  getTotalPotentialLoss,
} from '@/lib/repositories/forecasts.repository';
import { countProducts } from '@/lib/repositories/products.repository';
import ForecastTable from '@/components/forecast/ForecastTable';


function formatEur(value: number): string {
  return `€${Math.round(value).toLocaleString()}`;
}

function formatDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

// ─── Empty State ──────────────────────────────────────────────────────────────
function NoForecastState() {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Surplus Risk Forecast</h2>
        <p className="text-sm text-gray-500 mt-1">Demand predictions and surplus risk analysis for your inventory.</p>
      </div>
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-8 text-center">
        <p className="text-base font-semibold text-blue-800 mb-2">No forecast data yet</p>
        <p className="text-sm text-blue-700 mb-4">
          Upload your inventory CSV or Excel file to generate your first forecast.
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
export default async function ForecastPage() {
  
  
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const userId = user.id;

  const latestUpload = await getLatestUpload(userId);
  if (!latestUpload) return <NoForecastState />;

  const uploadId = latestUpload.id;

  const [predictions, highRiskCount, totalLoss, productCount] = await Promise.all([
    getSurplusPredictions(userId, uploadId),
    countHighRiskItems(userId, uploadId),
    getTotalPotentialLoss(userId, uploadId),
    countProducts(userId),
  ]);

  const criticalCount = predictions.filter((p) => p.risk_level === 'CRITICAL').length;

  return (
    <div className="max-w-6xl mx-auto space-y-6">

      {/* ── Page Header ──────────────────────────────────────────────────── */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Surplus Risk Forecast</h2>
        <p className="text-sm text-gray-500 mt-1">
          Demand predictions and surplus risk analysis for your inventory.
        </p>
      </div>

      {/* ── Status Banner ────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-4 bg-blue-50 border border-blue-200 rounded-xl px-5 py-3">
        <div className="flex items-center gap-2.5">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
          </svg>
          <p className="text-sm text-blue-700">
            Showing forecast based on{' '}
            <span className="font-semibold">{latestUpload.filename}</span>{' '}
            <span className="text-blue-500">({formatDate(latestUpload.created_at)})</span>
          </p>
        </div>
        <Link
          href="/upload"
          className="text-sm font-semibold text-blue-600 hover:text-blue-800 whitespace-nowrap underline underline-offset-2 transition-colors duration-150"
        >
          Upload New Data →
        </Link>
      </div>

      {/* ── Summary Cards ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'Products Analysed', value: String(productCount),
            bg: 'bg-primary-light', color: 'text-primary',
            icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>,
          },
          {
            label: 'High Risk Items', value: String(highRiskCount),
            bg: 'bg-red-100', color: 'text-red-500',
            icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg>,
          },
          {
            label: 'Forecast Period', value: '7 days',
            bg: 'bg-blue-100', color: 'text-blue-500',
            icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>,
          },
          {
            label: 'Potential Loss', value: formatEur(totalLoss),
            bg: 'bg-amber-100', color: 'text-amber-500',
            icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
          },
        ].map((card) => (
          <div key={card.label} className="bg-white border border-gray-100 rounded-xl shadow-sm p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">{card.label}</p>
                <p className="text-2xl font-bold text-gray-800 mt-1.5">{card.value}</p>
              </div>
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${card.bg} ${card.color}`}>
                {card.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Client-side Filterable Table ─────────────────────────────────── */}
      <ForecastTable predictions={predictions} />

      {/* ── Insight Card ────────────────────────────────────────────────── */}
      {totalLoss > 0 && (
        <div className="bg-gradient-to-r from-primary-light to-blue-50 border border-primary/20 rounded-xl p-5 flex flex-col sm:flex-row sm:items-start gap-4">
          <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-primary-dark mb-1">Forecast Insight</p>
            <p className="text-sm text-gray-700 leading-relaxed">
              Based on your sales history and current stock, we forecast{' '}
              <strong className="text-gray-800">{formatEur(totalLoss)} in potential losses</strong>{' '}
              from surplus inventory.
              {criticalCount > 0 && (
                <> <strong className="text-gray-800">{criticalCount} products</strong> are at critical risk — consider creating offers immediately.</>
              )}
            </p>
          </div>
          <div className="flex-shrink-0 self-center sm:self-start pt-0.5">
            <Link
              href="/surplus"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary-dark transition-colors duration-150 shadow-sm whitespace-nowrap"
            >
              View Surplus
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </div>
        </div>
      )}

    </div>
  );
}