import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  variant?: 'indigo' | 'emerald' | 'rose' | 'amber' | 'blue';
}

const variantStyles = {
  indigo: {
    bg: 'from-indigo-950/40 via-slate-900/60 to-slate-900/80',
    border: 'border-indigo-500/20',
    iconBg: 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400',
    glow: 'group-hover:border-indigo-500/40',
  },
  emerald: {
    bg: 'from-emerald-950/40 via-slate-900/60 to-slate-900/80',
    border: 'border-emerald-500/20',
    iconBg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
    glow: 'group-hover:border-emerald-500/40',
  },
  rose: {
    bg: 'from-rose-950/40 via-slate-900/60 to-slate-900/80',
    border: 'border-rose-500/20',
    iconBg: 'bg-rose-500/10 border-rose-500/30 text-rose-400',
    glow: 'group-hover:border-rose-500/40',
  },
  amber: {
    bg: 'from-amber-950/40 via-slate-900/60 to-slate-900/80',
    border: 'border-amber-500/20',
    iconBg: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
    glow: 'group-hover:border-amber-500/40',
  },
  blue: {
    bg: 'from-blue-950/40 via-slate-900/60 to-slate-900/80',
    border: 'border-blue-500/20',
    iconBg: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
    glow: 'group-hover:border-blue-500/40',
  },
};

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  variant = 'indigo',
}) => {
  const styles = variantStyles[variant];

  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border ${styles.border} ${styles.glow} bg-gradient-to-br ${styles.bg} p-5 backdrop-blur-xl transition-all duration-300 hover:translate-y-[-2px] hover:shadow-xl`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wider text-slate-400">{title}</span>
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl border ${styles.iconBg}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>

      <div className="mt-4">
        <h3 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">{value}</h3>
        {(subtitle || trend) && (
          <div className="mt-2 flex items-center gap-2 text-xs">
            {trend && (
              <span
                className={`font-semibold ${
                  trend.isPositive ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {trend.value}
              </span>
            )}
            {subtitle && <span className="text-slate-400">{subtitle}</span>}
          </div>
        )}
      </div>
    </div>
  );
};
