import React from 'react';

interface Props {
  score: number;
  size?: number;
  strokeWidth?: number;
}

export const RiskScoreMeter: React.FC<Props> = ({ score, size = 110, strokeWidth = 8 }) => {
  const normalizedScore = Math.min(Math.max(score, 0), 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (normalizedScore / 100) * circumference;

  let strokeColor = '#38bdf8'; // sky/low
  let labelColor = 'text-sky-400';
  let severityText = 'LOW';

  if (normalizedScore >= 80) {
    strokeColor = '#ef4444'; // red
    labelColor = 'text-red-400';
    severityText = 'CRITICAL';
  } else if (normalizedScore >= 60) {
    strokeColor = '#f97316'; // orange
    labelColor = 'text-orange-400';
    severityText = 'HIGH';
  } else if (normalizedScore >= 30) {
    strokeColor = '#eab308'; // amber
    labelColor = 'text-amber-400';
    severityText = 'MEDIUM';
  }

  return (
    <div
      className="flex flex-col items-center justify-center relative shrink-0"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#1e293b"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Progress Arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      {/* Center Label */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none">
        <span className="text-2xl font-bold tracking-tight text-white leading-none">
          {normalizedScore}
        </span>
        <span className={`text-[10px] font-semibold tracking-wider uppercase mt-1 ${labelColor}`}>
          {severityText}
        </span>
      </div>
    </div>
  );
};
