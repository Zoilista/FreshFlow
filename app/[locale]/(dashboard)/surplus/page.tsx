import { createClient } from '@/lib/supabase/server';
import { getSurplusPredictions } from '@/lib/repositories/forecasts.repository';
import { getLatestUpload } from '@/lib/repositories/uploads.repository';
import SurplusClientTable from '@/components/surplus/SurplusClientTable';
import { getTranslations, getFormatter } from 'next-intl/server';

export default async function SurplusPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const t = await getTranslations('surplus.page');
  const format = await getFormatter();

  const latestUpload = await getLatestUpload(user.id);
  const predictions = latestUpload ? await getSurplusPredictions(user.id, latestUpload.id) : [];
  
  const highRiskItems = predictions.filter(p => p.risk_level === 'CRITICAL' || p.risk_level === 'HIGH').length;
  const totalValueAtRisk = predictions.reduce((sum, p) => sum + (p.potential_loss_eur || 0), 0);
  const totalCO2 = predictions.reduce((sum, p) => sum + (Math.max(0, (p.current_stock || 0) - (p.forecast_demand || 0)) * 2.5), 0);

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

      <SurplusClientTable predictions={predictions} userId={user.id} />
    </div>
  );
}
