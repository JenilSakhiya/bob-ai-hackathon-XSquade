import React from 'react';
import { ArrowUpRight } from 'lucide-react';

interface Props {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: string;
  icon: React.ReactNode;
  variant?: 'default' | 'critical' | 'warning' | 'info';
}

export const StatCard: React.FC<Props> = ({
  title,
  value,
  subtitle,
  trend,
  icon,
  variant = 'default',
}) => {
  const borderAndBg = {
    default: 'border-white/[0.08] bg-[#090e18] hover:border-cyan-500/40',
    critical: 'hacker-panel-critical hover:border-red-500/60',
    warning: 'border-amber-900/50 bg-gradient-to-br from-amber-950/20 via-[#090e18] to-[#090e18] hover:border-amber-500/50',
    info: 'border-cyan-900/50 bg-gradient-to-br from-cyan-950/20 via-[#090e18] to-[#090e18] hover:border-cyan-500/50',
  }[variant];

  const iconBg = {
    default: 'bg-slate-900/80 border-slate-700/60 text-slate-300',
    critical: 'bg-red-950/80 border-red-700/60 text-red-400',
    warning: 'bg-amber-950/80 border-amber-700/60 text-amber-400',
    info: 'bg-cyan-950/80 border-cyan-700/60 text-cyan-400',
  }[variant];

  const valueColor = {
    default: 'text-white',
    critical: 'text-red-400',
    warning: 'text-amber-400',
    info: 'text-cyan-400',
  }[variant];

  return (
    <div
      className={`relative overflow-hidden rounded-xl border p-4 sm:p-5 transition-all duration-200 hacker-panel ${borderAndBg}`}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <span className="text-cyan-400">//</span> {title}
          </p>
          <div className="flex items-baseline gap-2">
            <h3 className={`text-2xl sm:text-3xl font-black font-mono tracking-tight ${valueColor}`}>
              {value}
            </h3>
            {trend && (
              <span className="flex items-center text-[11px] font-mono font-bold text-emerald-400">
                <ArrowUpRight className="h-3 w-3" />
                {trend}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-xs text-slate-400 font-mono text-[11px]">
              {subtitle}
            </p>
          )}
        </div>
        <div className={`rounded-lg p-2.5 border shadow-inner ${iconBg}`}>
          {icon}
        </div>
      </div>
    </div>
  );
};
