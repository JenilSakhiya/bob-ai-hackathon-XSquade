import React from 'react';

interface Props {
  score: number;
  size?: number;
  strokeWidth?: number;
}

export const RiskScoreMeter: React.FC<Props> = ({ score, size = 120, strokeWidth = 10 }) => {
  const normalizedScore = Math.min(Math.max(score, 0), 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (normalizedScore / 100) * circumference;

  let color = '#3b82f6'; // blue (low)
  let severityLabel = 'LOW';
  let glowClass = '';

  if (normalizedScore >= 80) {
    color = '#ef4444'; // red (critical)
    severityLabel = 'CRITICAL';
    glowClass = 'drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]';
  } else if (normalizedScore >= 60) {
    color = '#f97316'; // orange (high)
    severityLabel = 'HIGH';
    glowClass = 'drop-shadow-[0_0_6px_rgba(249,115,22,0.6)]';
  } else if (normalizedScore >= 30) {
    color = '#eab308'; // yellow (medium)
    severityLabel = 'MEDIUM';
  }

  return (
    <div className="flex flex-col items-center justify-center relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#1e293b"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Progress track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
          className={`transition-all duration-1000 ease-out ${glowClass}`}
        />
      </svg>
      {/* Center score display */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-2xl font-black font-mono tracking-tight text-white leading-none">
          {normalizedScore}
        </span>
        <span className="text-[10px] font-bold font-mono tracking-widest uppercase mt-0.5" style={{ color }}>
          {severityLabel}
        </span>
      </div>
    </div>
  );
};
