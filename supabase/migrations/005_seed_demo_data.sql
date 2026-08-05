-- ============================================================
-- FreshFlow — Migration 005: Seed Demo Data
-- 
-- Run this script in the Supabase SQL editor to populate the
-- dashboard with realistic demo data for presentations.
-- Ensure you have at least ONE registered user before running this.
-- ============================================================

DO $$
DECLARE
  v_user_id UUID;
  v_upload_id UUID;
  v_prod_id1 UUID;
  v_prod_id2 UUID;
  v_prod_id3 UUID;
  v_prod_id4 UUID;
  v_forecast_id1 UUID;
  v_forecast_id2 UUID;
  v_forecast_id3 UUID;
  v_surplus_id1 UUID;
  v_surplus_id2 UUID;
BEGIN
  -- Grab the first registered user
  SELECT id INTO v_user_id FROM auth.users ORDER BY created_at DESC LIMIT 1;
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'No user found. Please register a user in the app before seeding demo data.';
  END IF;

  -- 1. Create a dummy upload record
  INSERT INTO public.uploads (
    user_id, filename, file_size_bytes, mime_type, status, 
    total_rows, valid_rows, products_upserted, processing_ms
  ) VALUES (
    v_user_id, 'demo_inventory_q3.csv', 10245, 'text/csv', 'completed',
    450, 448, 120, 1450
  ) RETURNING id INTO v_upload_id;

  -- 2. Create some products
  INSERT INTO public.products (user_id, sku, product_name, category, unit, price_per_unit, avg_daily_sales, moving_avg_7d, weekly_demand, stock_turnover)
  VALUES (v_user_id, 'DEMO-100', 'Organic Tomatoes', 'Vegetables', 'kg', 2.50, 15.0, 14.5, 100, 1.2) RETURNING id INTO v_prod_id1;

  INSERT INTO public.products (user_id, sku, product_name, category, unit, price_per_unit, avg_daily_sales, moving_avg_7d, weekly_demand, stock_turnover)
  VALUES (v_user_id, 'DEMO-101', 'Artisan Bread', 'Bakery', 'pcs', 1.80, 45.0, 40.0, 280, 2.5) RETURNING id INTO v_prod_id2;

  INSERT INTO public.products (user_id, sku, product_name, category, unit, price_per_unit, avg_daily_sales, moving_avg_7d, weekly_demand, stock_turnover)
  VALUES (v_user_id, 'DEMO-102', 'Fresh Strawberries', 'Fruits', 'kg', 4.00, 8.0, 7.5, 50, 0.8) RETURNING id INTO v_prod_id3;

  INSERT INTO public.products (user_id, sku, product_name, category, unit, price_per_unit, avg_daily_sales, moving_avg_7d, weekly_demand, stock_turnover)
  VALUES (v_user_id, 'DEMO-103', 'Whole Milk 1L', 'Dairy', 'pcs', 1.20, 30.0, 32.0, 220, 3.0) RETURNING id INTO v_prod_id4;

  -- 3. Create forecast results
  INSERT INTO public.forecast_results (
    user_id, product_id, upload_id, forecast_date, current_stock, expected_demand_7d, 
    confidence_level, waste_risk_score, risk_level, potential_loss_eur
  ) VALUES (
    v_user_id, v_prod_id1, v_upload_id, CURRENT_DATE, 250, 100, 
    'high', 85, 'CRITICAL', 375.00
  ) RETURNING id INTO v_forecast_id1;

  INSERT INTO public.forecast_results (
    user_id, product_id, upload_id, forecast_date, current_stock, expected_demand_7d, 
    confidence_level, waste_risk_score, risk_level, potential_loss_eur
  ) VALUES (
    v_user_id, v_prod_id2, v_upload_id, CURRENT_DATE, 400, 280, 
    'very_high', 60, 'HIGH', 216.00
  ) RETURNING id INTO v_forecast_id2;

  INSERT INTO public.forecast_results (
    user_id, product_id, upload_id, forecast_date, current_stock, expected_demand_7d, 
    confidence_level, waste_risk_score, risk_level, potential_loss_eur
  ) VALUES (
    v_user_id, v_prod_id3, v_upload_id, CURRENT_DATE, 80, 50, 
    'medium', 35, 'MEDIUM', 120.00
  ) RETURNING id INTO v_forecast_id3;

  -- 4. Create surplus predictions based on forecasts
  INSERT INTO public.surplus_predictions (
    user_id, product_id, upload_id, forecast_id, product_name, category, unit, 
    current_stock, forecast_demand, risk_level, risk_score, potential_loss_eur, recommended_action
  ) VALUES (
    v_user_id, v_prod_id1, v_upload_id, v_forecast_id1, 'Organic Tomatoes', 'Vegetables', 'kg',
    250, 100, 'CRITICAL', 85, 375.00, 'create_offer'
  ) RETURNING id INTO v_surplus_id1;

  INSERT INTO public.surplus_predictions (
    user_id, product_id, upload_id, forecast_id, product_name, category, unit, 
    current_stock, forecast_demand, risk_level, risk_score, potential_loss_eur, recommended_action
  ) VALUES (
    v_user_id, v_prod_id2, v_upload_id, v_forecast_id2, 'Artisan Bread', 'Bakery', 'pcs',
    400, 280, 'HIGH', 60, 216.00, 'create_offer'
  ) RETURNING id INTO v_surplus_id2;

  INSERT INTO public.surplus_predictions (
    user_id, product_id, upload_id, forecast_id, product_name, category, unit, 
    current_stock, forecast_demand, risk_level, risk_score, potential_loss_eur, recommended_action
  ) VALUES (
    v_user_id, v_prod_id3, v_upload_id, v_forecast_id3, 'Fresh Strawberries', 'Fruits', 'kg',
    80, 50, 'MEDIUM', 35, 120.00, 'monitor'
  );

  -- 5. Create some impact metrics
  INSERT INTO public.impact_metrics (
    user_id, period_year, period_month, waste_kg_prevented, revenue_saved_eur, 
    co2_saved_kg, water_saved_litres, meals_equivalent, category_breakdown
  ) VALUES 
    (v_user_id, null, null, 1240.5, 3450.00, 3101.25, 12400.0, 2481, '{"Vegetables": 600, "Bakery": 440.5, "Fruits": 200}'::jsonb),
    (v_user_id, 2026, 6, 420.0, 1100.00, 1050.00, 4200.0, 840, '{"Vegetables": 220, "Bakery": 200}'::jsonb),
    (v_user_id, 2026, 7, 510.5, 1350.00, 1276.25, 5105.0, 1021, '{"Vegetables": 210, "Fruits": 300.5}'::jsonb);

  -- 6. Create some active offers
  INSERT INTO public.offers (
    user_id, surplus_prediction_id, product_name, category, unit, surplus_quantity, risk_level,
    buyer_name, offer_price, status, notes
  ) VALUES 
    (v_user_id, v_surplus_id1, 'Organic Tomatoes', 'Vegetables', 'kg', 150, 'CRITICAL', 'Local Food Bank', 0.50, 'Pending', 'Can deliver tomorrow morning.'),
    (v_user_id, v_surplus_id2, 'Artisan Bread', 'Bakery', 'pcs', 120, 'HIGH', 'Community Kitchen', 0.80, 'Accepted', 'Agreed pickup today at 18:00'),
    (v_user_id, null, 'Cucumbers', 'Vegetables', 'kg', 45, 'LOW', 'Bistro Noord', 1.20, 'Expired', 'Offer automatically expired after 48h.');

  RAISE NOTICE 'Successfully seeded demo data for user %', v_user_id;
END $$;
