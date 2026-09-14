import React from 'react';

interface Props {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  variant?: 'default' | 'critical' | 'warning' | 'info';
}

export const StatCard: React.FC<Props> = ({
  title,
  value,
  subtitle,
  icon,
  variant = 'default',
}) => {
  const borderColors = {
    default: 'border-slate-800/80 hover:border-slate-700',
    critical: 'border-red-900/60 hover:border-red-600/80 bg-gradient-to-br from-red-950/20 to-slate-900/40',
    warning: 'border-orange-900/50 hover:border-orange-600/70 bg-gradient-to-br from-orange-950/20 to-slate-900/40',
    info: 'border-blue-900/50 hover:border-blue-600/70 bg-gradient-to-br from-blue-950/20 to-slate-900/40',
  }[variant];

  const textColors = {
    default: 'text-white',
    critical: 'text-red-400',
    warning: 'text-orange-400',
    info: 'text-blue-400',
  }[variant];

  return (
    <div
      className={`relative overflow-hidden rounded-xl border p-5 transition-all duration-200 bg-[#0d1322]/90 backdrop-blur-md shadow-lg ${borderColors}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono">
            {title}
          </p>
          <div className="mt-2 flex items-baseline gap-2">
            <h3 className={`text-3xl font-extrabold font-mono tracking-tight ${textColors}`}>
              {value}
            </h3>
          </div>
          {subtitle && (
            <p className="mt-1 text-xs text-slate-400">
              {subtitle}
            </p>
          )}
        </div>
        <div className="rounded-lg p-3 bg-slate-800/50 border border-slate-700/40 text-slate-300">
          {icon}
        </div>
      </div>
    </div>
  );
};
