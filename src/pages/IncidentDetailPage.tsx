import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  Bot,
  FileText,
  RefreshCw,
  User,
  Laptop,
  Globe,
  Radio,
  Clock,
  ShieldCheck,
  AlertOctagon,
  Sparkles,
} from 'lucide-react';
import { IncidentDetail, IncidentReport, ActionStatus, IncidentStatus } from '../types';
import { api } from '../services/api';
import { SeverityBadge } from '../components/SeverityBadge';
import { RiskScoreMeter } from '../components/RiskScoreMeter';
import { TimelineView } from '../components/TimelineView';
import { RiskExplanationCard } from '../components/RiskExplanationCard';
import { ActionRecommendations } from '../components/ActionRecommendations';
import { ChatDrawer } from '../components/ChatDrawer';
import { IncidentReportModal } from '../components/IncidentReportModal';

interface Props {
  incidentId: string;
  onBack: () => void;
}

export const IncidentDetailPage: React.FC<Props> = ({ incidentId, onBack }) => {
  const [incident, setIncident] = useState<IncidentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [investigating, setInvestigating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Chat & Report Modals
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [report, setReport] = useState<IncidentReport | null>(null);
  const [reportLoading, setReportLoading] = useState(false);

  const fetchIncident = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getIncident(incidentId);
      setIncident(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch incident details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncident();
  }, [incidentId]);

  const handleStatusChange = async (newStatus: IncidentStatus) => {
    try {
      await api.updateIncidentStatus(incidentId, newStatus);
      fetchIncident();
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const handleActionStatusChange = async (actionId: number, newStatus: ActionStatus) => {
    try {
      await api.updateActionStatus(incidentId, actionId, newStatus);
      fetchIncident();
    } catch (err) {
      console.error('Failed to update action:', err);
    }
  };

  const handleTriggerInvestigation = async () => {
    setInvestigating(true);
    try {
      await api.triggerInvestigation(incidentId);
      await fetchIncident();
    } catch (err) {
      console.error('Investigation failed:', err);
    } finally {
      setInvestigating(false);
    }
  };

  const handleOpenReport = async () => {
    setIsReportOpen(true);
    setReportLoading(true);
    try {
      const rep = await api.generateReport(incidentId);
      setReport(rep);
    } catch (err) {
      console.error('Failed to generate report:', err);
    } finally {
      setReportLoading(false);
    }
  };

  if (loading && !incident) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center space-y-3">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent"></div>
        <p className="font-mono text-sm text-cyan-400">Loading incident investigation telemetry...</p>
      </div>
    );
  }

  if (error || !incident) {
    return (
      <div className="mx-auto max-w-xl mt-12 rounded-xl border border-red-800 bg-red-950/40 p-6 text-center">
        <AlertOctagon className="mx-auto h-10 w-10 text-red-400 mb-3" />
        <h3 className="text-lg font-bold text-white font-mono">Incident Not Found</h3>
        <p className="mt-2 text-sm text-slate-300">{error || 'Could not load incident details.'}</p>
        <button
          onClick={onBack}
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-slate-800 px-4 py-2 text-xs font-mono font-bold text-white hover:bg-slate-700"
        >
          <ArrowLeft className="h-4 w-4" /> Return to Queue
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-16">
      {/* Back Button & Action Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900/80 px-3 py-1.5 text-xs font-mono font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Incidents
        </button>

        <div className="flex flex-wrap items-center gap-2">
          {/* AI SOC Chat Trigger */}
          <button
            onClick={() => setIsChatOpen(true)}
            className="flex items-center gap-1.5 rounded-lg border border-cyan-600/70 bg-cyan-950/70 px-3.5 py-1.5 text-xs font-mono font-bold text-cyan-300 shadow-[0_0_12px_rgba(0,240,255,0.25)] hover:bg-cyan-900/80 transition-all cursor-pointer"
          >
            <Bot className="h-4 w-4 text-cyan-400" />
            Ask CyberSentinel AI
          </button>

          {/* Incident Report Trigger */}
          <button
            onClick={handleOpenReport}
            className="flex items-center gap-1.5 rounded-lg border border-purple-600/70 bg-purple-950/70 px-3.5 py-1.5 text-xs font-mono font-bold text-purple-300 hover:bg-purple-900/80 transition-all cursor-pointer"
          >
            <FileText className="h-4 w-4 text-purple-400" />
            Generate Incident Report
          </button>

          {/* Re-Investigate */}
          <button
            onClick={handleTriggerInvestigation}
            disabled={investigating}
            title="Re-run AI correlation & investigation"
            className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-mono text-slate-300 hover:bg-slate-700 hover:text-white transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${investigating ? 'animate-spin' : ''}`} />
            {investigating ? 'Analyzing...' : 'Re-Investigate'}
          </button>
        </div>
      </div>

      {/* Incident Header Card */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-[#0d1322] p-6 shadow-2xl backdrop-blur-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 flex-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <SeverityBadge severity={incident.severity} size="lg" />
              <span className="font-mono text-xs font-bold text-cyan-400 bg-cyan-950/80 border border-cyan-800/60 px-2.5 py-1 rounded">
                ID: {incident.id}
              </span>
              <span className="font-mono text-xs text-slate-400 bg-slate-850 border border-slate-800 px-2.5 py-1 rounded">
                Type: {incident.attack_type}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight leading-tight">
              {incident.title}
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
              {incident.description}
            </p>

            {/* Status Dropdown */}
            <div className="pt-2 flex items-center gap-3 font-mono text-xs">
              <span className="text-slate-400">Investigation Status:</span>
              <select
                value={incident.status}
                onChange={(e) => handleStatusChange(e.target.value as IncidentStatus)}
                className="rounded-lg border border-slate-700 bg-[#090d18] px-3 py-1 font-bold text-cyan-400 focus:border-cyan-500 focus:outline-none"
              >
                <option value="OPEN">OPEN</option>
                <option value="INVESTIGATING">INVESTIGATING</option>
                <option value="CONTAINED">CONTAINED</option>
                <option value="RESOLVED">RESOLVED</option>
              </select>
            </div>
          </div>

          {/* Risk Gauge & Confidence */}
          <div className="flex items-center gap-6 self-start lg:self-center shrink-0 border-t lg:border-t-0 lg:border-l border-slate-800/80 pt-4 lg:pt-0 lg:pl-8">
            <RiskScoreMeter score={incident.risk_score} size={110} strokeWidth={9} />

            <div className="space-y-1 font-mono text-xs">
              <div className="text-slate-400">Severity Assessment</div>
              <div className="text-sm font-bold text-white uppercase">{incident.severity}</div>
              <div className="text-[11px] text-slate-400">
                AI Confidence: <strong className="text-cyan-400">{incident.confidence}%</strong>
              </div>
              <div className="text-[11px] text-slate-400">
                Correlated Events: <strong className="text-white">{incident.events.length}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols wide on LG) */}
        <div className="lg:col-span-2 space-y-6">
          {/* AI Assessment / Why is this dangerous? */}
          <RiskExplanationCard
            summary={incident.ai_summary}
            hypothesis={incident.attack_hypothesis}
            whyDangerous={incident.why_dangerous}
            riskFactors={incident.risk_factors}
            confidence={incident.confidence}
          />

          {/* Visual Attack Timeline */}
          <div className="rounded-xl border border-slate-800 bg-[#0d1322]/90 p-5 shadow-lg backdrop-blur-md">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-5">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-cyan-400" />
                <h3 className="text-base font-bold text-white font-mono">
                  Attack Sequence Timeline
                </h3>
              </div>
              <span className="text-xs font-mono text-slate-400">
                {incident.events.length} Telemetry Steps Correlated
              </span>
            </div>

            <TimelineView events={incident.events} />
          </div>
        </div>

        {/* Right Column (1 Col wide on LG) */}
        <div className="space-y-6">
          {/* Affected Assets & Identity Card */}
          <div className="rounded-xl border border-slate-800 bg-[#0d1322]/90 p-5 shadow-lg backdrop-blur-md">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3 mb-4">
              <Laptop className="h-5 w-5 text-cyan-400" />
              <h3 className="text-base font-bold text-white font-mono">
                Impacted Assets & Identity
              </h3>
            </div>

            <div className="space-y-3.5 text-xs font-mono">
              <div className="rounded-lg border border-slate-800/80 bg-[#090d18] p-3">
                <span className="text-slate-500 text-[11px]">Primary Target Identity:</span>
                <p className="text-sm font-bold text-white mt-0.5 flex items-center gap-1.5">
                  <User className="h-4 w-4 text-cyan-400" />
                  {incident.affected_user}
                </p>
              </div>

              <div className="rounded-lg border border-slate-800/80 bg-[#090d18] p-3">
                <span className="text-slate-500 text-[11px]">Target Endpoint Hostname:</span>
                <p className="text-sm font-bold text-white mt-0.5 flex items-center gap-1.5">
                  <Laptop className="h-4 w-4 text-purple-400" />
                  {incident.affected_asset}
                </p>
              </div>

              <div className="rounded-lg border border-slate-800/80 bg-[#090d18] p-3">
                <span className="text-slate-500 text-[11px]">Observed IP Addresses:</span>
                <p className="text-xs text-slate-200 mt-1 flex items-center gap-1.5">
                  <Globe className="h-3.5 w-3.5 text-slate-400" />
                  Source: {incident.events[0]?.source_ip || '198.51.100.23'}
                </p>
                {incident.events.some((e) => e.destination_ip) && (
                  <p className="text-xs text-red-400 mt-0.5 flex items-center gap-1.5">
                    <Radio className="h-3.5 w-3.5 text-red-400" />
                    Egress Target: {incident.events.find((e) => e.destination_ip)?.destination_ip}
                  </p>
                )}
              </div>

              <div className="rounded-lg border border-slate-800/80 bg-[#090d18] p-3">
                <span className="text-slate-500 text-[11px]">Temporal Horizon:</span>
                <p className="text-xs text-slate-300 mt-1">
                  First Seen: {new Date(incident.first_seen).toLocaleTimeString()}
                </p>
                <p className="text-xs text-slate-300">
                  Last Seen: {new Date(incident.last_seen).toLocaleTimeString()}
                </p>
              </div>
            </div>
          </div>

          {/* Response Actions */}
          <ActionRecommendations
            actions={incident.actions}
            onUpdateStatus={handleActionStatusChange}
          />
        </div>
      </div>

      {/* AI SOC Chat Drawer */}
      <ChatDrawer
        incidentId={incident.id}
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
      />

      {/* Incident Report Modal */}
      <IncidentReportModal
        report={report}
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        loading={reportLoading}
      />
    </div>
  );
};
