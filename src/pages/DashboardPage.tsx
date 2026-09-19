import React from 'react';
import type { DashboardSummary, DashboardAnalytics, Transaction } from '../types.js';
import { StatCard } from '../components/StatCard.js';
import { MonthlyTrendChart, BreakdownCharts } from '../components/Charts.js';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle2,
  ArrowRight,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { formatDate } from '../utils/date.js';

interface DashboardPageProps {
  summary: DashboardSummary | null;
  analytics: DashboardAnalytics | null;
  recentTransactions: Transaction[];
  onViewAllTransactions: () => void;
  isLoading: boolean;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  summary,
  analytics,
  recentTransactions,
  onViewAllTransactions,
  isLoading,
}) => {
  if (isLoading && !summary) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-10 w-10 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  const formatCurrency = (amount: number = 0) => {
    return `$${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div className="space-y-6">
      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Revenue"
          value={formatCurrency(summary?.totalRevenue)}
          subtitle="All received revenue"
          icon={TrendingUp}
          variant="emerald"
        />

        <StatCard
          title="Total Expenses"
          value={formatCurrency(summary?.totalExpenses)}
          subtitle="Disbursed outflow costs"
          icon={TrendingDown}
          variant="rose"
        />

        <StatCard
          title="Net Balance"
          value={formatCurrency(summary?.netBalance)}
          subtitle={
            (summary?.netBalance || 0) >= 0 ? 'Profitable cash flow' : 'Negative cash flow'
          }
          icon={DollarSign}
          variant={(summary?.netBalance || 0) >= 0 ? 'indigo' : 'rose'}
        />

        <StatCard
          title="Pending Settlements"
          value={formatCurrency(summary?.pendingAmount)}
          subtitle={`${summary?.pendingCount || 0} transactions awaiting payment`}
          icon={Clock}
          variant="amber"
        />
      </div>

      {/* Analytics Charts */}
      {analytics && (
        <div className="space-y-6">
          <MonthlyTrendChart data={analytics.monthlyTrend || []} />
          <BreakdownCharts
            categoryData={analytics.categoryBreakdown || []}
            statusData={analytics.statusDistribution || []}
          />
        </div>
      )}

      {/* Recent Transactions Preview */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="text-base font-semibold text-white">Recent Transactions</h4>
            <p className="text-xs text-slate-400">Latest activity logged into MongoDB</p>
          </div>
          <button
            onClick={onViewAllTransactions}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            <span>View Full Ledger</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="px-3 py-2.5">ID</th>
                <th className="px-3 py-2.5">Date</th>
                <th className="px-3 py-2.5">User</th>
                <th className="px-3 py-2.5">Category</th>
                <th className="px-3 py-2.5">Amount</th>
                <th className="px-3 py-2.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40">
              {recentTransactions.map((tx) => {
                const isRevenue = tx.category === 'Revenue';
                const isPaid = tx.status === 'Paid';

                return (
                  <tr key={tx.id} className="hover:bg-slate-800/30">
                    <td className="px-3 py-2.5 font-mono text-indigo-400 font-medium">#{tx.id}</td>
                    <td className="px-3 py-2.5 text-slate-300">
                      {formatDate(tx.date)}
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-2">
                        <img
                          src={tx.user_profile}
                          alt={tx.user_id}
                          className="h-5 w-5 rounded-full object-cover border border-slate-700"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=60&auto=format&fit=crop&q=60';
                          }}
                        />
                        <span className="font-mono text-slate-300">{tx.user_id}</span>
                      </div>
                    </td>
                    <td className="px-3 py-2.5">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium ${
                          isRevenue
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}
                      >
                        {isRevenue ? (
                          <ArrowUpRight className="h-2.5 w-2.5" />
                        ) : (
                          <ArrowDownRight className="h-2.5 w-2.5" />
                        )}
                        {tx.category}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 font-semibold text-slate-100">
                      {isRevenue ? '+' : '-'}${tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-3 py-2.5">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium ${
                          isPaid
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}
                      >
                        {isPaid ? (
                          <CheckCircle2 className="h-2.5 w-2.5" />
                        ) : (
                          <Clock className="h-2.5 w-2.5" />
                        )}
                        {tx.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
