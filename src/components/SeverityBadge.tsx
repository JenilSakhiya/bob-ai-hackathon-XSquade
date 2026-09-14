import React from 'react';
import { Severity } from '../types';

interface Props {
  severity: Severity | string;
  size?: 'sm' | 'md' | 'lg';
  showPulse?: boolean;
}

export const SeverityBadge: React.FC<Props> = ({ severity, size = 'md', showPulse = true }) => {
  const sevUpper = (severity || 'LOW').toUpperCase();

  let colorClasses = 'bg-blue-950/70 text-blue-400 border-blue-800/60';
  let dotColor = 'bg-blue-400';
  let pulse = false;

  if (sevUpper === 'CRITICAL') {
    colorClasses = 'bg-red-950/80 text-red-400 border-red-700/80 shadow-[0_0_12px_rgba(239,68,68,0.3)]';
    dotColor = 'bg-red-500';
    pulse = showPulse;
  } else if (sevUpper === 'HIGH') {
    colorClasses = 'bg-orange-950/70 text-orange-400 border-orange-700/70 shadow-[0_0_10px_rgba(249,115,22,0.2)]';
    dotColor = 'bg-orange-400';
  } else if (sevUpper === 'MEDIUM') {
    colorClasses = 'bg-yellow-950/60 text-yellow-400 border-yellow-700/60';
    dotColor = 'bg-yellow-400';
  }

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 font-medium',
    md: 'text-xs px-2.5 py-1 font-semibold tracking-wider',
    lg: 'text-sm px-3.5 py-1.5 font-bold tracking-wider',
  }[size];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border uppercase font-mono ${colorClasses} ${sizeClasses}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${dotColor} ${pulse ? 'animate-ping' : ''}`}
      />
      {sevUpper}
    </span>
  );
};
