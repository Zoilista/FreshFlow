-- ============================================================
-- FreshFlow — Migration 002: Fix Uploads RLS & Permissions
-- ============================================================

-- 1. Grant Schema Usage
GRANT USAGE ON SCHEMA public TO authenticated, service_role;

-- 2. Grant Base Table Privileges
-- (Grants the required SELECT, INSERT, UPDATE, DELETE privileges)
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.uploads TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.uploads TO service_role;

-- 3. Add Missing DELETE Policy
-- (SELECT, INSERT, and UPDATE policies already exist from migration 001)
DROP POLICY IF EXISTS "uploads_delete_own" ON public.uploads;
CREATE POLICY "uploads_delete_own" ON public.uploads 
  FOR DELETE 
  USING (auth.uid() = user_id);
