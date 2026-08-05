// ─── Impact Engine ────────────────────────────────────────────────────────────
// Deterministic environmental & financial impact calculations.
// Runs after each forecast generation; stores results in impact_metrics.

import type { SurplusPredictionRow, ImpactMetricInsert } from '@/types/database';

// ── Physical constants (IPCC / FAO averages) ──────────────────────────────────
const CO2_KG_PER_KG_FOOD_WASTE     = 2.5;   // kg CO₂e per kg food waste prevented (IPCC)
const WATER_LITRES_PER_KG_FOOD     = 1.0;   // litres water saved per kg (conservative FAO)
const MEALS_EQUIVALENT_PER_KG      = 0.5;   // average 0.5 kg per meal (FAO 2020)
const RECOVERY_RATE                = 0.75;  // 75% of at-risk stock realistically recoverable

export interface ImpactCalculationInput {
  userId:              string;
  uploadId:            string;
  surplusPredictions:  SurplusPredictionRow[];
  periodYear:          number;
  periodMonth:         number;
}

export interface ImpactCalculationOutput {
  wasteKgPrevented:   number;
  revenueSavedEur:    number;
  co2SavedKg:         number;
  waterSavedLitres:   number;
  mealsEquivalent:    number;
  categoryBreakdown:  Record<string, number>;  // { "Vegetables": 120.5, ... }
}

/**
 * Calculate impact from surplus predictions.
 * Only HIGH and CRITICAL risk items contribute — we assume action is taken on them.
 */
export function calculateImpact(input: ImpactCalculationInput): ImpactCalculationOutput {
  const actionable = input.surplusPredictions.filter(
    (p) => p.risk_level === 'HIGH' || p.risk_level === 'CRITICAL',
  );

  let wasteKgPrevented = 0;
  let revenueSavedEur  = 0;
  const categoryBreakdown: Record<string, number> = {};

  for (const prediction of actionable) {
    // At-risk surplus = expected_remaining_stock (stock beyond expected demand)
    // Apply recovery rate: not all surplus will actually be redirected
    const atRiskKg    = Math.max(0, (prediction.current_stock ?? 0) - (prediction.forecast_demand ?? 0));
    const recoveredKg = atRiskKg * RECOVERY_RATE;

    wasteKgPrevented += recoveredKg;
    revenueSavedEur  += prediction.potential_loss_eur * RECOVERY_RATE;

    const cat = prediction.category ?? 'Other';
    categoryBreakdown[cat] = (categoryBreakdown[cat] ?? 0) + recoveredKg;
  }

  // Round all values
  wasteKgPrevented = Math.round(wasteKgPrevented * 100) / 100;
  revenueSavedEur  = Math.round(revenueSavedEur  * 100) / 100;

  const co2SavedKg       = Math.round(wasteKgPrevented * CO2_KG_PER_KG_FOOD_WASTE * 100) / 100;
  const waterSavedLitres = Math.round(wasteKgPrevented * WATER_LITRES_PER_KG_FOOD * 100) / 100;
  const mealsEquivalent  = Math.round(wasteKgPrevented * MEALS_EQUIVALENT_PER_KG  * 100) / 100;

  // Round category breakdown values
  for (const cat of Object.keys(categoryBreakdown)) {
    categoryBreakdown[cat] = Math.round(categoryBreakdown[cat] * 100) / 100;
  }

  return {
    wasteKgPrevented,
    revenueSavedEur,
    co2SavedKg,
    waterSavedLitres,
    mealsEquivalent,
    categoryBreakdown,
  };
}

/**
 * Converts calculation output to a DB-ready ImpactMetricInsert row.
 */
export function toImpactMetricInsert(
  input: ImpactCalculationInput,
  output: ImpactCalculationOutput,
): ImpactMetricInsert {
  return {
    user_id:             input.userId,
    upload_id:           input.uploadId,
    period_year:         input.periodYear,
    period_month:        input.periodMonth,
    waste_kg_prevented:  output.wasteKgPrevented,
    revenue_saved_eur:   output.revenueSavedEur,
    co2_saved_kg:        output.co2SavedKg,
    water_saved_litres:  output.waterSavedLitres,
    meals_equivalent:    output.mealsEquivalent,
    category_breakdown:  output.categoryBreakdown,
  };
}
