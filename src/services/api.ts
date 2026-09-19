import type {
  Transaction,
  DashboardSummary,
  DashboardAnalytics,
  PaginationMeta,
  TransactionFilterParams,
  User,
} from '../types.js';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const getToken = (): string | null => {
  return localStorage.getItem('flowledger_token');
};

export const setToken = (token: string): void => {
  localStorage.setItem('flowledger_token', token);
};

export const removeToken = (): void => {
  localStorage.removeItem('flowledger_token');
};

const getHeaders = (isJson = true): HeadersInit => {
  const token = getToken();
  const headers: Record<string, string> = {};
  if (isJson) {
    headers['Content-Type'] = 'application/json';
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

async function handleResponse<T>(res: Response): Promise<T> {
  if (res.status === 401) {
    removeToken();
    window.dispatchEvent(new Event('flowledger_unauthorized'));
    throw new Error('Session expired. Please log in again.');
  }

  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(json.message || `Request failed with status ${res.status}`);
  }
  return json.data !== undefined ? json.data : json;
}

// Auth APIs
export const apiLogin = async (email: string, password: string): Promise<{ token: string; user: User }> => {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await handleResponse<{ token: string; user: User }>(res);
  if (data.token) {
    setToken(data.token);
  }
  return data;
};

export const apiGetMe = async (): Promise<User> => {
  const res = await fetch(`${API_BASE}/auth/me`, {
    headers: getHeaders(),
  });
  return handleResponse<User>(res);
};

export const apiLogout = async (): Promise<void> => {
  try {
    await fetch(`${API_BASE}/auth/logout`, {
      method: 'POST',
      headers: getHeaders(),
    });
  } catch {
    // Ignore network error on logout
  } finally {
    removeToken();
  }
};

// Dashboard APIs
export const apiGetDashboardSummary = async (): Promise<DashboardSummary> => {
  const res = await fetch(`${API_BASE}/dashboard/summary`, {
    headers: getHeaders(),
  });
  return handleResponse<DashboardSummary>(res);
};

export const apiGetDashboardAnalytics = async (): Promise<DashboardAnalytics> => {
  const res = await fetch(`${API_BASE}/dashboard/analytics`, {
    headers: getHeaders(),
  });
  return handleResponse<DashboardAnalytics>(res);
};

export const apiGetRecentTransactions = async (limit = 6): Promise<Transaction[]> => {
  const res = await fetch(`${API_BASE}/dashboard/recent?limit=${limit}`, {
    headers: getHeaders(),
  });
  return handleResponse<Transaction[]>(res);
};

// Transaction APIs
export const apiGetTransactions = async (
  params: TransactionFilterParams = {}
): Promise<{ data: Transaction[]; pagination: PaginationMeta }> => {
  const query = new URLSearchParams();

  if (params.page) query.append('page', params.page.toString());
  if (params.limit) query.append('limit', params.limit.toString());
  if (params.search) query.append('search', params.search);
  if (params.category && params.category !== 'All') query.append('category', params.category);
  if (params.status && params.status !== 'All') query.append('status', params.status);
  if (params.startDate) query.append('startDate', params.startDate);
  if (params.endDate) query.append('endDate', params.endDate);
  if (params.minAmount !== undefined && params.minAmount !== '') query.append('minAmount', params.minAmount.toString());
  if (params.maxAmount !== undefined && params.maxAmount !== '') query.append('maxAmount', params.maxAmount.toString());
  if (params.sortBy) query.append('sortBy', params.sortBy);
  if (params.sortOrder) query.append('sortOrder', params.sortOrder);

  const res = await fetch(`${API_BASE}/transactions?${query.toString()}`, {
    headers: getHeaders(),
  });

  const json = await res.json().catch(() => ({}));
  if (res.status === 401) {
    removeToken();
    window.dispatchEvent(new Event('flowledger_unauthorized'));
    throw new Error('Session expired. Please log in again.');
  }
  if (!res.ok) {
    throw new Error(json.message || `Request failed with status ${res.status}`);
  }

  return {
    data: json.data || [],
    pagination: json.pagination || {
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 1,
      hasNextPage: false,
      hasPrevPage: false,
    },
  };
};

export const apiExportCSV = async (params: TransactionFilterParams & { columns?: string[] }): Promise<void> => {
  const query = new URLSearchParams();
  if (params.search) query.append('search', params.search);
  if (params.category && params.category !== 'All') query.append('category', params.category);
  if (params.status && params.status !== 'All') query.append('status', params.status);
  if (params.startDate) query.append('startDate', params.startDate);
  if (params.endDate) query.append('endDate', params.endDate);
  if (params.columns && params.columns.length > 0) {
    query.append('columns', params.columns.join(','));
  }

  const token = getToken();
  const headers: Record<string, string> = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}/transactions/export?${query.toString()}`, {
    headers,
  });

  if (!res.ok) {
    throw new Error('Failed to download CSV export');
  }

  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `transactions_export_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
};
