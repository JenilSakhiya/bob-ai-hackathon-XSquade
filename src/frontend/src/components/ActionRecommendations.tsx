import React from 'react';
import { ShieldCheck, Check, Info, ArrowRight } from 'lucide-react';
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
          <span className="rounded bg-red-950/60 border border-red-800/40 px-2 py-0.5 text-[10px] font-bold text-red-300">
            HIGH
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="rounded bg-amber-950/60 border border-amber-800/40 px-2 py-0.5 text-[10px] font-bold text-amber-300">
            MEDIUM
          </span>
        );
      default:
        return (
          <span className="rounded bg-sky-950/60 border border-sky-800/40 px-2 py-0.5 text-[10px] font-bold text-sky-300">
            LOW
          </span>
        );
    }
  };

  const getStatusBadge = (status: ActionStatus) => {
    switch (status) {
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400 bg-emerald-950/50 border border-emerald-800/40 px-2 py-0.5 rounded-md">
            <Check className="h-3 w-3" />
            Completed
          </span>
        );
      case 'APPROVED':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-sky-400 bg-sky-950/50 border border-sky-800/40 px-2 py-0.5 rounded-md">
            Approved
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-400 bg-slate-800/80 border border-slate-700/60 px-2 py-0.5 rounded-md">
            Recommended
          </span>
        );
    }
  };

  return (
    <div className="rounded-xl border border-white/[0.08] bg-[#0f1623] p-5 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-sky-400" />
          <h3 className="text-sm font-semibold text-white">
            Recommended Response Actions
          </h3>
        </div>
        <span className="text-xs text-slate-400">
          {actions.length} Actions
        </span>
      </div>

      {/* Safety Notice */}
      <div className="flex items-center gap-2.5 rounded-lg border border-sky-900/30 bg-sky-950/20 p-2.5 text-xs text-slate-300">
        <Info className="h-4 w-4 shrink-0 text-sky-400" />
        <span className="text-[11px] leading-relaxed">
          <strong className="text-white font-medium">Safe Mode:</strong> Response actions are prescriptive guidance. Executing will update the incident audit trail.
        </span>
      </div>

      {/* Actions List */}
      <div className="space-y-2.5">
        {actions.map((act) => (
          <div
            key={act.id}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg border border-white/[0.06] bg-slate-900/50 p-3.5 transition-all hover:border-slate-700 hover:bg-slate-900/80"
          >
            <div className="space-y-1 min-w-0 flex-1">
              <div className="flex items-center gap-2">
                {getPriorityBadge(act.priority)}
                <span className="text-xs font-semibold text-slate-100">
                  {act.action}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                <span className="text-slate-500 font-medium">Reason:</span> {act.reason}
              </p>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
              {getStatusBadge(act.status)}

              {onUpdateStatus && act.status === 'RECOMMENDED' && (
                <button
                  onClick={() => onUpdateStatus(act.id, 'APPROVED')}
                  className="flex items-center gap-1 rounded-md bg-sky-600 hover:bg-sky-500 px-2.5 py-1 text-xs font-medium text-white transition-colors cursor-pointer"
                >
                  Approve <ArrowRight className="h-3 w-3" />
                </button>
              )}

              {onUpdateStatus && act.status === 'APPROVED' && (
                <button
                  onClick={() => onUpdateStatus(act.id, 'COMPLETED')}
                  className="flex items-center gap-1 rounded-md bg-emerald-600 hover:bg-emerald-500 px-2.5 py-1 text-xs font-medium text-white transition-colors cursor-pointer"
                >
                  <Check className="h-3 w-3" /> Mark Done
                </button>
              )}
            </div>
          </div>
        ))}

        {actions.length === 0 && (
          <div className="text-center py-6 text-xs text-slate-500">
            No response actions currently required.
          </div>
        )}
      </div>
    </div>
  );
};
