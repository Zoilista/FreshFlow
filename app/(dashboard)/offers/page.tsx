'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────────
type OfferStatus = 'Awaiting Response' | 'Offer Accepted' | 'Expired';
type TabFilter  = 'all' | 'pending' | 'accepted' | 'expired';

interface SentOffer {
  id: string;
  product: string;
  quantity: string;
  price: string;
  buyerCount: number;
  sentAt: string;
  status: OfferStatus;
}

interface IncomingResponse {
  id: string;
  product: string;
  buyer: string;
  message: string;
}

// ─── Mock Data ─────────────────────────────────────────────────────────────────────
const SENT_OFFERS: SentOffer[] = [
  { id: 'tomatoes',     product: 'Tomatoes',     quantity: '270 kg',  price: '€540', buyerCount: 3, sentAt: '2h ago',    status: 'Awaiting Response' },
  { id: 'lettuce',      product: 'Lettuce',       quantity: '230 kg',  price: '€180', buyerCount: 2, sentAt: '5h ago',    status: 'Awaiting Response' },
  { id: 'bread-rolls',  product: 'Bread Rolls',   quantity: '90 pcs',  price: '€135', buyerCount: 4, sentAt: '1 day ago', status: 'Offer Accepted'   },
  { id: 'yogurt',       product: 'Yogurt 500g',   quantity: '65 pcs',  price: '€165', buyerCount: 1, sentAt: '1 day ago', status: 'Awaiting Response' },
  { id: 'cucumbers',    product: 'Cucumbers',     quantity: '110 kg',  price: '€95',  buyerCount: 3, sentAt: '2 days ago',status: 'Offer Accepted'   },
  { id: 'strawberries', product: 'Strawberries',  quantity: '40 kg',   price: '€120', buyerCount: 2, sentAt: '3 days ago',status: 'Expired'          },
];

const INCOMING: IncomingResponse[] = [
  { id: 'r1', product: 'Bread Rolls', buyer: 'Noord Bakery Supply',  message: '"We\'ll take 60 pcs at €1.40/unit"' },
  { id: 'r2', product: 'Cucumbers',   buyer: 'FreshHub Amsterdam',   message: '"Interested in 80 kg at €0.85/kg"' },
  { id: 'r3', product: 'Tomatoes',    buyer: 'GreenMart Noord',      message: '"Can we do 150 kg at €1.80/kg?"' },
];

const STATUS_STYLE: Record<OfferStatus, string> = {
  'Awaiting Response': 'bg-amber-100 text-amber-700',
  'Offer Accepted':    'bg-primary-light text-primary-dark',
  'Expired':           'bg-gray-100 text-gray-500',
};

const TABS: { label: string; value: TabFilter }[] = [
  { label: 'All',      value: 'all'      },
  { label: 'Pending',  value: 'pending'  },
  { label: 'Accepted', value: 'accepted' },
  { label: 'Expired',  value: 'expired'  },
];

function filterOffers(offers: SentOffer[], tab: TabFilter): SentOffer[] {
  if (tab === 'all')      return offers;
  if (tab === 'pending')  return offers.filter((o) => o.status === 'Awaiting Response');
  if (tab === 'accepted') return offers.filter((o) => o.status === 'Offer Accepted');
  if (tab === 'expired')  return offers.filter((o) => o.status === 'Expired');
  return offers;
}

