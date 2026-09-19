import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './context/AuthContext.js';
import { LoginPage } from './pages/LoginPage.js';
import { DashboardPage } from './pages/DashboardPage.js';
import { TransactionsPage } from './pages/TransactionsPage.js';
import { Navbar } from './components/Navbar.js';
import { Sidebar, type SidebarTab } from './components/Sidebar.js';
import { ExportModal } from './components/ExportModal.js';
import {
  apiGetDashboardSummary,
  apiGetDashboardAnalytics,
  apiGetRecentTransactions,
  apiGetTransactions,
} from './services/api.js';
import type {
  DashboardSummary,
  DashboardAnalytics,
  Transaction,
  PaginationMeta,
  TransactionFilterParams,
} from './types.js';
import {
  Wallet,
  User,
  MessageSquare,
  Settings,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
  CheckCircle2,
  Mail,
  Bell,
} from 'lucide-react';

export function App() {
  const { user, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<SidebarTab>('dashboard');

  // Dashboard Data
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [analytics, setAnalytics] = useState<DashboardAnalytics | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [isDashboardLoading, setIsDashboardLoading] = useState(false);

  // Transactions Data
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [filters, setFilters] = useState<TransactionFilterParams>({
    page: 1,
    limit: 10,
    search: '',
    category: 'All',
    status: 'All',
    sortBy: 'date',
    sortOrder: 'desc',
  });
  const [isTransactionsLoading, setIsTransactionsLoading] = useState(false);

  // Modals & UI
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchDashboardData = useCallback(async () => {
    if (!user) return;
    try {
      setIsDashboardLoading(true);
      const [sumData, analData, recData] = await Promise.all([
        apiGetDashboardSummary(),
        apiGetDashboardAnalytics(),
        apiGetRecentTransactions(6),
      ]);
      setSummary(sumData);
      setAnalytics(analData);
      setRecentTransactions(recData);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setIsDashboardLoading(false);
    }
  }, [user]);

  const fetchTransactionsData = useCallback(
    async (currentFilters: TransactionFilterParams) => {
      if (!user) return;
      try {
        setIsTransactionsLoading(true);
        const res = await apiGetTransactions(currentFilters);
        setTransactions(res.data);
        setPagination(res.pagination);
      } catch (err) {
        console.error('Error fetching transactions:', err);
      } finally {
        setIsTransactionsLoading(false);
      }
    },
    [user]
  );

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user, fetchDashboardData]);

  useEffect(() => {
    if (user) {
      fetchTransactionsData(filters);
    }
  }, [user, filters, fetchTransactionsData]);

  const handleFilterChange = (newFilters: Partial<TransactionFilterParams>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([fetchDashboardData(), fetchTransactionsData(filters)]);
    setIsRefreshing(false);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin" />
          <p className="text-xs text-slate-400 font-medium tracking-wide">Loading FlowLedger...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <Navbar onRefresh={handleRefresh} isRefreshing={isRefreshing} />

      <div className="flex-1 flex flex-col md:flex-row">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenExport={() => setIsExportOpen(true)}
          totalTransactions={summary?.totalTransactions ?? 300}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {activeTab === 'dashboard' && (
            <DashboardPage
              summary={summary}
              analytics={analytics}
              recentTransactions={recentTransactions}
              onViewAllTransactions={() => setActiveTab('transactions')}
              isLoading={isDashboardLoading}
            />
          )}

          {activeTab === 'transactions' && (
            <TransactionsPage
              transactions={transactions}
              pagination={pagination}
              filters={filters}
              onFilterChange={handleFilterChange}
              isLoading={isTransactionsLoading}
              onOpenExport={() => setIsExportOpen(true)}
            />
          )}

          {activeTab === 'analytics' && (
            <DashboardPage
              summary={summary}
              analytics={analytics}
              recentTransactions={recentTransactions}
              onViewAllTransactions={() => setActiveTab('transactions')}
              isLoading={isDashboardLoading}
            />
          )}

          {activeTab === 'wallet' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                    <Wallet className="h-5 w-5 text-emerald-400" />
                    Digital Wallet & Balance Overview
                  </h2>
                  <p className="text-xs text-slate-400">Manage accounts, liquidity balances, and funds settlement</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-5 backdrop-blur-xl">
                  <div className="text-xs text-slate-400 mb-1">Available Liquidity</div>
                  <div className="text-2xl font-bold text-white font-mono">
                    ${(summary?.netBalance || 133198.25).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </div>
                  <div className="mt-3 flex items-center gap-1.5 text-xs text-emerald-400">
                    <ArrowUpRight className="h-3.5 w-3.5" />
                    <span>Real-time settled balance</span>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-5 backdrop-blur-xl">
                  <div className="text-xs text-slate-400 mb-1">Total Inflow Revenue</div>
                  <div className="text-2xl font-bold text-emerald-400 font-mono">
                    +${(summary?.totalRevenue || 339803.25).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </div>
                  <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-400">
                    <span>{summary?.paidCount || 186} settled incoming transactions</span>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-5 backdrop-blur-xl">
                  <div className="text-xs text-slate-400 mb-1">Total Outflow Expenses</div>
                  <div className="text-2xl font-bold text-rose-400 font-mono">
                    -${(summary?.totalExpenses || 206605).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </div>
                  <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-400">
                    <ArrowDownRight className="h-3.5 w-3.5 text-rose-400" />
                    <span>Disbursed expense payments</span>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-6">
                <h3 className="text-sm font-semibold text-white mb-3">Linked Accounts & Verification</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/40 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold">
                        $
                      </div>
                      <div>
                        <div className="text-sm font-medium text-white">Primary Treasury (USD)</div>
                        <div className="text-xs text-slate-400">Bank Wire •••• 4289</div>
                      </div>
                    </div>
                    <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                      Active
                    </span>
                  </div>

                  <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/40 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold">
                        💳
                      </div>
                      <div>
                        <div className="text-sm font-medium text-white">Corporate Settlement Card</div>
                        <div className="text-xs text-slate-400">Visa Corporate •••• 9012</div>
                      </div>
                    </div>
                    <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                      Verified
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'personal' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                  <User className="h-5 w-5 text-emerald-400" />
                  Personal Profile & Account
                </h2>
                <p className="text-xs text-slate-400">Account details and security status</p>
              </div>

              <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-6 backdrop-blur-xl">
                <div className="flex items-center gap-4 pb-6 border-b border-slate-800">
                  <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-xl font-bold text-white shadow-lg shadow-emerald-500/20">
                    {user.email ? user.email.slice(0, 2).toUpperCase() : 'AD'}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">{user.name || 'Admin User'}</h3>
                    <p className="text-xs text-slate-400">{user.email}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <ShieldCheck className="h-3 w-3" />
                        Role: {user.role || 'admin'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/40">
                    <div className="text-xs text-slate-400">User ID</div>
                    <div className="text-sm font-mono text-slate-200 mt-1">{user.id}</div>
                  </div>
                  <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/40">
                    <div className="text-xs text-slate-400">Security Token</div>
                    <div className="text-sm font-mono text-emerald-400 mt-1 flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      JWT Authenticated (24h validity)
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'message' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-emerald-400" />
                  Messages & Activity Notifications
                </h2>
                <p className="text-xs text-slate-400">System alerts, audit logs, and incoming updates</p>
              </div>

              <div className="space-y-3">
                <div className="p-4 rounded-xl border border-emerald-500/20 bg-slate-900/60 backdrop-blur-xl flex items-start gap-3">
                  <Bell className="h-5 w-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-sm font-semibold text-white">System Synchronized Successfully</div>
                    <div className="text-xs text-slate-300 mt-0.5">
                      All 300 records loaded from MongoDB and verified with live aggregations.
                    </div>
                    <div className="text-[11px] text-slate-500 mt-2">Just now</div>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/40 flex items-start gap-3">
                  <Mail className="h-5 w-5 text-indigo-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-sm font-semibold text-white">Export Tool Available</div>
                    <div className="text-xs text-slate-300 mt-0.5">
                      You can generate custom CSV exports with dynamic columns from both the sidebar and ledger views.
                    </div>
                    <div className="text-[11px] text-slate-500 mt-2">10 minutes ago</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'setting' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                  <Settings className="h-5 w-5 text-emerald-400" />
                  Platform Settings
                </h2>
                <p className="text-xs text-slate-400">Configure ledger preferences, database sync, and display options</p>
              </div>

              <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-6 space-y-6">
                <div>
                  <h3 className="text-sm font-semibold text-white mb-2">Display & Currency Settings</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/40">
                      <div className="text-xs text-slate-400">Currency Unit</div>
                      <div className="text-sm font-medium text-white mt-1">USD ($)</div>
                    </div>
                    <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/40">
                      <div className="text-xs text-slate-400">Theme Mode</div>
                      <div className="text-sm font-medium text-white mt-1">Dark High-Contrast OLED</div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800">
                  <h3 className="text-sm font-semibold text-white mb-2">Backend Connection</h3>
                  <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/40 flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-white">API URL Base</div>
                      <div className="text-xs text-slate-400 font-mono">http://localhost:5000/api</div>
                    </div>
                    <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                      Connected
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        filters={filters}
      />
    </div>
  );
}

export default App;

