'use client';

import { useState } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

// ─── Types ───────────────────────────────────────────────────────────────────────
type RiskLevel = 'HIGH' | 'MEDIUM' | 'LOW';
type FilterType = 'all' | 'high' | 'medium' | 'low';

interface ForecastItem {
  product: string;
  category: string;
  currentStock: string;
  forecastDemand: string;
  risk: RiskLevel;
  riskScore: number;
  action: 'Create Offer' | 'Monitor' | null;
}

// ─── Mock Data ──────────────────────────────────────────────────────────────────
const FORECAST_ITEMS: ForecastItem[] = [
  { product: 'Tomatoes',    category: 'Vegetables', currentStock: '450 kg',  forecastDemand: '180 kg',  risk: 'HIGH',   riskScore: 85, action: 'Create Offer' },
  { product: 'Strawberries',category: 'Fruits',     currentStock: '200 kg',  forecastDemand: '160 kg',  risk: 'MEDIUM', riskScore: 58, action: 'Monitor' },
  { product: 'Lettuce',     category: 'Vegetables', currentStock: '320 kg',  forecastDemand: '90 kg',   risk: 'HIGH',   riskScore: 79, action: 'Create Offer' },
  { product: 'Oranges',     category: 'Fruits',     currentStock: '580 kg',  forecastDemand: '520 kg',  risk: 'LOW',    riskScore: 22, action: null },
  { product: 'Bread Rolls', category: 'Bakery',     currentStock: '150 pcs', forecastDemand: '60 pcs',  risk: 'HIGH',   riskScore: 91, action: 'Create Offer' },
  { product: 'Cucumbers',   category: 'Vegetables', currentStock: '280 kg',  forecastDemand: '240 kg',  risk: 'LOW',    riskScore: 18, action: null },
  { product: 'Bananas',     category: 'Fruits',     currentStock: '340 kg',  forecastDemand: '200 kg',  risk: 'MEDIUM', riskScore: 62, action: 'Monitor' },
  { product: 'Milk 2L',     category: 'Dairy',      currentStock: '90 pcs',  forecastDemand: '45 pcs',  risk: 'HIGH',   riskScore: 88, action: 'Create Offer' },
  { product: 'Peppers',     category: 'Vegetables', currentStock: '195 kg',  forecastDemand: '170 kg',  risk: 'LOW',    riskScore: 31, action: null },
  { product: 'Yogurt 500g', category: 'Dairy',      currentStock: '120 pcs', forecastDemand: '55 pcs',  risk: 'HIGH',   riskScore: 77, action: 'Create Offer' },
];

const SUMMARY_CARDS = [
  {
    label: 'Products Analyzed',
    value: '24',
    color: 'bg-primary-light',
    iconColor: 'text-primary',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
  },
  {
    label: 'High Risk Items',
    value: '6',
    color: 'bg-red-100',
    iconColor: 'text-red-500',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
      </svg>
    ),
  },
  {
    label: 'Forecast Period',
    value: '7 days',
    color: 'bg-blue-100',
    iconColor: 'text-blue-500',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
      </svg>
    ),
  },
  {
    label: 'Potential Savings',
    value: '€1,240',
    color: 'bg-amber-100',
    iconColor: 'text-amber-500',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────────
function RiskBadge({ level }: { level: RiskLevel }) {
  const styles: Record<RiskLevel, string> = {
    HIGH:   'bg-red-100 text-red-700',
    MEDIUM: 'bg-amber-100 text-amber-700',
    LOW:    'bg-green-100 text-green-700',
  };
  return (
    <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold', styles[level])}>
      {level}
    </span>
  );
}

function RiskBar({ score, level }: { score: number; level: RiskLevel }) {
  const barColor: Record<RiskLevel, string> = {
    HIGH:   'bg-red-500',
    MEDIUM: 'bg-amber-400',
    LOW:    'bg-green-500',
  };
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden min-w-[64px]">
        <div
          className={cn('h-full rounded-full transition-all', barColor[level])}
          style={{ width: `${score}%` }}
        />
      </div>
      <span className="text-xs font-medium text-gray-600 w-6 text-right">{score}</span>
    </div>
  );
}

const FILTER_OPTIONS: { label: string; value: FilterType }[] = [
  { label: 'All',       value: 'all'    },
  { label: 'High Risk', value: 'high'   },
  { label: 'Medium',    value: 'medium' },
  { label: 'Low Risk',  value: 'low'    },
];

