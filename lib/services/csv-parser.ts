// ─── CSV / Excel Parser Service ─────────────────────────────────────────────
// Handles both .csv and .xlsx files.
// Returns a normalized ParsedFile for the data-processor pipeline.

import * as XLSX from 'xlsx';

// ── Column mapping: accepted canonical field names ──────────────────────────
export const CANONICAL_COLUMNS = [
  'product_name',
  'sku',
  'date',
  'sales',
  'stock',
  'price',
  'category',
] as const;

export type CanonicalColumn = (typeof CANONICAL_COLUMNS)[number];

/** Mapping from CSV header → canonical column name (null = ignored) */
export type ColumnMapping = Record<string, CanonicalColumn | null>;

/** A single parsed data row, after column mapping */
export interface MappedRow {
  product_name?: string;
  sku?:          string;
  date?:         string;   // ISO YYYY-MM-DD
  sales?:        number;
  stock?:        number;
  price?:        number;
  category?:     string;
}

export interface RowValidationError {
  rowIndex: number;  // 1-based (matches spreadsheet row numbers)
  errors:   string[];
}

export interface ParsedFile {
  filename:       string;
  fileSizeBytes:  number;
  mimeType:       string;
  totalRows:      number;     // data rows (no header)
  headers:        string[];   // original headers from file
  columnMapping:  ColumnMapping;
  previewRows:    string[][];  // first 10 raw rows for UI preview
  mappedRows:     MappedRow[];
  validRows:      MappedRow[];
  invalidRows:    RowValidationError[];
  duplicateCount: number;
  dateFrom:       string | null;   // ISO date
  dateTo:         string | null;   // ISO date
}

// ── Fuzzy column header matching ────────────────────────────────────────────
/**
 * Maps raw CSV headers to canonical column names.
 * Performs exact match first, then alias match, then ignores unknown headers.
 */
const COLUMN_ALIASES: Record<CanonicalColumn, string[]> = {
  product_name: ['product_name', 'product', 'name', 'item', 'item_name', 'productname', 'product name', 'naam'],
  sku:          ['sku', 'product_id', 'item_id', 'barcode', 'code', 'article_number', 'articlenumber'],
  date:         ['date', 'datum', 'sale_date', 'saledate', 'sales_date', 'transaction_date', 'day'],
  sales:        ['sales', 'quantity_sold', 'qty', 'sold', 'quantity', 'amount', 'verkoop', 'verkopen', 'units_sold'],
  stock:        ['stock', 'stock_quantity', 'inventory', 'quantity_on_hand', 'on_hand', 'voorraad', 'remaining'],
  price:        ['price', 'price_per_unit', 'unit_price', 'cost', 'prijs', 'selling_price'],
  category:     ['category', 'cat', 'type', 'group', 'product_category', 'department', 'categorie'],
};

export function buildColumnMapping(headers: string[]): ColumnMapping {
  const mapping: ColumnMapping = {};
  const usedCanonical = new Set<CanonicalColumn>();

  for (const header of headers) {
    const normalised = header.toLowerCase().trim().replace(/\s+/g, '_');
    let matched: CanonicalColumn | null = null;

    for (const [canonical, aliases] of Object.entries(COLUMN_ALIASES) as [CanonicalColumn, string[]][]) {
      if (!usedCanonical.has(canonical) && aliases.includes(normalised)) {
        matched = canonical;
        usedCanonical.add(canonical);
        break;
      }
    }
    mapping[header] = matched;
  }

  return mapping;
}

// ── Date parsing ─────────────────────────────────────────────────────────────
/**
 * Attempts to parse a date string into ISO YYYY-MM-DD format.
 * Handles: YYYY-MM-DD, DD/MM/YYYY, MM/DD/YYYY, DD-MM-YYYY, Excel serial numbers.
 */
