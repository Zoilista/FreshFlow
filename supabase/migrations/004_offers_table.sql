-- ============================================================
-- FreshFlow — Migration 004: Offers Table
-- ============================================================

CREATE TABLE IF NOT EXISTS public.offers (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  user_id                 UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Foreign key with SET NULL so offers are preserved if the prediction is removed
  surplus_prediction_id   UUID REFERENCES public.surplus_predictions(id) ON DELETE SET NULL,
  
  -- Denormalized product info (so the offer retains context even if the prediction is deleted)
  product_name            TEXT NOT NULL,
  category                TEXT,
  unit                    TEXT,
  surplus_quantity        NUMERIC,
  risk_level              TEXT,
  
  -- Offer specifics
  buyer_name              TEXT NOT NULL,
  offer_price             NUMERIC NOT NULL,
  status                  TEXT NOT NULL DEFAULT 'Pending'
                            CHECK (status IN ('Pending','Accepted','Rejected','Expired')),
  notes                   TEXT
);

-- Trigger for updated_at
CREATE TRIGGER offers_updated_at
  BEFORE UPDATE ON public.offers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- RLS
ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "offers_select_own" ON public.offers;
DROP POLICY IF EXISTS "offers_insert_own" ON public.offers;
DROP POLICY IF EXISTS "offers_update_own" ON public.offers;
DROP POLICY IF EXISTS "offers_delete_own" ON public.offers;

CREATE POLICY "offers_select_own" ON public.offers FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "offers_insert_own" ON public.offers FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "offers_update_own" ON public.offers FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "offers_delete_own" ON public.offers FOR DELETE USING (auth.uid() = user_id);

-- Explicit GRANTS
GRANT ALL ON TABLE public.offers TO authenticated, service_role;