// ─── Main Component ───────────────────────────────────────────────────────────────
export default function ForecastPage() {
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

  const filtered = FORECAST_ITEMS.filter((item) => {
    if (activeFilter === 'all') return true;
    return item.risk.toLowerCase() === activeFilter;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6">

      {/* ── Page Header ──────────────────────────────────────────────────────── */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Surplus Risk Forecast</h2>
        <p className="text-sm text-gray-500 mt-1">
          AI-powered demand predictions and surplus risk analysis for your inventory.
        </p>
      </div>

      {/* ── 1. Status Banner ─────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-4 bg-blue-50 border border-blue-200 rounded-xl px-5 py-3">
        <div className="flex items-center gap-2.5">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
          </svg>
          <p className="text-sm text-blue-700">
            Showing forecast based on your last upload:{' '}
            <span className="font-semibold">inventory_june_2025.csv</span>{' '}
            <span className="text-blue-500">(Jun 28, 2025)</span>
          </p>
        </div>
        <Link
          href="/upload"
          className="text-sm font-semibold text-blue-600 hover:text-blue-800 whitespace-nowrap underline underline-offset-2 transition-colors duration-150"
        >
          Upload New Data →
        </Link>
      </div>

      {/* ── 2. Summary Cards ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {SUMMARY_CARDS.map((card) => (
          <div key={card.label} className="bg-white border border-gray-100 rounded-xl shadow-sm p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">{card.label}</p>
                <p className="text-2xl font-bold text-gray-800 mt-1.5">{card.value}</p>
              </div>
              <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0', card.color, card.iconColor)}>
                {card.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── 3. Risk Table ────────────────────────────────────────────────────── */}
      <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
        {/* Table Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold text-gray-800">Surplus Risk Forecast</h3>
            <p className="text-xs text-gray-400 mt-0.5">
              {filtered.length} of {FORECAST_ITEMS.length} products shown
            </p>
          </div>

          {/* Filter Buttons */}
          <div className="flex items-center gap-1.5 p-1 bg-gray-100 rounded-lg">
            {FILTER_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setActiveFilter(opt.value)}
                className={cn(
                  'px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-150',
                  activeFilter === opt.value
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {['Product', 'Category', 'Current Stock', 'Forecast Demand', 'Surplus Risk', 'Risk Score', 'Action'].map((col) => (
                  <th
                    key={col}
                    className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((item) => (
                <tr key={item.product} className="hover:bg-gray-50 transition-colors duration-100">
                  {/* Product */}
                  <td className="px-5 py-3.5 font-medium text-gray-800 whitespace-nowrap">{item.product}</td>
                  {/* Category */}
                  <td className="px-5 py-3.5 text-gray-500 whitespace-nowrap">{item.category}</td>
                  {/* Current Stock */}
                  <td className="px-5 py-3.5 text-gray-700 whitespace-nowrap">{item.currentStock}</td>
                  {/* Forecast Demand */}
                  <td className="px-5 py-3.5 text-gray-700 whitespace-nowrap">{item.forecastDemand}</td>
                  {/* Risk Badge */}
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <RiskBadge level={item.risk} />
                  </td>
                  {/* Risk Score Bar */}
                  <td className="px-5 py-3.5 w-36">
                    <RiskBar score={item.riskScore} level={item.risk} />
                  </td>
                  {/* Action */}
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    {item.action === 'Create Offer' && (
                      <button
                        onClick={() => console.log(`Create offer for ${item.product}`)}
                        className="px-3 py-1.5 text-xs font-semibold bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors duration-150"
                      >
                        Create Offer
                      </button>
                    )}
                    {item.action === 'Monitor' && (
                      <button
                        onClick={() => console.log(`Monitor ${item.product}`)}
                        className="px-3 py-1.5 text-xs font-semibold border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors duration-150"
                      >
                        Monitor
                      </button>
                    )}
                    {item.action === null && (
                      <span className="text-gray-300 font-medium">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div className="py-12 text-center">
              <p className="text-sm text-gray-400">No products match the selected filter.</p>
            </div>
          )}
        </div>
      </div>

      {/* ── 4. AI Insight Card ───────────────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-primary-light to-blue-50 border border-primary/20 rounded-xl p-5 flex flex-col sm:flex-row sm:items-start gap-4">
        {/* Icon */}
        <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
          </svg>
        </div>

        {/* Text */}
        <div className="flex-1">
          <p className="text-sm font-bold text-primary-dark mb-1">AI Insight</p>
          <p className="text-sm text-gray-700 leading-relaxed">
            Based on historical patterns and current stock levels, we forecast{' '}
            <strong className="text-gray-800">€1,240 in potential losses</strong> if surplus items are not
            redirected within <strong className="text-gray-800">48 hours</strong>. 5 products are at
            critical risk. Consider creating offers for high-risk items immediately.
          </p>
        </div>

        {/* CTA */}
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

    </div>
  );
}