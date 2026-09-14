import React, { useEffect, useState } from 'react';
import {
  ShieldAlert,
  Search,
  Filter,
  RefreshCw,
  ArrowUpRight,
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
    }, 250);
    return () => clearTimeout(timeout);
  }, [search, severity, status, attackType]);

  const formatTime = (ts: string) => {
    try {
      const date = new Date(ts);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
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
            <ShieldAlert className="h-6 w-6 text-cyan-400" />
            Security Incidents Queue
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Correlated threat clusters grouped by behavioral heuristics and entity attributes
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="rounded bg-slate-800 px-3 py-1.5 text-slate-300 border border-slate-700">
            Total Detected: <strong className="text-cyan-400">{total}</strong>
          </span>
          <button
            onClick={fetchIncidents}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 bg-[#0d1322]/80 border border-slate-800 p-3.5 rounded-xl backdrop-blur-md">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search title, user, asset..."
            className="w-full rounded-lg border border-slate-700/80 bg-[#090d18] pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
          />
        </div>

        {/* Severity */}
        <div>
          <select
            value={severity}
            onChange={(e) => setSeverity(e.target.value)}
            className="w-full rounded-lg border border-slate-700/80 bg-[#090d18] px-3 py-2 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none font-mono"
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
            className="w-full rounded-lg border border-slate-700/80 bg-[#090d18] px-3 py-2 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none font-mono"
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
            className="w-full rounded-lg border border-slate-700/80 bg-[#090d18] px-3 py-2 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none font-mono"
          >
            <option value="ALL">All Attack Types</option>
            <option value="Account Takeover">Account Takeover</option>
            <option value="Privilege Escalation">Privilege Escalation</option>
            <option value="Data Exfiltration">Data Exfiltration</option>
            <option value="Brute Force">Brute Force</option>
          </select>
        </div>
      </div>

      {/* Incidents Table */}
      <div className="rounded-xl border border-slate-800 bg-[#0d1322]/90 shadow-xl overflow-hidden backdrop-blur-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="border-b border-slate-800 bg-slate-900/80 text-slate-400 uppercase">
              <tr>
                <th className="px-6 py-3.5">Severity</th>
                <th className="px-6 py-3.5">Incident</th>
                <th className="px-6 py-3.5">Risk Score</th>
                <th className="px-6 py-3.5">User</th>
                <th className="px-6 py-3.5">Asset</th>
                <th className="px-6 py-3.5">First Seen</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-right">Investigation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-cyan-400">
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Loading incident telemetry...
                    </div>
                  </td>
                </tr>
              ) : incidents.length > 0 ? (
                incidents.map((inc) => (
                  <tr
                    key={inc.id}
                    onClick={() => onSelectIncident(inc.id)}
                    className="cursor-pointer hover:bg-[#11192e] transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <SeverityBadge severity={inc.severity} size="sm" />
                    </td>

                    <td className="px-6 py-4">
                      <div>
                        <span className="font-semibold text-white group-hover:text-cyan-400 transition-colors text-sm">
                          {inc.title}
                        </span>
                        <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
                          <span className="text-slate-500 font-mono">{inc.id}</span>
                          <span>•</span>
                          <span className="rounded bg-slate-800 px-1.5 py-0.2 text-slate-300">
                            {inc.attack_type}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-12 bg-slate-800 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              inc.risk_score >= 80
                                ? 'bg-red-500'
                                : inc.risk_score >= 60
                                ? 'bg-orange-500'
                                : 'bg-yellow-500'
                            }`}
                            style={{ width: `${inc.risk_score}%` }}
                          />
                        </div>
                        <span
                          className={`font-bold font-mono ${
                            inc.risk_score >= 80
                              ? 'text-red-400'
                              : inc.risk_score >= 60
                              ? 'text-orange-400'
                              : 'text-yellow-400'
                          }`}
                        >
                          {inc.risk_score}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span className="flex items-center gap-1.5 text-slate-200">
                        <User className="h-3.5 w-3.5 text-slate-500" />
                        {inc.affected_user}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <span className="flex items-center gap-1.5 text-slate-300">
                        <Laptop className="h-3.5 w-3.5 text-slate-500" />
                        {inc.affected_asset}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-slate-400">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5 text-slate-500" />
                        {formatTime(inc.first_seen)}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <span className="rounded bg-slate-800 px-2 py-0.5 text-[11px] text-slate-300 border border-slate-700">
                        {inc.status}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <span className="inline-flex items-center gap-1 rounded bg-cyan-950 px-2.5 py-1 text-[11px] font-bold text-cyan-400 border border-cyan-800/60 group-hover:bg-cyan-900 transition-colors">
                        View Details <ArrowUpRight className="h-3 w-3" />
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    No security incidents detected.
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
