// ─── Impact Repository ────────────────────────────────────────────────────────
import { createClient } from '@/lib/supabase/server';
import type { ImpactMetricRow, ImpactMetricInsert, ImpactMetricUpdate } from '@/types/database';

/** Upsert a monthly impact metric row */
export async function upsertImpactMetric(data: ImpactMetricInsert): Promise<ImpactMetricRow> {
  const supabase = await createClient();
  const { data: row, error } = await supabase
    .from('impact_metrics')
    .upsert(data, { onConflict: 'user_id,period_year,period_month' })
    .select()
    .single();
  if (error) throw new Error(`upsertImpactMetric: ${error.message}`);
  return row as ImpactMetricRow;
}

/** Update cumulative (all-time) impact for a user */
export async function upsertCumulativeImpact(
  userId: string,
  uploadId: string,
  update: Omit<ImpactMetricInsert, 'user_id' | 'upload_id' | 'period_year' | 'period_month'>,
): Promise<void> {
  const supabase = await createClient();
  // Cumulative row has period_year = null, period_month = null
  // We need to increment existing values
  const { data: existing } = await supabase
    .from('impact_metrics')
    .select('*')
    .eq('user_id', userId)
    .is('period_year', null)
    .is('period_month', null)
    .maybeSingle();

  if (existing) {
    const cumUpdate: ImpactMetricUpdate = {
      upload_id:            uploadId,
      waste_kg_prevented:   Number(existing.waste_kg_prevented)  + update.waste_kg_prevented,
      revenue_saved_eur:    Number(existing.revenue_saved_eur)   + update.revenue_saved_eur,
      co2_saved_kg:         Number(existing.co2_saved_kg)        + update.co2_saved_kg,
      water_saved_litres:   Number(existing.water_saved_litres)  + update.water_saved_litres,
      meals_equivalent:     Number(existing.meals_equivalent)    + update.meals_equivalent,
    };
    const { error } = await supabase
      .from('impact_metrics')
      .update(cumUpdate)
      .eq('id', existing.id);
    if (error) throw new Error(`upsertCumulativeImpact (update): ${error.message}`);
  } else {
    const insert: ImpactMetricInsert = {
      user_id:      userId,
      upload_id:    uploadId,
      period_year:  null,
      period_month: null,
      ...update,
    };
    const { error } = await supabase
      .from('impact_metrics')
      .insert(insert);
    if (error) throw new Error(`upsertCumulativeImpact (insert): ${error.message}`);
  }
}

/** Get cumulative (all-time) impact for a user */
export async function getCumulativeImpact(userId: string): Promise<ImpactMetricRow | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('impact_metrics')
    .select('*')
    .eq('user_id', userId)
    .is('period_year', null)
    .is('period_month', null)
    .maybeSingle();
  if (error) throw new Error(`getCumulativeImpact: ${error.message}`);
  return data as ImpactMetricRow | null;
}

/** Get monthly impact breakdown for a user (last N months) */
export async function getMonthlyImpact(
  userId: string,
  limitMonths = 6,
): Promise<ImpactMetricRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('impact_metrics')
    .select('*')
    .eq('user_id', userId)
    .not('period_year', 'is', null)
    .order('period_year',  { ascending: false })
    .order('period_month', { ascending: false })
    .limit(limitMonths);
  if (error) throw new Error(`getMonthlyImpact: ${error.message}`);
  return ((data ?? []) as ImpactMetricRow[]).reverse();   // chronological order
}

/** Get category breakdown from the latest cumulative metric */
export async function getCategoryBreakdown(
  userId: string,
): Promise<Record<string, number>> {
  const cumulative = await getCumulativeImpact(userId);
  return (cumulative?.category_breakdown as Record<string, number>) ?? {};
}