export function parseDate(raw: string | number | null | undefined): string | null {
  if (raw === null || raw === undefined || raw === '') return null;

  // Excel serial date number
  if (typeof raw === 'number') {
    const d = XLSX.SSF.parse_date_code(raw);
    if (d) {
      const month = String(d.m).padStart(2, '0');
      const day   = String(d.d).padStart(2, '0');
      return `${d.y}-${month}-${day}`;
    }
    return null;
  }

  const s = String(raw).trim();

  // Already ISO
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
    const d = new Date(s);
    return isNaN(d.getTime()) ? null : s;
  }

  // DD/MM/YYYY or DD-MM-YYYY
  const dmy = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (dmy) {
    const candidate = `${dmy[3]}-${dmy[2].padStart(2, '0')}-${dmy[1].padStart(2, '0')}`;
    const d = new Date(candidate);
    return isNaN(d.getTime()) ? null : candidate;
  }

  // MM/DD/YYYY
  const mdy = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (mdy) {
    const candidate = `${mdy[3]}-${mdy[1].padStart(2, '0')}-${mdy[2].padStart(2, '0')}`;
    const d = new Date(candidate);
    return isNaN(d.getTime()) ? null : candidate;
  }

  // Attempt native parse
  const d = new Date(s);
  if (!isNaN(d.getTime())) {
    return d.toISOString().split('T')[0];
  }

  return null;
}

// ── Number parsing ────────────────────────────────────────────────────────────
function parseNumber(raw: string | number | null | undefined): number | null {
  if (raw === null || raw === undefined || raw === '') return null;
  if (typeof raw === 'number') return isNaN(raw) ? null : raw;
  // Strip currency symbols, spaces, commas-as-thousands
  const cleaned = String(raw).replace(/[€$£\s]/g, '').replace(/,(?=\d{3})/g, '');
  const n = parseFloat(cleaned);
  return isNaN(n) ? null : n;
}

// ── Row validation ────────────────────────────────────────────────────────────
function validateMappedRow(row: MappedRow, rowIndex: number): RowValidationError | null {
  const errors: string[] = [];

  if (!row.product_name || String(row.product_name).trim() === '') {
    errors.push('product_name is required');
  }
  if (row.date === undefined || row.date === null) {
    errors.push('date is required and must be a valid date');
  }
  if (row.sales !== undefined && row.sales < 0) {
    errors.push('sales must be >= 0');
  }
  if (row.stock !== undefined && row.stock < 0) {
    errors.push('stock must be >= 0');
  }
  if (row.price !== undefined && row.price < 0) {
    errors.push('price must be >= 0');
  }

  return errors.length > 0 ? { rowIndex, errors } : null;
}

// ── Row deduplication ─────────────────────────────────────────────────────────
/**
 * Deduplicates on (product_name, date).
 * When duplicate: keeps last occurrence (latest upload wins on stock),
 * sums sales values.
 */
function deduplicateRows(rows: MappedRow[]): { rows: MappedRow[]; duplicateCount: number } {
  const seen = new Map<string, MappedRow>();
  let duplicateCount = 0;

  for (const row of rows) {
    const key = `${(row.product_name ?? '').toLowerCase().trim()}||${row.date ?? ''}`;
    if (seen.has(key)) {
      duplicateCount++;
      const existing = seen.get(key)!;
      // Sum sales, keep latest stock / price
      seen.set(key, {
        ...row,
        sales: (existing.sales ?? 0) + (row.sales ?? 0),
      });
    } else {
      seen.set(key, { ...row });
    }
  }

  return { rows: Array.from(seen.values()), duplicateCount };
}

