import React, { useState } from 'react';
import { FileText, Copy, Download, Check, X, Shield, Clock, User, Laptop } from 'lucide-react';
import { IncidentReport } from '../types';
import { SeverityBadge } from './SeverityBadge';

interface Props {
  report: IncidentReport | null;
  isOpen: boolean;
  onClose: () => void;
  loading: boolean;
}

export const IncidentReportModal: React.FC<Props> = ({
  report,
  isOpen,
  onClose,
  loading,
}) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'summary' | 'markdown'>('summary');

  if (!isOpen) return null;

  const handleCopy = () => {
    if (!report?.markdown) return;
    navigator.clipboard.writeText(report.markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadMarkdown = () => {
    if (!report?.markdown) return;
    const blob = new Blob([report.markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CyberSentinel-Report-${report.incident_id}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadJSON = () => {
    if (!report) return;
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CyberSentinel-Report-${report.incident_id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="relative flex flex-col max-h-[90vh] w-full max-w-4xl rounded-2xl border border-white/[0.1] bg-[#090d16] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/[0.08] bg-[#0f1623] px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-950/60 border border-sky-800/40 text-sky-400">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">
                SOC Incident Investigation Report
              </h2>
              <p className="text-xs text-slate-400">
                Incident Ref: <span className="font-mono text-slate-300">{report?.incident_id || 'Generating...'}</span> • TLP:AMBER
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* View Switcher */}
            <div className="flex rounded-lg bg-slate-900 p-1 border border-white/[0.06] text-xs">
              <button
                onClick={() => setActiveTab('summary')}
                className={`rounded px-3 py-1 font-medium transition-colors ${
                  activeTab === 'summary'
                    ? 'bg-slate-800 text-white font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Executive View
              </button>
              <button
                onClick={() => setActiveTab('markdown')}
                className={`rounded px-3 py-1 font-medium transition-colors ${
                  activeTab === 'markdown'
                    ? 'bg-slate-800 text-white font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Raw Markdown
              </button>
            </div>

            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-3">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-sky-400 border-t-transparent"></div>
              <p className="text-xs font-medium text-sky-400">Compiling SOC Incident Dossier...</p>
            </div>
          ) : report ? (
            activeTab === 'summary' ? (
              <div className="space-y-5">
                {/* Executive Header Card */}
                <div className="rounded-xl border border-white/[0.08] bg-[#0f1623] p-5 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.08] pb-3">
                    <h3 className="text-base font-bold text-white">
                      {report.title}
                    </h3>
                    <div className="flex items-center gap-2">
                      <SeverityBadge severity={report.severity} size="md" />
                      <span className="rounded-md bg-slate-800 px-2.5 py-1 text-xs font-mono font-semibold text-slate-300 border border-slate-700">
                        Risk: {report.risk_score}/100
                      </span>
                      <span className="rounded-md bg-slate-800 px-2.5 py-1 text-xs font-mono font-semibold text-sky-400 border border-slate-700">
                        Confidence: {report.confidence}%
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                    <div>
                      <span className="text-slate-500 font-medium flex items-center gap-1">
                        <User className="h-3 w-3" /> Impacted User:
                      </span>
                      <p className="text-slate-200 font-semibold mt-0.5">{report.affected_user}</p>
                    </div>
                    <div>
                      <span className="text-slate-500 font-medium flex items-center gap-1">
                        <Laptop className="h-3 w-3" /> Target Asset:
                      </span>
                      <p className="text-slate-200 font-semibold mt-0.5">{report.affected_asset}</p>
                    </div>
                    <div>
                      <span className="text-slate-500 font-medium flex items-center gap-1">
                        <Clock className="h-3 w-3" /> First Seen:
                      </span>
                      <p className="text-slate-200 font-semibold mt-0.5 font-mono text-[11px]">{report.first_seen}</p>
                    </div>
                    <div>
                      <span className="text-slate-500 font-medium">Status:</span>
                      <p className="text-sky-400 font-semibold mt-0.5">{report.status}</p>
                    </div>
                  </div>
                </div>

                {/* Threat Summary & Hypothesis */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="rounded-xl border border-white/[0.08] bg-[#0f1623] p-4 space-y-1.5">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Executive Summary
                    </h4>
                    <p className="text-xs text-slate-300 leading-relaxed font-normal">
                      {report.summary}
                    </p>
                  </div>

                  <div className="rounded-xl border border-white/[0.08] bg-[#0f1623] p-4 space-y-1.5">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Attack Hypothesis
                    </h4>
                    <p className="text-xs text-slate-300 leading-relaxed font-normal">
                      {report.attack_hypothesis}
                    </p>
                  </div>
                </div>

                {/* Risk Factor Evidence Table */}
                <div className="rounded-xl border border-white/[0.08] bg-[#0f1623] p-4 space-y-3">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Telemetry Risk Evidence Breakdown
                  </h4>
                  <div className="space-y-2">
                    {report.risk_factors.map((rf, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between rounded-lg bg-slate-900/60 px-3.5 py-2.5 border border-white/[0.06] text-xs"
                      >
                        <div className="min-w-0 pr-3">
                          <p className="font-semibold text-slate-200">{rf.indicator}</p>
                          <p className="text-[11px] text-slate-400 truncate">{rf.evidence}</p>
                        </div>
                        <span className="font-mono text-red-400 font-bold shrink-0 text-xs">
                          +{rf.contribution} pts
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              /* Raw Markdown View */
              <div className="rounded-xl border border-white/[0.08] bg-slate-950 p-4">
                <pre className="max-h-[60vh] overflow-y-auto text-xs font-mono text-slate-300 whitespace-pre-wrap leading-relaxed">
                  {report.markdown}
                </pre>
              </div>
            )
          ) : (
            <p className="text-slate-400 text-center py-10 text-xs">No report generated.</p>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.08] bg-[#0f1623] px-6 py-3.5">
          <div className="text-xs text-slate-400 flex items-center gap-1.5">
            <Shield className="h-4 w-4 text-sky-400" />
            <span>Audited & Formatted by CyberSentinel Engine</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              disabled={!report}
              className="flex items-center gap-1.5 rounded-lg border border-white/[0.1] bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-700 transition-colors cursor-pointer"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? 'Copied!' : 'Copy Markdown'}
            </button>

            <button
              onClick={handleDownloadMarkdown}
              disabled={!report}
              className="flex items-center gap-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 px-3 py-1.5 text-xs font-medium text-white transition-colors cursor-pointer"
            >
              <Download className="h-3.5 w-3.5" />
              Download .md
            </button>

            <button
              onClick={handleDownloadJSON}
              disabled={!report}
              className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-700 transition-colors cursor-pointer"
            >
              <Download className="h-3.5 w-3.5" />
              Download JSON
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
