import React, { useState } from 'react';
import { FileSpreadsheet, Check, X, Download } from 'lucide-react';
import type { TransactionFilterParams } from '../types.js';
import { apiExportCSV } from '../services/api.js';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: TransactionFilterParams;
}

const AVAILABLE_COLUMNS = [
  { id: 'id', label: 'Transaction ID (#id)' },
  { id: 'date', label: 'Transaction Date' },
  { id: 'amount', label: 'Amount ($)' },
  { id: 'category', label: 'Category (Revenue / Expense)' },
  { id: 'status', label: 'Status (Paid / Pending)' },
  { id: 'user_id', label: 'User ID' },
  { id: 'user_profile', label: 'User Profile Avatar' },
];

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose, filters }) => {
  const [selectedColumns, setSelectedColumns] = useState<string[]>([
    'id',
    'date',
    'amount',
    'category',
    'status',
    'user_id',
    'user_profile',
  ]);
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  if (!isOpen) return null;

  const toggleColumn = (colId: string) => {
    if (selectedColumns.includes(colId)) {
      if (selectedColumns.length > 1) {
        setSelectedColumns(selectedColumns.filter((c) => c !== colId));
      }
    } else {
      setSelectedColumns([...selectedColumns, colId]);
    }
  };

  const selectAll = () => {
    setSelectedColumns(AVAILABLE_COLUMNS.map((c) => c.id));
  };

  const handleExport = async () => {
    try {
      setIsExporting(true);
      setExportError(null);
      await apiExportCSV({
        ...filters,
        columns: selectedColumns,
      });
      onClose();
    } catch (err: any) {
      setExportError(err.message || 'Failed to export CSV');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <FileSpreadsheet className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Export Transactions to CSV</h3>
              <p className="text-xs text-slate-400">Configure export columns & preserve active filters</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {exportError && (
          <div className="mb-4 p-3 rounded-xl border border-rose-500/30 bg-rose-500/10 text-xs text-rose-300">
            {exportError}
          </div>
        )}

        <div className="space-y-4 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-300">Choose CSV Columns</span>
            <button
              onClick={selectAll}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-medium"
            >
              Select All
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {AVAILABLE_COLUMNS.map((col) => {
              const isChecked = selectedColumns.includes(col.id);
              return (
                <button
                  key={col.id}
                  onClick={() => toggleColumn(col.id)}
                  className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-left transition-all ${
                    isChecked
                      ? 'border-indigo-500/50 bg-indigo-500/10 text-slate-100'
                      : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div
                    className={`flex h-4 w-4 items-center justify-center rounded border transition-colors ${
                      isChecked
                        ? 'border-indigo-500 bg-indigo-500 text-white'
                        : 'border-slate-700 bg-slate-900'
                    }`}
                  >
                    {isChecked && <Check className="h-3 w-3" />}
                  </div>
                  <span className="truncate">{col.label}</span>
                </button>
              );
            })}
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-3 text-slate-400">
            <div className="font-medium text-slate-300 mb-1">Active Filter Scope:</div>
            <div className="flex flex-wrap gap-2 text-[11px]">
              <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
                Category: <strong className="text-slate-200">{filters.category || 'All'}</strong>
              </span>
              <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
                Status: <strong className="text-slate-200">{filters.status || 'All'}</strong>
              </span>
              {filters.search && (
                <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
                  Search: <strong className="text-slate-200">{filters.search}</strong>
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-500/25 transition-all disabled:opacity-50"
          >
            {isExporting ? (
              <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            Download CSV
          </button>
        </div>
      </div>
    </div>
  );
};
