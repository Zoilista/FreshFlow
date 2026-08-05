// ─── Forecasts Repository ─────────────────────────────────────────────────────
import { createClient } from '@/lib/supabase/server';
import type {
  ForecastResultRow,
  ForecastResultInsert,
  SurplusPredictionRow,
  SurplusPredictionInsert,
  RiskLevel,
} from '@/types/database';

// ── Forecast Results ──────────────────────────────────────────────────────────

/** Bulk insert forecast results. Returns array of inserted rows (with IDs). */
export async function bulkInsertForecastResults(
  rows: ForecastResultInsert[],
): Promise<ForecastResultRow[]> {
  if (rows.length === 0) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('forecast_results')
    .upsert(rows, { onConflict: 'user_id,product_id,upload_id', ignoreDuplicates: false })
    .select('*');
  if (error) throw new Error(`bulkInsertForecastResults: ${error.message}`);
  return (data ?? []) as ForecastResultRow[];
}

/** Get the latest forecast for a user (from their most recent upload) */
export async function getLatestForecastResults(
  userId: string,
  uploadId: string,
): Promise<ForecastResultRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('forecast_results')
    .select('*')
    .eq('user_id', userId)
    .eq('upload_id', uploadId)
    .order('waste_risk_score', { ascending: false });
  if (error) throw new Error(`getLatestForecastResults: ${error.message}`);
  return (data ?? []) as ForecastResultRow[];
}

/** Count forecasts generated for a user */
export async function countForecasts(userId: string): Promise<number> {
  const supabase = await createClient();
  const { count, error } = await supabase
    .from('forecast_results')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId);
  if (error) throw new Error(`countForecasts: ${error.message}`);
  return count ?? 0;
}

/** Count high/critical risk items from latest upload */
export async function countHighRiskItems(userId: string, uploadId: string): Promise<number> {
  const supabase = await createClient();
  const { count, error } = await supabase
    .from('forecast_results')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('upload_id', uploadId)
    .in('risk_level', ['HIGH', 'CRITICAL'] as RiskLevel[]);
  if (error) throw new Error(`countHighRiskItems: ${error.message}`);
  return count ?? 0;
}

// ── Surplus Predictions ───────────────────────────────────────────────────────

/** Bulk insert surplus predictions */
export async function bulkInsertSurplusPredictions(
  rows: SurplusPredictionInsert[],
): Promise<SurplusPredictionRow[]> {
  if (rows.length === 0) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('surplus_predictions')
    .upsert(rows, { onConflict: 'user_id,product_id,upload_id', ignoreDuplicates: false })
    .select('*');
  if (error) throw new Error(`bulkInsertSurplusPredictions: ${error.message}`);
  return (data ?? []) as SurplusPredictionRow[];
}

export type SurplusPredictionWithConfidence = SurplusPredictionRow & {
  forecast_results: { confidence_level: string | null } | null;
};

/** Get surplus predictions for an upload, ordered by risk score */
export async function getSurplusPredictions(
  userId: string,
  uploadId: string,
): Promise<SurplusPredictionWithConfidence[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('surplus_predictions')
    .select('*, forecast_results(confidence_level)')
    .eq('user_id', userId)
    .eq('upload_id', uploadId)
    .order('risk_score', { ascending: false });
  if (error) throw new Error(`getSurplusPredictions: ${error.message}`);
  return (data ?? []) as SurplusPredictionWithConfidence[];
}

/** Get top N urgent alerts (HIGH/CRITICAL) for dashboard */
export async function getUrgentAlerts(
  userId: string,
  uploadId: string,
  limit = 3,
): Promise<SurplusPredictionRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('surplus_predictions')
    .select('*')
    .eq('user_id', userId)
    .eq('upload_id', uploadId)
    .in('risk_level', ['HIGH', 'CRITICAL'] as RiskLevel[])
    .order('risk_score', { ascending: false })
    .limit(limit);
  if (error) throw new Error(`getUrgentAlerts: ${error.message}`);
  return (data ?? []) as SurplusPredictionRow[];
}

/** Sum of potential losses across all high-risk items */
export async function getTotalPotentialLoss(
  userId: string,
  uploadId: string,
): Promise<number> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('surplus_predictions')
    .select('potential_loss_eur')
    .eq('user_id', userId)
    .eq('upload_id', uploadId)
    .in('risk_level', ['HIGH', 'CRITICAL'] as RiskLevel[]);
  if (error) throw new Error(`getTotalPotentialLoss: ${error.message}`);
  return (data ?? []).reduce((sum, r) => sum + Number(r.potential_loss_eur ?? 0), 0);
}