// ── Flat rows → MappedRow ─────────────────────────────────────────────────────
function mapRawRow(
  rawRow: Record<string, string | number | null>,
  mapping: ColumnMapping,
): MappedRow {
  const mapped: MappedRow = {};

  for (const [header, canonical] of Object.entries(mapping)) {
    if (!canonical) continue;
    const raw = rawRow[header];

    switch (canonical) {
      case 'product_name':
      case 'sku':
      case 'category':
        mapped[canonical] = raw != null ? String(raw).trim() : undefined;
        break;
      case 'date':
        mapped.date = parseDate(raw as string | number | null) ?? undefined;
        break;
      case 'sales':
        { const n = parseNumber(raw as string | number | null);
        mapped.sales = n ?? undefined; }
        break;
      case 'stock':
        { const n = parseNumber(raw as string | number | null);
        mapped.stock = n ?? undefined; }
        break;
      case 'price':
        { const n = parseNumber(raw as string | number | null);
        mapped.price = n ?? undefined; }
        break;
    }
  }

  return mapped;
}

// ── Main Parser: CSV text ─────────────────────────────────────────────────────
function parseCSVText(text: string): { headers: string[]; rawRows: Record<string, string>[] } {
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) return { headers: [], rawRows: [] };

  function splitCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') { inQuotes = !inQuotes; continue; }
      if (ch === ',' && !inQuotes) { result.push(current.trim()); current = ''; continue; }
      current += ch;
    }
    result.push(current.trim());
    return result;
  }

  const headers = splitCSVLine(lines[0]);
  const rawRows: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cells = splitCSVLine(lines[i]);
    const row: Record<string, string> = {};
    headers.forEach((h, idx) => { row[h] = cells[idx] ?? ''; });
    rawRows.push(row);
  }

  return { headers, rawRows };
}

// ── Main Parser: ArrayBuffer (CSV or XLSX) ────────────────────────────────────
export async function parseFile(
  buffer: ArrayBuffer,
  filename: string,
  fileSizeBytes: number,
): Promise<ParsedFile> {
  const ext = filename.split('.').pop()?.toLowerCase() ?? '';
  const mimeType = ext === 'xlsx'
    ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    : 'text/csv';

  let headers: string[] = [];
  let rawRows: Record<string, string | number | null>[] = [];

  if (ext === 'xlsx') {
    // Parse Excel
    const workbook  = XLSX.read(buffer, { type: 'array', cellDates: false });
    const sheetName = workbook.SheetNames[0];
    const sheet     = workbook.Sheets[sheetName];
    const jsonRows  = XLSX.utils.sheet_to_json<Record<string, string | number | null>>(sheet, {
      raw:    true,
      defval: null,
    });

    if (jsonRows.length > 0) {
      headers = Object.keys(jsonRows[0]);
      rawRows  = jsonRows;
    }
  } else {
    // Parse CSV
    const text   = new TextDecoder().decode(buffer);
    const parsed = parseCSVText(text);
    headers = parsed.headers;
    rawRows  = parsed.rawRows as Record<string, string | number | null>[];
  }

  const columnMapping = buildColumnMapping(headers);

  // Build preview (first 10 raw rows as string[][])
  const previewRows: string[][] = rawRows.slice(0, 10).map((row) =>
    headers.map((h) => (row[h] != null ? String(row[h]) : '')),
  );

  // Map all rows
  const allMappedRows = rawRows.map((row) => mapRawRow(row, columnMapping));

  // Validate
  const validRows: MappedRow[]             = [];
  const invalidRows: RowValidationError[]  = [];

  allMappedRows.forEach((row, i) => {
    const err = validateMappedRow(row, i + 2); // +2: 1-based + skip header
    if (err) {
      invalidRows.push(err);
    } else {
      validRows.push(row);
    }
  });

  // Deduplicate valid rows
  const { rows: dedupedRows, duplicateCount } = deduplicateRows(validRows);

  // Date range
  const dates = dedupedRows
    .map((r) => r.date)
    .filter((d): d is string => d != null)
    .sort();
  const dateFrom = dates[0] ?? null;
  const dateTo   = dates[dates.length - 1] ?? null;

  return {
    filename,
    fileSizeBytes,
    mimeType,
    totalRows:      rawRows.length,
    headers,
    columnMapping,
    previewRows,
    mappedRows:     dedupedRows,
    validRows:      dedupedRows,
    invalidRows,
    duplicateCount,
    dateFrom,
    dateTo,
  };
}
