'use client';

import { useState, useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';

// ─── Types ─────────────────────────────────────────────────────────────────────
interface ParsedFile {
  name: string;
  sizeKB: string;
  rows: number;
  columns: number;
  headers: string[];
  preview: string[][];
}

interface RecentUpload {
  name: string;
  date: string;
  rows: number;
  status: 'Processed' | 'Failed';
}

// ─── Constants ──────────────────────────────────────────────────────────────────
const REQUIRED_COLUMNS = ['product_name', 'date', 'quantity_sold', 'stock_quantity', 'unit'];

const RECENT_UPLOADS: RecentUpload[] = [
  { name: 'inventory_june_2025.csv', date: 'Jun 28, 2025', rows: 1240, status: 'Processed' },
  { name: 'sales_may_2025.csv',      date: 'May 31, 2025', rows: 980,  status: 'Processed' },
  { name: 'stock_april_2025.csv',    date: 'Apr 30, 2025', rows: 1105, status: 'Processed' },
];

// ─── CSV Parser ─────────────────────────────────────────────────────────────────
function parseCSV(text: string): string[][] {
  return text
    .split(/\r?\n/)
    .filter((line) => line.trim().length > 0)
    .map((line) => {
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
    });
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

// ─── Icons ───────────────────────────────────────────────────────────────────────
const UploadIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-14 w-14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
  </svg>
);

const DownloadIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
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

// ─── Main Component ───────────────────────────────────────────────────────────────
export default function UploadPage() {
  const [dragOver, setDragOver] = useState(false);
  const [error, setError]       = useState<string[] | null>(null);
  const [xlsxWarning, setXlsxWarning] = useState(false);
  const [parsed, setParsed]     = useState<ParsedFile | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // ── Process a File ──────────────────────────────────────────────────────────
  const processFile = useCallback((file: File) => {
    setError(null);
    setParsed(null);
    setXlsxWarning(false);

    const ext = file.name.split('.').pop()?.toLowerCase();

    if (ext === 'xlsx') {
      setXlsxWarning(true);
      return;
    }

    if (ext !== 'csv') {
      setError(['Unsupported file format. Please upload a .csv file.']);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const rows = parseCSV(text);

      if (rows.length < 2) {
        setError(['The file appears to be empty or has no data rows.']);
        return;
      }

      const headers = rows[0].map((h) => h.toLowerCase().trim());
      const missing = REQUIRED_COLUMNS.filter((col) => !headers.includes(col));

      if (missing.length > 0) {
        setError([
          `Missing required column${missing.length > 1 ? 's' : ''}: ${missing.join(', ')}`,
          `Expected columns: ${REQUIRED_COLUMNS.join(', ')}`,
        ]);
        return;
      }

      const dataRows = rows.slice(1);
      const preview  = dataRows.slice(0, 5);

      setParsed({
        name:    file.name,
        sizeKB:  formatSize(file.size),
        rows:    dataRows.length,
        columns: headers.length,
        headers,
        preview,
      });
    };

    reader.onerror = () => setError(['Failed to read the file. Please try again.']);
    reader.readAsText(file);
  }, []);

  // ── Drag handlers ───────────────────────────────────────────────────────────
  const handleDragOver  = (e: React.DragEvent) => { e.preventDefault(); setDragOver(true); };
  const handleDragLeave = ()                   => setDragOver(false);
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
    setXlsxWarning(false);
    if (inputRef.current) inputRef.current.value = '';
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-4xl mx-auto space-y-6">

      {/* ── Page Header ────────────────────────────────────────────────────── */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Upload Data</h2>
        <p className="text-sm text-gray-500 mt-1">
          Import your inventory or sales CSV to generate AI-powered forecasts.
        </p>
      </div>

      {/* ── 1. Template Download Card ──────────────────────────────────────── */}
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
              Download our CSV template to get started with the correct column structure.
            </p>
          </div>
        </div>
        <button
          onClick={() => console.log('Download template')}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-dark transition-colors duration-150 whitespace-nowrap flex-shrink-0"
        >
          <DownloadIcon />
          Download Template
        </button>
      </div>

      {/* ── 2. Drag & Drop Upload Zone ─────────────────────────────────────── */}
      {!parsed && !error && !xlsxWarning && (
        <label
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
          <span className={cn('transition-colors duration-200', dragOver ? 'text-primary-dark' : 'text-gray-300 group-hover:text-primary')}>
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

      {/* ── 3a. XLSX Warning ───────────────────────────────────────────────── */}
      {xlsxWarning && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 flex items-start gap-4">
          <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="font-semibold text-amber-800 text-sm">Excel Support Coming Soon</p>
            <p className="text-amber-700 text-sm mt-1">
              Excel (.xlsx) files will be supported in the next release. Please export your file as <strong>.csv</strong> and try again.
            </p>
          </div>
          <button onClick={handleReset} className="text-sm font-medium text-amber-700 hover:text-amber-900 underline underline-offset-2 flex-shrink-0 mt-0.5">
            Try Again
          </button>
        </div>
      )}

      {/* ── 3b. Error State ────────────────────────────────────────────────── */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-5 flex items-start gap-4">
          <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-red-100 flex items-center justify-center text-red-600">
            <ErrorIcon />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-red-800 text-sm">Upload Failed</p>
            <ul className="mt-1 space-y-0.5">
              {error.map((msg, i) => (
                <li key={i} className="text-red-700 text-sm">• {msg}</li>
              ))}
            </ul>
          </div>
          <button
            onClick={handleReset}
            className="flex-shrink-0 px-4 py-1.5 text-sm font-medium bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors duration-150 mt-0.5"
          >
            Try Again
          </button>
        </div>
      )}

      {/* ── 3c. Success State ──────────────────────────────────────────────── */}
      {parsed && (
        <div className="space-y-4">
          {/* Success Alert */}
          <div className="bg-primary-light border border-primary/30 rounded-xl p-5 flex items-start gap-4">
            <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-primary flex items-center justify-center text-white">
              <CheckIcon />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-primary-dark text-sm">File uploaded successfully!</p>
              <div className="flex flex-wrap gap-x-6 gap-y-1 mt-2">
                {[
                  { label: 'File',    value: parsed.name    },
                  { label: 'Size',    value: parsed.sizeKB  },
                  { label: 'Rows',    value: `${parsed.rows.toLocaleString()} data rows` },
                  { label: 'Columns', value: `${parsed.columns} columns` },
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

          {/* Preview Table */}
          <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
            <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between">
              <p className="text-sm font-semibold text-gray-700">Data Preview</p>
              <span className="text-xs text-gray-400">Showing first {parsed.preview.length} rows</span>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    {parsed.headers.map((h) => (
                      <th
                        key={h}
                        className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {parsed.preview.map((row, ri) => (
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

          {/* Analyze Button */}
          <button
            onClick={() => console.log('Forecasting...')}
            className="w-full flex items-center justify-center gap-2 py-3.5 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark active:scale-[0.99] transition-all duration-150 shadow-sm hover:shadow-md"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
            </svg>
            Analyze &amp; Forecast
          </button>
        </div>
      )}

      {/* ── 4. Recent Uploads ──────────────────────────────────────────────── */}
      <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-700">Recent Uploads</h3>
        </div>
        <ul className="divide-y divide-gray-50">
          {RECENT_UPLOADS.map((upload, i) => (
            <li key={i} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors duration-100">
              <FileIcon />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-700 truncate">{upload.name}</p>
                <p className="text-xs text-gray-400 mt-0.5">{upload.date} · {upload.rows.toLocaleString()} rows</p>
              </div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-primary-light text-primary-dark">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                {upload.status}
              </span>
            </li>
          ))}
        </ul>
      </div>

    </div>
  );
}