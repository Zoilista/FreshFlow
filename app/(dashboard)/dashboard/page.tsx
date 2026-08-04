'use client';

import Link from 'next/link';
import { useState } from 'react';
import { cn } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────────
interface ActivityItem {
  color: 'green' | 'amber' | 'red' | 'gray';
  text: string;
  time: string;
}

interface KpiCard {
  label: string;
  value: string;
  iconBg: string;
  iconColor: string;
  icon: React.ReactNode;
}

interface QuickAction {
  emoji: string;
  label: string;
  href: string;
}

// ─── Mock Data ─────────────────────────────────────────────────────────────────────
const ACTIVITY: ActivityItem[] = [
  { color: 'green', text: 'Offer accepted — Bread Rolls (€135)',         time: '2h ago'    },
  { color: 'amber', text: 'New response from FreshHub Amsterdam',         time: '4h ago'    },
  { color: 'red',   text: 'High risk detected — Tomatoes (85/100)',       time: '6h ago'    },
  { color: 'green', text: 'Offer sent — Lettuce to 2 buyers',             time: '1 day ago' },
  { color: 'gray',  text: 'Data uploaded — inventory_june_2025.csv',      time: '1 day ago' },
];

const ACTIVITY_DOT: Record<ActivityItem['color'], string> = {
  green: 'bg-primary',
  amber: 'bg-amber-400',
  red:   'bg-red-500',
  gray:  'bg-gray-300',
};

const KPI_CARDS: KpiCard[] = [
  {
    label: "Today's Surplus Risk",
    value: '6 items',
    iconBg: 'bg-red-100', iconColor: 'text-red-500',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
      </svg>
    ),
  },
  {
    label: 'Active Offers',
    value: '3',
    iconBg: 'bg-amber-100', iconColor: 'text-amber-500',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
      </svg>
    ),
  },
  {
    label: 'Food Saved This Month',
    value: '340 kg',
    iconBg: 'bg-primary-light', iconColor: 'text-primary',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
      </svg>
    ),
  },
  {
    label: 'Pending Responses',
    value: '3',
    iconBg: 'bg-blue-100', iconColor: 'text-blue-500',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.76c0 1.6 1.123 2.994 2.707 3.227 1.068.157 2.148.279 3.238.364.466.037.893.281 1.153.671L12 21l2.652-3.978c.26-.39.687-.634 1.153-.67 1.09-.086 2.17-.208 3.238-.365 1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
      </svg>
    ),
  },
];

const QUICK_ACTIONS: QuickAction[] = [
  { emoji: '📤', label: 'Upload Data',     href: '/upload'   },
  { emoji: '📊', label: 'View Forecast',   href: '/forecast' },
  { emoji: '📦', label: 'Manage Surplus',  href: '/surplus'  },
  { emoji: '📈', label: 'Impact Report',   href: '/impact'   },
];

// ─── Onboarding Banner ───────────────────────────────────────────────────────────
function OnboardingBanner() {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <div className="relative bg-gradient-to-r from-primary-light to-blue-50 border border-primary/20 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      {/* Close button */}
      <button
        id="onboarding-banner-close"
        onClick={() => setVisible(false)}
        className="absolute top-3 right-3 p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-white/60 transition-colors"
        aria-label="Dismiss banner"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Left side */}
      <div className="min-w-0 pr-6">
        <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-primary/15 text-primary text-xs font-bold mb-2">
          Get Started
        </span>
        <h3 className="text-sm font-bold text-gray-800">
          Upload your first data file to unlock forecasts
        </h3>
        <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
          It takes less than 5 minutes. Just upload a CSV with your sales and stock data.
        </p>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3 flex-shrink-0">
        <Link
          href="/upload"
          id="onboarding-banner-upload"
          className="px-4 py-2 text-sm font-semibold bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors duration-150 shadow-sm whitespace-nowrap"
        >
          Upload Now →
        </Link>
        <button
          id="onboarding-banner-example"
          onClick={() => console.log('See example CSV clicked')}
          className="text-sm text-gray-500 hover:text-gray-700 underline underline-offset-2 transition-colors whitespace-nowrap"
        >
          See example CSV
        </button>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────────
