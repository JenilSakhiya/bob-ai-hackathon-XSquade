import React from 'react';
import { Severity } from '../types';

interface Props {
  severity: Severity | string;
  size?: 'sm' | 'md' | 'lg';
  showPulse?: boolean;
}

export const SeverityBadge: React.FC<Props> = ({ severity, size = 'md' }) => {
  const sevUpper = (severity || 'LOW').toUpperCase();

  let badgeStyles = 'bg-cyan-950/60 text-cyan-300 border-cyan-800/60';
  let dotColor = 'bg-cyan-400';

  if (sevUpper === 'CRITICAL') {
    badgeStyles = 'bg-red-950/70 text-red-300 border-red-600/70 shadow-[0_0_8px_rgba(239,68,68,0.3)]';
    dotColor = 'bg-red-400 animate-ping';
  } else if (sevUpper === 'HIGH') {
    badgeStyles = 'bg-orange-950/70 text-orange-300 border-orange-600/70 shadow-[0_0_8px_rgba(249,115,22,0.2)]';
    dotColor = 'bg-orange-400';
  } else if (sevUpper === 'MEDIUM') {
    badgeStyles = 'bg-amber-950/60 text-amber-300 border-amber-700/60';
    dotColor = 'bg-amber-400';
  } else if (sevUpper === 'LOW') {
    badgeStyles = 'bg-slate-900/80 text-slate-300 border-slate-700/60';
    dotColor = 'bg-slate-400';
  }

  const sizeStyles = {
    sm: 'text-[10px] px-2 py-0.5 font-mono font-bold tracking-wider',
    md: 'text-xs px-2.5 py-0.5 font-mono font-bold tracking-wider',
    lg: 'text-xs px-3.5 py-1 font-mono font-bold tracking-wider',
  }[size];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border uppercase font-mono transition-colors ${badgeStyles} ${sizeStyles}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
      {sevUpper}
    </span>
  );
};
