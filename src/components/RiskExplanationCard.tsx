import React from 'react';
import { AlertTriangle, ShieldAlert, Zap, Compass, CheckCircle2 } from 'lucide-react';
import { RiskFactor } from '../types';

interface Props {
  summary?: string | null;
  hypothesis?: string | null;
  whyDangerous?: string | null;
  riskFactors: RiskFactor[];
  confidence: number;
}

export const RiskExplanationCard: React.FC<Props> = ({
  summary,
  hypothesis,
  whyDangerous,
  riskFactors,
  confidence,
}) => {
  return (
    <div className="rounded-xl border border-red-900/60 bg-gradient-to-br from-red-950/20 via-[#0d1322] to-slate-900/60 p-5 shadow-xl backdrop-blur-md">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-red-900/40 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-950/80 border border-red-700/60 text-red-400">
            <ShieldAlert className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white font-mono tracking-wide">
              AI Assessment: Why is this dangerous?
            </h3>
            <p className="text-xs text-slate-400">
              Autonomous multi-vector behavioral & threat correlation
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="text-slate-400">AI Confidence:</span>
          <span className="rounded bg-red-950/80 px-2 py-0.5 font-bold text-red-400 border border-red-800/60">
            {confidence}%
          </span>
        </div>
      </div>

      {/* Primary Statement */}
      <div className="mt-4 rounded-lg border border-red-800/40 bg-red-950/30 p-3.5 text-sm text-red-200 leading-relaxed font-medium">
        <p className="flex items-start gap-2">
          <AlertTriangle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
          <span>
            {whyDangerous ||
              'CyberSentinel identified multiple correlated indicators that strongly suggest account compromise.'}
          </span>
        </p>
      </div>

      {/* Attack Hypothesis */}
      {hypothesis && (
        <div className="mt-3.5 rounded-lg border border-slate-800 bg-slate-900/50 p-3 text-xs text-slate-300 leading-relaxed">
          <div className="flex items-center gap-1.5 font-mono text-cyan-400 font-semibold mb-1">
            <Compass className="h-3.5 w-3.5" />
            Attack Hypothesis:
          </div>
          <p>{hypothesis}</p>
        </div>
      )}

      {/* Contributing Risk Factors Breakdown */}
      <div className="mt-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono mb-2.5 flex items-center gap-1.5">
          <Zap className="h-3.5 w-3.5 text-orange-400" />
          Contributing Threat Indicators & Points:
        </h4>

        <div className="space-y-2">
          {riskFactors.map((factor, index) => (
            <div
              key={index}
              className="flex items-center justify-between gap-3 rounded-lg border border-slate-800/90 bg-[#090d18]/90 p-2.5 transition-colors hover:border-slate-700"
            >
              <div className="flex items-start gap-2 min-w-0">
                <CheckCircle2 className="h-4 w-4 text-red-400/80 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-slate-200">
                    {factor.indicator}
                  </p>
                  <p className="text-[11px] text-slate-400 truncate">
                    {factor.evidence}
                  </p>
                </div>
              </div>

              <div className="shrink-0">
                <span className="inline-flex items-center rounded-md bg-red-950/80 px-2 py-0.5 text-xs font-bold font-mono text-red-400 border border-red-800/70">
                  +{factor.contribution} pts
                </span>
              </div>
            </div>
          ))}

          {riskFactors.length === 0 && (
            <p className="text-xs text-slate-500 italic">No specific anomaly points assigned.</p>
          )}
        </div>
      </div>
    </div>
  );
};
