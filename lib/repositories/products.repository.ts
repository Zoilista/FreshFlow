// ─── Products Repository ─────────────────────────────────────────────────────
import { createClient } from '@/lib/supabase/server';
import type {
  ProductRow,
  ProductInsert,
  ProductUpdate,
  SalesHistoryInsert,
  InventorySnapshotInsert,
} from '@/types/database';

/** Upsert a product by (user_id, product_name). Returns the product row. */
export async function upsertProduct(
  data: ProductInsert,
): Promise<ProductRow> {
  const supabase = await createClient();
  const { data: row, error } = await supabase
    .from('products')
    .upsert(data, { onConflict: 'user_id,product_name', ignoreDuplicates: false })
    .select()
    .single();
  if (error) throw new Error(`upsertProduct (${data.product_name}): ${error.message}`);
  return row as ProductRow;
}

/** Bulk upsert products. Returns map of product_name (lowercase) → product_id */
export async function bulkUpsertProducts(
  inserts: ProductInsert[],
): Promise<Map<string, string>> {
  if (inserts.length === 0) return new Map();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('products')
    .upsert(inserts, { onConflict: 'user_id,product_name', ignoreDuplicates: false })
    .select('id, product_name');
  if (error) throw new Error(`bulkUpsertProducts: ${error.message}`);
  const map = new Map<string, string>();
  for (const row of data ?? []) {
    map.set((row.product_name as string).toLowerCase(), row.id as string);
  }
  return map;
}

/** Update product aggregate stats */
export async function updateProductStats(
  id: string,
  update: ProductUpdate,
): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from('products')
    .update(update)
    .eq('id', id);
  if (error) throw new Error(`updateProductStats (${id}): ${error.message}`);
}

/** Get all products for a user */
export async function getProducts(userId: string): Promise<ProductRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('user_id', userId)
    .order('product_name', { ascending: true });
  if (error) throw new Error(`getProducts: ${error.message}`);
  return (data ?? []) as ProductRow[];
}

/** Count total products for a user */
export async function countProducts(userId: string): Promise<number> {
  const supabase = await createClient();
  const { count, error } = await supabase
    .from('products')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId);
  if (error) throw new Error(`countProducts: ${error.message}`);
  return count ?? 0;
}

// ── Sales History ─────────────────────────────────────────────────────────────

/** Bulk insert sales history rows (upsert on conflict to avoid duplicates) */
export async function bulkInsertSalesHistory(rows: SalesHistoryInsert[]): Promise<number> {
  if (rows.length === 0) return 0;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('sales_history')
    .upsert(rows, { onConflict: 'user_id,product_id,sale_date', ignoreDuplicates: true })
    .select('id');
  if (error) throw new Error(`bulkInsertSalesHistory: ${error.message}`);
  return data?.length ?? 0;
}

/** Get sales history for a product (for forecast engine input) */
export async function getSalesHistoryForProduct(
  productId: string,
  limitDays = 90,
): Promise<{ sale_date: string; quantity_sold: number; price_per_unit: number | null }[]> {
  const supabase = await createClient();
  const since    = new Date(Date.now() - limitDays * 86_400_000).toISOString().split('T')[0];
  const { data, error } = await supabase
    .from('sales_history')
    .select('sale_date, quantity_sold, price_per_unit')
    .eq('product_id', productId)
    .gte('sale_date', since)
    .order('sale_date', { ascending: true });
  if (error) throw new Error(`getSalesHistoryForProduct: ${error.message}`);
  return (data ?? []) as { sale_date: string; quantity_sold: number; price_per_unit: number | null }[];
}

// ── Inventory Snapshots ───────────────────────────────────────────────────────

/** Bulk insert inventory snapshots (upsert on conflict) */
export async function bulkInsertInventorySnapshots(rows: InventorySnapshotInsert[]): Promise<number> {
  if (rows.length === 0) return 0;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('inventory_snapshots')
    .upsert(rows, { onConflict: 'user_id,product_id,snapshot_date', ignoreDuplicates: true })
    .select('id');
  if (error) throw new Error(`bulkInsertInventorySnapshots: ${error.message}`);
  return data?.length ?? 0;
}

/** Get the latest stock snapshot per product for a user */
export async function getLatestStockPerProduct(
  userId: string,
): Promise<Map<string, number>> {
  const supabase = await createClient();
  // Get the most recent snapshot date per product
  const { data, error } = await supabase
    .from('inventory_snapshots')
    .select('product_id, snapshot_date, stock_quantity')
    .eq('user_id', userId)
    .order('snapshot_date', { ascending: false });
  if (error) throw new Error(`getLatestStockPerProduct: ${error.message}`);

  // Keep only the latest per product
  const map = new Map<string, number>();
  for (const row of data ?? []) {
    if (!map.has(row.product_id)) {
      map.set(row.product_id, Number(row.stock_quantity));
    }
  }
  return map;
}
