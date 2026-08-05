'use server';

// ─── Upload Server Action ─────────────────────────────────────────────────────
// Full pipeline: Parse → Validate → Dedup → Store → Forecast → Impact

import { createClient } from '@/lib/supabase/server';
import { parseFile }    from '@/lib/services/csv-parser';
import { processRows }  from '@/lib/services/data-processor';
import {
  createUpload,
  updateUpload,
  findDuplicateUpload,
} from '@/lib/repositories/uploads.repository';
import {
  bulkUpsertProducts,
  bulkInsertSalesHistory,
  bulkInsertInventorySnapshots,
  getSalesHistoryForProduct,
  getLatestStockPerProduct,
} from '@/lib/repositories/products.repository';
import {
  bulkInsertForecastResults,
  bulkInsertSurplusPredictions,
} from '@/lib/repositories/forecasts.repository';
import {
  upsertImpactMetric,
  upsertCumulativeImpact,
} from '@/lib/repositories/impact.repository';
import {
  ForecastEngine,
  WeightedMovingAverageForecastModel,
} from '@/lib/services/forecast-engine';
import type { ProductForecastInput }   from '@/lib/services/forecast-engine';
import { calculateImpact, toImpactMetricInsert } from '@/lib/services/impact-engine';

export interface UploadResult {
  success:         boolean;
  uploadId?:       string;
  filename?:       string;
  totalRows?:      number;
  validRows?:      number;
  invalidRows?:    number;
  duplicateRows?:  number;
  productsUpserted?: number;
  salesInserted?:  number;
  stockInserted?:  number;
  processingMs?:   number;
  isDuplicate?:    boolean;
  error?:          string;
  redirectTo?:     string;
}

