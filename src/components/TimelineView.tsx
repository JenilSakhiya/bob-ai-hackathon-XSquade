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
        return <Lock className="h-4 w-4 text-orange-400" />;
      case 'LOGIN_SUCCESS':
        return <Unlock className="h-4 w-4 text-emerald-400" />;
      case 'NEW_DEVICE':
        return <Laptop className="h-4 w-4 text-cyan-400" />;
      case 'PRIVILEGE_CHANGE':
        return <ShieldAlert className="h-4 w-4 text-red-400" />;
      case 'PROCESS_STARTED':
        return <Terminal className="h-4 w-4 text-yellow-400" />;
      case 'DATA_TRANSFER':
        return <ArrowUpRight className="h-4 w-4 text-purple-400" />;
      case 'FILE_ACCESS':
        return <FileText className="h-4 w-4 text-blue-400" />;
      default:
        return <Shield className="h-4 w-4 text-slate-400" />;
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
    <div className="relative pl-6 before:absolute before:left-3 before:top-3 before:bottom-3 before:w-0.5 before:bg-gradient-to-b before:from-cyan-500/60 before:via-purple-500/40 before:to-slate-800">
      <div className="space-y-6">
        {sortedEvents.map((ev, index) => (
          <div key={ev.id || index} className="relative group">
            {/* Timeline node icon */}
            <div className="absolute -left-[30px] top-1 flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 border border-slate-700 shadow-md group-hover:border-cyan-400 transition-colors">
              {getEventIcon(ev.event_type)}
            </div>

            {/* Event content card */}
            <div className="rounded-lg border border-slate-800/80 bg-[#0d1322]/80 p-4 backdrop-blur-sm transition-all duration-200 hover:border-slate-700 hover:bg-[#11192e]">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/60 pb-2 mb-2.5">
                <div className="flex items-center gap-2 font-mono text-xs">
                  <span className="flex items-center gap-1 text-cyan-400 font-bold">
                    <Clock className="h-3.5 w-3.5" />
                    {formatTime(ev.timestamp)}
                  </span>
                  <span className="text-slate-600">•</span>
                  <span className="rounded bg-slate-800 px-2 py-0.5 font-semibold text-slate-300">
                    {ev.event_type}
                  </span>
                </div>

                <div className="flex items-center gap-2 font-mono text-xs">
                  <span className="flex items-center gap-1 text-slate-400">
                    <Globe className="h-3.5 w-3.5 text-slate-500" />
                    {ev.source_ip}
                    {ev.destination_ip && ` → ${ev.destination_ip}`}
                  </span>
                  <SeverityBadge severity={ev.severity} size="sm" showPulse={false} />
                </div>
              </div>

              <p className="text-sm font-medium text-slate-200 leading-relaxed">
                {ev.description}
              </p>

              {/* Extra Metadata details */}
              {ev.metadata && Object.keys(ev.metadata).length > 0 && (
                <div className="mt-2.5 flex flex-wrap gap-1.5 font-mono text-[11px]">
                  {Object.entries(ev.metadata).map(([key, value]) => (
                    <span
                      key={key}
                      className="rounded bg-slate-900/90 border border-slate-800 px-2 py-0.5 text-slate-400"
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
