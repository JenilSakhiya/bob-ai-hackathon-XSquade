import React, { useState, useRef, useEffect } from 'react';
import {
  Flame,
  Play,
  RefreshCw,
  Terminal,
  ArrowRight,
  CheckCircle2,
  Lock,
  ArrowUpRight,
  Zap,
  RotateCcw,
} from 'lucide-react';
import { SimulationResult, SimulationStep } from '../types';
import { api } from '../services/api';
import { SeverityBadge } from '../components/SeverityBadge';
import { RiskScoreMeter } from '../components/RiskScoreMeter';

interface Props {
  onSelectIncident: (id: string) => void;
}

export const SimulatorPage: React.FC<Props> = ({ onSelectIncident }) => {
  const [runningSimulation, setRunningSimulation] = useState<string | null>(null);
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null);
  const [visibleSteps, setVisibleSteps] = useState<SimulationStep[]>([]);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<any>(null);

  // Clear interval on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Helper to stream steps sequentially for realistic interactive demo effect
  const animateSteps = (result: SimulationResult) => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    if (!result || !result.steps || !Array.isArray(result.steps) || result.steps.length === 0) {
      setVisibleSteps([]);
      setSimulationResult(result);
      setRunningSimulation(null);
      return;
    }

    setVisibleSteps([]);
    setSimulationResult(null);

    const stepsToAnimate = [...result.steps];
    let currentIndex = 0;

    intervalRef.current = setInterval(() => {
      if (currentIndex < stepsToAnimate.length) {
        const nextStep = stepsToAnimate[currentIndex];
        if (nextStep) {
          setVisibleSteps((prev) => [...prev, nextStep]);
        }
        currentIndex++;
      } else {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
        setSimulationResult(result);
        setRunningSimulation(null);
      }
    }, 250); // fast crisp streaming
  };

  const handleSimulateFullAttack = async () => {
    setRunningSimulation('full');
    setError(null);
    setStatusMessage('Executing primary demo scenario: multi-stage attack sequence...');
    try {
      const res = await api.simulateFullAttack();
      animateSteps(res);
      setStatusMessage(res.message);
    } catch (err: any) {
      setError(err.message || 'Simulation execution failed.');
      setRunningSimulation(null);
    }
  };

  const handleSimulateBruteForce = async () => {
    setRunningSimulation('brute');
    setError(null);
    try {
      const res = await api.simulateBruteForce();
      animateSteps(res);
      setStatusMessage(res.message);
    } catch (err: any) {
      setError(err.message || 'Simulation failed.');
      setRunningSimulation(null);
    }
  };

  const handleSimulateAccountTakeover = async () => {
    setRunningSimulation('takeover');
    setError(null);
    try {
      const res = await api.simulateAccountTakeover();
      animateSteps(res);
      setStatusMessage(res.message);
    } catch (err: any) {
      setError(err.message || 'Simulation failed.');
      setRunningSimulation(null);
    }
  };

  const handleSimulateDataExfiltration = async () => {
    setRunningSimulation('exfil');
    setError(null);
    try {
      const res = await api.simulateDataExfiltration();
      animateSteps(res);
      setStatusMessage(res.message);
    } catch (err: any) {
      setError(err.message || 'Simulation failed.');
      setRunningSimulation(null);
    }
  };

  const handleReset = async () => {
    if (!window.confirm('Reset all telemetry and incidents back to clean seed baseline?')) return;
    try {
      if (intervalRef.current) clearInterval(intervalRef.current);
      await api.resetTelemetry();
      setSimulationResult(null);
      setVisibleSteps([]);
      setStatusMessage('Telemetry successfully reset to clean demo baseline.');
    } catch (err: any) {
      setError(err.message || 'Reset failed.');
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-black text-white font-mono tracking-wide flex items-center gap-2">
            <Flame className="h-6 w-6 text-red-500 animate-pulse" />
            Attack Simulation & Threat Engine
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Simulate realistic adversary behaviors, test real-time detection rules, and correlate multi-stage campaigns
          </p>
        </div>

        <button
          onClick={handleReset}
          className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-1.5 text-xs font-mono text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Reset to Clean Baseline
        </button>
      </div>

      {/* Error display if any */}
      {error && (
        <div className="rounded-xl border border-red-800 bg-red-950/40 p-4 text-xs font-mono text-red-300 flex items-center gap-2">
          <span>Error: {error}</span>
        </div>
      )}

      {/* Primary Demo Scenario Card */}
      <div className="relative overflow-hidden rounded-2xl border-2 border-red-700/80 bg-gradient-to-br from-red-950/40 via-[#0d1322] to-slate-900/90 p-6 shadow-[0_0_30px_rgba(239,68,68,0.2)]">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="rounded bg-red-950 px-2 py-0.5 text-[11px] font-bold font-mono tracking-widest text-red-400 border border-red-700">
                PRIMARY HACKATHON DEMO
              </span>
              <span className="text-xs font-mono text-slate-400">• Expected Risk: 90–100 CRITICAL</span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-white font-mono tracking-tight">
              Possible Account Takeover + Privilege Escalation + Data Exfiltration
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Injects a 9-event coordinated APT attack chain against user <code className="text-cyan-400">admin01</code>.
              CyberSentinel evaluates detection rules, correlates disparate events across identity, privilege, and network egress,
              and generates a single unified CRITICAL incident.
            </p>

            <div className="pt-2 flex flex-wrap gap-2 text-[11px] font-mono text-slate-400">
              <span className="rounded bg-slate-900/90 border border-slate-800 px-2 py-0.5">
                09:10 Brute Force Failures
              </span>
              <span className="rounded bg-slate-900/90 border border-slate-800 px-2 py-0.5">
                09:12 Login Success
              </span>
              <span className="rounded bg-slate-900/90 border border-slate-800 px-2 py-0.5">
                09:13 New Device
              </span>
              <span className="rounded bg-slate-900/90 border border-slate-800 px-2 py-0.5">
                09:16 Priv Escalation
              </span>
              <span className="rounded bg-slate-900/90 border border-slate-800 px-2 py-0.5">
                09:22 8 GB Exfiltration
              </span>
            </div>
          </div>

          <div className="shrink-0 self-start lg:self-center">
            <button
              onClick={handleSimulateFullAttack}
              disabled={!!runningSimulation}
              className="flex items-center gap-3 rounded-xl bg-gradient-to-r from-red-600 via-red-500 to-orange-600 px-6 py-4 text-sm font-black font-mono tracking-wider text-white shadow-[0_0_25px_rgba(239,68,68,0.5)] hover:from-red-500 hover:to-orange-500 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 cursor-pointer"
            >
              <Flame className={`h-5 w-5 ${runningSimulation === 'full' ? 'animate-spin' : ''}`} />
              {runningSimulation === 'full' ? 'SIMULATING ATTACK...' : 'SIMULATE FULL ATTACK CHAIN'}
            </button>
          </div>
        </div>
      </div>

      {/* Individual Scenario Trigger Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Brute Force */}
        <div className="rounded-xl border border-slate-800 bg-[#0d1322] p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Lock className="h-4 w-4 text-orange-400" />
              <h3 className="text-sm font-bold text-white font-mono">
                Brute Force Spray
              </h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Simulates 6 rapid authentication failures across SSH/Kerberos services to trigger BRUTE_FORCE_SUSPECTED.
            </p>
          </div>
          <button
            onClick={handleSimulateBruteForce}
            disabled={!!runningSimulation}
            className="flex items-center justify-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-mono font-bold text-slate-200 hover:bg-slate-700 hover:text-white transition-colors disabled:opacity-50 cursor-pointer"
          >
            <Play className="h-3.5 w-3.5" />
            Simulate Brute Force
          </button>
        </div>

        {/* Account Takeover */}
        <div className="rounded-xl border border-slate-800 bg-[#0d1322] p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Zap className="h-4 w-4 text-yellow-400" />
              <h3 className="text-sm font-bold text-white font-mono">
                Account Takeover
              </h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Simulates authentication failures followed by login success from an unmanaged, anomalous device ID.
            </p>
          </div>
          <button
            onClick={handleSimulateAccountTakeover}
            disabled={!!runningSimulation}
            className="flex items-center justify-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-mono font-bold text-slate-200 hover:bg-slate-700 hover:text-white transition-colors disabled:opacity-50 cursor-pointer"
          >
            <Play className="h-3.5 w-3.5" />
            Simulate Account Takeover
          </button>
        </div>

        {/* Data Exfiltration */}
        <div className="rounded-xl border border-slate-800 bg-[#0d1322] p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <ArrowUpRight className="h-4 w-4 text-purple-400" />
              <h3 className="text-sm font-bold text-white font-mono">
                Data Exfiltration
              </h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Simulates staging of encrypted archives (7z.exe) and abnormal large-scale outbound network egress (3.5 GB).
            </p>
          </div>
          <button
            onClick={handleSimulateDataExfiltration}
            disabled={!!runningSimulation}
            className="flex items-center justify-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-mono font-bold text-slate-200 hover:bg-slate-700 hover:text-white transition-colors disabled:opacity-50 cursor-pointer"
          >
            <Play className="h-3.5 w-3.5" />
            Simulate Exfiltration
          </button>
        </div>
      </div>

      {/* Live Simulation Output Console */}
      <div className="rounded-xl border border-slate-800 bg-[#070a12] shadow-xl overflow-hidden font-mono">
        <div className="flex items-center justify-between border-b border-slate-800 bg-[#0d1322] px-5 py-3">
          <div className="flex items-center gap-2">
            <Terminal className="h-4 w-4 text-cyan-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Live Threat Simulation & Correlation Stream
            </h3>
          </div>
          {runningSimulation && (
            <span className="flex items-center gap-2 text-xs text-cyan-400">
              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
              Processing Rule Engine...
            </span>
          )}
        </div>

        <div className="p-5 min-h-[220px] max-h-[380px] overflow-y-auto space-y-2 text-xs">
          {visibleSteps.length === 0 && !runningSimulation && (
            <div className="text-slate-500 text-center py-12">
              Select an attack simulation above to observe live event generation, detection, and AI correlation.
            </div>
          )}

          {visibleSteps && visibleSteps.filter(Boolean).map((step, idx) => (
            <div
              key={idx}
              className="flex items-start gap-3 rounded bg-slate-950/80 border border-slate-850 p-2.5 transition-all"
            >
              <span className="text-cyan-400 font-bold shrink-0">{step?.time_offset || '+00:00'}</span>
              <span className="rounded bg-slate-900 px-2 py-0.2 text-purple-400 border border-purple-900/60 font-semibold shrink-0">
                {step?.event_type || 'EVENT'}
              </span>
              <span className="text-slate-300 flex-1">{step?.description || ''}</span>
              <span className="text-emerald-400 text-[10px] shrink-0 font-semibold flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" /> EMITTED
              </span>
            </div>
          ))}
        </div>

        {/* Result Callout when finished */}
        {simulationResult?.incident && (
          <div className="border-t border-slate-800 bg-[#0d1322] p-5">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-xl border border-red-700/80 bg-red-950/40 p-4">
              <div className="flex items-center gap-4">
                <RiskScoreMeter score={simulationResult.incident.risk_score} size={80} strokeWidth={8} />
                <div>
                  <div className="flex items-center gap-2">
                    <SeverityBadge severity={simulationResult.incident.severity} size="sm" />
                    <span className="text-xs font-bold text-white">
                      {simulationResult.incident.title}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1">
                    Risk Score: <strong className="text-red-400">{simulationResult.incident.risk_score}/100</strong> • 
                    Events: <strong className="text-white">{simulationResult.events_generated}</strong> • 
                    User: <strong className="text-cyan-400">{simulationResult.incident.affected_user}</strong>
                  </p>
                </div>
              </div>

              <button
                onClick={() => onSelectIncident(simulationResult.incident!.id)}
                className="flex items-center gap-2 rounded-xl bg-cyan-500 px-4 py-2 text-xs font-bold font-mono text-slate-950 hover:bg-cyan-400 transition-colors shadow-[0_0_15px_rgba(0,240,255,0.3)] shrink-0 cursor-pointer"
              >
                Investigate Created Incident <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
