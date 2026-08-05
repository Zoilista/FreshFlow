-- ============================================================
-- FreshFlow — Migration 003: Fix All Tables RLS & Permissions
-- ============================================================

-- Grant Base Table Privileges for ALL remaining tables
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.profiles TO authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.products TO authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.sales_history TO authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.inventory_snapshots TO authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.forecast_results TO authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.surplus_predictions TO authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.impact_metrics TO authenticated, service_role;

-- Add Missing DELETE Policies for ALL remaining tables

-- profiles (uses 'id' instead of 'user_id')
DROP POLICY IF EXISTS "profiles_delete_own" ON public.profiles;
CREATE POLICY "profiles_delete_own" ON public.profiles FOR DELETE USING (auth.uid() = id);

-- products
DROP POLICY IF EXISTS "products_delete_own" ON public.products;
CREATE POLICY "products_delete_own" ON public.products FOR DELETE USING (auth.uid() = user_id);

-- sales_history
DROP POLICY IF EXISTS "sales_history_delete_own" ON public.sales_history;
CREATE POLICY "sales_history_delete_own" ON public.sales_history FOR DELETE USING (auth.uid() = user_id);

-- inventory_snapshots
DROP POLICY IF EXISTS "inventory_snapshots_delete_own" ON public.inventory_snapshots;
CREATE POLICY "inventory_snapshots_delete_own" ON public.inventory_snapshots FOR DELETE USING (auth.uid() = user_id);

-- forecast_results
DROP POLICY IF EXISTS "forecast_results_delete_own" ON public.forecast_results;
CREATE POLICY "forecast_results_delete_own" ON public.forecast_results FOR DELETE USING (auth.uid() = user_id);

-- surplus_predictions
DROP POLICY IF EXISTS "surplus_predictions_delete_own" ON public.surplus_predictions;
CREATE POLICY "surplus_predictions_delete_own" ON public.surplus_predictions FOR DELETE USING (auth.uid() = user_id);

-- impact_metrics
DROP POLICY IF EXISTS "impact_metrics_delete_own" ON public.impact_metrics;
CREATE POLICY "impact_metrics_delete_own" ON public.impact_metrics FOR DELETE USING (auth.uid() = user_id);
