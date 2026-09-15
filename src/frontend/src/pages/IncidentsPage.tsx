import React, { useEffect, useState } from 'react';
import {
  ShieldAlert,
  Search,
  RefreshCw,
  ArrowRight,
  Clock,
  User,
  Laptop,
} from 'lucide-react';
import { Incident } from '../types';
import { api } from '../services/api';
import { SeverityBadge } from '../components/SeverityBadge';

interface Props {
  onSelectIncident: (id: string) => void;
}

export const IncidentsPage: React.FC<Props> = ({ onSelectIncident }) => {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [severity, setSeverity] = useState('ALL');
  const [status, setStatus] = useState('ALL');
  const [attackType, setAttackType] = useState('ALL');

  const fetchIncidents = async () => {
    setLoading(true);
    try {
      const res = await api.getIncidents({
        search: search || undefined,
        severity: severity !== 'ALL' ? severity : undefined,
        status: status !== 'ALL' ? status : undefined,
        attack_type: attackType !== 'ALL' ? attackType : undefined,
      });
      setIncidents(res.incidents);
      setTotal(res.total);
    } catch (err) {
      console.error('Failed to fetch incidents:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchIncidents();
    }, 200);
    return () => clearTimeout(timeout);
  }, [search, severity, status, attackType]);

  const formatTime = (ts: string) => {
    try {
      const date = new Date(ts);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
    } catch (_) {
      return ts;
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-cyan-500/20 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white font-mono tracking-wider flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-cyan-400" />
            SECURITY INCIDENT TRIAGE QUEUE // ATT&CK CLUSTERS
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Correlated threat clusters grouped by behavioral heuristics and entity attributes
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="rounded-lg bg-slate-900/90 px-3 py-1.5 text-slate-300 border border-cyan-500/30">
            TOTAL CLUSTERS: <strong className="text-cyan-400">{total}</strong>
          </span>
          <button
            onClick={fetchIncidents}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-cyan-500/30 bg-slate-900 text-slate-300 hover:text-cyan-400 hover:border-cyan-400 transition-colors cursor-pointer"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 bg-[#090e18] border border-cyan-500/20 p-3.5 rounded-xl hacker-panel font-mono text-xs">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search title, user, asset, IP..."
            className="w-full rounded-lg border border-slate-700 bg-slate-950 pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
          />
        </div>

        {/* Severity */}
        <div>
          <select
            value={severity}
            onChange={(e) => setSeverity(e.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Severities</option>
            <option value="CRITICAL">CRITICAL</option>
            <option value="HIGH">HIGH</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="LOW">LOW</option>
          </select>
        </div>

        {/* Status */}
        <div>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            <option value="OPEN">OPEN</option>
            <option value="INVESTIGATING">INVESTIGATING</option>
            <option value="CONTAINED">CONTAINED</option>
            <option value="RESOLVED">RESOLVED</option>
          </select>
        </div>

        {/* Attack Type */}
        <div>
          <select
            value={attackType}
            onChange={(e) => setAttackType(e.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Attack Categories</option>
            <option value="Account Takeover">Account Takeover</option>
            <option value="Privilege Escalation">Privilege Escalation</option>
            <option value="Data Exfiltration">Data Exfiltration</option>
            <option value="Brute Force">Brute Force</option>
          </select>
        </div>
      </div>

      {/* Incidents Table */}
      <div className="rounded-xl border border-cyan-500/20 bg-[#090e18] shadow-sm overflow-hidden hacker-panel">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="border-b border-white/[0.08] bg-slate-950/80 text-slate-400 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-6 py-3.5">Severity</th>
                <th className="px-6 py-3.5">Incident Details</th>
                <th className="px-6 py-3.5">Risk Score</th>
                <th className="px-6 py-3.5">Target User</th>
                <th className="px-6 py-3.5">Target Host</th>
                <th className="px-6 py-3.5">First Seen</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-right">Investigation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04] text-slate-300">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-cyan-400">
                    <div className="flex items-center justify-center gap-2 text-xs font-bold font-mono">
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      FETCHING INCIDENT TELEMETRY CLUSTERS...
                    </div>
                  </td>
                </tr>
              ) : incidents.length > 0 ? (
                incidents.map((inc) => (
                  <tr
                    key={inc.id}
                    onClick={() => onSelectIncident(inc.id)}
                    className="cursor-pointer hover:bg-slate-900/80 transition-colors group"
                  >
                    <td className="px-6 py-3.5">
                      <SeverityBadge severity={inc.severity} size="sm" />
                    </td>

                    <td className="px-6 py-3.5">
                      <div>
                        <span className="font-bold text-white group-hover:text-cyan-400 transition-colors text-sm">
                          {inc.title}
                        </span>
                        <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-400">
                          <span className="font-mono text-cyan-400">{inc.id}</span>
                          <span>•</span>
                          <span className="rounded bg-slate-800 px-1.5 py-0.2 text-slate-300">
                            {inc.attack_type}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              inc.risk_score >= 80
                                ? 'bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.8)]'
                                : inc.risk_score >= 60
                                ? 'bg-orange-500'
                                : 'bg-yellow-500'
                            }`}
                            style={{ width: `${inc.risk_score}%` }}
                          />
                        </div>
                        <span className="font-bold text-red-400 font-mono">
                          {inc.risk_score}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-3.5">
                      <span className="flex items-center gap-1.5 text-slate-200">
                        <User className="h-3.5 w-3.5 text-slate-500" />
                        {inc.affected_user}
                      </span>
                    </td>

                    <td className="px-6 py-3.5">
                      <span className="flex items-center gap-1.5 text-cyan-300">
                        <Laptop className="h-3.5 w-3.5 text-slate-500" />
                        {inc.affected_asset}
                      </span>
                    </td>

                    <td className="px-6 py-3.5 text-slate-400">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-slate-500" />
                        {formatTime(inc.first_seen)}
                      </span>
                    </td>

                    <td className="px-6 py-3.5">
                      <span className="rounded bg-slate-800/90 px-2 py-0.5 text-[10px] font-bold text-slate-300 border border-slate-700">
                        {inc.status}
                      </span>
                    </td>

                    <td className="px-6 py-3.5 text-right">
                      <span className="inline-flex items-center gap-1 rounded bg-cyan-950/90 px-2.5 py-1 text-xs font-bold text-cyan-300 border border-cyan-600/60 group-hover:bg-cyan-900 transition-colors">
                        DETAILS <ArrowRight className="h-3 w-3" />
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    No security incidents match the current filter parameters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
