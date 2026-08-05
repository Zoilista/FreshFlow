// ─── Forecast Engine — Interface-based, Deterministic ───────────────────────
// No external AI/ML APIs. All calculations are deterministic.
// Designed for extensibility: swap IForecastModel implementations freely.

import type { RiskLevel, ConfidenceLevel, ForecastResultInsert, SurplusPredictionInsert } from '@/types/database';

// ══════════════════════════════════════════════════════════════════════════════
// INTERFACES — Core contracts for the forecast system
// ══════════════════════════════════════════════════════════════════════════════

/** Historical data point fed to the model */
export interface SalesDataPoint {
  date:          string;   // ISO YYYY-MM-DD
  quantitySold:  number;
  stockQuantity: number;
  price:         number | null;
}

/** What the caller provides per product */
export interface ProductForecastInput {
  userId:      string;
  productId:   string;
  uploadId:    string;
  productName: string;
  category:    string | null;
  unit:        string | null;
  history:     SalesDataPoint[];   // all available data points, sorted ascending by date
}

/** What the engine returns per product */
export interface ProductForecastOutput {
  productId:              string;
  currentStock:           number;
  avgDailySales:          number;
  dataPointsCount:        number;
  expectedDemand7d:       number;
  expectedRemainingStock: number;
  daysOfStockRemaining:   number;
  surplusRatio:           number;
  confidenceScore:        number;       // 0.00 – 1.00
  confidenceLevel:        ConfidenceLevel;
  wasteRiskScore:         number;       // 0 – 100
  riskLevel:              RiskLevel;
  potentialLossEur:       number;
}

/** The pluggable forecast model interface */
export interface IForecastModel {
  readonly name:    string;
  readonly version: string;
  compute(input: ProductForecastInput): ProductForecastOutput;
}

/** What the orchestrator returns (DB-ready rows) */
export interface ForecastBatch {
  forecastResults:    ForecastResultInsert[];
  surplusPredictions: SurplusPredictionInsert[];
}

// ══════════════════════════════════════════════════════════════════════════════
// CONFIDENCE CALCULATOR
// Improved: uses multiple signals (data density, recency, variance, price)
// ══════════════════════════════════════════════════════════════════════════════

interface ConfidenceFactors {
  dataPointsCount: number;
  daysCovered:     number;    // calendar days spanned by the history
  salesVariance:   number;    // coefficient of variation of daily sales
  hasPriceData:    boolean;
  hasStockData:    boolean;
}

function computeConfidence(factors: ConfidenceFactors): {
  score: number;
  level: ConfidenceLevel;
} {
  let score = 0;

  // ── Factor 1: Data volume (0–35 pts) ─────────────────────────────────────
  // 30+ data points → full score; tapers logarithmically below
  const volumeScore = factors.dataPointsCount >= 30
    ? 35
    : Math.round((Math.log1p(factors.dataPointsCount) / Math.log1p(30)) * 35);
  score += volumeScore;

  // ── Factor 2: Temporal coverage (0–25 pts) ───────────────────────────────
  // 28+ days of history → full score
  const coverageScore = factors.daysCovered >= 28
    ? 25
    : Math.round((factors.daysCovered / 28) * 25);
  score += coverageScore;

  // ── Factor 3: Sales stability (0–25 pts) ─────────────────────────────────
  // Lower coefficient of variation = more stable = higher confidence
  // CV = std_dev / mean; CV < 0.3 → high stability
  const cv = factors.salesVariance;
  const stabilityScore = cv <= 0
    ? 25
    : cv <= 0.3
      ? 25
      : cv <= 0.6
        ? 18
        : cv <= 1.0
          ? 10
          : 5;
  score += stabilityScore;

  // ── Factor 4: Data completeness (0–15 pts) ────────────────────────────────
  let completeness = 0;
  if (factors.hasPriceData) completeness += 8;
  if (factors.hasStockData) completeness += 7;
  score += completeness;

  // Clamp to [0, 100]
  score = Math.min(100, Math.max(0, score));
  const normalised = score / 100;

  const level: ConfidenceLevel =
    normalised >= 0.80 ? 'very_high' :
    normalised >= 0.65 ? 'high'      :
    normalised >= 0.45 ? 'medium'    :
    normalised >= 0.25 ? 'low'       :
                         'very_low';

  return { score: Math.round(normalised * 100) / 100, level };
}

