import React from 'react';
import {
  Lock,
  Unlock,
  Laptop,
  ShieldAlert,
  Terminal,
  ArrowUpRight,
  Shield,
  FileText,
  Clock,
  Globe,
  Radio,
} from 'lucide-react';
import { SecurityEvent } from '../types';
import { SeverityBadge } from './SeverityBadge';

interface Props {
  events: SecurityEvent[];
}

export const TimelineView: React.FC<Props> = ({ events }) => {
  const sortedEvents = [...events].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'LOGIN_FAILED':
        return <Lock className="h-3.5 w-3.5 text-orange-400" />;
      case 'LOGIN_SUCCESS':
        return <Unlock className="h-3.5 w-3.5 text-emerald-400" />;
      case 'NEW_DEVICE':
        return <Laptop className="h-3.5 w-3.5 text-sky-400" />;
      case 'PRIVILEGE_CHANGE':
        return <ShieldAlert className="h-3.5 w-3.5 text-red-400" />;
      case 'PROCESS_STARTED':
        return <Terminal className="h-3.5 w-3.5 text-amber-400" />;
      case 'DATA_TRANSFER':
        return <ArrowUpRight className="h-3.5 w-3.5 text-indigo-400" />;
      case 'FIREWALL_ALERT':
        return <Radio className="h-3.5 w-3.5 text-red-400" />;
      case 'FILE_ACCESS':
        return <FileText className="h-3.5 w-3.5 text-blue-400" />;
      default:
        return <Shield className="h-3.5 w-3.5 text-slate-400" />;
    }
  };

  const formatTime = (ts: string) => {
    try {
      const date = new Date(ts);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
    } catch (_) {
      return ts;
    }
  };

  return (
    <div className="relative pl-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-px before:bg-slate-800">
      <div className="space-y-4">
        {sortedEvents.map((ev, index) => (
          <div key={ev.id || index} className="relative group">
            {/* Timeline node icon */}
            <div className="absolute -left-[27px] top-1 flex h-6 w-6 items-center justify-center rounded-full bg-[#0f1623] border border-slate-700 group-hover:border-sky-400 transition-colors">
              {getEventIcon(ev.event_type)}
            </div>

            {/* Event card */}
            <div className="rounded-lg border border-white/[0.06] bg-slate-900/50 p-3.5 transition-all duration-150 hover:border-slate-700 hover:bg-slate-900/80">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/[0.06] pb-2 mb-2">
                <div className="flex items-center gap-2 text-xs">
                  <span className="flex items-center gap-1 text-sky-400 font-mono font-medium text-[11px]">
                    <Clock className="h-3 w-3" />
                    {formatTime(ev.timestamp)}
                  </span>
                  <span className="text-slate-600">•</span>
                  <span className="rounded bg-slate-800 px-2 py-0.5 text-[11px] font-medium text-slate-300">
                    {ev.event_type}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <span className="flex items-center gap-1 text-slate-400 font-mono text-[11px]">
                    <Globe className="h-3 w-3 text-slate-500" />
                    {ev.source_ip}
                    {ev.destination_ip && ` → ${ev.destination_ip}`}
                  </span>
                  <SeverityBadge severity={ev.severity} size="sm" />
                </div>
              </div>

              <p className="text-xs text-slate-200 leading-relaxed font-normal">
                {ev.description}
              </p>

              {/* Extra Metadata details */}
              {ev.metadata && Object.keys(ev.metadata).length > 0 && (
                <div className="mt-2.5 flex flex-wrap gap-1.5 text-[11px] font-mono">
                  {Object.entries(ev.metadata).map(([key, value]) => (
                    <span
                      key={key}
                      className="rounded bg-slate-950/80 border border-slate-800 px-2 py-0.5 text-slate-400"
                    >
                      <span className="text-slate-500">{key}:</span> {String(value)}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
