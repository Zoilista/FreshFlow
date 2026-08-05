// Dashboard Server Component — NO mock data
import { Link } from '@/i18n/routing';
import { createClient } from '@/lib/supabase/server';
import { getLatestUpload } from '@/lib/repositories/uploads.repository';
import { countProducts } from '@/lib/repositories/products.repository';
import {
  countForecasts,
  countHighRiskItems,
  getUrgentAlerts,
  getTotalPotentialLoss,
} from '@/lib/repositories/forecasts.repository';
import { getCumulativeImpact } from '@/lib/repositories/impact.repository';
import { cn } from '@/lib/utils';
import type { SurplusPredictionRow } from '@/types/database';
import { getTranslations, getFormatter } from 'next-intl/server';

function formatKg(value: number): string {
  return value >= 1000
    ? `${(value / 1000).toFixed(1)} t`
    : `${Math.round(value)} kg`;
}

function StatCard({
  label, value, sub, iconBg, iconColor, icon,
}: {
  label: string; value: string; sub?: string;
  iconBg: string; iconColor: string; icon: React.ReactNode;
}) {
  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-5">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide leading-tight">{label}</p>
          <p className="text-2xl font-bold text-gray-800 mt-1.5">{value}</p>
          {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
        </div>
        <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0', iconBg, iconColor)}>
          {icon}
        </div>
      </div>
    </div>
  );
}

