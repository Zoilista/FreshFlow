import os
import json

# 1. Update English JSON for Surplus & Offers
surplus_json_path = os.path.join("messages", "en", "surplus.json")
offers_json_path = os.path.join("messages", "en", "offers.json")

surplus_data = {
  "page": {
    "title": "Surplus Management",
    "subtitle": "Manage high-risk inventory before it becomes waste.",
    "stats": {
      "itemsAtRisk": "Items at Risk",
      "totalValue": "Total Value at Risk",
      "co2": "Est. CO₂ Footprint",
      "safe": "All items safe"
    }
  },
  "table": {
    "searchPlaceholder": "Search products...",
    "all": "All",
    "highRisk": "High Risk",
    "mediumRisk": "Medium Risk",
    "lowRisk": "Low Risk",
    "colProduct": "Product",
    "colSurplus": "Surplus Qty",
    "colRisk": "Risk Level",
    "colEstLoss": "Est. Loss",
    "colConfidence": "Confidence",
    "colAction": "Action",
    "btnCreate": "Create Offer",
    "riskCritical": "CRITICAL",
    "riskHigh": "HIGH",
    "riskMedium": "MEDIUM",
    "riskLow": "LOW",
    "empty": "No surplus predictions yet.",
    "emptyDesc": "Upload your latest inventory data to see predictions.",
    "btnUpload": "Upload Data"
  }
}

offers_data = {
  "page": {
    "title": "Active Offers",
    "subtitle": "Discounted inventory available for buyers or donation.",
    "stats": {
      "activeOffers": "Active Offers",
      "totalValue": "Total Value",
      "potential": "Recovery Potential"
    }
  },
  "table": {
    "searchPlaceholder": "Search offers...",
    "statusActive": "Active",
    "statusPending": "Pending",
    "statusClosed": "Closed",
    "colProduct": "Product",
    "colPrice": "Offer Price",
    "colQty": "Quantity",
    "colStatus": "Status",
    "colExpires": "Expires In",
    "colAction": "Action",
    "btnView": "View Details",
    "empty": "No active offers yet.",
    "emptyDesc": "Create offers from your surplus inventory to recover value.",
    "btnSurplus": "View Surplus"
  }
}

with open(surplus_json_path, "w", encoding="utf-8") as f:
    json.dump(surplus_data, f, indent=2, ensure_ascii=False)

with open(offers_json_path, "w", encoding="utf-8") as f:
    json.dump(offers_data, f, indent=2, ensure_ascii=False)

# Rewrite Surplus Page
surplus_page_path = os.path.join("app", "[locale]", "(dashboard)", "surplus", "page.tsx")
surplus_page_content = """import { createClient } from '@/lib/supabase/server';
import { getSurplusPredictions } from '@/lib/repositories/surplus.repository';
import SurplusClientTable from '@/components/surplus/SurplusClientTable';
import { getTranslations, getFormatter } from 'next-intl/server';

export default async function SurplusPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const t = await getTranslations('surplus.page');
  const format = await getFormatter();

  const predictions = await getSurplusPredictions(user.id);
  
  const highRiskItems = predictions.filter(p => p.risk_level === 'CRITICAL' || p.risk_level === 'HIGH').length;
  const totalValueAtRisk = predictions.reduce((sum, p) => sum + (p.potential_loss_eur || 0), 0);
  const totalCO2 = predictions.reduce((sum, p) => sum + (p.surplus_quantity * 2.5), 0);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t('title')}</h1>
        <p className="text-sm text-gray-500 mt-1">{t('subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <p className="text-sm font-medium text-gray-500">{t('stats.itemsAtRisk')}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{format.number(highRiskItems)}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <p className="text-sm font-medium text-gray-500">{t('stats.totalValue')}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {totalValueAtRisk > 0 ? format.number(totalValueAtRisk, { style: 'currency', currency: 'EUR', minimumFractionDigits: 0 }) : t('stats.safe')}
          </p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <p className="text-sm font-medium text-gray-500">{t('stats.co2')}</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{format.number(totalCO2, { maximumFractionDigits: 1 })} kg</p>
        </div>
      </div>

      <SurplusClientTable initialData={predictions} />
    </div>
  );
}
"""
with open(surplus_page_path, "w", encoding="utf-8") as f:
    f.write(surplus_page_content)

# Rewrite Offers Page
offers_page_path = os.path.join("app", "[locale]", "(dashboard)", "offers", "page.tsx")
offers_page_content = """import { createClient } from '@/lib/supabase/server';
import { getOffers } from '@/lib/repositories/offers.repository';
import OffersClientTable from '@/components/offers/OffersClientTable';
import { getTranslations, getFormatter } from 'next-intl/server';

export default async function OffersPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;
  
  const t = await getTranslations('offers.page');
  const format = await getFormatter();

  const offers = await getOffers(user.id);
  
  const activeOffers = offers.filter(o => o.status === 'active');
  const activeCount = activeOffers.length;
  const totalValue = activeOffers.reduce((sum, o) => sum + (o.surplus_prediction?.potential_loss_eur || 0), 0);
  const recoveryValue = activeOffers.reduce((sum, o) => sum + (o.offer_price * o.quantity), 0);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t('title')}</h1>
        <p className="text-sm text-gray-500 mt-1">{t('subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <p className="text-sm font-medium text-gray-500">{t('stats.activeOffers')}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{format.number(activeCount)}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <p className="text-sm font-medium text-gray-500">{t('stats.totalValue')}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{format.number(totalValue, { style: 'currency', currency: 'EUR', minimumFractionDigits: 0 })}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <p className="text-sm font-medium text-gray-500">{t('stats.potential')}</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{format.number(recoveryValue, { style: 'currency', currency: 'EUR', minimumFractionDigits: 0 })}</p>
        </div>
      </div>

      <OffersClientTable initialData={offers} />
    </div>
  );
}
"""
with open(offers_page_path, "w", encoding="utf-8") as f:
    f.write(offers_page_content)
    
print("Surplus and Offers server pages localized.")
