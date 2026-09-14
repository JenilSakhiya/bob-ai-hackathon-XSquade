import React, { useState } from 'react';
import { FileText, Copy, Download, Check, X, Printer, Shield } from 'lucide-react';
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
      <div className="relative flex flex-col max-h-[90vh] w-full max-w-4xl rounded-2xl border border-slate-700/80 bg-[#090d18] shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 bg-[#0d1322] px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-950/70 border border-cyan-700/60 text-cyan-400">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white font-mono">
                Official Incident Report
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                ID: {report?.incident_id || 'Generating...'} • Classification: TLP:AMBER
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-3">
              <div className="h-10 w-10 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent"></div>
              <p className="text-sm font-mono text-cyan-400">Compiling SOC Incident Report...</p>
            </div>
          ) : report ? (
            <div className="space-y-6">
              {/* Executive Header Card */}
              <div className="rounded-xl border border-slate-800 bg-[#0d1322] p-5">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3 mb-4">
                  <h3 className="text-lg font-bold text-white font-mono">
                    {report.title}
                  </h3>
                  <div className="flex items-center gap-2">
                    <SeverityBadge severity={report.severity} size="md" />
                    <span className="rounded bg-slate-800 px-2.5 py-1 text-xs font-mono text-slate-300 border border-slate-700">
                      Risk: {report.risk_score}/100
                    </span>
                    <span className="rounded bg-slate-800 px-2.5 py-1 text-xs font-mono text-cyan-400 border border-slate-700">
                      Confidence: {report.confidence}%
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
                  <div>
                    <span className="text-slate-500">Affected User:</span>
                    <p className="text-slate-200 font-semibold">{report.affected_user}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Asset/Host:</span>
                    <p className="text-slate-200 font-semibold">{report.affected_asset}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">First Seen:</span>
                    <p className="text-slate-200 font-semibold">{report.first_seen}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Status:</span>
                    <p className="text-cyan-400 font-semibold">{report.status}</p>
                  </div>
                </div>
              </div>

              {/* Threat Summary & Hypothesis */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-xl border border-slate-800 bg-[#0d1322] p-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono mb-2">
                    Executive Summary
                  </h4>
                  <p className="text-xs text-slate-200 leading-relaxed">
                    {report.summary}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-800 bg-[#0d1322] p-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono mb-2">
                    Attack Hypothesis
                  </h4>
                  <p className="text-xs text-slate-200 leading-relaxed">
                    {report.attack_hypothesis}
                  </p>
                </div>
              </div>

              {/* Risk Factor Evidence Table */}
              <div className="rounded-xl border border-slate-800 bg-[#0d1322] p-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono mb-3">
                  Telemetry Risk Evidence Breakdown
                </h4>
                <div className="space-y-2">
                  {report.risk_factors.map((rf, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between rounded-lg bg-slate-900/80 px-3 py-2 border border-slate-800 text-xs"
                    >
                      <span className="font-semibold text-slate-200">{rf.indicator}</span>
                      <span className="text-slate-400 truncate max-w-md mx-2">{rf.evidence}</span>
                      <span className="font-mono text-red-400 font-bold shrink-0">+{rf.contribution} pts</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Raw Markdown Preview Tab */}
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono text-slate-400">Raw Markdown Export View</span>
                </div>
                <pre className="max-h-56 overflow-y-auto text-[11px] font-mono text-slate-300 p-3 rounded bg-black/60 whitespace-pre-wrap leading-relaxed">
                  {report.markdown}
                </pre>
              </div>
            </div>
          ) : (
            <p className="text-slate-400 text-center py-10">No report available.</p>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-800 bg-[#0d1322] px-6 py-3.5">
          <div className="text-xs text-slate-400 font-mono flex items-center gap-1.5">
            <Shield className="h-4 w-4 text-cyan-400" />
            Generated by CyberSentinel AI Engine
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              disabled={!report}
              className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-mono text-slate-200 hover:bg-slate-700 transition-colors"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? 'Copied!' : 'Copy Markdown'}
            </button>

            <button
              onClick={handleDownloadMarkdown}
              disabled={!report}
              className="flex items-center gap-1.5 rounded-lg border border-cyan-700/60 bg-cyan-950/60 px-3 py-1.5 text-xs font-mono text-cyan-300 hover:bg-cyan-900/60 transition-colors"
            >
              <Download className="h-3.5 w-3.5" />
              Download .md
            </button>

            <button
              onClick={handleDownloadJSON}
              disabled={!report}
              className="flex items-center gap-1.5 rounded-lg border border-purple-700/60 bg-purple-950/60 px-3 py-1.5 text-xs font-mono text-purple-300 hover:bg-purple-900/60 transition-colors"
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
