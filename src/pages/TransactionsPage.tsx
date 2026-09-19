import React from 'react';
import type { Transaction, PaginationMeta, TransactionFilterParams } from '../types.js';
import { TransactionTable } from '../components/TransactionTable.js';
import { FileSpreadsheet, Sparkles } from 'lucide-react';

interface TransactionsPageProps {
  transactions: Transaction[];
  pagination: PaginationMeta;
  filters: TransactionFilterParams;
  onFilterChange: (filters: Partial<TransactionFilterParams>) => void;
  isLoading: boolean;
  onOpenExport: () => void;
}

export const TransactionsPage: React.FC<TransactionsPageProps> = ({
  transactions,
  pagination,
  filters,
  onFilterChange,
  isLoading,
  onOpenExport,
}) => {
  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white tracking-tight">Transactions Ledger</h2>
            <span className="rounded-full bg-indigo-500/10 px-2.5 py-0.5 text-xs font-semibold text-indigo-400 border border-indigo-500/20">
              MongoDB Live
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Search, filter, paginate, sort, and inspect transactions across the entire 300 records dataset.
          </p>
        </div>

        <button
          onClick={onOpenExport}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white text-xs font-semibold shadow-lg shadow-indigo-600/25 transition-all w-fit"
        >
          <FileSpreadsheet className="h-4 w-4" />
          <span>Export CSV</span>
          <Sparkles className="h-3 w-3 text-indigo-200" />
        </button>
      </div>

      {/* Main Filterable Table */}
      <TransactionTable
        transactions={transactions}
        pagination={pagination}
        filters={filters}
        onFilterChange={onFilterChange}
        isLoading={isLoading}
      />
    </div>
  );
};
