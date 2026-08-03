'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────────
type RiskLevel = 'HIGH' | 'MEDIUM' | 'LOW';
type TabType = 'needs-action' | 'active-offers' | 'resolved';
type Visibility = 'all-buyers' | 'specific-network' | 'food-banks';

interface SurplusItem {
  id: string;
  product: string;
  category: string;
  risk: RiskLevel;
  currentStock: string;
  forecastDemand: string;
  surplus: string;
  surplusRaw: number;
  totalRaw: number;
  unit: string;
  estValue: string;
  urgency: string;
  urgencyType: 'danger' | 'warning';
  secondaryAction: 'Donate' | 'Set Alert';
}

interface ActiveOffer {
  id: string;
  product: string;
  category: string;
  risk: RiskLevel;
  offerPrice: string;
  buyers: number;
  status: 'Awaiting Response' | 'Offer Accepted';
}

interface ResolvedItem {
  id: string;
  product: string;
  outcome: string;
  earned: string;
  date: string;
}

interface ModalProduct {
  name: string;
  surplus: string;
  unit: string;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────────
const NEEDS_ACTION: SurplusItem[] = [
  {
    id: 'tomatoes',
    product: 'Tomatoes',    category: 'Vegetables', risk: 'HIGH',
    currentStock: '450 kg', forecastDemand: '180 kg', surplus: '270 kg',
    surplusRaw: 270, totalRaw: 450, unit: 'kg',
    estValue: '€540',
    urgency: '⏱ High risk — expires within 48h', urgencyType: 'danger',
    secondaryAction: 'Donate',
  },
  {
    id: 'bread-rolls',
    product: 'Bread Rolls', category: 'Bakery',     risk: 'HIGH',
    currentStock: '150 pcs', forecastDemand: '60 pcs', surplus: '90 pcs',
    surplusRaw: 90, totalRaw: 150, unit: 'pcs',
    estValue: '€135',
    urgency: '⏱ High risk — expires within 24h', urgencyType: 'danger',
    secondaryAction: 'Donate',
  },
  {
    id: 'milk',
    product: 'Milk 2L',     category: 'Dairy',      risk: 'HIGH',
    currentStock: '90 pcs',  forecastDemand: '45 pcs', surplus: '45 pcs',
    surplusRaw: 45, totalRaw: 90, unit: 'pcs',
    estValue: '€90',
    urgency: '⏱ High risk — expires within 36h', urgencyType: 'danger',
    secondaryAction: 'Donate',
  },
  {
    id: 'strawberries',
    product: 'Strawberries', category: 'Fruits',     risk: 'MEDIUM',
    currentStock: '200 kg',  forecastDemand: '160 kg', surplus: '40 kg',
    surplusRaw: 40, totalRaw: 200, unit: 'kg',
    estValue: '€120',
    urgency: '📊 Monitor — review in 3 days', urgencyType: 'warning',
    secondaryAction: 'Set Alert',
  },
  {
    id: 'bananas',
    product: 'Bananas',      category: 'Fruits',     risk: 'MEDIUM',
    currentStock: '340 kg',  forecastDemand: '200 kg', surplus: '140 kg',
    surplusRaw: 140, totalRaw: 340, unit: 'kg',
    estValue: '€280',
    urgency: '📊 Monitor — review in 2 days', urgencyType: 'warning',
    secondaryAction: 'Set Alert',
  },
];

const ACTIVE_OFFERS: ActiveOffer[] = [
  { id: 'lettuce',   product: 'Lettuce',      category: 'Vegetables', risk: 'HIGH',   offerPrice: '€180', buyers: 2, status: 'Awaiting Response' },
  { id: 'yogurt',    product: 'Yogurt 500g',  category: 'Dairy',      risk: 'HIGH',   offerPrice: '€165', buyers: 1, status: 'Awaiting Response' },
  { id: 'cucumbers', product: 'Cucumbers',    category: 'Vegetables', risk: 'LOW',    offerPrice: '€95',  buyers: 3, status: 'Offer Accepted' },
];

const RESOLVED: ResolvedItem[] = [
  { id: 'oranges', product: 'Oranges',  outcome: 'Successfully sold 60 kg', earned: '€120 earned', date: 'Jun 27' },
  { id: 'peppers', product: 'Peppers',  outcome: 'Donated 25 kg to food bank', earned: 'Impact: 50 meals', date: 'Jun 25' },
];

const TABS: { label: string; value: TabType; count: number }[] = [
  { label: 'Needs Action',  value: 'needs-action',  count: NEEDS_ACTION.length },
  { label: 'Active Offers', value: 'active-offers', count: ACTIVE_OFFERS.length },
  { label: 'Resolved',      value: 'resolved',      count: RESOLVED.length },
];

// ─── Sub-components ───────────────────────────────────────────────────────────────
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

function SurplusBar({ surplusRaw, totalRaw, risk }: { surplusRaw: number; totalRaw: number; risk: RiskLevel }) {
  const pct = Math.round((surplusRaw / totalRaw) * 100);
  const color: Record<RiskLevel, string> = { HIGH: 'bg-red-500', MEDIUM: 'bg-amber-400', LOW: 'bg-green-500' };
  return (
    <div className="mt-3">
      <div className="flex justify-between text-xs text-gray-400 mb-1">
        <span>{surplusRaw} surplus of {totalRaw} total</span>
        <span>{pct}%</span>
      </div>
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className={cn('h-full rounded-full transition-all', color[risk])} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

// ─── Create Offer Modal ───────────────────────────────────────────────────────────
interface ModalProps {
  product: ModalProduct;
  onClose: () => void;
}

function CreateOfferModal({ product, onClose }: ModalProps) {
  const [qty, setQty]      = useState('');
  const [price, setPrice]  = useState('');
  const [notes, setNotes]  = useState('');
  const [vis, setVis]      = useState<Visibility>('all-buyers');

  const handleSend = () => {
    console.log('Send Offer', { product: product.name, qty, price, notes, visibility: vis });
    onClose();
  };

  const visOptions: { value: Visibility; label: string }[] = [
    { value: 'all-buyers',       label: 'All registered buyers in my city' },
    { value: 'specific-network', label: 'Specific buyer network' },
    { value: 'food-banks',       label: 'Food banks / Social markets only' },
  ];

  return (
    <div
      className="fixed inset-0 bg-black/40 z-50 flex items-start justify-center px-4 overflow-y-auto"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl p-6 max-w-md w-full mt-16 mb-8 shadow-xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-gray-800">Create Surplus Offer</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Product Info (readonly) */}
        <div className="bg-gray-50 rounded-xl px-4 py-3 mb-5 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400 font-medium">Selected Product</p>
            <p className="text-sm font-semibold text-gray-800 mt-0.5">{product.name}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400 font-medium">Available Surplus</p>
            <p className="text-sm font-semibold text-primary-dark mt-0.5">{product.surplus}</p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Offer Quantity */}
          <div>
            <label htmlFor="offer-qty" className="block text-xs font-semibold text-gray-600 mb-1.5">
              Offer Quantity <span className="text-gray-400 font-normal">(max {product.surplus})</span>
            </label>
            <div className="relative">
              <input
                id="offer-qty"
                type="number"
                min={1}
                placeholder={`e.g. 100`}
                value={qty}
                onChange={(e) => setQty(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">{product.unit}</span>
            </div>
          </div>

          {/* Price per unit */}
          <div>
            <label htmlFor="offer-price" className="block text-xs font-semibold text-gray-600 mb-1.5">
              Price per unit (€)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">€</span>
              <input
                id="offer-price"
                type="number"
                min={0}
                step={0.01}
                placeholder="0.00"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full border border-gray-200 rounded-lg pl-8 pr-4 py-2.5 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label htmlFor="offer-notes" className="block text-xs font-semibold text-gray-600 mb-1.5">
              Additional Notes <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <textarea
              id="offer-notes"
              rows={3}
              placeholder="e.g. Best before tomorrow, available for pickup from 08:00..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors resize-none"
            />
          </div>

          {/* Visibility */}
          <div>
            <p className="text-xs font-semibold text-gray-600 mb-2">Who can see this offer?</p>
            <div className="space-y-2">
              {visOptions.map((opt) => (
                <label key={opt.value} className="flex items-center gap-3 cursor-pointer group">
                  <div
                    className={cn(
                      'w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors',
                      vis === opt.value ? 'border-primary bg-primary' : 'border-gray-300 group-hover:border-primary/50'
                    )}
                    onClick={() => setVis(opt.value)}
                  >
                    {vis === opt.value && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                  <span className="text-sm text-gray-700" onClick={() => setVis(opt.value)}>
                    {opt.label}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 text-sm font-semibold text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSend}
            className="flex-1 py-2.5 text-sm font-semibold text-white bg-primary rounded-lg hover:bg-primary-dark transition-colors shadow-sm"
          >
            Send Offer
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────────
export default function SurplusPage() {
  const [activeTab, setActiveTab]           = useState<TabType>('needs-action');
  const [modalOpen, setModalOpen]           = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ModalProduct | null>(null);

  // Lock body scroll when modal open
  useEffect(() => {
    if (modalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [modalOpen]);

  const openModal = (item: SurplusItem) => {
    setSelectedProduct({ name: item.product, surplus: item.surplus, unit: item.unit });
    setModalOpen(true);
  };

  return (
    <>
      {modalOpen && selectedProduct && (
        <CreateOfferModal product={selectedProduct} onClose={() => setModalOpen(false)} />
      )}

      <div className="max-w-4xl mx-auto space-y-6">

        {/* ── Page Header ──────────────────────────────────────────────────── */}
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Surplus Management</h2>
          <p className="text-sm text-gray-500 mt-1">
            Monitor, redirect and resolve surplus inventory before it becomes waste.
          </p>
        </div>

        {/* ── 1. Summary Cards ─────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              label: 'Active Offers',
              value: '3',
              iconBg: 'bg-primary-light',
              iconColor: 'text-primary',
              icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              ),
            },
            {
              label: 'Total Surplus Value',
              value: '€2,180',
              iconBg: 'bg-amber-100',
              iconColor: 'text-amber-500',
              icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ),
            },
            {
              label: 'Items Redirected This Month',
              value: '18',
              iconBg: 'bg-blue-100',
              iconColor: 'text-blue-500',
              icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ),
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

        {/* ── 2. Surplus Items Panel ────────────────────────────────────────── */}
        <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
          {/* Panel Header + Tabs */}
          <div className="px-6 pt-5 pb-0 border-b border-gray-100">
            <h3 className="text-base font-semibold text-gray-800 mb-4">Current Surplus Items</h3>
            <div className="flex gap-6">
              {TABS.map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setActiveTab(tab.value)}
                  className={cn(
                    'pb-3 text-sm font-semibold flex items-center gap-1.5 border-b-2 transition-colors duration-150',
                    activeTab === tab.value
                      ? 'border-primary text-primary-dark'
                      : 'border-transparent text-gray-400 hover:text-gray-600'
                  )}
                >
                  {tab.label}
                  <span className={cn(
                    'inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold',
                    activeTab === tab.value ? 'bg-primary-light text-primary-dark' : 'bg-gray-100 text-gray-500'
                  )}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6 space-y-4">

            {/* ── TAB 1: Needs Action ──────────────────────────────────────── */}
            {activeTab === 'needs-action' && NEEDS_ACTION.map((item) => (
              <div
                key={item.id}
                className="border border-gray-100 rounded-xl p-5 hover:border-gray-200 transition-colors duration-150"
              >
                {/* Top row */}
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h4 className="text-base font-semibold text-gray-800">{item.product}</h4>
                    <span className="text-xs text-gray-400">{item.category}</span>
                    <RiskBadge level={item.risk} />
                  </div>
                  {/* Action buttons */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => openModal(item)}
                      className="px-3.5 py-1.5 text-xs font-semibold bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors duration-150"
                    >
                      Create Offer
                    </button>
                    <button
                      onClick={() => console.log(`${item.secondaryAction}: ${item.product}`)}
                      className="px-3.5 py-1.5 text-xs font-semibold border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors duration-150"
                    >
                      {item.secondaryAction}
                    </button>
                  </div>
                </div>

                {/* Details grid */}
                <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { label: 'Current Stock', value: item.currentStock },
                    { label: 'Forecast Demand', value: item.forecastDemand },
                    { label: 'Surplus', value: item.surplus },
                    { label: 'Est. Value', value: item.estValue },
                  ].map(({ label, value }) => (
                    <div key={label} className="bg-gray-50 rounded-lg px-3 py-2">
                      <p className="text-xs text-gray-400">{label}</p>
                      <p className="text-sm font-semibold text-gray-700 mt-0.5">{value}</p>
                    </div>
                  ))}
                </div>

                {/* Progress bar */}
                <SurplusBar surplusRaw={item.surplusRaw} totalRaw={item.totalRaw} risk={item.risk} />

                {/* Urgency label */}
                <p className={cn(
                  'text-xs font-medium mt-3',
                  item.urgencyType === 'danger' ? 'text-red-500' : 'text-amber-600'
                )}>
                  {item.urgency}
                </p>
              </div>
            ))}

            {/* ── TAB 2: Active Offers ──────────────────────────────────────── */}
            {activeTab === 'active-offers' && ACTIVE_OFFERS.map((offer) => (
              <div key={offer.id} className="border border-gray-100 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h4 className="text-sm font-semibold text-gray-800">{offer.product}</h4>
                    <span className="text-xs text-gray-400">{offer.category}</span>
                    <RiskBadge level={offer.risk} />
                  </div>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="text-xs text-gray-500">
                      Sent to <strong className="text-gray-700">{offer.buyers} {offer.buyers === 1 ? 'buyer' : 'buyers'}</strong>
                    </span>
                    <span className="text-xs font-semibold text-gray-700">
                      Offer: <span className="text-primary-dark">{offer.offerPrice}</span>
                    </span>
                  </div>
                </div>
                <span className={cn(
                  'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold flex-shrink-0',
                  offer.status === 'Offer Accepted'
                    ? 'bg-primary-light text-primary-dark'
                    : 'bg-amber-100 text-amber-700'
                )}>
                  <span className={cn(
                    'w-1.5 h-1.5 rounded-full',
                    offer.status === 'Offer Accepted' ? 'bg-primary' : 'bg-amber-500'
                  )} />
                  {offer.status}
                </span>
              </div>
            ))}

            {/* ── TAB 3: Resolved ──────────────────────────────────────────── */}
            {activeTab === 'resolved' && RESOLVED.map((item) => (
              <div key={item.id} className="border border-gray-100 rounded-xl p-5 flex items-center gap-4 opacity-75 hover:opacity-100 transition-opacity duration-150">
                <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-700">{item.product}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{item.outcome}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-semibold text-gray-700">{item.earned}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{item.date}</p>
                </div>
              </div>
            ))}

          </div>
        </div>

      </div>
    </>
  );
}