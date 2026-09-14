import React, { useEffect, useState } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  Activity,
  Layers,
  Search,
  ArrowUpRight,
  RefreshCw,
  Flame,
  Radio,
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
import { DashboardData, Incident } from '../types';
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
      <div className="flex min-h-[60vh] flex-col items-center justify-center space-y-3">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent"></div>
        <p className="font-mono text-sm text-cyan-400">Loading CyberSentinel Security Operations Center...</p>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="mx-auto max-w-2xl mt-12 rounded-xl border border-red-800 bg-red-950/40 p-6 text-center">
        <AlertTriangle className="mx-auto h-10 w-10 text-red-400 mb-3" />
        <h3 className="text-lg font-bold text-white font-mono">SOC Backend Connection Failed</h3>
        <p className="mt-2 text-sm text-slate-300">{error}</p>
        <button
          onClick={fetchDashboard}
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-red-800 px-4 py-2 text-xs font-mono font-bold text-white hover:bg-red-700"
        >
          <RefreshCw className="h-4 w-4" /> Retry
        </button>
      </div>
    );
  }

  const kpi = data?.kpi;

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner / Hero */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-950 via-[#0d1322] to-slate-950 p-6 shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-cyan-400 animate-ping"></span>
              <h1 className="text-2xl font-black tracking-tight text-white font-mono">
                AI SECURITY COMMAND CENTER
              </h1>
            </div>
            <p className="mt-1 text-sm text-slate-400 max-w-2xl">
              Autonomous continuous telemetry monitoring, multi-event correlation, explainable risk scoring, and prescriptive response actions.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onNavigateToSimulator}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-red-600 to-red-700 px-4 py-2.5 text-xs font-bold font-mono text-white shadow-[0_0_20px_rgba(239,68,68,0.4)] hover:from-red-500 hover:to-red-600 transition-all cursor-pointer"
            >
              <Flame className="h-4 w-4" />
              Launch Attack Simulator
            </button>
            <button
              onClick={fetchDashboard}
              title="Refresh Telemetry"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-700 bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Critical Incidents"
          value={kpi?.critical_incidents ?? 0}
          subtitle="Requires immediate containment"
          icon={<ShieldAlert className="h-6 w-6 text-red-400" />}
          variant="critical"
        />
        <StatCard
          title="High Risk Incidents"
          value={kpi?.high_risk_incidents ?? 0}
          subtitle="Score >= 60 in active queue"
          icon={<AlertTriangle className="h-6 w-6 text-orange-400" />}
          variant="warning"
        />
        <StatCard
          title="Events Today"
          value={kpi?.events_today?.toLocaleString() ?? '0'}
          subtitle="Processed security logs"
          icon={<Layers className="h-6 w-6 text-cyan-400" />}
          variant="info"
        />
        <StatCard
          title="Open Investigations"
          value={kpi?.open_investigations ?? 0}
          subtitle="Active SOC workflow items"
          icon={<Activity className="h-6 w-6 text-purple-400" />}
          variant="default"
        />
      </div>

      {/* Visualizations Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Events Volume Over Time (Area Chart) */}
        <div className="rounded-xl border border-slate-800 bg-[#0d1322]/90 p-5 shadow-lg backdrop-blur-md">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 mb-4">
            <div>
              <h3 className="text-sm font-bold text-white font-mono">
                Events Telemetry Stream (Past 12h)
              </h3>
              <p className="text-xs text-slate-400">Chronological ingestion rate</p>
            </div>
            <span className="rounded bg-slate-800 px-2 py-0.5 text-[11px] font-mono text-cyan-400">
              Real-time
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.events_over_time || []}>
                <defs>
                  <linearGradient id="eventGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00f0ff" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#00f0ff" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" stroke="#475569" fontSize={11} />
                <YAxis stroke="#475569" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#090d18', borderColor: '#1e293b', borderRadius: '8px', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="count" stroke="#00f0ff" strokeWidth={2} fillOpacity={1} fill="url(#eventGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Incidents by Severity (Donut Chart) */}
        <div className="rounded-xl border border-slate-800 bg-[#0d1322]/90 p-5 shadow-lg backdrop-blur-md">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 mb-4">
            <div>
              <h3 className="text-sm font-bold text-white font-mono">
                Incidents by Severity Breakdown
              </h3>
              <p className="text-xs text-slate-400">Active triage distribution</p>
            </div>
            <span className="rounded bg-slate-800 px-2 py-0.5 text-[11px] font-mono text-purple-400">
              Aggregated
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
                    paddingAngle={4}
                  >
                    {(data?.incidents_by_severity || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#090d18', borderColor: '#1e293b', borderRadius: '8px', fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="flex flex-col gap-2 font-mono text-xs">
              {(data?.incidents_by_severity || []).map((item) => (
                <div key={item.severity} className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-sm" style={{ backgroundColor: item.color }} />
                  <span className="text-slate-300 w-20">{item.severity}:</span>
                  <span className="text-white font-bold">{item.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Attack Types Distribution (Bar Chart) */}
        <div className="rounded-xl border border-slate-800 bg-[#0d1322]/90 p-5 shadow-lg backdrop-blur-md">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 mb-4">
            <div>
              <h3 className="text-sm font-bold text-white font-mono">
                Correlated Attack Classifications
              </h3>
              <p className="text-xs text-slate-400">Identified MITRE ATT&CK patterns</p>
            </div>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.attack_types || []} layout="vertical">
                <XAxis type="number" stroke="#475569" fontSize={11} />
                <YAxis dataKey="type" type="category" width={140} stroke="#94a3b8" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#090d18', borderColor: '#1e293b', borderRadius: '8px', fontSize: '12px' }}
                />
                <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Risk Score Distribution (Histogram) */}
        <div className="rounded-xl border border-slate-800 bg-[#0d1322]/90 p-5 shadow-lg backdrop-blur-md">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 mb-4">
            <div>
              <h3 className="text-sm font-bold text-white font-mono">
                Risk Score Distribution Buckets
              </h3>
              <p className="text-xs text-slate-400">Explainable risk index scoring</p>
            </div>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.risk_distribution || []}>
                <XAxis dataKey="range" stroke="#475569" fontSize={11} />
                <YAxis stroke="#475569" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#090d18', borderColor: '#1e293b', borderRadius: '8px', fontSize: '12px' }}
                />
                <Bar dataKey="count" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Critical & High Incidents Queue */}
      <div className="rounded-xl border border-slate-800 bg-[#0d1322]/90 shadow-xl overflow-hidden backdrop-blur-md">
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-red-400" />
            <h3 className="text-base font-bold text-white font-mono">
              Priority Threat Incidents
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">Click incident to open deep investigation</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="border-b border-slate-800 bg-slate-900/60 text-slate-400 uppercase">
              <tr>
                <th className="px-6 py-3">Severity</th>
                <th className="px-6 py-3">Incident Title</th>
                <th className="px-6 py-3">Risk Score</th>
                <th className="px-6 py-3">User</th>
                <th className="px-6 py-3">Asset</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {(data?.recent_critical_incidents || []).map((inc) => (
                <tr
                  key={inc.id}
                  onClick={() => onSelectIncident(inc.id)}
                  className="cursor-pointer hover:bg-[#11192e] transition-colors group"
                >
                  <td className="px-6 py-4">
                    <SeverityBadge severity={inc.severity} size="sm" />
                  </td>
                  <td className="px-6 py-4 font-semibold text-white group-hover:text-cyan-400 transition-colors">
                    {inc.title}
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-bold text-red-400 font-mono">
                      {inc.risk_score} / 100
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-300 font-medium">
                    {inc.affected_user}
                  </td>
                  <td className="px-6 py-4 text-slate-400">
                    {inc.affected_asset}
                  </td>
                  <td className="px-6 py-4">
                    <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] text-slate-300 border border-slate-700">
                      {inc.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="inline-flex items-center gap-1 rounded bg-cyan-950 px-2.5 py-1 text-[11px] font-bold text-cyan-400 border border-cyan-800/60 group-hover:bg-cyan-900/80 transition-colors">
                      Investigate <ArrowUpRight className="h-3 w-3" />
                    </span>
                  </td>
                </tr>
              ))}

              {(!data?.recent_critical_incidents || data.recent_critical_incidents.length === 0) && (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-slate-500">
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
