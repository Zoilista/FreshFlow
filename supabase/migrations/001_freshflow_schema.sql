-- ============================================================
-- FreshFlow — Migration 001: Core Schema
-- Run this in your Supabase SQL editor (or via Supabase CLI)
-- ============================================================

-- ── Enable pgcrypto for gen_random_uuid() ───────────────────
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── Updated_at trigger function ──────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- TABLE: profiles (extends Supabase auth.users)
-- May partially exist — we use ADD COLUMN IF NOT EXISTS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id             UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  email          TEXT,
  full_name      TEXT,
  business_name  TEXT,
  business_type  TEXT NOT NULL DEFAULT 'Independent Retailer',
  city           TEXT,
  country        TEXT
);

-- Backfill missing columns if table already existed
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='updated_at') THEN
    ALTER TABLE public.profiles ADD COLUMN updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='business_name') THEN
    ALTER TABLE public.profiles ADD COLUMN business_name TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='city') THEN
    ALTER TABLE public.profiles ADD COLUMN city TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='country') THEN
    ALTER TABLE public.profiles ADD COLUMN country TEXT;
  END IF;
END $$;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);

DROP TRIGGER IF EXISTS profiles_updated_at ON public.profiles;
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-create profile on new user sign-up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- TABLE: uploads
-- One row per file upload. Tracks processing state & metrics.
-- ============================================================
CREATE TABLE IF NOT EXISTS public.uploads (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  user_id               UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- File metadata
  filename              TEXT NOT NULL,
  file_size_bytes       BIGINT,
  mime_type             TEXT,

  -- Processing state
  status                TEXT NOT NULL DEFAULT 'pending'
                          CHECK (status IN ('pending','processing','completed','failed')),
  error_message         TEXT,

  -- Processing metrics (Phase 2 amendment)
  total_rows            INTEGER,
  valid_rows            INTEGER,
  duplicate_rows        INTEGER,
  invalid_rows          INTEGER,
  products_upserted     INTEGER,
  sales_rows_inserted   INTEGER,
  stock_rows_inserted   INTEGER,
  processing_ms         INTEGER,          -- wall-clock time in milliseconds

  -- Dedup fingerprint
  content_hash          TEXT,             -- SHA-256 of first 500 rows serialised

  -- Detected date range in the file
  data_date_from        DATE,
  data_date_to          DATE
);

ALTER TABLE public.uploads ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "uploads_select_own" ON public.uploads;
DROP POLICY IF EXISTS "uploads_insert_own" ON public.uploads;
DROP POLICY IF EXISTS "uploads_update_own" ON public.uploads;
CREATE POLICY "uploads_select_own" ON public.uploads FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "uploads_insert_own" ON public.uploads FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "uploads_update_own" ON public.uploads FOR UPDATE USING (auth.uid() = user_id);

DROP TRIGGER IF EXISTS uploads_updated_at ON public.uploads;
CREATE TRIGGER uploads_updated_at
  BEFORE UPDATE ON public.uploads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE INDEX IF NOT EXISTS uploads_user_created ON public.uploads (user_id, created_at DESC);

