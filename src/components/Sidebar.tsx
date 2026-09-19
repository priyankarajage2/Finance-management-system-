import React from 'react';
import {
  LayoutGrid,
  Receipt,
  Wallet,
  BarChart3,
  User,
  MessageSquare,
  Settings,
  FileSpreadsheet,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';

export type SidebarTab =
  | 'dashboard'
  | 'transactions'
  | 'wallet'
  | 'analytics'
  | 'personal'
  | 'message'
  | 'setting';

interface SidebarProps {
  activeTab: SidebarTab;
  setActiveTab: (tab: SidebarTab) => void;
  onOpenExport: () => void;
  totalTransactions?: number;
}

interface NavItem {
  id: SidebarTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number | string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  onOpenExport,
  totalTransactions = 300,
}) => {
  const navItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid },
    { id: 'transactions', label: 'Transactions', icon: Receipt, badge: totalTransactions },
    { id: 'wallet', label: 'Wallet', icon: Wallet },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'personal', label: 'Personal', icon: User },
    { id: 'message', label: 'Message', icon: MessageSquare },
    { id: 'setting', label: 'Setting', icon: Settings },
  ];

  return (
    <aside className="w-full md:w-64 flex-shrink-0 md:border-r border-slate-800/80 bg-slate-950/70 p-4 flex flex-col justify-between gap-6">
      {/* Navigation Items */}
      <div className="flex md:flex-col gap-1.5 overflow-x-auto md:overflow-visible">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`group relative flex items-center justify-between w-full px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-slate-900/90 text-emerald-400 font-semibold shadow-inner border border-slate-800/80'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
              }`}
            >
              <div className="flex items-center gap-3.5">
                <Icon
                  className={`h-4.5 w-4.5 transition-colors ${
                    isActive
                      ? 'text-emerald-400'
                      : 'text-slate-400 group-hover:text-slate-200'
                  }`}
                />
                <span className="tracking-wide">{item.label}</span>
              </div>

              <div className="flex items-center gap-2">
                {item.badge !== undefined && (
                  <span
                    className={`text-[11px] px-2 py-0.5 rounded-full font-mono font-medium ${
                      isActive
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-slate-800/80 text-slate-400'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}

                {/* Yellow / Golden active pill indicator from screenshot */}
                {isActive && (
                  <span className="hidden md:block w-1.5 h-5 rounded-full bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.8)]" />
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Bottom helper card & info */}
      <div className="hidden md:flex flex-col gap-3 pt-4 border-t border-slate-900">
        <div className="p-3.5 rounded-xl border border-indigo-500/20 bg-gradient-to-b from-indigo-950/40 to-slate-900/80 text-xs">
          <div className="flex items-center gap-2 font-semibold text-indigo-300 mb-1">
            <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
            Quick Export
          </div>
          <p className="text-slate-400 mb-3 leading-relaxed">
            Download CSV with customized column selections & date filters.
          </p>
          <button
            onClick={onOpenExport}
            className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs transition-colors shadow-md shadow-indigo-500/20"
          >
            <FileSpreadsheet className="h-3.5 w-3.5" />
            Export to CSV
          </button>
        </div>

        <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-800/80 bg-slate-900/40 text-[11px] text-slate-400">
          <ShieldAlert className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0" />
          <span>MongoDB Single Source of Truth</span>
        </div>
      </div>
    </aside>
  );
};

