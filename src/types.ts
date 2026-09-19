export interface User {
  id: string;
  email: string;
  role: string;
  name?: string;
}

export interface Transaction {
  _id?: string;
  id: number;
  date: string;
  amount: number;
  category: 'Revenue' | 'Expense';
  status: 'Paid' | 'Pending';
  user_id: string;
  user_profile: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface DashboardSummary {
  totalRevenue: number;
  totalExpenses: number;
  netBalance: number;
  pendingCount: number;
  pendingAmount: number;
  paidCount: number;
  paidAmount: number;
  totalTransactions: number;
}

export interface MonthlyTrendItem {
  month: string;
  revenue: number;
  expense: number;
}

export interface BreakdownItem {
  name: string;
  value: number;
  count: number;
}

export interface DashboardAnalytics {
  monthlyTrend: MonthlyTrendItem[];
  categoryBreakdown: BreakdownItem[];
  statusDistribution: BreakdownItem[];
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface TransactionFilterParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: 'All' | 'Revenue' | 'Expense';
  status?: 'All' | 'Paid' | 'Pending';
  startDate?: string;
  endDate?: string;
  minAmount?: string | number;
  maxAmount?: string | number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