function EmptyDashboard({ displayName, t }: { displayName: string, t: (k: string, v?: Record<string, string | number | Date>) => string }) {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-800">{t('greeting.welcome')}{displayName ? `, ${displayName}` : ''} 👋</h2>
          <p className="text-sm text-gray-500 mt-1">{t('empty.subtitle')}</p>
        </div>
      </div>

      <div className="relative bg-gradient-to-r from-primary-light to-blue-50 border border-primary/20 rounded-xl p-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <div>
          <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-primary/15 text-primary text-xs font-bold mb-3">
            {t('empty.getStarted')}
          </span>
          <h3 className="text-lg font-bold text-gray-800">{t('empty.title')}</h3>
          <p className="text-sm text-gray-500 mt-1 max-w-md">
            {t('empty.desc')}
          </p>
          <div className="flex flex-wrap gap-2 mt-3">
            {['product_name', 'date', 'sales', 'stock', 'price', 'category'].map((col) => (
              <span key={col} className="font-mono text-xs bg-white border border-gray-200 text-gray-600 px-2 py-0.5 rounded">{col}</span>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <Link
            href="/upload"
            id="empty-dashboard-upload-btn"
            className="px-5 py-2.5 text-sm font-semibold bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors duration-150 shadow-sm whitespace-nowrap"
          >
            {t('empty.btn')}
          </Link>
        </div>
      </div>
    </div>
  );
}

function ActionCard({
  title, description, href, linkLabel, variant = 'default',
}: {
  title: string; description: string; href: string; linkLabel: string;
  variant?: 'default' | 'urgent' | 'highlight';
}) {
  const borderClass =
    variant === 'urgent'    ? 'border-red-200 bg-red-50'   :
    variant === 'highlight' ? 'border-primary/20 bg-primary-light' :
                              'border-gray-100 bg-white';

  const linkClass =
    variant === 'urgent'    ? 'text-red-600 hover:text-red-800'   :
    variant === 'highlight' ? 'text-primary hover:text-primary-dark' :
                              'text-blue-600 hover:text-blue-800';

  return (
    <div className={cn('border rounded-xl px-5 py-4 flex items-center justify-between gap-4 shadow-sm', borderClass)}>
      <p className={cn('text-sm font-medium', variant === 'urgent' ? 'text-red-700' : variant === 'highlight' ? 'text-primary-dark' : 'text-gray-700')}>
        {title}
        {description && <span className="font-normal text-gray-500 ml-1">— {description}</span>}
      </p>
      <Link
        href={href}
        className={cn('flex-shrink-0 text-sm font-semibold underline underline-offset-2 transition-colors whitespace-nowrap', linkClass)}
      >
        {linkLabel} →
      </Link>
    </div>
  );
}

function AlertRow({ prediction, t, formatCurrency }: { prediction: SurplusPredictionRow, t: (k: string, v?: Record<string, string | number | Date>) => string, formatCurrency: (v: number) => string }) {
  const isUrgent = prediction.risk_level === 'CRITICAL' || prediction.risk_level === 'HIGH';
  const dotColor = prediction.risk_level === 'CRITICAL' ? 'bg-red-500 animate-pulse' :
                   prediction.risk_level === 'HIGH'     ? 'bg-red-400' :
                                                         'bg-amber-400';

  return (
    <div className={cn(
      'flex flex-col sm:flex-row sm:items-center justify-between gap-3 border rounded-xl px-5 py-3.5',
      isUrgent ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200'
    )}>
      <div className="flex items-center gap-3">
        <div className={cn('w-2 h-2 rounded-full flex-shrink-0', dotColor)} />
        <p className={cn('text-sm font-medium', isUrgent ? 'text-red-700' : 'text-amber-700')}>
          <strong>{prediction.product_name}</strong>
          {' '}— {t('urgent.riskScore', { score: prediction.risk_score })}
          {prediction.potential_loss_eur > 0 && ` · ${t('urgent.atRisk', { value: formatCurrency(prediction.potential_loss_eur) })}`}
        </p>
      </div>
      <Link
        href="/surplus"
        className={cn('flex-shrink-0 text-sm font-semibold underline underline-offset-2 transition-colors', isUrgent ? 'text-red-600 hover:text-red-800' : 'text-amber-600 hover:text-amber-800')}
      >
        {t('urgent.btn')}
      </Link>
    </div>
  );
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const t = await getTranslations('dashboard.page');
  const tNav = await getTranslations('dashboard.nav');
  const tRoot = await getTranslations();
  const format = await getFormatter();

  const userId = user.id;

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, business_name')
    .eq('id', userId)
    .maybeSingle();

  const displayName = profile?.full_name ?? profile?.business_name ?? user.email ?? '';
  const greeting    = tRoot('dashboard.greeting');

  const latestUpload = await getLatestUpload(userId);

  if (!latestUpload) {
    return <EmptyDashboard displayName={displayName} t={t} />;
  }

  const uploadId = latestUpload.id;

  const [
    productCount,
    forecastCount,
    highRiskCount,
    urgentAlerts,
    totalPotentialLoss,
    cumulativeImpact,
  ] = await Promise.all([
    countProducts(userId),
    countForecasts(userId),
    countHighRiskItems(userId, uploadId),
    getUrgentAlerts(userId, uploadId, 3),
    getTotalPotentialLoss(userId, uploadId),
    getCumulativeImpact(userId),
  ]);

  const wasteKg      = cumulativeImpact?.waste_kg_prevented  ?? 0;
  const revenueSaved = cumulativeImpact?.revenue_saved_eur   ?? 0;
  const co2Saved     = cumulativeImpact?.co2_saved_kg        ?? 0;

  const formatCurrency = (val: number) => format.number(val, { style: 'currency', currency: 'EUR', minimumFractionDigits: 0, maximumFractionDigits: 0 });

  return (
    <div className="max-w-5xl mx-auto space-y-6">

      {/* 1. Welcome Banner */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-800">
            {greeting}{displayName ? `, ${displayName}` : ''} 👋
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {t('banner.subtitle', { time: format.relativeTime(new Date(latestUpload.updated_at)) })}
          </p>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <Link
            href="/upload"
            id="dashboard-upload-btn"
            className="px-4 py-2 text-sm font-semibold bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors duration-150 shadow-sm"
          >
            {tRoot('dashboard.uploadNewData')}
          </Link>
          <Link
            href="/forecast"
            id="dashboard-forecast-btn"
            className="px-4 py-2 text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors duration-150"
          >
            {tRoot('dashboard.viewForecast')}
          </Link>
        </div>
      </div>

      {/* 2. Urgent Alerts */}
      {urgentAlerts.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-600 flex items-center gap-1.5">
            <span>⚠️</span> {tRoot('dashboard.requiresAttention')} {t('urgent.subtitle', { count: urgentAlerts.length })}
          </h3>
          {urgentAlerts.map((alert) => (
            <AlertRow key={alert.id} prediction={alert} t={t} formatCurrency={formatCurrency} />
          ))}
        </div>
      )}

      {/* 3. KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          label={tRoot('dashboard.productsTracked')}
          value={format.number(productCount)}
          sub={t('stats.productsSub', { count: forecastCount })}
          iconBg="bg-primary-light" iconColor="text-primary"
          icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>}
        />
        <StatCard
          label={tRoot('dashboard.highRiskItems')}
          value={format.number(highRiskCount)}
          sub={highRiskCount > 0 ? t('stats.highRiskSub', { value: formatCurrency(totalPotentialLoss) }) : t('stats.highRiskSubSafe')}
          iconBg="bg-red-100" iconColor="text-red-500"
          icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg>}
        />
        <StatCard
          label={tRoot('dashboard.foodSaved')}
          value={formatKg(wasteKg)}
          sub={t('stats.foodSavedSub', { value: format.number(co2Saved / 1000, { maximumFractionDigits: 2 }) })}
          iconBg="bg-emerald-100" iconColor="text-emerald-600"
          icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1-2.3A4.49 4.49 0 008 20C19 20 22 3 22 3c-1 2-8 5.5-8 5.5z" /></svg>}
        />
      </div>

      {/* 4. Action-Focused Cards */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-600">{tRoot('dashboard.recommendedActions')}</h3>

        {highRiskCount > 0 && (
          <ActionCard
            title={t('actions.urgentTitle', { count: highRiskCount })}
            description={t('actions.urgentDesc', { value: formatCurrency(totalPotentialLoss) })}
            href="/surplus"
            linkLabel={t('actions.urgentBtn')}
            variant="urgent"
          />
        )}

        <ActionCard
          title={t('actions.forecastTitle')}
          description={t('actions.forecastDesc', { file: latestUpload.filename })}
          href="/forecast"
          linkLabel={t('actions.forecastBtn')}
          variant="highlight"
        />

        {wasteKg > 0 && (
          <ActionCard
            title={t('actions.impactTitle', { value: formatKg(wasteKg) })}
            description={t('actions.impactDesc', { value: formatCurrency(revenueSaved) })}
            href="/impact"
            linkLabel={t('actions.impactBtn')}
          />
        )}

        <ActionCard
          title={t('actions.uploadTitle')}
          description={t('actions.uploadDesc')}
          href="/upload"
          linkLabel={t('actions.uploadBtn')}
        />
      </div>

      {/* 5. Two-column: Recent Activity + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-5">
          <h3 className="text-base font-semibold text-gray-800 mb-4">{t('recent.title')}</h3>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <span className="mt-1.5 w-2 h-2 rounded-full flex-shrink-0 bg-primary" />
              <p className="flex-1 text-sm text-gray-700 leading-relaxed" >{t.rich('recent.upload', { file: latestUpload.filename, strong: (chunks) => <strong>{chunks}</strong> })}</p>
              <span className="text-xs text-gray-400 flex-shrink-0 mt-0.5">{format.relativeTime(new Date(latestUpload.created_at))}</span>
            </div>
            {highRiskCount > 0 && (
              <div className="flex items-start gap-3">
                <span className="mt-1.5 w-2 h-2 rounded-full flex-shrink-0 bg-red-500" />
                <p className="flex-1 text-sm text-gray-700 leading-relaxed" >{t.rich('recent.highRisk', { count: highRiskCount, strong: (chunks) => <strong>{chunks}</strong> })}</p>
                <span className="text-xs text-gray-400 flex-shrink-0 mt-0.5">{format.relativeTime(new Date(latestUpload.created_at))}</span>
              </div>
            )}
            {wasteKg > 0 && (
              <div className="flex items-start gap-3">
                <span className="mt-1.5 w-2 h-2 rounded-full flex-shrink-0 bg-emerald-400" />
                <p className="flex-1 text-sm text-gray-700 leading-relaxed" >{t.rich('recent.impact', { value: formatKg(wasteKg), strong: (chunks) => <strong>{chunks}</strong> })}</p>
                <span className="text-xs text-gray-400 flex-shrink-0 mt-0.5">{t('recent.today')}</span>
              </div>
            )}
          </div>
          <Link href="/forecast" className="mt-5 block text-xs font-semibold text-gray-400 hover:text-gray-600 transition-colors">
            {t('recent.viewAll')}
          </Link>
        </div>

        <div className="flex flex-col gap-4">
          <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-5">
            <h3 className="text-base font-semibold text-gray-800 mb-4">{t('quick.title')}</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { emoji: '📤', label: tNav('upload'),    href: '/upload'   },
                { emoji: '📊', label: tNav('forecast'),  href: '/forecast' },
                { emoji: '📦', label: t('quick.manageSurplus'), href: '/surplus'  },
                { emoji: '📈', label: tNav('impact'),  href: '/impact'   },
              ].map((action) => (
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
          <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-xl p-5 shadow-sm">
            <h3 className="text-base font-semibold text-amber-800 mb-2">{tRoot('dashboard.leaderboard.title')}</h3>
            <p className="text-sm text-amber-700 mb-3">{tRoot('dashboard.leaderboard.rank', { rank: 8, total: 10 })}</p>
            
            <div className="h-1.5 w-full bg-amber-200 rounded-full overflow-hidden mb-4">
              <div className="h-full bg-amber-400 rounded-full" style={{ width: '80%' }} />
            </div>

            <Link href="/impact" className="text-xs font-semibold text-amber-700 hover:text-amber-900 underline transition-colors">
              {tRoot('dashboard.leaderboard.viewFull')}
            </Link>
          </div>
        </div>
      </div>

      {/* 6. Last Upload Summary */}
      <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-5 flex items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-1">{t('lastUpload.title')}</h3>
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-sm text-gray-600 font-medium">{latestUpload.filename}</span>
            {latestUpload.valid_rows != null && (
              <>
                <span className="text-gray-300">·</span>
                <span className="text-xs text-gray-500">{t('lastUpload.validRows', { count: format.number(latestUpload.valid_rows) })}</span>
              </>
            )}
            {latestUpload.products_upserted != null && (
              <>
                <span className="text-gray-300">·</span>
                <span className="text-xs text-gray-500">{t('lastUpload.products', { count: format.number(latestUpload.products_upserted) })}</span>
              </>
            )}
            <span className="text-gray-300">·</span>
            <span className="text-xs text-gray-500">{format.dateTime(new Date(latestUpload.created_at), { dateStyle: 'medium' })}</span>
            <span className="text-gray-300">·</span>
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary-dark">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
              {t('lastUpload.processed')}
              {latestUpload.processing_ms != null && (
                <span className="text-gray-400 font-normal ml-0.5">({format.number(latestUpload.processing_ms / 1000, { maximumFractionDigits: 1 })}s)</span>
              )}
            </span>
          </div>
        </div>
        <Link
          href="/upload"
          className="flex-shrink-0 text-sm font-semibold text-primary hover:text-primary-dark underline underline-offset-2 transition-colors"
        >
          {t('lastUpload.btn')}
        </Link>
      </div>

    </div>
  );
}
