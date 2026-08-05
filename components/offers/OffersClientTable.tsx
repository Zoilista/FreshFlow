'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import type { OfferRow, OfferStatus } from '@/types/database';

type FilterType = 'All' | 'Pending' | 'Accepted' | 'Rejected' | 'Expired';

const STATUS_STYLE: Record<OfferStatus, string> = {
  'Pending':  'bg-amber-100 text-amber-700',
  'Accepted': 'bg-primary-light text-primary-dark',
  'Expired':  'bg-gray-100 text-gray-500',
  'Rejected': 'bg-red-100 text-red-700',
};

function formatEur(n: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);
}

function relativeTime(isoDate: string): string {
  const diffMs = Date.now() - new Date(isoDate).getTime();
  const diffMins = Math.floor(diffMs / 60_000);
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffH = Math.floor(diffMins / 60);
  if (diffH < 24) return `${diffH}h ago`;
  const diffD = Math.floor(diffH / 24);
  if (diffD < 7) return `${diffD}d ago`;
  return new Date(isoDate).toLocaleDateString();
}

export default function OffersClientTable({
  offers,
}: {
  offers: OfferRow[];
}) {
  const [activeTab, setActiveTab] = useState<FilterType>('All');

  const filtered = offers.filter(o => {
    if (activeTab === 'All') return true;
    return o.status === activeTab;
  });

  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
      {/* Header + Tabs */}
      <div className="px-6 pt-5 pb-0 border-b border-gray-100">
        <h3 className="text-base font-semibold text-gray-800 mb-4">Sent Offers</h3>
        <div className="flex gap-1 p-1 bg-gray-100 rounded-lg w-fit mb-[-1px]">
          {['All', 'Pending', 'Accepted', 'Rejected', 'Expired'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as FilterType)}
              className={cn(
                'px-4 py-1.5 text-xs font-semibold rounded-md transition-all duration-150',
                activeTab === tab
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              )}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="divide-y divide-gray-50">
        {filtered.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-10">No offers in this category.</p>
        ) : filtered.map(offer => (
          <div
            key={offer.id}
            className={cn(
              'flex flex-col sm:flex-row sm:items-center gap-4 px-6 py-4 transition-colors',
              offer.status === 'Accepted' ? 'bg-primary-light/20' : 'hover:bg-gray-50'
            )}
          >
            {/* Left: product info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-sm font-semibold text-gray-800">{offer.product_name}</p>
                <span className="text-xs text-gray-400">{offer.category || 'Uncategorised'}</span>
                {offer.risk_level && (
                  <span className="text-[10px] font-semibold border px-1.5 py-0.5 rounded uppercase text-gray-500 bg-white">
                    {offer.risk_level} RISK
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 mt-1.5">
                <span className="text-xs text-gray-500 border border-gray-200 px-2 py-0.5 rounded bg-white">
                  {offer.surplus_quantity} {offer.unit}
                </span>
                <span className="text-xs font-bold text-primary-dark">
                  {formatEur(offer.offer_price)}
                </span>
              </div>
              {offer.notes && (
                <p className="text-xs text-gray-500 mt-2 italic border-l-2 border-gray-200 pl-2">
                  &quot;{offer.notes}&quot;
                </p>
              )}
            </div>

            {/* Middle: buyer info + date */}
            <div className="sm:text-right min-w-max">
              <p className="text-xs text-gray-600">
                Sent to <strong className="text-gray-800">{offer.buyer_name}</strong>
              </p>
              <p className="text-xs text-gray-400 mt-0.5">{relativeTime(offer.created_at)}</p>
            </div>

            {/* Right: status + action */}
            <div className="flex flex-col items-end gap-2 flex-shrink-0 w-28">
              <span className={cn('text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide', STATUS_STYLE[offer.status])}>
                {offer.status}
              </span>
              {offer.status === 'Pending' && (
                <button
                  onClick={() => alert('Simulated: Accepting offer. In a real app, this updates Supabase.')}
                  className="text-[10px] font-semibold text-primary hover:underline underline-offset-2 transition-colors"
                >
                  Mark Accepted →
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
