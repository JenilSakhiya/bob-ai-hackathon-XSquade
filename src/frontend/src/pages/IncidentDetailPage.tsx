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
  AlertOctagon,
  Compass,
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
      <div className="flex min-h-[60vh] flex-col items-center justify-center space-y-3 font-mono">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent shadow-[0_0_12px_rgba(0,229,255,0.4)]"></div>
        <p className="text-xs font-bold text-cyan-400">CORRELATING INCIDENT EVIDENCE & TELEMETRY...</p>
      </div>
    );
  }

  if (error || !incident) {
    return (
      <div className="mx-auto max-w-lg mt-12 rounded-xl border border-red-800/80 bg-red-950/40 p-6 text-center font-mono">
        <AlertOctagon className="mx-auto h-8 w-8 text-red-400 mb-2" />
        <h3 className="text-base font-black text-white">INCIDENT RECORD NOT FOUND</h3>
        <p className="mt-1 text-xs text-slate-300">{error || 'Could not load incident details.'}</p>
        <button
          onClick={onBack}
          className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-slate-800 px-4 py-2 text-xs font-bold text-white hover:bg-slate-700 transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> RETURN TO QUEUE
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Top Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-cyan-500/20 pb-4 font-mono text-xs">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 rounded-lg border border-cyan-500/30 bg-slate-900 px-3 py-1.5 font-bold text-slate-300 hover:text-cyan-400 hover:border-cyan-400 transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          RETURN TO TRIAGE QUEUE
        </button>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* AI SOC Chat Trigger */}
          <button
            onClick={() => setIsChatOpen(true)}
            className="flex items-center gap-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 px-3.5 py-1.5 font-black text-slate-950 shadow-[0_0_12px_rgba(0,229,255,0.4)] transition-all cursor-pointer"
          >
            <Bot className="h-4 w-4" />
            ASK CYBERSENTINEL AI
          </button>

          {/* Incident Report Trigger */}
          <button
            onClick={handleOpenReport}
            className="flex items-center gap-1.5 rounded-lg border border-purple-700/60 bg-purple-950/60 hover:bg-purple-900/60 px-3.5 py-1.5 font-bold text-purple-300 transition-all cursor-pointer"
          >
            <FileText className="h-4 w-4 text-purple-400" />
            GENERATE SOC REPORT
          </button>

          {/* Re-Investigate */}
          <button
            onClick={handleTriggerInvestigation}
            disabled={investigating}
            title="Re-run AI correlation & investigation"
            className="flex items-center gap-1.5 rounded-lg border border-white/[0.1] bg-slate-850 px-3 py-1.5 font-bold text-slate-300 hover:bg-slate-800 hover:text-white transition-colors disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${investigating ? 'animate-spin' : ''}`} />
            {investigating ? 'RE-EVALUATING...' : 'RE-EVALUATE'}
          </button>
        </div>
      </div>

      {/* Incident Header Dossier Card */}
      <div className="relative overflow-hidden rounded-xl border border-cyan-500/20 bg-[#090e18] p-5 sm:p-6 hacker-panel shadow-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 flex-1">
            <div className="flex flex-wrap items-center gap-2 font-mono">
              <SeverityBadge severity={incident.severity} size="lg" />
              <span className="text-xs font-bold text-cyan-300 bg-cyan-950/80 border border-cyan-700/60 px-2.5 py-0.5 rounded">
                ID: {incident.id}
              </span>
              <span className="text-xs text-slate-300 bg-slate-800/80 border border-slate-700/60 px-2.5 py-0.5 rounded font-bold">
                ATT&CK PATTERN: {incident.attack_type}
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-white font-mono tracking-tight leading-snug">
              {incident.title}
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 max-w-4xl leading-relaxed font-mono">
              {incident.description}
            </p>

            {/* Status Dropdown */}
            <div className="pt-1 flex items-center gap-2.5 font-mono text-xs">
              <span className="text-slate-400 font-bold">INCIDENT WORKFLOW:</span>
              <select
                value={incident.status}
                onChange={(e) => handleStatusChange(e.target.value as IncidentStatus)}
                className="rounded-lg border border-cyan-500/40 bg-slate-950 px-3 py-1 font-bold text-cyan-400 focus:border-cyan-400 focus:outline-none cursor-pointer"
              >
                <option value="OPEN">OPEN</option>
                <option value="INVESTIGATING">INVESTIGATING</option>
                <option value="CONTAINED">CONTAINED</option>
                <option value="RESOLVED">RESOLVED</option>
              </select>
            </div>
          </div>

          {/* Risk Gauge & Summary Stats */}
          <div className="flex items-center gap-6 self-start lg:self-center shrink-0 border-t lg:border-t-0 lg:border-l border-white/[0.08] pt-4 lg:pt-0 lg:pl-8 font-mono">
            <RiskScoreMeter score={incident.risk_score} size={110} strokeWidth={9} />

            <div className="space-y-1.5 text-xs">
              <div className="text-slate-400">SEVERITY RATING</div>
              <div className="text-sm font-black text-white uppercase">{incident.severity}</div>
              <div className="text-[11px] text-slate-400">
                AI CONFIDENCE: <strong className="text-cyan-400">{incident.confidence}%</strong>
              </div>
              <div className="text-[11px] text-slate-400">
                CORRELATED LOGS: <strong className="text-white">{incident.events.length}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout (Full Width) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left Column (2 Cols on Desktop) */}
        <div className="lg:col-span-2 space-y-5">
          {/* AI Assessment Card */}
          <RiskExplanationCard
            summary={incident.ai_summary}
            hypothesis={incident.attack_hypothesis}
            whyDangerous={incident.why_dangerous}
            riskFactors={incident.risk_factors}
            confidence={incident.confidence}
          />

          {/* Visual Attack Timeline */}
          <div className="rounded-xl border border-cyan-500/20 bg-[#090e18] p-5 hacker-panel space-y-4">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <div className="flex items-center gap-2 font-mono">
                <Clock className="h-4 w-4 text-cyan-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                  ATTACK SEQUENCE TIMELINE // {incident.events.length} LOG EVENTS
                </h3>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">
                CHRONOLOGICAL RECONSTRUCTION
              </span>
            </div>

            <TimelineView events={incident.events} />
          </div>
        </div>

        {/* Right Column (1 Col on Desktop) */}
        <div className="space-y-5">
          {/* Impacted Assets & Identity Card */}
          <div className="rounded-xl border border-cyan-500/20 bg-[#090e18] p-5 hacker-panel space-y-3">
            <div className="flex items-center gap-2 border-b border-white/[0.08] pb-3 font-mono">
              <Laptop className="h-4 w-4 text-cyan-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                TARGET ENTITY DOSSIER
              </h3>
            </div>

            <div className="space-y-2.5 text-xs font-mono">
              <div className="rounded-lg border border-slate-800 bg-slate-950 p-3 space-y-0.5">
                <span className="text-slate-500 text-[11px]">PRIMARY USER IDENTITY:</span>
                <p className="text-xs font-bold text-white flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 text-cyan-400" />
                  {incident.affected_user}
                </p>
              </div>

              <div className="rounded-lg border border-slate-800 bg-slate-950 p-3 space-y-0.5">
                <span className="text-slate-500 text-[11px]">TARGET HOSTNAME / ASSET:</span>
                <p className="text-xs font-bold text-white flex items-center gap-1.5 text-purple-300">
                  <Laptop className="h-3.5 w-3.5 text-purple-400" />
                  {incident.affected_asset}
                </p>
              </div>

              <div className="rounded-lg border border-slate-800 bg-slate-950 p-3 space-y-1">
                <span className="text-slate-500 text-[11px]">OBSERVED IP ENDPOINTS:</span>
                <p className="text-xs text-slate-200 flex items-center gap-1.5">
                  <Globe className="h-3 w-3 text-slate-400" />
                  Source: {incident.events[0]?.source_ip || '198.51.100.23'}
                </p>
                {incident.events.some((e) => e.destination_ip) && (
                  <p className="text-xs text-red-400 flex items-center gap-1.5">
                    <Radio className="h-3 w-3 text-red-400" />
                    Egress Target: {incident.events.find((e) => e.destination_ip)?.destination_ip}
                  </p>
                )}
              </div>

              <div className="rounded-lg border border-slate-800 bg-slate-950 p-3 space-y-0.5 text-[11px]">
                <span className="text-slate-500">TEMPORAL WINDOW:</span>
                <p className="text-slate-300">
                  First Seen: {new Date(incident.first_seen).toLocaleTimeString()}
                </p>
                <p className="text-slate-300">
                  Last Seen: {new Date(incident.last_seen).toLocaleTimeString()}
                </p>
              </div>
            </div>
          </div>

          {/* Response Actions Playbook */}
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
