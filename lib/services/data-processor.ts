// ─── Data Processor ──────────────────────────────────────────────────────────
// Transforms ParsedFile rows into DB-ready product / sales / inventory records.
// Called by the upload Server Action after CSV/XLSX parsing.

import type { MappedRow } from '@/lib/services/csv-parser';
import type {
  ProductInsert,
  ProductUpdate,
  SalesHistoryInsert,
  InventorySnapshotInsert,
} from '@/types/database';

export interface ProcessingResult {
  products:            ProductUpsertItem[];
  salesHistory:        SalesHistoryInsert[];
  inventorySnapshots:  InventorySnapshotInsert[];
}

export interface ProductUpsertItem {
  insert: ProductInsert;
  update: ProductUpdate;
  naturalKey: { productName: string; sku: string | null };
}

/**
 * Groups rows by product, computes per-product aggregate stats,
 * and returns DB-ready inserts.
 */
export function processRows(
  rows: MappedRow[],
  userId: string,
  uploadId: string,
  // Map from (productName → productId) from prior upsert — optional,
  // used to set product_id on sales/stock rows.
  productIdMap: Map<string, string> = new Map(),
): ProcessingResult {
  // ── Group rows by product name ─────────────────────────────────────────────
  const byProduct = new Map<string, MappedRow[]>();

  for (const row of rows) {
    const key = (row.product_name ?? '').toLowerCase().trim();
    if (!key) continue;
    if (!byProduct.has(key)) byProduct.set(key, []);
    byProduct.get(key)!.push(row);
  }

  const products:           ProductUpsertItem[]       = [];
  const salesHistory:       SalesHistoryInsert[]       = [];
  const inventorySnapshots: InventorySnapshotInsert[]  = [];

  for (const [, productRows] of byProduct) {
    const first        = productRows[0];
    const productName  = (first.product_name ?? '').trim();
    const sku          = first.sku?.trim() || null;
    const category     = first.category?.trim() || null;
    const unit         = 'kg';   // default; could be extended later

    // ── Price: take median of non-null prices ─────────────────────────────
    const prices = productRows
      .map((r) => r.price)
      .filter((p): p is number => p != null && p > 0)
      .sort((a, b) => a - b);
    const medianPrice = prices.length > 0
      ? prices[Math.floor(prices.length / 2)]
      : null;

    // ── Sales stats ───────────────────────────────────────────────────────
    const salesValues = productRows
      .map((r) => r.sales ?? 0)
      .filter((s) => s >= 0);
    const avgDailySales = salesValues.length > 0
      ? salesValues.reduce((a, b) => a + b, 0) / salesValues.length
      : 0;

    // Weighted moving average of last 7 days
    const recentSales = [...productRows]
      .sort((a, b) => (a.date ?? '').localeCompare(b.date ?? ''))
      .slice(-7)
      .map((r) => r.sales ?? 0);
    let movingAvg7d = 0;
    if (recentSales.length > 0) {
      let weightedSum = 0, weightSum = 0;
      recentSales.forEach((v, i) => {
        const w = i + 1;
        weightedSum += v * w;
        weightSum   += w;
      });
      movingAvg7d = weightSum > 0 ? weightedSum / weightSum : 0;
    }

    // ── Stock turnover ───────────────────────────────────────────────────
    const stockValues = productRows.map((r) => r.stock ?? 0).filter((s) => s >= 0);
    const avgStock    = stockValues.length > 0
      ? stockValues.reduce((a, b) => a + b, 0) / stockValues.length
      : 0;
    const stockTurnover = avgStock > 0 ? avgDailySales / avgStock : 0;

    // ── Product insert / update ───────────────────────────────────────────
    const productInsert: ProductInsert = {
      user_id:         userId,
      sku,
      product_name:    productName,
      category,
      unit,
      price_per_unit:  medianPrice,
      avg_daily_sales: Math.round(avgDailySales * 10000) / 10000,
      moving_avg_7d:   Math.round(movingAvg7d   * 10000) / 10000,
      weekly_demand:   Math.round(movingAvg7d * 7 * 10000) / 10000,
      stock_turnover:  Math.round(stockTurnover * 10000) / 10000,
    };

    const productUpdate: ProductUpdate = {
      sku,
      category,
      price_per_unit:  medianPrice,
      avg_daily_sales: productInsert.avg_daily_sales,
      moving_avg_7d:   productInsert.moving_avg_7d,
      weekly_demand:   productInsert.weekly_demand,
      stock_turnover:  productInsert.stock_turnover,
    };

    products.push({
      insert:     productInsert,
      update:     productUpdate,
      naturalKey: { productName, sku },
    });

    // ── Sales history rows ────────────────────────────────────────────────
    const productId = productIdMap.get(productName.toLowerCase()) ?? '';

    for (const row of productRows) {
      if (!row.date || (row.sales == null)) continue;

      salesHistory.push({
        user_id:        userId,
        product_id:     productId,
        upload_id:      uploadId,
        sale_date:      row.date,
        quantity_sold:  Math.max(0, row.sales),
        price_per_unit: row.price ?? null,
        revenue:        row.price != null && row.sales != null
          ? Math.round(row.price * row.sales * 100) / 100
          : null,
      });
    }

    // ── Inventory snapshot rows ───────────────────────────────────────────
    for (const row of productRows) {
      if (!row.date || row.stock == null) continue;

      inventorySnapshots.push({
        user_id:        userId,
        product_id:     productId,
        upload_id:      uploadId,
        snapshot_date:  row.date,
        stock_quantity: Math.max(0, row.stock),
      });
    }
  }

  return { products, salesHistory, inventorySnapshots };
}