-- ============================================================
-- TABLE: products
-- Canonical product catalogue per user, upserted from uploads
-- ============================================================
CREATE TABLE IF NOT EXISTS public.products (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  user_id        UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Identity — (user_id, sku) is the natural key
  sku            TEXT,
  product_name   TEXT NOT NULL,
  category       TEXT,
  unit           TEXT DEFAULT 'kg',

  -- Pricing (latest seen value from uploads)
  price_per_unit NUMERIC(10,2),

  -- Aggregate stats updated after each upload
  avg_daily_sales    NUMERIC(10,4) DEFAULT 0,
  moving_avg_7d      NUMERIC(10,4) DEFAULT 0,
  weekly_demand      NUMERIC(10,4) DEFAULT 0,
  stock_turnover     NUMERIC(10,4) DEFAULT 0,

  UNIQUE (user_id, product_name)  -- fallback uniqueness when no SKU
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "products_select_own" ON public.products;
DROP POLICY IF EXISTS "products_insert_own" ON public.products;
DROP POLICY IF EXISTS "products_update_own" ON public.products;
CREATE POLICY "products_select_own" ON public.products FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "products_insert_own" ON public.products FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "products_update_own" ON public.products FOR UPDATE USING (auth.uid() = user_id);

DROP TRIGGER IF EXISTS products_updated_at ON public.products;
CREATE TRIGGER products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE INDEX IF NOT EXISTS products_user_id ON public.products (user_id);

-- ============================================================
-- TABLE: sales_history
-- One row per (product × date) from uploaded CSV data
-- ============================================================
CREATE TABLE IF NOT EXISTS public.sales_history (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  user_id        UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id     UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  upload_id      UUID NOT NULL REFERENCES public.uploads(id) ON DELETE CASCADE,

  sale_date      DATE NOT NULL,
  quantity_sold  NUMERIC(10,4) NOT NULL DEFAULT 0,
  price_per_unit NUMERIC(10,2),
  revenue        NUMERIC(10,2),    -- quantity_sold × price_per_unit (computed)

  UNIQUE (user_id, product_id, sale_date)  -- one row per product per day
);

ALTER TABLE public.sales_history ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "sales_history_select_own" ON public.sales_history;
DROP POLICY IF EXISTS "sales_history_insert_own" ON public.sales_history;
CREATE POLICY "sales_history_select_own" ON public.sales_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "sales_history_insert_own" ON public.sales_history FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS sales_history_product_date ON public.sales_history (product_id, sale_date DESC);
CREATE INDEX IF NOT EXISTS sales_history_user_date    ON public.sales_history (user_id, sale_date DESC);

-- ============================================================
-- TABLE: inventory_snapshots
-- Stock level per product per date (from CSV 'stock' column)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.inventory_snapshots (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  user_id        UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id     UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  upload_id      UUID NOT NULL REFERENCES public.uploads(id) ON DELETE CASCADE,

  snapshot_date  DATE NOT NULL,
  stock_quantity NUMERIC(10,4) NOT NULL DEFAULT 0,

  UNIQUE (user_id, product_id, snapshot_date)
);

ALTER TABLE public.inventory_snapshots ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "inventory_snapshots_select_own" ON public.inventory_snapshots;
DROP POLICY IF EXISTS "inventory_snapshots_insert_own" ON public.inventory_snapshots;
CREATE POLICY "inventory_snapshots_select_own" ON public.inventory_snapshots FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "inventory_snapshots_insert_own" ON public.inventory_snapshots FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS inventory_snapshots_product_date ON public.inventory_snapshots (product_id, snapshot_date DESC);

-- ============================================================
-- TABLE: forecast_results
-- 7-day demand forecast per product, computed after each upload
-- ============================================================
CREATE TABLE IF NOT EXISTS public.forecast_results (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  user_id          UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id       UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  upload_id        UUID NOT NULL REFERENCES public.uploads(id) ON DELETE CASCADE,

  forecast_date    DATE NOT NULL DEFAULT CURRENT_DATE,

  -- Model inputs
  current_stock     NUMERIC(10,4),
  avg_daily_sales   NUMERIC(10,4),
  data_points_count INTEGER,          -- how many sales records fed the model

  -- Model outputs
  expected_demand_7d         NUMERIC(10,4),  -- units expected to sell in 7 days
  expected_remaining_stock   NUMERIC(10,4),  -- stock - expected_demand_7d
  days_of_stock_remaining    NUMERIC(10,2),  -- current_stock / avg_daily_sales
  surplus_ratio              NUMERIC(10,4),  -- current_stock / expected_demand_7d

  -- Confidence (improved — see forecast-engine.ts)
  confidence_score           NUMERIC(4,2),   -- 0.00 – 1.00
  confidence_level           TEXT CHECK (confidence_level IN ('very_low','low','medium','high','very_high')),

  -- Risk
  waste_risk_score  INTEGER NOT NULL DEFAULT 0 CHECK (waste_risk_score BETWEEN 0 AND 100),
  risk_level        TEXT NOT NULL DEFAULT 'LOW'
                      CHECK (risk_level IN ('LOW','MEDIUM','HIGH','CRITICAL')),

  potential_loss_eur NUMERIC(10,2) DEFAULT 0,  -- at-risk value in EUR

  UNIQUE (user_id, product_id, upload_id)   -- one forecast per product per upload
);

ALTER TABLE public.forecast_results ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "forecast_results_select_own" ON public.forecast_results;
DROP POLICY IF EXISTS "forecast_results_insert_own" ON public.forecast_results;
DROP POLICY IF EXISTS "forecast_results_update_own" ON public.forecast_results;
CREATE POLICY "forecast_results_select_own" ON public.forecast_results FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "forecast_results_insert_own" ON public.forecast_results FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "forecast_results_update_own" ON public.forecast_results FOR UPDATE USING (auth.uid() = user_id);

DROP TRIGGER IF EXISTS forecast_results_updated_at ON public.forecast_results;
CREATE TRIGGER forecast_results_updated_at
  BEFORE UPDATE ON public.forecast_results
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE INDEX IF NOT EXISTS forecast_results_user_date   ON public.forecast_results (user_id, forecast_date DESC);
CREATE INDEX IF NOT EXISTS forecast_results_upload      ON public.forecast_results (upload_id);
CREATE INDEX IF NOT EXISTS forecast_results_risk        ON public.forecast_results (user_id, waste_risk_score DESC);

-- ============================================================
-- TABLE: surplus_predictions
-- Denormalised summary per product per upload for fast UI queries
-- ============================================================
CREATE TABLE IF NOT EXISTS public.surplus_predictions (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  user_id        UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id     UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  upload_id      UUID NOT NULL REFERENCES public.uploads(id) ON DELETE CASCADE,
  forecast_id    UUID NOT NULL REFERENCES public.forecast_results(id) ON DELETE CASCADE,

  -- Snapshot of product fields (denormalised for fast reads)
  product_name     TEXT NOT NULL,
  category         TEXT,
  unit             TEXT,
  current_stock    NUMERIC(10,4),
  forecast_demand  NUMERIC(10,4),
  price_per_unit   NUMERIC(10,2),

  risk_level       TEXT NOT NULL CHECK (risk_level IN ('LOW','MEDIUM','HIGH','CRITICAL')),
  risk_score       INTEGER NOT NULL CHECK (risk_score BETWEEN 0 AND 100),
  potential_loss_eur NUMERIC(10,2) DEFAULT 0,

  -- Action recommendation
  recommended_action TEXT CHECK (recommended_action IN ('create_offer','monitor','none')),

  UNIQUE (user_id, product_id, upload_id)
);

ALTER TABLE public.surplus_predictions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "surplus_predictions_select_own" ON public.surplus_predictions;
DROP POLICY IF EXISTS "surplus_predictions_insert_own" ON public.surplus_predictions;
DROP POLICY IF EXISTS "surplus_predictions_update_own" ON public.surplus_predictions;
CREATE POLICY "surplus_predictions_select_own" ON public.surplus_predictions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "surplus_predictions_insert_own" ON public.surplus_predictions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "surplus_predictions_update_own" ON public.surplus_predictions FOR UPDATE USING (auth.uid() = user_id);

DROP TRIGGER IF EXISTS surplus_predictions_updated_at ON public.surplus_predictions;
CREATE TRIGGER surplus_predictions_updated_at
  BEFORE UPDATE ON public.surplus_predictions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE INDEX IF NOT EXISTS surplus_predictions_user_risk ON public.surplus_predictions (user_id, risk_score DESC);
CREATE INDEX IF NOT EXISTS surplus_predictions_upload    ON public.surplus_predictions (upload_id);

-- ============================================================
-- TABLE: impact_metrics
-- Cumulative & monthly environmental/financial impact per user
-- ============================================================
CREATE TABLE IF NOT EXISTS public.impact_metrics (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  user_id          UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  upload_id        UUID REFERENCES public.uploads(id) ON DELETE SET NULL,

  -- Period (NULL = all-time cumulative)
  period_year      INTEGER,
  period_month     INTEGER,

  -- Impact figures
  waste_kg_prevented     NUMERIC(12,4) DEFAULT 0,
  revenue_saved_eur      NUMERIC(12,2) DEFAULT 0,
  co2_saved_kg           NUMERIC(12,4) DEFAULT 0,
  water_saved_litres     NUMERIC(12,4) DEFAULT 0,
  meals_equivalent       NUMERIC(12,4) DEFAULT 0,

  -- Category breakdown (stored as JSON for flexibility)
  category_breakdown     JSONB DEFAULT '{}',

  UNIQUE (user_id, period_year, period_month)
);

ALTER TABLE public.impact_metrics ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "impact_metrics_select_own" ON public.impact_metrics;
DROP POLICY IF EXISTS "impact_metrics_insert_own" ON public.impact_metrics;
DROP POLICY IF EXISTS "impact_metrics_update_own" ON public.impact_metrics;
-- Impact leaderboard: users can read all cumulative metrics (period_year IS NULL means all-time)
-- so we allow SELECT for cumulative rows to any authenticated user
CREATE POLICY "impact_metrics_select_own" ON public.impact_metrics
  FOR SELECT USING (auth.uid() = user_id OR (period_year IS NULL AND period_month IS NULL));
CREATE POLICY "impact_metrics_insert_own" ON public.impact_metrics FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "impact_metrics_update_own" ON public.impact_metrics FOR UPDATE USING (auth.uid() = user_id);

DROP TRIGGER IF EXISTS impact_metrics_updated_at ON public.impact_metrics;
CREATE TRIGGER impact_metrics_updated_at
  BEFORE UPDATE ON public.impact_metrics
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE INDEX IF NOT EXISTS impact_metrics_user_period ON public.impact_metrics (user_id, period_year DESC, period_month DESC);
