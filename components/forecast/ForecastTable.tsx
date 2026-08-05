'use client';

// Forecast Table — Client Component
// Receives pre-fetched predictions from the Server Component.
// Owns filter state only — no data fetching.

import { useState } from 'react';
import { useTranslations, useFormatter } from 'next-intl';
import { Link } from '@/i18n/routing';
import { cn } from '@/lib/utils';
import type { SurplusPredictionRow, RiskLevel } from '@/types/database';

type FilterType = 'all' | 'critical' | 'high' | 'medium' | 'low';

const FILTER_OPTIONS: { label: string; value: FilterType }[] = [
  { label: 'All',      value: 'all'      },
  { label: 'Critical', value: 'critical' },
  { label: 'High',     value: 'high'     },
  { label: 'Medium',   value: 'medium'   },
  { label: 'Low',      value: 'low'      },
];

const RISK_BADGE: Record<RiskLevel, string> = {
  CRITICAL: 'bg-red-200 text-red-800',
  HIGH:     'bg-red-100 text-red-700',
  MEDIUM:   'bg-amber-100 text-amber-700',
  LOW:      'bg-green-100 text-green-700',
};

const RISK_BAR: Record<RiskLevel, string> = {
  CRITICAL: 'bg-red-600',
  HIGH:     'bg-red-500',
  MEDIUM:   'bg-amber-400',
  LOW:      'bg-green-500',
};

function RiskBadge({ level }: { level: RiskLevel }) {
  return (
    <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold', RISK_BADGE[level])}>
      {level}
    </span>
  );
}

function RiskBar({ score, level }: { score: number; level: RiskLevel }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden min-w-[64px]">
        <div className={cn('h-full rounded-full transition-all', RISK_BAR[level])} style={{ width: `${score}%` }} />
      </div>
      <span className="text-xs font-medium text-gray-600 w-6 text-right">{score}</span>
    </div>
  );
}

interface ForecastTableProps {
  predictions: SurplusPredictionRow[];
}

export default function ForecastTable({ predictions }: ForecastTableProps) {
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

  const t = useTranslations('forecast');
  const format = useFormatter();

  const formatNumber = (n: number | null | undefined, unit = '') => {
    if (n == null) return '—';
    return `${format.number(n, { maximumFractionDigits: 2 })}${unit ? ' ' + unit : ''}`;
  };

  const formatEur = (n: number) => {
    return n > 0 ? format.number(n, { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }) : '—';
  };


  const filtered = predictions.filter((p) => {
    if (activeFilter === 'all') return true;
    return p.risk_level.toLowerCase() === activeFilter;
  });

  // Count per level for filter badges
  const counts: Record<FilterType, number> = {
    all:      predictions.length,
    critical: predictions.filter((p) => p.risk_level === 'CRITICAL').length,
    high:     predictions.filter((p) => p.risk_level === 'HIGH').length,
    medium:   predictions.filter((p) => p.risk_level === 'MEDIUM').length,
    low:      predictions.filter((p) => p.risk_level === 'LOW').length,
  };

  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
      {/* Table Header */}
      <div className="px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-gray-800">{t('table.title')}</h3>
          <p className="text-xs text-gray-400 mt-0.5">
            {t('table.subtitle', { filtered: filtered.length, total: predictions.length })}
          </p>
        </div>

        {/* {t('btnFilter')} Buttons */}
        <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-lg flex-wrap">
          {FILTER_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              id={`forecast-filter-${opt.value}`}
              onClick={() => setActiveFilter(opt.value)}
              className={cn(
                'px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-150 flex items-center gap-1.5',
                activeFilter === opt.value
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              )}
            >
              {opt.label}
              {counts[opt.value] > 0 && (
                <span className={cn(
                  'rounded-full text-[10px] font-bold px-1 min-w-[16px] text-center',
                  activeFilter === opt.value ? 'bg-white/20' : 'bg-gray-200 text-gray-600'
                )}>
                  {counts[opt.value]}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              {[t('table.colProduct'), t('table.colCategory'), t('table.colStock'), t('table.colDemand'), t('table.colRiskLevel'), t('table.colRiskScore'), t('table.colAtRisk'), t('table.colAction')].map((col) => (
                <th key={col} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50 transition-colors duration-100">
                <td className="px-5 py-3.5 font-medium text-gray-800 whitespace-nowrap">{item.product_name}</td>
                <td className="px-5 py-3.5 text-gray-500 whitespace-nowrap">{item.category ?? '—'}</td>
                <td className="px-5 py-3.5 text-gray-700 whitespace-nowrap">
                  {formatNumber(item.current_stock, item.unit ?? '')}
                </td>
                <td className="px-5 py-3.5 text-gray-700 whitespace-nowrap">
                  {formatNumber(item.forecast_demand, item.unit ?? '')}
                </td>
                <td className="px-5 py-3.5 whitespace-nowrap">
                  <RiskBadge level={item.risk_level} />
                </td>
                <td className="px-5 py-3.5 w-36">
                  <RiskBar score={item.risk_score} level={item.risk_level} />
                </td>
                <td className="px-5 py-3.5 whitespace-nowrap text-gray-700 font-medium">
                  {formatEur(item.potential_loss_eur)}
                </td>
                <td className="px-5 py-3.5 whitespace-nowrap">
                  {item.recommended_action === 'create_offer' && (
                    <Link
                      href="/surplus"
                      className="px-3 py-1.5 text-xs font-semibold bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors duration-150"
                    >
                      {t('table.createOffer')}
                    </Link>
                  )}
                  {item.recommended_action === 'monitor' && (
                    <span className="px-3 py-1.5 text-xs font-semibold border border-gray-300 text-gray-600 rounded-lg">
                      {t('table.monitor')}
                    </span>
                  )}
                  {item.recommended_action === 'none' && (
                    <span className="text-gray-300 font-medium">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-sm text-gray-400">{t('table.empty')}</p>
          </div>
        )}
      </div>
    </div>
  );
}
