import React from 'react';
import { ShieldCheck, Check, AlertCircle, PlayCircle, Info } from 'lucide-react';
import { ResponseAction, ActionStatus } from '../types';

interface Props {
  actions: ResponseAction[];
  onUpdateStatus?: (actionId: number, newStatus: ActionStatus) => void;
}

export const ActionRecommendations: React.FC<Props> = ({ actions, onUpdateStatus }) => {
  const getPriorityBadge = (priority: string) => {
    switch (priority.toUpperCase()) {
      case 'HIGH':
        return (
          <span className="rounded bg-red-950/70 border border-red-800/80 px-2 py-0.5 text-[10px] font-bold font-mono text-red-400">
            HIGH
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="rounded bg-orange-950/70 border border-orange-800/80 px-2 py-0.5 text-[10px] font-bold font-mono text-orange-400">
            MEDIUM
          </span>
        );
      default:
        return (
          <span className="rounded bg-blue-950/70 border border-blue-800/80 px-2 py-0.5 text-[10px] font-bold font-mono text-blue-400">
            LOW
          </span>
        );
    }
  };

  const getStatusBadge = (status: ActionStatus) => {
    switch (status) {
      case 'COMPLETED':
        return (
          <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded">
            <Check className="h-3 w-3" />
            COMPLETED
          </span>
        );
      case 'APPROVED':
        return (
          <span className="flex items-center gap-1 text-[11px] font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-800/60 px-2 py-0.5 rounded">
            <PlayCircle className="h-3 w-3" />
            APPROVED
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 text-[11px] font-mono text-slate-400 bg-slate-800/80 border border-slate-700/60 px-2 py-0.5 rounded">
            RECOMMENDED
          </span>
        );
    }
  };

  return (
    <div className="rounded-xl border border-slate-800 bg-[#0d1322]/90 p-5 shadow-lg backdrop-blur-md">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 mb-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-cyan-400" />
          <h3 className="text-base font-bold text-white font-mono">
            Recommended Response Actions
          </h3>
        </div>
        <span className="text-xs text-slate-400 font-mono">
          {actions.length} Actions Available
        </span>
      </div>

      {/* Safety Notice */}
      <div className="mb-4 flex items-center gap-2 rounded-lg border border-cyan-900/40 bg-cyan-950/20 p-2.5 text-xs text-cyan-300">
        <Info className="h-4 w-4 shrink-0 text-cyan-400" />
        <span>
          <strong>Operational Safety Guardrail:</strong> Actions are recommendations only. MVP does not execute destructive changes on live infrastructure.
        </span>
      </div>

      {/* Actions List */}
      <div className="space-y-3">
        {actions.map((act) => (
          <div
            key={act.id}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg border border-slate-800 bg-[#090d18] p-3.5 transition-all hover:border-slate-700"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                {getPriorityBadge(act.priority)}
                <span className="text-sm font-semibold text-slate-100">
                  {act.action}
                </span>
              </div>
              <p className="text-xs text-slate-400 pl-0.5">
                <span className="text-slate-500 font-mono">Reason:</span> {act.reason}
              </p>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
              {getStatusBadge(act.status)}

              {onUpdateStatus && act.status === 'RECOMMENDED' && (
                <button
                  onClick={() => onUpdateStatus(act.id, 'APPROVED')}
                  className="rounded bg-cyan-950 px-2.5 py-1 text-xs font-semibold font-mono text-cyan-300 border border-cyan-700/60 hover:bg-cyan-900/60 transition-colors"
                >
                  Approve
                </button>
              )}

              {onUpdateStatus && act.status === 'APPROVED' && (
                <button
                  onClick={() => onUpdateStatus(act.id, 'COMPLETED')}
                  className="rounded bg-emerald-950 px-2.5 py-1 text-xs font-semibold font-mono text-emerald-300 border border-emerald-700/60 hover:bg-emerald-900/60 transition-colors"
                >
                  Complete
                </button>
              )}
            </div>
          </div>
        ))}

        {actions.length === 0 && (
          <div className="text-center py-6 text-sm text-slate-500">
            No response actions currently required.
          </div>
        )}
      </div>
    </div>
  );
};
