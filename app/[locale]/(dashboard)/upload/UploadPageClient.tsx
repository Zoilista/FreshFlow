'use client';

import { useState, useRef, useCallback, useTransition } from 'react';
import { useRouter } from '@/i18n/routing';

import { cn } from '@/lib/utils';
import { parseFile } from '@/lib/services/csv-parser';
import type { ParsedFile } from '@/lib/services/csv-parser';
import { uploadCSV } from '@/lib/actions/upload';

// ─── Icons ─────────────────────────────────────────────────────────────────────
const UploadIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-14 w-14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
  </svg>
);

const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const ErrorIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
  </svg>
);

const FileIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
  </svg>
);

const DownloadIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
  </svg>
);

// ─── CSV Template Download ─────────────────────────────────────────────────────
const TEMPLATE_CSV = `product_name,sku,date,sales,stock,price,category
Tomatoes,TOM-001,2025-06-01,45,320,1.20,Vegetables
Bread Rolls,BRD-001,2025-06-01,120,90,0.45,Bakery
Milk 2L,MLK-001,2025-06-01,30,60,1.80,Dairy
`;

function downloadTemplate() {
  const blob = new Blob([TEMPLATE_CSV], { type: 'text/csv' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = 'freshflow_template.csv';
  a.click();
  URL.revokeObjectURL(url);
}

function formatSize(bytes: number): string {
  if (bytes < 1024)            return `${bytes} B`;
  if (bytes < 1024 * 1024)     return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

// ─── Column Mapping Badge ──────────────────────────────────────────────────────
const CANONICAL_LABELS: Record<string, string> = {
  product_name: 'Product Name',
  sku:          'SKU',
  date:         'Date',
  sales:        'Sales',
  stock:        'Stock',
  price:        'Price',
  category:     'Category',
};

function ColumnMappingRow({ header, canonical }: { header: string; canonical: string | null }) {
  return (
    <div className="flex items-center gap-3 text-sm py-1.5">
      <span className="font-mono text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded w-40 truncate">{header}</span>
      <span className="text-gray-400">→</span>
      {canonical ? (
        <span className="text-xs font-semibold text-primary-dark bg-primary-light px-2 py-0.5 rounded">
          {CANONICAL_LABELS[canonical] ?? canonical}
        </span>
      ) : (
        <span className="text-xs text-gray-400 italic">ignored</span>
      )}
    </div>
  );
}

// ─── Progress Step ─────────────────────────────────────────────────────────────
type StepStatus = 'idle' | 'active' | 'done' | 'error';

function ProgressStep({ label, status, index }: { label: string; status: StepStatus; index: number }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className={cn(
        'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-colors',
        status === 'done'   ? 'bg-primary text-white' :
        status === 'active' ? 'bg-primary/20 text-primary border-2 border-primary animate-pulse' :
        status === 'error'  ? 'bg-red-100 text-red-600' :
                              'bg-gray-100 text-gray-400'
      )}>
        {status === 'done' ? '✓' : status === 'error' ? '✗' : index + 1}
      </div>
      <span className={cn(
        'text-sm',
        status === 'done'   ? 'text-primary-dark font-medium' :
        status === 'active' ? 'text-gray-800 font-semibold' :
        status === 'error'  ? 'text-red-600' :
                              'text-gray-400'
      )}>{label}</span>
    </div>
  );
}

// ─── Types ─────────────────────────────────────────────────────────────────────
type UploadStep = 'uploading' | 'processing' | 'forecasting' | 'saving';

interface UploadProgress {
  step:    UploadStep;
  message: string;
}

// ─── Recent Uploads Component (Server Component wrapper via prop) ───────────────
interface RecentUploadItem {
  id:         string;
  filename:   string;
  created_at: string;
  total_rows: number | null;
  valid_rows: number | null;
  status:     string;
}

function RecentUploadsList({ uploads }: { uploads: RecentUploadItem[] }) {
  if (uploads.length === 0) {
    return (
      <div className="px-6 py-8 text-center">
        <p className="text-sm text-gray-400">No uploads yet. Upload your first CSV or Excel file to get started.</p>
      </div>
    );
  }

  return (
    <ul className="divide-y divide-gray-50">
      {uploads.map((upload) => (
        <li key={upload.id} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors duration-100">
          <FileIcon />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-700 truncate">{upload.filename}</p>
            <p className="text-xs text-gray-400 mt-0.5">
              {formatDate(upload.created_at)} · {(upload.valid_rows ?? upload.total_rows ?? 0).toLocaleString()} valid rows
            </p>
          </div>
          <span className={cn(
            'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium',
            upload.status === 'completed' ? 'bg-primary-light text-primary-dark' :
            upload.status === 'failed'    ? 'bg-red-100 text-red-600' :
                                           'bg-amber-100 text-amber-700'
          )}>
            <span className={cn(
              'w-1.5 h-1.5 rounded-full',
              upload.status === 'completed' ? 'bg-primary' :
              upload.status === 'failed'    ? 'bg-red-500' : 'bg-amber-400'
            )} />
            {upload.status === 'completed' ? 'Processed' : upload.status === 'failed' ? 'Failed' : 'Processing'}
          </span>
        </li>
      ))}
    </ul>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function UploadPageClient({ recentUploads }: { recentUploads: RecentUploadItem[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [dragOver,    setDragOver]    = useState(false);
  const [parsed,      setParsed]      = useState<ParsedFile | null>(null);
  const [error,       setError]       = useState<string | null>(null);
  const [progress,    setProgress]    = useState<UploadProgress | null>(null);
  const [uploadDone,  setUploadDone]  = useState(false);
  const [isDuplicate, setIsDuplicate] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // ── Process file locally (client-side parse + preview) ──────────────────────
  const processFile = useCallback(async (file: File) => {
    setError(null);
    setParsed(null);
    setUploadDone(false);
    setIsDuplicate(false);
    setProgress(null);
    setSelectedFile(file);

    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!ext || !['csv', 'xlsx'].includes(ext)) {
      setError('Unsupported file format. Please upload a .csv or .xlsx file.');
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      setError('File too large. Maximum size is 50 MB.');
      return;
    }

    try {
      const buffer  = await file.arrayBuffer();
      const result  = await parseFile(buffer, file.name, file.size);
      setParsed(result);
    } catch (err) {
      setError(`Failed to read file: ${String(err)}`);
    }
  }, []);

  // ── Drag & Drop handlers ──────────────────────────────────────────────────────
  const handleDragOver  = (e: React.DragEvent) => { e.preventDefault(); setDragOver(true); };
  const handleDragLeave = () => setDragOver(false);
  const handleDrop      = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  };
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };
  const handleReset = () => {
    setError(null);
    setParsed(null);
    setProgress(null);
    setUploadDone(false);
    setIsDuplicate(false);
    setSelectedFile(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  // ── Submit to server ──────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!parsed) return;

    if (!selectedFile) {
      setError('File not found. Please re-select the file.');
      return;
    }

    setProgress({ step: 'uploading',   message: 'Uploading file...' });
    await new Promise((r) => setTimeout(r, 300));
    setProgress({ step: 'processing',  message: 'Processing rows...' });
    await new Promise((r) => setTimeout(r, 300));
    setProgress({ step: 'forecasting', message: 'Generating forecasts...' });

    const formData = new FormData();
    formData.set('file', selectedFile);

    startTransition(async () => {
      const result = await uploadCSV(formData);

      if (!result.success) {
        setError(result.error ?? 'Upload failed.');
        setProgress(null);
        return;
      }

      if (result.isDuplicate) {
        setIsDuplicate(true);
        setProgress(null);
        return;
      }

      setProgress({ step: 'saving', message: 'Saving results...' });
      await new Promise((r) => setTimeout(r, 500));
      setUploadDone(true);
      setProgress(null);

      // Redirect to forecast after a moment
      setTimeout(() => {
        router.push('/forecast');
        router.refresh();
      }, 1500);
    });
  };

  const STEPS: { label: string; id: UploadStep }[] = [
    { id: 'uploading',   label: 'Uploading file'        },
    { id: 'processing',  label: 'Processing rows'        },
    { id: 'forecasting', label: 'Generating forecasts'   },
    { id: 'saving',      label: 'Saving results'         },
  ];

  const stepOrder: UploadStep[] = ['uploading', 'processing', 'forecasting', 'saving'];
  const currentStepIdx = progress ? stepOrder.indexOf(progress.step) : -1;

  return (
    <div className="max-w-4xl mx-auto space-y-6">

      {/* ── Page Header ─────────────────────────────────────────────────── */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Upload Data</h2>
        <p className="text-sm text-gray-500 mt-1">
          Import your inventory or sales file (CSV or Excel) to generate demand forecasts.
        </p>
      </div>

      {/* ── Template Download ────────────────────────────────────────────── */}
      <div className="bg-white border border-gray-100 rounded-xl shadow-sm px-6 py-4 flex items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex-shrink-0 w-8 h-8 rounded-lg bg-primary-light flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-primary-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700">Not sure about the format?</p>
            <p className="text-xs text-gray-400 mt-0.5">
              Download our CSV template with the correct column structure.
              Accepted: <span className="font-mono text-gray-600">product_name, sku, date, sales, stock, price, category</span>
            </p>
          </div>
        </div>
        <button
          id="download-template-btn"
          onClick={downloadTemplate}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-dark transition-colors duration-150 whitespace-nowrap flex-shrink-0"
        >
          <DownloadIcon />
          Download Template
        </button>
      </div>

      {/* ── Drop Zone (hidden when file is loaded or uploading) ───────────── */}
      {!parsed && !error && !progress && (
        <label
          id="upload-drop-zone"
          htmlFor="file-input"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            'flex flex-col items-center justify-center gap-4 w-full h-64 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200',
            dragOver
              ? 'border-primary bg-primary-light'
              : 'border-gray-300 bg-white hover:border-primary hover:bg-primary-light'
          )}
        >
          <span className={cn('transition-colors duration-200', dragOver ? 'text-primary-dark' : 'text-gray-300')}>
            <UploadIcon />
          </span>
          <div className="text-center">
            <p className={cn('text-base font-semibold transition-colors duration-200', dragOver ? 'text-primary-dark' : 'text-gray-600')}>
              Drop your CSV or Excel file here
            </p>
            <p className="text-sm text-gray-400 mt-1">
              or <span className="text-primary font-medium underline underline-offset-2">click to browse</span> — supports .csv and .xlsx
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs text-gray-400">
            <span className="px-2 py-1 bg-gray-100 rounded-md font-mono">.csv</span>
            <span className="px-2 py-1 bg-green-50 text-green-700 border border-green-200 rounded-md font-mono">.xlsx ✓</span>
            <span>Max 50 MB</span>
          </div>
          <input
            id="file-input"
            ref={inputRef}
            type="file"
            accept=".csv,.xlsx"
            className="hidden"
            onChange={handleFileChange}
          />
        </label>
      )}

      {/* ── Error State ───────────────────────────────────────────────────── */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-5 flex items-start gap-4">
          <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-red-100 flex items-center justify-center text-red-600">
            <ErrorIcon />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-red-800 text-sm">Upload Failed</p>
            <p className="text-red-700 text-sm mt-1">{error}</p>
          </div>
          <button
            id="upload-try-again-btn"
            onClick={handleReset}
            className="flex-shrink-0 px-4 py-1.5 text-sm font-medium bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors duration-150 mt-0.5"
          >
            Try Again
          </button>
        </div>
      )}

      {/* ── Duplicate Detection ───────────────────────────────────────────── */}
      {isDuplicate && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 flex items-start gap-4">
          <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="font-semibold text-amber-800 text-sm">Duplicate File Detected</p>
            <p className="text-amber-700 text-sm mt-1">
              This file has already been processed. Your existing forecasts are still valid.
            </p>
          </div>
          <button
            onClick={() => router.push('/forecast')}
            className="flex-shrink-0 px-4 py-1.5 text-sm font-semibold bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors mt-0.5"
          >
            View Forecast →
          </button>
        </div>
      )}

      {/* ── Upload Progress ───────────────────────────────────────────────── */}
      {progress && (
        <div className="bg-white border border-primary/20 rounded-xl p-6 space-y-4">
          <p className="text-sm font-semibold text-gray-700 mb-2">Processing your file…</p>
          <div className="space-y-3">
            {STEPS.map((step, i) => {
              const status: StepStatus =
                i < currentStepIdx  ? 'done'   :
                i === currentStepIdx ? 'active' :
                                      'idle';
              return <ProgressStep key={step.id} label={step.label} status={status} index={i} />;
            })}
          </div>
        </div>
      )}

      {/* ── Upload Success ────────────────────────────────────────────────── */}
      {uploadDone && (
        <div className="bg-primary-light border border-primary/30 rounded-xl p-5 flex items-center gap-4">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white">
            <CheckIcon />
          </div>
          <div>
            <p className="font-semibold text-primary-dark">Upload complete! Redirecting to forecast…</p>
          </div>
        </div>
      )}

      {/* ── Parsed File Preview ───────────────────────────────────────────── */}
      {parsed && !progress && !uploadDone && (
        <div className="space-y-4">

          {/* Success Alert */}
          <div className="bg-primary-light border border-primary/30 rounded-xl p-5 flex items-start gap-4">
            <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-primary flex items-center justify-center text-white">
              <CheckIcon />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-primary-dark text-sm">File loaded successfully</p>
              <div className="flex flex-wrap gap-x-6 gap-y-1 mt-2">
                {[
                  { label: 'File',          value: parsed.filename                              },
                  { label: 'Size',          value: formatSize(parsed.fileSizeBytes)             },
                  { label: 'Total rows',    value: `${parsed.totalRows.toLocaleString()}`       },
                  { label: 'Valid rows',    value: `${parsed.validRows.length.toLocaleString()}` },
                  { label: 'Columns',       value: `${parsed.headers.length}`                   },
                  ...(parsed.duplicateCount > 0
                    ? [{ label: 'Duplicates removed', value: `${parsed.duplicateCount}` }]
                    : []),
                ].map(({ label, value }) => (
                  <span key={label} className="text-xs text-primary-dark">
                    <span className="font-medium">{label}:</span> {value}
                  </span>
                ))}
              </div>
            </div>
            <button onClick={handleReset} className="flex-shrink-0 text-xs text-primary-dark hover:text-primary underline underline-offset-2 mt-0.5">
              Replace file
            </button>
          </div>

          {/* Validation warnings */}
          {parsed.invalidRows.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <p className="text-sm font-semibold text-amber-800 mb-2">
                ⚠️ {parsed.invalidRows.length} rows will be skipped:
              </p>
              <ul className="space-y-1 max-h-32 overflow-y-auto">
                {parsed.invalidRows.slice(0, 5).map((err) => (
                  <li key={err.rowIndex} className="text-xs text-amber-700">
                    Row {err.rowIndex}: {err.errors.join(', ')}
                  </li>
                ))}
                {parsed.invalidRows.length > 5 && (
                  <li className="text-xs text-amber-600 font-medium">
                    …and {parsed.invalidRows.length - 5} more
                  </li>
                )}
              </ul>
            </div>
          )}

          {/* Column Mapping */}
          <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
            <div className="px-5 py-3.5 border-b border-gray-100">
              <p className="text-sm font-semibold text-gray-700">Column Mapping</p>
              <p className="text-xs text-gray-400 mt-0.5">How your file&apos;s columns are mapped to FreshFlow fields</p>
            </div>
            <div className="px-5 py-4 columns-2 gap-8">
              {parsed.headers.map((h) => (
                <ColumnMappingRow
                  key={h}
                  header={h}
                  canonical={parsed.columnMapping[h]}
                />
              ))}
            </div>
          </div>

          {/* Data Preview */}
          <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
            <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between">
              <p className="text-sm font-semibold text-gray-700">Data Preview</p>
              <span className="text-xs text-gray-400">Showing first {parsed.previewRows.length} rows</span>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    {parsed.headers.map((h) => (
                      <th
                        key={h}
                        className={cn(
                          'px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider whitespace-nowrap',
                          parsed.columnMapping[h] ? 'text-primary-dark' : 'text-gray-400'
                        )}
                      >
                        {h}
                        {parsed.columnMapping[h] && (
                          <span className="ml-1 text-[10px] text-primary/60 normal-case">
                            ({parsed.columnMapping[h]})
                          </span>
                        )}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {parsed.previewRows.map((row, ri) => (
                    <tr key={ri} className="hover:bg-gray-50 transition-colors duration-100">
                      {row.map((cell, ci) => (
                        <td key={ci} className="px-4 py-2.5 text-gray-600 whitespace-nowrap">
                          {cell || <span className="text-gray-300 italic">—</span>}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Submit Button */}
          <button
            id="upload-analyze-btn"
            onClick={handleSubmit}
            disabled={isPending || parsed.validRows.length === 0}
            className="w-full flex items-center justify-center gap-2 py-3.5 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark active:scale-[0.99] transition-all duration-150 shadow-sm hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
            </svg>
            {isPending ? 'Processing…' : `Analyze & Forecast (${parsed.validRows.length.toLocaleString()} rows)`}
          </button>
        </div>
      )}

      {/* ── Recent Uploads ─────────────────────────────────────────────────── */}
      <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-700">Recent Uploads</h3>
        </div>
        <RecentUploadsList uploads={recentUploads} />
      </div>

    </div>
  );
}