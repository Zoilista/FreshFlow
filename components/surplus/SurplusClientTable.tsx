'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import type { SurplusPredictionWithConfidence } from '@/lib/repositories/forecasts.repository';
import type { RiskLevel } from '@/types/database';
import { createOfferAction } from '@/lib/actions/offers';
import { useTranslations } from 'next-intl';

type FilterType = 'all' | 'high' | 'medium' | 'low';

const RISK_BADGE: Record<RiskLevel, string> = {
  CRITICAL: 'bg-red-200 text-red-800',
  HIGH:     'bg-red-100 text-red-700',
  MEDIUM:   'bg-amber-100 text-amber-700',
  LOW:      'bg-green-100 text-green-700',
};

function formatEur(n: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);
}

// ─── {t("btnCreate")} Modal ───────────────────────────────────────────────────────────
function CreateOfferModal({
  prediction,
  surplusQty,
  userId,
  onClose,
  onSuccess
}: {
  prediction: SurplusPredictionWithConfidence;
  surplusQty: number;
  userId: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [qty, setQty]      = useState(String(surplusQty));
  const [price, setPrice]  = useState('');
  const [buyer, setBuyer]  = useState('');
  const [notes, setNotes]  = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!qty || !price || !buyer) return alert('Please fill in required fields (quantity, price, buyer).');
    
    setLoading(true);
    try {
      const res = await createOfferAction({
        user_id: userId,
        surplus_prediction_id: prediction.id,
        product_name: prediction.product_name,
        category: prediction.category,
        unit: prediction.unit,
        surplus_quantity: Number(qty),
        risk_level: prediction.risk_level,
        buyer_name: buyer,
        offer_price: Number(price),
        status: 'Pending',
        notes: notes || null,
      });
      if (!res.success) {
        alert(`Error creating offer: ${res.error}`);
      } else {
        onSuccess();
      }
    } catch (err: unknown) {
      alert(`Error creating offer: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 z-50 flex items-start justify-center px-4 overflow-y-auto"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl p-6 max-w-md w-full mt-16 mb-8 shadow-xl">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-gray-800">Create Surplus Offer</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="bg-gray-50 rounded-xl px-4 py-3 mb-5 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400 font-medium">Selected Product</p>
            <p className="text-sm font-semibold text-gray-800 mt-0.5">{prediction.product_name}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400 font-medium">Available Surplus</p>
            <p className="text-sm font-semibold text-primary-dark mt-0.5">{surplusQty} {prediction.unit}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Offer Quantity (max {surplusQty})</label>
            <div className="relative">
              <input
                type="number" min={1} max={surplusQty} value={qty} onChange={(e) => setQty(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/30 outline-none"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">{prediction.unit}</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Price per unit (€)</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">€</span>
              <input
                type="number" min={0} step={0.01} value={price} onChange={(e) => setPrice(e.target.value)}
                className="w-full border border-gray-200 rounded-lg pl-8 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/30 outline-none"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Buyer Name</label>
            <input
              type="text" placeholder="e.g. Local Food Bank" value={buyer} onChange={(e) => setBuyer(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/30 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Notes (optional)</label>
            <textarea
              rows={2} value={notes} onChange={(e) => setNotes(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/30 outline-none resize-none"
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 py-2.5 text-sm font-semibold text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">Cancel</button>
          <button 
            onClick={handleSend} 
            disabled={loading}
            className="flex-1 py-2.5 text-sm font-semibold text-white bg-primary rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
          >
            {loading ? 'Sending...' : 'Send Offer'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Client Component ────────────────────────────────────────────────────────
export default function SurplusClientTable({
  predictions,
  userId
}: {
  predictions: SurplusPredictionWithConfidence[];
  userId: string;
}) {
  const [activeTab, setActiveTab] = useState<FilterType>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPrediction, setSelectedPrediction] = useState<SurplusPredictionWithConfidence | null>(null);
  const t = useTranslations('surplus.table');

  useEffect(() => {
    document.body.style.overflow = modalOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [modalOpen]);

  const filtered = predictions.filter(p => {
    if (activeTab === 'all') return true;
    if (activeTab === 'high') return p.risk_level === 'HIGH' || p.risk_level === 'CRITICAL';
    if (activeTab === 'medium') return p.risk_level === 'MEDIUM';
    if (activeTab === 'low') return p.risk_level === 'LOW';
    return true;
  });

  const openModal = (p: SurplusPredictionWithConfidence) => {
    setSelectedPrediction(p);
    setModalOpen(true);
  };

  return (
    <>
      {modalOpen && selectedPrediction && (
        <CreateOfferModal
          prediction={selectedPrediction}
          surplusQty={Math.max(0, (selectedPrediction.current_stock ?? 0) - (selectedPrediction.forecast_demand ?? 0))}
          userId={userId}
          onClose={() => setModalOpen(false)}
          onSuccess={() => {
            setModalOpen(false);
            // Optionally could show a toast here. For now, rely on page reload or optimistic UI
            alert('Offer created successfully! Check the Offers page.');
          }}
        />
      )}

      <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
        {/* Header & Tabs */}
        <div className="px-6 pt-5 pb-0 border-b border-gray-100">
          <h3 className="text-base font-semibold text-gray-800 mb-4">Current Surplus Items</h3>
          <div className="flex gap-6">
            {[
              { label: 'All', value: 'all' },
              { label: 'High Risk', value: 'high' },
              { label: 'Medium Risk', value: 'medium' },
              { label: 'Low Risk', value: 'low' },
            ].map(tab => (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value as FilterType)}
                className={cn(
                  'pb-3 text-sm font-semibold flex items-center gap-1.5 border-b-2 transition-colors duration-150',
                  activeTab === tab.value
                    ? 'border-primary text-primary-dark'
                    : 'border-transparent text-gray-400 hover:text-gray-600'
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* List */}
        <div className="p-6 space-y-4">
          {filtered.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-10">No surplus predictions match this filter.</p>
          ) : filtered.map(item => {
            const surplusRaw = Math.max(0, (item.current_stock ?? 0) - (item.forecast_demand ?? 0));
            const totalRaw = item.current_stock ?? 1;
            const pct = Math.round((surplusRaw / totalRaw) * 100);
            const isHighRisk = item.risk_level === 'CRITICAL' || item.risk_level === 'HIGH';
            const co2Savings = surplusRaw * 2.5; // Estimated 2.5 kg CO2 per kg/unit of food

            return (
              <div key={item.id} className="border border-gray-100 rounded-xl p-5 hover:border-gray-200 transition-colors duration-150">
                {/* Top Row */}
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h4 className="text-base font-semibold text-gray-800">{item.product_name}</h4>
                    <span className="text-xs text-gray-400">{item.category || 'Uncategorised'}</span>
                    <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold', RISK_BADGE[item.risk_level])}>
                      {item.risk_level}
                    </span>
                    {item.forecast_results?.confidence_level && (
                      <span className="text-xs text-gray-500 border px-2 py-0.5 rounded-full">
                        Confidence: {item.forecast_results.confidence_level.replace('_', ' ')}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => openModal(item)}
                      className="px-3.5 py-1.5 text-xs font-semibold bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                    >
                      {t("btnCreate")}
                    </button>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="mt-3 grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {[
                    { label: 'Current Stock', value: `${item.current_stock} ${item.unit}` },
                    { label: 'Demand (7d)', value: `${item.forecast_demand} ${item.unit}` },
                    { label: 'Surplus', value: `${surplusRaw} ${item.unit}` },
                    { label: 'Est. Loss', value: formatEur(item.potential_loss_eur) },
                    { label: 'CO₂ Savings', value: `${new Intl.NumberFormat('en-US', { maximumFractionDigits: 1 }).format(co2Savings)} kg` },
                  ].map(({ label, value }) => (
                    <div key={label} className="bg-gray-50 rounded-lg px-3 py-2">
                      <p className="text-xs text-gray-400">{label}</p>
                      <p className="text-sm font-semibold text-gray-700 mt-0.5">{value}</p>
                    </div>
                  ))}
                </div>

                {/* Progress bar */}
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>{surplusRaw} {item.unit} surplus out of {totalRaw} {item.unit} total stock</span>
                    <span>{pct}%</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className={cn('h-full rounded-full transition-all', isHighRisk ? 'bg-red-500' : 'bg-amber-400')} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
