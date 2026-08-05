import { createClient } from '@/lib/supabase/server';
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
  
  const activeOffers = offers.filter(o => o.status === 'Pending');
  const activeCount = activeOffers.length;
  const totalValue = activeOffers.reduce((sum, o) => sum + (o.offer_price * (o.surplus_quantity || 0) * 1.5), 0);
  const recoveryValue = activeOffers.reduce((sum, o) => sum + (o.offer_price * (o.surplus_quantity || 0)), 0);

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

      <OffersClientTable offers={offers} />
    </div>
  );
}
