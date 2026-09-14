import React, { useEffect, useState } from 'react';
import {
  Layers,
  Search,
  RefreshCw,
  Clock,
  Globe,
  User,
  Laptop,
  Code,
  X,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { SecurityEvent } from '../types';
import { api } from '../services/api';
import { SeverityBadge } from '../components/SeverityBadge';

export const EventsPage: React.FC = () => {
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(40);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [eventType, setEventType] = useState('ALL');
  const [severity, setSeverity] = useState('ALL');
  const [username, setUsername] = useState('');

  // Selected event for JSON inspect modal
  const [inspectedEvent, setInspectedEvent] = useState<SecurityEvent | null>(null);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await api.getEvents({
        page,
        page_size: pageSize,
        search: search || undefined,
        event_type: eventType !== 'ALL' ? eventType : undefined,
        severity: severity !== 'ALL' ? severity : undefined,
        username: username || undefined,
      });
      setEvents(res.events);
      setTotal(res.total);
    } catch (err) {
      console.error('Failed to fetch events:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchEvents();
    }, 250);
    return () => clearTimeout(timer);
  }, [page, search, eventType, severity, username]);

  const totalPages = Math.ceil(total / pageSize) || 1;

  const formatTimestamp = (ts: string) => {
    try {
      const d = new Date(ts);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
    } catch (_) {
      return ts;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-black text-white font-mono tracking-wide flex items-center gap-2">
            <Layers className="h-6 w-6 text-cyan-400" />
            Security Telemetry Events
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Raw ingested log telemetry streams evaluated by rule-based detection engine
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="rounded bg-slate-800 px-3 py-1.5 text-slate-300 border border-slate-700">
            Total Logs: <strong className="text-cyan-400">{total}</strong>
          </span>
          <button
            onClick={fetchEvents}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 bg-[#0d1322]/80 border border-slate-800 p-3.5 rounded-xl backdrop-blur-md">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search description, IP, host..."
            className="w-full rounded-lg border border-slate-700/80 bg-[#090d18] pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
          />
        </div>

        {/* Event Type Filter */}
        <div>
          <select
            value={eventType}
            onChange={(e) => {
              setEventType(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-lg border border-slate-700/80 bg-[#090d18] px-3 py-2 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none font-mono"
          >
            <option value="ALL">All Event Types</option>
            <option value="LOGIN_FAILED">LOGIN_FAILED</option>
            <option value="LOGIN_SUCCESS">LOGIN_SUCCESS</option>
            <option value="NEW_DEVICE">NEW_DEVICE</option>
            <option value="PRIVILEGE_CHANGE">PRIVILEGE_CHANGE</option>
            <option value="PROCESS_STARTED">PROCESS_STARTED</option>
            <option value="DATA_TRANSFER">DATA_TRANSFER</option>
            <option value="FIREWALL_ALERT">FIREWALL_ALERT</option>
            <option value="FILE_ACCESS">FILE_ACCESS</option>
          </select>
        </div>

        {/* Severity Filter */}
        <div>
          <select
            value={severity}
            onChange={(e) => {
              setSeverity(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-lg border border-slate-700/80 bg-[#090d18] px-3 py-2 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none font-mono"
          >
            <option value="ALL">All Severities</option>
            <option value="CRITICAL">CRITICAL</option>
            <option value="HIGH">HIGH</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="LOW">LOW</option>
          </select>
        </div>

        {/* Username Filter */}
        <div>
          <input
            type="text"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              setPage(1);
            }}
            placeholder="Filter by username..."
            className="w-full rounded-lg border border-slate-700/80 bg-[#090d18] px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Events Table */}
      <div className="rounded-xl border border-slate-800 bg-[#0d1322]/90 shadow-xl overflow-hidden backdrop-blur-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="border-b border-slate-800 bg-slate-900/80 text-slate-400 uppercase">
              <tr>
                <th className="px-5 py-3.5">Time</th>
                <th className="px-5 py-3.5">Severity</th>
                <th className="px-5 py-3.5">Event Type</th>
                <th className="px-5 py-3.5">User</th>
                <th className="px-5 py-3.5">Source → Dest IP</th>
                <th className="px-5 py-3.5">Asset</th>
                <th className="px-5 py-3.5">Description</th>
                <th className="px-5 py-3.5 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-cyan-400">
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Ingesting telemetry log records...
                    </div>
                  </td>
                </tr>
              ) : events.length > 0 ? (
                events.map((ev) => (
                  <tr
                    key={ev.id}
                    className="hover:bg-[#11192e] transition-colors group"
                  >
                    <td className="px-5 py-3.5 text-cyan-400 font-bold whitespace-nowrap">
                      {formatTimestamp(ev.timestamp)}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <SeverityBadge severity={ev.severity} size="sm" showPulse={false} />
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <span className="rounded bg-slate-800 px-2 py-0.5 font-semibold text-slate-200 border border-slate-700 text-[11px]">
                        {ev.event_type}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap text-slate-200">
                      {ev.username}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap text-slate-400">
                      {ev.source_ip}
                      {ev.destination_ip && (
                        <span className="text-slate-500"> → {ev.destination_ip}</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap text-slate-400">
                      {ev.hostname || ev.device_id || '–'}
                    </td>
                    <td className="px-5 py-3.5 text-slate-300 max-w-xs truncate">
                      {ev.description}
                    </td>
                    <td className="px-5 py-3.5 text-right whitespace-nowrap">
                      <button
                        onClick={() => setInspectedEvent(ev)}
                        className="rounded bg-slate-800 p-1.5 text-slate-400 hover:bg-slate-700 hover:text-cyan-400 transition-colors"
                        title="Inspect JSON Metadata"
                      >
                        <Code className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    No security events match the current filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="flex items-center justify-between border-t border-slate-800 bg-slate-900/60 px-6 py-3 font-mono text-xs">
          <div className="text-slate-400">
            Showing Page <span className="text-white font-bold">{page}</span> of{' '}
            <span className="text-white font-bold">{totalPages}</span> ({total} logs)
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="flex items-center gap-1 rounded border border-slate-700 bg-slate-800 px-2.5 py-1 text-slate-300 hover:bg-slate-700 disabled:opacity-40"
            >
              <ChevronLeft className="h-3.5 w-3.5" /> Previous
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="flex items-center gap-1 rounded border border-slate-700 bg-slate-800 px-2.5 py-1 text-slate-300 hover:bg-slate-700 disabled:opacity-40"
            >
              Next <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* JSON Metadata Inspection Modal */}
      {inspectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-lg rounded-2xl border border-slate-700 bg-[#090d18] p-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
              <div className="flex items-center gap-2">
                <Code className="h-4 w-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-white font-mono">
                  Event Telemetry #{inspectedEvent.id} Metadata
                </h3>
              </div>
              <button
                onClick={() => setInspectedEvent(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <pre className="max-h-80 overflow-y-auto rounded-lg bg-black/80 p-3.5 text-xs font-mono text-cyan-300 whitespace-pre-wrap leading-relaxed">
              {JSON.stringify(
                {
                  id: inspectedEvent.id,
                  timestamp: inspectedEvent.timestamp,
                  event_type: inspectedEvent.event_type,
                  username: inspectedEvent.username,
                  source_ip: inspectedEvent.source_ip,
                  destination_ip: inspectedEvent.destination_ip,
                  device_id: inspectedEvent.device_id,
                  hostname: inspectedEvent.hostname,
                  location: inspectedEvent.location,
                  severity: inspectedEvent.severity,
                  description: inspectedEvent.description,
                  metadata: inspectedEvent.metadata,
                },
                null,
                2
              )}
            </pre>

            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setInspectedEvent(null)}
                className="rounded-lg bg-slate-800 px-4 py-1.5 text-xs font-mono text-slate-300 hover:bg-slate-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
