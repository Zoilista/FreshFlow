// ─── FreshFlow — Database Types ─────────────────────────────────────────────
// Auto-synced with supabase/migrations/001_freshflow_schema.sql
// Use Row for reads, Insert for writes, Update for patches.

export type RiskLevel       = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type ConfidenceLevel = 'very_low' | 'low' | 'medium' | 'high' | 'very_high';
export type UploadStatus    = 'pending' | 'processing' | 'completed' | 'failed';
export type ActionType      = 'create_offer' | 'monitor' | 'none';
export type OfferStatus     = 'Pending' | 'Accepted' | 'Rejected' | 'Expired';

// ── profiles ─────────────────────────────────────────────────────────────────
export interface ProfileRow {
  id:            string;
  created_at:    string;
  updated_at:    string;
  email:         string | null;
  full_name:     string | null;
  business_name: string | null;
  business_type: string;
  city:          string | null;
  country:       string | null;
}
export type ProfileInsert = Omit<ProfileRow, 'created_at' | 'updated_at'>;
export type ProfileUpdate = Partial<Omit<ProfileRow, 'id' | 'created_at' | 'updated_at'>>;

// ── uploads ──────────────────────────────────────────────────────────────────
export interface UploadRow {
  id:                   string;
  created_at:           string;
  updated_at:           string;
  user_id:              string;
  filename:             string;
  file_size_bytes:      number | null;
  mime_type:            string | null;
  status:               UploadStatus;
  error_message:        string | null;
  total_rows:           number | null;
  valid_rows:           number | null;
  duplicate_rows:       number | null;
  invalid_rows:         number | null;
  products_upserted:    number | null;
  sales_rows_inserted:  number | null;
  stock_rows_inserted:  number | null;
  processing_ms:        number | null;
  content_hash:         string | null;
  data_date_from:       string | null;   // ISO date string
  data_date_to:         string | null;   // ISO date string
}
export interface UploadInsert {
  user_id:              string;
  filename:             string;
  file_size_bytes?:     number | null;
  mime_type?:           string | null;
  status?:              UploadStatus;
  error_message?:       string | null;
  total_rows?:          number | null;
  valid_rows?:          number | null;
  duplicate_rows?:      number | null;
  invalid_rows?:        number | null;
  products_upserted?:   number | null;
  sales_rows_inserted?: number | null;
  stock_rows_inserted?: number | null;
  processing_ms?:       number | null;
  content_hash?:        string | null;
  data_date_from?:      string | null;
  data_date_to?:        string | null;
}
export type UploadUpdate = Partial<Omit<UploadRow, 'id' | 'created_at' | 'updated_at' | 'user_id'>>;

// ── products ─────────────────────────────────────────────────────────────────
export interface ProductRow {
  id:              string;
  created_at:      string;
  updated_at:      string;
  user_id:         string;
  sku:             string | null;
  product_name:    string;
  category:        string | null;
  unit:            string | null;
  price_per_unit:  number | null;
  avg_daily_sales: number;
  moving_avg_7d:   number;
  weekly_demand:   number;
  stock_turnover:  number;
}
export type ProductInsert = Omit<ProductRow, 'id' | 'created_at' | 'updated_at'>;
export type ProductUpdate = Partial<Omit<ProductRow, 'id' | 'created_at' | 'updated_at' | 'user_id'>>;

// ── sales_history ─────────────────────────────────────────────────────────────
export interface SalesHistoryRow {
  id:            string;
  created_at:    string;
  updated_at:    string;
  user_id:       string;
  product_id:    string;
  upload_id:     string;
  sale_date:     string;   // ISO date string
  quantity_sold: number;
  price_per_unit: number | null;
  revenue:       number | null;
}
export type SalesHistoryInsert = Omit<SalesHistoryRow, 'id' | 'created_at' | 'updated_at'>;

// ── inventory_snapshots ───────────────────────────────────────────────────────
export interface InventorySnapshotRow {
  id:             string;
  created_at:     string;
  updated_at:     string;
  user_id:        string;
  product_id:     string;
  upload_id:      string;
  snapshot_date:  string;  // ISO date string
  stock_quantity: number;
}
export type InventorySnapshotInsert = Omit<InventorySnapshotRow, 'id' | 'created_at' | 'updated_at'>;