// ── Statistical helpers ───────────────────────────────────────────────────────
function weightedMovingAverage(values: number[], windowSize: number): number {
  const window = values.slice(-windowSize);
  if (window.length === 0) return 0;
  // Linearly weighted — more recent values have higher weight
  let weightedSum = 0;
  let weightSum   = 0;
  window.forEach((v, i) => {
    const w = i + 1;   // weight: 1, 2, 3, ..., windowSize
    weightedSum += v * w;
    weightSum   += w;
  });
  return weightSum > 0 ? weightedSum / weightSum : 0;
}

function coefficientOfVariation(values: number[]): number {
  if (values.length < 2) return 0;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  if (mean === 0) return 0;
  const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
  return Math.sqrt(variance) / mean;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

// ══════════════════════════════════════════════════════════════════════════════
// DEFAULT MODEL: Weighted Moving Average + Surplus Ratio
// ══════════════════════════════════════════════════════════════════════════════
export class WeightedMovingAverageForecastModel implements IForecastModel {
  readonly name    = 'WeightedMovingAverage';
  readonly version = '1.0.0';

  compute(input: ProductForecastInput): ProductForecastOutput {
    const { history, productId } = input;

    // Sort ascending by date
    const sorted = [...history].sort((a, b) => a.date.localeCompare(b.date));

    const salesValues  = sorted.map((h) => h.quantitySold);
    const stockValues  = sorted.map((h) => h.stockQuantity);

    const dataPointsCount = sorted.length;

    // Current stock = last known stock value
    const currentStock = stockValues.length > 0
      ? stockValues[stockValues.length - 1]
      : 0;

    // Weighted moving average of daily sales (7-day window)
    const avgDailySales = dataPointsCount > 0
      ? weightedMovingAverage(salesValues, 7)
      : 0;

    // Expected demand over next 7 days
    const expectedDemand7d = Math.max(0, avgDailySales * 7);

    // Expected remaining stock after 7 days
    const expectedRemainingStock = Math.max(0, currentStock - expectedDemand7d);

    // Days of stock remaining at current sales rate
    const daysOfStockRemaining = avgDailySales > 0
      ? currentStock / avgDailySales
      : currentStock > 0 ? 999 : 0;

    // Surplus ratio: how much stock vs expected 7-day demand
    const surplusRatio = expectedDemand7d > 0
      ? currentStock / expectedDemand7d
      : currentStock > 0 ? 10 : 0;

    // ── Risk Score (0–100) ──────────────────────────────────────────────────
    // Component A: how far surplus ratio exceeds 1.0 (max out at ratio=3.0)
    const surplusComponent = clamp((surplusRatio - 1) / 2, 0, 1) * 55;

    // Component B: low days-remaining is a risk even if surplus ratio looks okay
    // (e.g., perishables — stock may spoil before it can be sold)
    const daysComponent = daysOfStockRemaining < 7
      ? clamp((7 - daysOfStockRemaining) / 7, 0, 1) * 45
      : 0;

    const wasteRiskScore = Math.round(clamp(surplusComponent + daysComponent, 0, 100));

    const riskLevel: RiskLevel =
      wasteRiskScore >= 75 ? 'CRITICAL' :
      wasteRiskScore >= 50 ? 'HIGH'     :
      wasteRiskScore >= 25 ? 'MEDIUM'   :
                             'LOW';

    // ── Confidence ──────────────────────────────────────────────────────────
    const dateStrings = sorted.map((h) => h.date);
    const daysCovered = dateStrings.length >= 2
      ? Math.round(
          (new Date(dateStrings[dateStrings.length - 1]).getTime() -
           new Date(dateStrings[0]).getTime()) / 86_400_000,
        )
      : 0;

    const hasPriceData = sorted.some((h) => h.price != null && h.price > 0);
    const hasStockData = sorted.some((h) => h.stockQuantity > 0);
    const cv           = coefficientOfVariation(salesValues);

    const { score: confidenceScore, level: confidenceLevel } = computeConfidence({
      dataPointsCount,
      daysCovered,
      salesVariance: cv,
      hasPriceData,
      hasStockData,
    });

    // ── Potential Loss (EUR) ─────────────────────────────────────────────────
    // Only count the at-risk surplus (stock beyond what's expected to sell)
    const avgPrice = sorted
      .map((h) => h.price)
      .filter((p): p is number => p != null && p > 0)
      .reduce((sum, p, _, arr) => sum + p / arr.length, 0);

    const potentialLossEur = riskLevel !== 'LOW'
      ? Math.round(expectedRemainingStock * avgPrice * 100) / 100
      : 0;

    return {
      productId,
      currentStock,
      avgDailySales,
      dataPointsCount,
      expectedDemand7d,
      expectedRemainingStock,
      daysOfStockRemaining,
      surplusRatio,
      confidenceScore,
      confidenceLevel,
      wasteRiskScore,
      riskLevel,
      potentialLossEur,
    };
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// FORECAST ORCHESTRATOR
// Accepts any IForecastModel — easily swappable.
// ══════════════════════════════════════════════════════════════════════════════
export class ForecastEngine {
  constructor(private readonly model: IForecastModel = new WeightedMovingAverageForecastModel()) {}

  /**
   * Runs the forecast model for each product and returns DB-ready rows.
   */
  runBatch(inputs: ProductForecastInput[]): ForecastBatch {
    const forecastResults:    ForecastResultInsert[]    = [];
    const surplusPredictions: SurplusPredictionInsert[] = [];
    const today = new Date().toISOString().split('T')[0];

    for (const input of inputs) {
      const out = this.model.compute(input);

      const forecastInsert: ForecastResultInsert = {
        user_id:                   input.userId,
        product_id:                input.productId,
        upload_id:                 input.uploadId,
        forecast_date:             today,
        current_stock:             out.currentStock,
        avg_daily_sales:           out.avgDailySales,
        data_points_count:         out.dataPointsCount,
        expected_demand_7d:        out.expectedDemand7d,
        expected_remaining_stock:  out.expectedRemainingStock,
        days_of_stock_remaining:   out.daysOfStockRemaining,
        surplus_ratio:             out.surplusRatio,
        confidence_score:          out.confidenceScore,
        confidence_level:          out.confidenceLevel,
        waste_risk_score:          out.wasteRiskScore,
        risk_level:                out.riskLevel,
        potential_loss_eur:        out.potentialLossEur,
      };

      forecastResults.push(forecastInsert);

      // Sort the history to get the latest stock
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const lastHistory = [...input.history].sort((a, b) => b.date.localeCompare(a.date))[0];
      const latestPrice = input.history
        .map((h) => h.price)
        .filter((p): p is number => p != null && p > 0)
        .slice(-1)[0] ?? null;

      const recommendedAction =
        out.riskLevel === 'CRITICAL' || out.riskLevel === 'HIGH' ? 'create_offer' :
        out.riskLevel === 'MEDIUM'                               ? 'monitor'      :
                                                                   'none';

      const surplusInsert: SurplusPredictionInsert = {
        user_id:             input.userId,
        product_id:          input.productId,
        upload_id:           input.uploadId,
        forecast_id:         '',    // filled after forecast_results insert
        product_name:        input.productName,
        category:            input.category,
        unit:                input.unit,
        current_stock:       out.currentStock,
        forecast_demand:     out.expectedDemand7d,
        price_per_unit:      latestPrice,
        risk_level:          out.riskLevel,
        risk_score:          out.wasteRiskScore,
        potential_loss_eur:  out.potentialLossEur,
        recommended_action:  recommendedAction,
      };

      surplusPredictions.push(surplusInsert);
    }

    return { forecastResults, surplusPredictions };
  }
}
