import React, { useEffect, useState } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  Activity,
  ScrollText,
  ArrowRight,
  RefreshCw,
  Flame,
  Radio,
  Terminal,
  Cpu,
  Layers,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from 'recharts';
import { DashboardData } from '../types';
import { api } from '../services/api';
import { StatCard } from '../components/StatCard';
import { SeverityBadge } from '../components/SeverityBadge';

interface Props {
  onSelectIncident: (id: string) => void;
  onNavigateToSimulator: () => void;
}

export const DashboardPage: React.FC<Props> = ({
  onSelectIncident,
  onNavigateToSimulator,
}) => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getDashboard();
      setData(res);
    } catch (err: any) {
      setError(err.message || 'Failed to connect to CyberSentinel backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading && !data) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center space-y-3 font-mono">
        <div className="h-9 w-9 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent shadow-[0_0_15px_rgba(0,229,255,0.4)]"></div>
        <p className="text-xs font-bold text-cyan-400">INITIALIZING SOC TELEMETRY MATRIX...</p>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="mx-auto max-w-xl mt-12 rounded-xl border border-red-800/80 bg-red-950/40 p-6 text-center font-mono">
        <AlertTriangle className="mx-auto h-8 w-8 text-red-400 mb-2 animate-bounce" />
        <h3 className="text-base font-black text-white">SOC BACKEND TELEMETRY OFFLINE</h3>
        <p className="mt-1 text-xs text-slate-300">{error}</p>
        <button
          onClick={fetchDashboard}
          className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-red-800 hover:bg-red-700 px-4 py-2 text-xs font-bold text-white transition-colors cursor-pointer"
        >
          <RefreshCw className="h-3.5 w-3.5" /> RECONNECT
        </button>
      </div>
    );
  }

  const kpi = data?.kpi;

  return (
    <div className="space-y-5">
      {/* Top Tactical Command Banner */}
      <div className="relative overflow-hidden rounded-xl border border-cyan-500/20 bg-[#090e18] p-5 hacker-panel">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(0,229,255,0.8)]"></span>
              <h1 className="text-lg sm:text-xl font-black font-mono tracking-wider text-white">
                SECURITY OPERATIONS COMMAND CENTER // TELEMETRY GRID
              </h1>
            </div>
            <p className="text-xs text-slate-400 font-mono max-w-3xl leading-relaxed">
              Real-time log ingestion, deterministic rule correlation, point-based additive risk scoring, and prescriptive automated defense playbooks.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 font-mono">
            <button
              onClick={onNavigateToSimulator}
              className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 px-4 py-2 text-xs font-black tracking-wider text-white shadow-[0_0_15px_rgba(239,68,68,0.35)] transition-all cursor-pointer"
            >
              <Flame className="h-4 w-4" />
              LAUNCH ATTACK SIMULATOR
            </button>
            <button
              onClick={fetchDashboard}
              title="Refresh Telemetry"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-cyan-500/30 bg-slate-900 text-slate-300 hover:text-cyan-400 hover:border-cyan-400 transition-colors cursor-pointer"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Critical Incidents"
          value={kpi?.critical_incidents ?? 0}
          subtitle="Immediate containment required"
          icon={<ShieldAlert className="h-5 w-5 text-red-400" />}
          variant="critical"
        />
        <StatCard
          title="High Risk Threats"
          value={kpi?.high_risk_incidents ?? 0}
          subtitle="Risk score ≥ 60 in active queue"
          icon={<AlertTriangle className="h-5 w-5 text-amber-400" />}
          variant="warning"
        />
        <StatCard
          title="Events Streamed"
          value={kpi?.events_today?.toLocaleString() ?? '0'}
          subtitle="Processed security log records"
          icon={<ScrollText className="h-5 w-5 text-cyan-400" />}
          variant="info"
        />
        <StatCard
          title="Correlated Clusters"
          value={kpi?.open_investigations ?? 0}
          subtitle="Multi-vector attack chains"
          icon={<Activity className="h-5 w-5 text-purple-400" />}
          variant="default"
        />
      </div>

      {/* Telemetry Visualizations Grid (2x2 Full Width) */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Events Volume Over Time (Area Chart) */}
        <div className="rounded-xl border border-cyan-500/20 bg-[#090e18] p-4 sm:p-5 hacker-panel space-y-3">
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
            <div>
              <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-white flex items-center gap-1.5">
                <span className="text-cyan-400">//</span> Log Ingestion Rate (Past 12h Stream)
              </h3>
              <p className="text-[11px] text-slate-400 font-mono">Chronological event ingestion throughput</p>
            </div>
            <span className="rounded bg-cyan-950/80 px-2 py-0.5 text-[10px] font-bold font-mono text-cyan-400 border border-cyan-800/60">
              LIVE TELEMETRY
            </span>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.events_over_time || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="eventAreaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00e5ff" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#00e5ff" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" stroke="#475569" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#475569" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#060a12',
                    borderColor: 'rgba(0, 229, 255, 0.3)',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontFamily: 'monospace',
                    color: '#00e5ff',
                  }}
                />
                <Area type="monotone" dataKey="count" stroke="#00e5ff" strokeWidth={2} fillOpacity={1} fill="url(#eventAreaGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Incidents by Severity (Donut Chart) */}
        <div className="rounded-xl border border-cyan-500/20 bg-[#090e18] p-4 sm:p-5 hacker-panel space-y-3">
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
            <div>
              <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-white flex items-center gap-1.5">
                <span className="text-cyan-400">//</span> Severity Classification Matrix
              </h3>
              <p className="text-[11px] text-slate-400 font-mono">Active security triage breakdown</p>
            </div>
            <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-bold font-mono text-slate-300 border border-slate-700">
              CLUSTER POSTURE
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-around h-64">
            <div className="h-56 w-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data?.incidents_by_severity || []}
                    dataKey="count"
                    nameKey="severity"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                  >
                    {(data?.incidents_by_severity || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#060a12',
                      borderColor: 'rgba(0, 229, 255, 0.3)',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontFamily: 'monospace',
                      color: '#f8fafc',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="flex flex-col gap-2.5 font-mono text-xs">
              {(data?.incidents_by_severity || []).map((item) => (
                <div key={item.severity} className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-slate-300 w-24 font-bold">{item.severity}:</span>
                  <span className="text-white font-black text-sm">{item.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Attack Types Distribution (Bar Chart) */}
        <div className="rounded-xl border border-cyan-500/20 bg-[#090e18] p-4 sm:p-5 hacker-panel space-y-3">
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
            <div>
              <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-white flex items-center gap-1.5">
                <span className="text-cyan-400">//</span> Correlated Attack Classifications
              </h3>
              <p className="text-[11px] text-slate-400 font-mono">Identified MITRE ATT&CK patterns</p>
            </div>
          </div>

          <div className="h-56 w-full pt-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.attack_types || []} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                <XAxis type="number" stroke="#475569" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis dataKey="type" type="category" width={140} stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#060a12',
                    borderColor: 'rgba(0, 229, 255, 0.3)',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontFamily: 'monospace',
                    color: '#f8fafc',
                  }}
                />
                <Bar dataKey="count" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Risk Score Distribution (Histogram) */}
        <div className="rounded-xl border border-cyan-500/20 bg-[#090e18] p-4 sm:p-5 hacker-panel space-y-3">
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
            <div>
              <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-white flex items-center gap-1.5">
                <span className="text-cyan-400">//</span> Risk Score Distribution Buckets
              </h3>
              <p className="text-[11px] text-slate-400 font-mono">Explainable 0–100 threat weight density</p>
            </div>
          </div>

          <div className="h-56 w-full pt-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.risk_distribution || []} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <XAxis dataKey="range" stroke="#475569" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#475569" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#060a12',
                    borderColor: 'rgba(0, 229, 255, 0.3)',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontFamily: 'monospace',
                    color: '#f8fafc',
                  }}
                />
                <Bar dataKey="count" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Priority Threat Incidents Queue Table */}
      <div className="rounded-xl border border-cyan-500/20 bg-[#090e18] shadow-sm overflow-hidden hacker-panel">
        <div className="flex items-center justify-between border-b border-white/[0.08] px-6 py-4">
          <div className="flex items-center gap-2 font-mono">
            <ShieldAlert className="h-4 w-4 text-red-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
              PRIORITY THREAT INCIDENT MATRIX
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-mono text-[11px]">
            SELECT TARGET TO LAUNCH DEEP INVESTIGATION
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="border-b border-white/[0.08] bg-slate-950/80 text-slate-400 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-6 py-3.5">Severity</th>
                <th className="px-6 py-3.5">Incident Title</th>
                <th className="px-6 py-3.5">Risk Score</th>
                <th className="px-6 py-3.5">Target Identity</th>
                <th className="px-6 py-3.5">Host / Asset</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-right">Investigation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04] text-slate-300">
              {(data?.recent_critical_incidents || []).map((inc) => (
                <tr
                  key={inc.id}
                  onClick={() => onSelectIncident(inc.id)}
                  className="cursor-pointer hover:bg-slate-900/80 transition-colors group"
                >
                  <td className="px-6 py-3.5">
                    <SeverityBadge severity={inc.severity} size="sm" />
                  </td>
                  <td className="px-6 py-3.5 font-bold text-white group-hover:text-cyan-400 transition-colors">
                    {inc.title}
                  </td>
                  <td className="px-6 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            inc.risk_score >= 80
                              ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]'
                              : inc.risk_score >= 60
                              ? 'bg-orange-500'
                              : 'bg-yellow-500'
                          }`}
                          style={{ width: `${inc.risk_score}%` }}
                        />
                      </div>
                      <span className="font-bold text-red-400">
                        {inc.risk_score} / 100
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-3.5 text-slate-200">
                    {inc.affected_user}
                  </td>
                  <td className="px-6 py-3.5 text-cyan-300 text-[11px]">
                    {inc.affected_asset}
                  </td>
                  <td className="px-6 py-3.5">
                    <span className="rounded bg-slate-800/90 px-2 py-0.5 text-[10px] font-bold text-slate-300 border border-slate-700">
                      {inc.status}
                    </span>
                  </td>
                  <td className="px-6 py-3.5 text-right">
                    <span className="inline-flex items-center gap-1 rounded bg-cyan-950/90 px-2.5 py-1 text-xs font-bold text-cyan-300 border border-cyan-600/60 group-hover:bg-cyan-900 transition-colors">
                      INVESTIGATE <ArrowRight className="h-3 w-3" />
                    </span>
                  </td>
                </tr>
              ))}

              {(!data?.recent_critical_incidents || data.recent_critical_incidents.length === 0) && (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-slate-500">
                    No active threat incidents detected in current telemetry window.
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