// ── forecast_results ──────────────────────────────────────────────────────────
export interface ForecastResultRow {
  id:                        string;
  created_at:                string;
  updated_at:                string;
  user_id:                   string;
  product_id:                string;
  upload_id:                 string;
  forecast_date:             string;   // ISO date string
  current_stock:             number | null;
  avg_daily_sales:           number | null;
  data_points_count:         number | null;
  expected_demand_7d:        number | null;
  expected_remaining_stock:  number | null;
  days_of_stock_remaining:   number | null;
  surplus_ratio:             number | null;
  confidence_score:          number | null;   // 0.00 – 1.00
  confidence_level:          ConfidenceLevel | null;
  waste_risk_score:          number;
  risk_level:                RiskLevel;
  potential_loss_eur:        number;
}
export type ForecastResultInsert = Omit<ForecastResultRow, 'id' | 'created_at' | 'updated_at'>;
export type ForecastResultUpdate = Partial<Omit<ForecastResultRow, 'id' | 'created_at' | 'updated_at' | 'user_id'>>;

// ── surplus_predictions ───────────────────────────────────────────────────────
export interface SurplusPredictionRow {
  id:                  string;
  created_at:          string;
  updated_at:          string;
  user_id:             string;
  product_id:          string;
  upload_id:           string;
  forecast_id:         string;
  product_name:        string;
  category:            string | null;
  unit:                string | null;
  current_stock:       number | null;
  forecast_demand:     number | null;
  price_per_unit:      number | null;
  risk_level:          RiskLevel;
  risk_score:          number;
  potential_loss_eur:  number;
  recommended_action:  ActionType | null;
}
export type SurplusPredictionInsert = Omit<SurplusPredictionRow, 'id' | 'created_at' | 'updated_at'>;

// ── impact_metrics ────────────────────────────────────────────────────────────
export interface ImpactMetricRow {
  id:                  string;
  created_at:          string;
  updated_at:          string;
  user_id:             string;
  upload_id:           string | null;
  period_year:         number | null;
  period_month:        number | null;
  waste_kg_prevented:  number;
  revenue_saved_eur:   number;
  co2_saved_kg:        number;
  water_saved_litres:  number;
  meals_equivalent:    number;
  category_breakdown:  Record<string, number>;  // { "Vegetables": 120.5, ... }
}
export type ImpactMetricInsert = Omit<ImpactMetricRow, 'id' | 'created_at' | 'updated_at'>;
export type ImpactMetricUpdate = Partial<Omit<ImpactMetricRow, 'id' | 'created_at' | 'updated_at' | 'user_id'>>;

// ── offers ────────────────────────────────────────────────────────────────────
export interface OfferRow {
  id:                    string;
  created_at:            string;
  updated_at:            string;
  user_id:               string;
  surplus_prediction_id: string | null;
  product_name:          string;
  category:              string | null;
  unit:                  string | null;
  surplus_quantity:      number | null;
  risk_level:            RiskLevel | null;
  buyer_name:            string;
  offer_price:           number;
  status:                OfferStatus;
  notes:                 string | null;
}
export type OfferInsert = Omit<OfferRow, 'id' | 'created_at' | 'updated_at'>;
export type OfferUpdate = Partial<Omit<OfferRow, 'id' | 'created_at' | 'updated_at' | 'user_id'>>;

// ── Supabase Database helper type ─────────────────────────────────────────────
export interface Database {
  public: {
    Tables: {
      profiles:              { Row: ProfileRow;             Insert: ProfileInsert;             Update: ProfileUpdate            };
      uploads:               { Row: UploadRow;              Insert: UploadInsert;              Update: UploadUpdate             };
      products:              { Row: ProductRow;             Insert: ProductInsert;             Update: ProductUpdate            };
      sales_history:         { Row: SalesHistoryRow;        Insert: SalesHistoryInsert;        Update: Partial<SalesHistoryInsert>  };
      inventory_snapshots:   { Row: InventorySnapshotRow;   Insert: InventorySnapshotInsert;   Update: Partial<InventorySnapshotInsert> };
      forecast_results:      { Row: ForecastResultRow;      Insert: ForecastResultInsert;      Update: ForecastResultUpdate     };
      surplus_predictions:   { Row: SurplusPredictionRow;   Insert: SurplusPredictionInsert;   Update: Partial<SurplusPredictionInsert> };
      impact_metrics:        { Row: ImpactMetricRow;        Insert: ImpactMetricInsert;        Update: ImpactMetricUpdate       };
      offers:                { Row: OfferRow;               Insert: OfferInsert;               Update: OfferUpdate              };
    };
  };
}