export default function DashboardPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-6">

      {/* ── 1. Welcome Banner ────────────────────────────────────────────────── */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-800">
            Good morning, Green Valley Market 👋
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Here&apos;s what&apos;s happening with your inventory today.
          </p>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <Link
            href="/upload"
            className="px-4 py-2 text-sm font-semibold bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors duration-150 shadow-sm"
          >
            Upload New Data
          </Link>
          <Link
            href="/forecast"
            className="px-4 py-2 text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors duration-150"
          >
            View Forecast →
          </Link>
        </div>
      </div>

      {/* ── 1b. Onboarding Banner ──────────────────────────────────────────── */}
      <OnboardingBanner />

      {/* ── 2. Urgent Alerts ─────────────────────────────────────────────────── */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-600 flex items-center gap-1.5">
          <span>⚠️</span> Requires Attention
        </h3>

        {/* Alert 1 — Red */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-red-50 border border-red-200 rounded-xl px-5 py-3.5">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0 animate-pulse" />
            <p className="text-sm text-red-700 font-medium">
              <strong>Bread Rolls</strong> expire in 24h — 90 pcs at risk (€135 value)
            </p>
          </div>
          <Link
            href="/surplus"
            className="flex-shrink-0 text-sm font-semibold text-red-600 hover:text-red-800 underline underline-offset-2 transition-colors"
          >
            Create Offer →
          </Link>
        </div>

        {/* Alert 2 — Amber */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-amber-50 border border-amber-200 rounded-xl px-5 py-3.5">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0" />
            <p className="text-sm text-amber-700 font-medium">
              <strong>5 high-risk items</strong> detected in your latest forecast
            </p>
          </div>
          <Link
            href="/forecast"
            className="flex-shrink-0 text-sm font-semibold text-amber-600 hover:text-amber-800 underline underline-offset-2 transition-colors"
          >
            View Forecast →
          </Link>
        </div>
      </div>

      {/* ── 3. KPI Cards ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {KPI_CARDS.map((card) => (
          <div key={card.label} className="bg-white border border-gray-100 rounded-xl shadow-sm p-5">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide leading-tight">{card.label}</p>
                <p className="text-2xl font-bold text-gray-800 mt-1.5">{card.value}</p>
              </div>
              <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0', card.iconBg, card.iconColor)}>
                {card.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── 4. Two-Column Layout ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* ── Left: Recent Activity ─────────────────────────────────────────── */}
        <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-5">
          <h3 className="text-base font-semibold text-gray-800 mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {ACTIVITY.map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className={cn('mt-1.5 w-2 h-2 rounded-full flex-shrink-0', ACTIVITY_DOT[item.color])} />
                <p className="flex-1 text-sm text-gray-700 leading-relaxed">{item.text}</p>
                <span className="text-xs text-gray-400 flex-shrink-0 mt-0.5">{item.time}</span>
              </div>
            ))}
          </div>
          <Link
            href="/offers"
            className="mt-5 block text-xs font-semibold text-gray-400 hover:text-gray-600 transition-colors"
          >
            View all activity →
          </Link>
        </div>

        {/* ── Right Column ─────────────────────────────────────────────────── */}
        <div className="flex flex-col gap-4">

          {/* Quick Actions */}
          <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-5">
            <h3 className="text-base font-semibold text-gray-800 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              {QUICK_ACTIONS.map((action) => (
                <Link
                  key={action.href}
                  href={action.href}
                  className="group flex flex-col items-center justify-center gap-2 p-4 bg-gray-50 hover:bg-primary-light rounded-xl transition-colors duration-150"
                >
                  <span className="text-2xl">{action.emoji}</span>
                  <span className="text-xs font-semibold text-gray-600 group-hover:text-primary-dark transition-colors text-center leading-tight">
                    {action.label}
                  </span>
                </Link>
              ))}
            </div>
          </div>

          {/* City Rank Mini Card */}
          <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-xl p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-amber-800 flex items-center gap-1.5">
                  🏆 Amsterdam Leaderboard
                </p>
                <p className="text-xs text-amber-700 mt-1">You&apos;re ranked <strong>#8</strong> of 10 businesses</p>

                {/* Rank progress bar */}
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-amber-600 mb-1">
                    <span>Your position</span>
                    <span>8 / 10</span>
                  </div>
                  <div className="h-1.5 bg-amber-200 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-400 rounded-full" style={{ width: '80%' }} />
                  </div>
                </div>
              </div>
            </div>
            <Link
              href="/impact"
              className="mt-4 block text-xs font-semibold text-amber-700 hover:text-amber-900 underline underline-offset-2 transition-colors"
            >
              View Full Leaderboard →
            </Link>
          </div>

        </div>
      </div>

      {/* ── 5. Last Upload ───────────────────────────────────────────────────── */}
      <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-5 flex items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-1">Last Upload</h3>
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-sm text-gray-600 font-medium">inventory_june_2025.csv</span>
            <span className="text-gray-300">·</span>
            <span className="text-xs text-gray-500">1,240 rows</span>
            <span className="text-gray-300">·</span>
            <span className="text-xs text-gray-500">Jun 28, 2025</span>
            <span className="text-gray-300">·</span>
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary-dark">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
              Processed
            </span>
          </div>
        </div>
        <Link
          href="/upload"
          className="flex-shrink-0 text-sm font-semibold text-primary hover:text-primary-dark underline underline-offset-2 transition-colors"
        >
          Upload New →
        </Link>
      </div>

    </div>
  );
}