// Simple deterministic content hash (no crypto module needed on edge)
function simpleContentHash(firstRows: string): string {
  let hash = 0;
  for (let i = 0; i < firstRows.length; i++) {
    const char = firstRows.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;  // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(16).padStart(8, '0');
}

export async function uploadCSV(formData: FormData): Promise<UploadResult> {
  const startMs = Date.now();

  // ── 1. Auth guard ────────────────────────────────────────────────────────
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: 'Unauthorized. Please sign in.' };
  }
  const userId = user.id;

  // ── 2. Extract file from FormData ────────────────────────────────────────
  const file = formData.get('file') as File | null;
  if (!file) {
    return { success: false, error: 'No file provided.' };
  }

  const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
  if (!['csv', 'xlsx'].includes(ext)) {
    return { success: false, error: 'Only .csv and .xlsx files are supported.' };
  }

  if (file.size > 50 * 1024 * 1024) {  // 50 MB limit
    return { success: false, error: 'File too large. Maximum size is 50 MB.' };
  }

  // ── 3. Parse the file ────────────────────────────────────────────────────
  const buffer = await file.arrayBuffer();
  let parsed;
  try {
    parsed = await parseFile(buffer, file.name, file.size);
  } catch (err) {
    return { success: false, error: `Failed to parse file: ${String(err)}` };
  }

  if (parsed.validRows.length === 0) {
    return {
      success:   false,
      error:     'No valid rows found. Check that your file includes required columns: product_name, date.',
      totalRows: parsed.totalRows,
    };
  }

  // ── 4. Duplicate detection ───────────────────────────────────────────────
  const hashInput = parsed.validRows.slice(0, 20).map(r => JSON.stringify(r)).join('|');
  const contentHash = simpleContentHash(hashInput + file.name + parsed.totalRows);

  const existingUpload = await findDuplicateUpload(userId, contentHash);
  if (existingUpload) {
    return {
      success:     true,
      isDuplicate: true,
      uploadId:    existingUpload.id,
      filename:    existingUpload.filename,
      totalRows:   existingUpload.total_rows ?? 0,
      redirectTo:  '/forecast',
    };
  }

  // ── 5. Create upload record (status: processing) ──────────────────────────
  const uploadRow = await createUpload({
    user_id:         userId,
    filename:        file.name,
    file_size_bytes: file.size,
    mime_type:       parsed.mimeType,
    status:          'processing',
    total_rows:      parsed.totalRows,
    valid_rows:      parsed.validRows.length,
    invalid_rows:    parsed.invalidRows.length,
    duplicate_rows:  parsed.duplicateCount,
    content_hash:    contentHash,
    data_date_from:  parsed.dateFrom,
    data_date_to:    parsed.dateTo,
  });
  const uploadId = uploadRow.id;

  try {
    // ── 6. Process rows → product inserts ──────────────────────────────────
    const initialProcessed = processRows(parsed.validRows, userId, uploadId);

    // ── 7. Bulk upsert products (get ID map back) ─────────────────────────
    const productInserts = initialProcessed.products.map((p) => p.insert);
    const productIdMap   = await bulkUpsertProducts(productInserts);

    // ── 8. Re-process rows with real product IDs ─────────────────────────
    const processed = processRows(parsed.validRows, userId, uploadId, productIdMap);

    // ── 9. Bulk insert sales history + inventory snapshots ────────────────
    const salesCount = await bulkInsertSalesHistory(processed.salesHistory);
    const stockCount = await bulkInsertInventorySnapshots(processed.inventorySnapshots);

    // ── 10. Run forecast engine ───────────────────────────────────────────
    const forecastInputs: ProductForecastInput[] = [];

    for (const [productNameLower, productId] of productIdMap) {
      const productData = processed.products.find(
        (p) => p.insert.product_name.toLowerCase() === productNameLower,
      );
      if (!productData) continue;

      // Get full sales history (up to 90 days) for this product
      const salesHistory = await getSalesHistoryForProduct(productId, 90);
      const latestStock  = (await getLatestStockPerProduct(userId)).get(productId) ?? 0;

      const history = salesHistory.map((s) => ({
        date:          s.sale_date,
        quantitySold:  Number(s.quantity_sold),
        stockQuantity: latestStock,
        price:         s.price_per_unit != null ? Number(s.price_per_unit) : null,
      }));

      forecastInputs.push({
        userId,
        productId,
        uploadId,
        productName: productData.insert.product_name,
        category:    productData.insert.category,
        unit:        productData.insert.unit,
        history,
      });
    }

    const engine  = new ForecastEngine(new WeightedMovingAverageForecastModel());
    const batch   = engine.runBatch(forecastInputs);

    // ── 11. Store forecast results ─────────────────────────────────────────
    const forecastRows = await bulkInsertForecastResults(batch.forecastResults);

    // Map product_id → forecast row id
    const forecastIdMap = new Map(forecastRows.map((r) => [r.product_id, r.id]));

    // Attach real forecast_id to surplus predictions
    const surplusWithIds = batch.surplusPredictions.map((sp) => ({
      ...sp,
      forecast_id: forecastIdMap.get(sp.product_id) ?? '',
    }));

    const surplusRows = await bulkInsertSurplusPredictions(surplusWithIds);

    // ── 12. Calculate & store impact metrics ──────────────────────────────
    const now         = new Date();
    const periodYear  = now.getFullYear();
    const periodMonth = now.getMonth() + 1;

    const impactOutput = calculateImpact({
      userId,
      uploadId,
      surplusPredictions: surplusRows,
      periodYear,
      periodMonth,
    });

    const monthlyImpactInsert = toImpactMetricInsert(
      { userId, uploadId, surplusPredictions: surplusRows, periodYear, periodMonth },
      impactOutput,
    );

    await upsertImpactMetric(monthlyImpactInsert);
    await upsertCumulativeImpact(userId, uploadId, {
      waste_kg_prevented:  impactOutput.wasteKgPrevented,
      revenue_saved_eur:   impactOutput.revenueSavedEur,
      co2_saved_kg:        impactOutput.co2SavedKg,
      water_saved_litres:  impactOutput.waterSavedLitres,
      meals_equivalent:    impactOutput.mealsEquivalent,
      category_breakdown:  impactOutput.categoryBreakdown,
    });

    // ── 13. Mark upload as completed ──────────────────────────────────────
    const processingMs = Date.now() - startMs;
    await updateUpload(uploadId, {
      status:               'completed',
      products_upserted:    productIdMap.size,
      sales_rows_inserted:  salesCount,
      stock_rows_inserted:  stockCount,
      processing_ms:        processingMs,
    });

    return {
      success:           true,
      uploadId,
      filename:          file.name,
      totalRows:         parsed.totalRows,
      validRows:         parsed.validRows.length,
      invalidRows:       parsed.invalidRows.length,
      duplicateRows:     parsed.duplicateCount,
      productsUpserted:  productIdMap.size,
      salesInserted:     salesCount,
      stockInserted:     stockCount,
      processingMs,
      redirectTo:        '/forecast',
    };

  } catch (err) {
    // Mark upload as failed
    await updateUpload(uploadId, {
      status:        'failed',
      error_message: String(err),
    });
    return { success: false, error: `Processing failed: ${String(err)}`, uploadId };
  }
}
