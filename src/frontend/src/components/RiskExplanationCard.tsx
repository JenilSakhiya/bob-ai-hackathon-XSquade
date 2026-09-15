import React from 'react';
import { AlertCircle, ShieldAlert, Zap, Compass, CheckCircle2 } from 'lucide-react';
import { RiskFactor } from '../types';

interface Props {
  summary?: string | null;
  hypothesis?: string | null;
  whyDangerous?: string | null;
  riskFactors: RiskFactor[];
  confidence: number;
}

export const RiskExplanationCard: React.FC<Props> = ({
  hypothesis,
  whyDangerous,
  riskFactors,
  confidence,
}) => {
  return (
    <div className="rounded-xl border border-white/[0.08] bg-[#0f1623] p-5 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.08] pb-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-950/50 border border-red-800/40 text-red-400">
            <ShieldAlert className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">
              AI Threat Assessment & Risk Analysis
            </h3>
            <p className="text-xs text-slate-400">
              Autonomous multi-vector behavioral & entity correlation
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400">Correlation Confidence:</span>
          <span className="rounded-md bg-slate-800 px-2 py-0.5 font-semibold text-sky-400 border border-slate-700/60 font-mono text-[11px]">
            {confidence}%
          </span>
        </div>
      </div>

      {/* Threat Summary Statement */}
      <div className="rounded-lg border border-red-900/30 bg-red-950/20 p-3.5 text-xs text-slate-200 leading-relaxed">
        <div className="flex items-start gap-2.5">
          <AlertCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
          <p className="font-normal text-slate-200">
            {whyDangerous ||
              'Multiple correlated telemetry signals indicate high probability of credential compromise and lateral movement.'}
          </p>
        </div>
      </div>

      {/* Attack Hypothesis */}
      {hypothesis && (
        <div className="rounded-lg border border-white/[0.06] bg-slate-900/60 p-3.5 text-xs text-slate-300 leading-relaxed space-y-1">
          <div className="flex items-center gap-1.5 text-sky-400 font-semibold text-[11px]">
            <Compass className="h-3.5 w-3.5" />
            ATT&CK Hypothesis:
          </div>
          <p className="text-slate-300 text-xs pl-5">{hypothesis}</p>
        </div>
      )}

      {/* Contributing Risk Indicators Breakdown */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Zap className="h-3.5 w-3.5 text-amber-400" />
            Correlated Risk Indicators & Weight Breakdown
          </h4>
          <span className="text-[11px] text-slate-500 font-mono">Additive Scoring</span>
        </div>

        <div className="space-y-2">
          {riskFactors.map((factor, index) => (
            <div
              key={index}
              className="flex items-center justify-between gap-3 rounded-lg border border-white/[0.06] bg-slate-900/50 p-3 transition-colors hover:border-slate-700 hover:bg-slate-900/80"
            >
              <div className="flex items-start gap-2.5 min-w-0 flex-1">
                <CheckCircle2 className="h-4 w-4 text-red-400/90 shrink-0 mt-0.5" />
                <div className="min-w-0 space-y-0.5">
                  <p className="text-xs font-medium text-slate-200">
                    {factor.indicator}
                  </p>
                  <p className="text-[11px] text-slate-400 truncate">
                    {factor.evidence}
                  </p>
                </div>
              </div>

              {/* Visual contribution points */}
              <div className="shrink-0 flex items-center gap-2.5">
                <div className="hidden sm:block w-20 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-red-500 h-full rounded-full"
                    style={{ width: `${Math.min(factor.contribution * 4, 100)}%` }}
                  />
                </div>
                <span className="inline-flex items-center rounded-md bg-red-950/60 px-2 py-0.5 text-xs font-bold font-mono text-red-300 border border-red-800/40">
                  +{factor.contribution} pts
                </span>
              </div>
            </div>
          ))}

          {riskFactors.length === 0 && (
            <p className="text-xs text-slate-500 italic py-2">No individual risk points assigned.</p>
          )}
        </div>
      </div>
    </div>
  );
};