// ─── Main Component ───────────────────────────────────────────────────────────────
export default function OffersPage() {
  const [activeTab, setActiveTab] = useState<TabFilter>('all');

  const filtered = filterOffers(SENT_OFFERS, activeTab);

  return (
    <div className="max-w-4xl mx-auto space-y-6">

      {/* ── Page Header ──────────────────────────────────────────────────────── */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Offers</h2>
        <p className="text-sm text-gray-500 mt-1">
          Manage the surplus offers you've sent and respond to incoming buyer messages.
        </p>
      </div>

      {/* ── 1. Summary Cards ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-4">
        {[
          {
            label: 'Sent Offers', value: '8',
            iconBg: 'bg-blue-100', iconColor: 'text-blue-500',
            icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" /></svg>,
          },
          {
            label: 'Received Responses', value: '5',
            iconBg: 'bg-amber-100', iconColor: 'text-amber-500',
            icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.76c0 1.6 1.123 2.994 2.707 3.227 1.068.157 2.148.279 3.238.364.466.037.893.281 1.153.671L12 21l2.652-3.978c.26-.39.687-.634 1.153-.67 1.09-.086 2.17-.208 3.238-.365 1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" /></svg>,
          },
          {
            label: 'Accepted Deals', value: '3',
            iconBg: 'bg-primary-light', iconColor: 'text-primary',
            icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
          },
        ].map((card) => (
          <div key={card.label} className="bg-white border border-gray-100 rounded-xl shadow-sm p-5 flex items-center gap-4">
            <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0', card.iconBg, card.iconColor)}>
              {card.icon}
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{card.value}</p>
              <p className="text-xs text-gray-400 mt-0.5">{card.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── 2. Sent Offers Panel ─────────────────────────────────────────────── */}
      <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
        {/* Header + Tabs */}
        <div className="px-6 pt-5 pb-0 border-b border-gray-100">
          <h3 className="text-base font-semibold text-gray-800 mb-4">Sent Offers</h3>
          <div className="flex gap-1 p-1 bg-gray-100 rounded-lg w-fit mb-[-1px]">
            {TABS.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={cn(
                  'px-4 py-1.5 text-xs font-semibold rounded-md transition-all duration-150',
                  activeTab === tab.value
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* List */}
        <div className="divide-y divide-gray-50">
          {filtered.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-10">No offers in this category.</p>
          ) : filtered.map((offer) => (
            <div
              key={offer.id}
              className={cn(
                'flex flex-col sm:flex-row sm:items-center gap-4 px-6 py-4 transition-colors',
                offer.status === 'Offer Accepted' ? 'bg-primary-light/20' : 'hover:bg-gray-50'
              )}
            >
              {/* Left: product info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800">{offer.product}</p>
                <div className="flex items-center gap-3 mt-0.5">
                  <span className="text-xs text-gray-500">{offer.quantity}</span>
                  <span className="text-xs font-semibold text-gray-700">{offer.price}</span>
                </div>
              </div>

              {/* Middle: buyer info + date */}
              <div className="sm:text-right min-w-max">
                <p className="text-xs text-gray-600">
                  Sent to <strong>{offer.buyerCount} {offer.buyerCount === 1 ? 'buyer' : 'buyers'}</strong>
                </p>
                <p className="text-xs text-gray-400 mt-0.5">{offer.sentAt}</p>
              </div>

              {/* Right: status + action */}
              <div className="flex items-center gap-3 flex-shrink-0">
                <span className={cn('text-xs font-semibold px-2.5 py-1 rounded-full', STATUS_STYLE[offer.status])}>
                  {offer.status}
                </span>
                <button
                  onClick={() => console.log('View details:', offer.id)}
                  className="text-xs font-semibold text-secondary hover:underline underline-offset-2 transition-colors"
                >
                  View Details →
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── 3. Incoming Responses Panel ──────────────────────────────────────── */}
      <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-base font-semibold text-gray-800">Incoming Responses</h3>
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-3 py-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            {INCOMING.length} new
          </span>
        </div>

        <div className="divide-y divide-gray-50">
          {INCOMING.map((resp) => (
            <div key={resp.id} className="px-6 py-5 flex flex-col sm:flex-row sm:items-center gap-4">
              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-semibold text-gray-800">{resp.buyer}</p>
                  <span className="text-xs text-gray-400">·</span>
                  <span className="text-xs text-gray-500">{resp.product}</span>
                </div>
                <p className="text-sm italic text-gray-600 mt-1.5">{resp.message}</p>
              </div>

              {/* Buttons */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => console.log('Accept response from:', resp.buyer)}
                  className="px-4 py-1.5 text-xs font-semibold bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors duration-150"
                >
                  Accept
                </button>
                <button
                  onClick={() => console.log('Decline response from:', resp.buyer)}
                  className="px-4 py-1.5 text-xs font-semibold border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors duration-150"
                >
                  Decline
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}