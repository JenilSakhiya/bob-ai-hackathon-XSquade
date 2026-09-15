import React, { useState, useRef, useEffect } from 'react';
import {
  Flame,
  Play,
  RefreshCw,
  Terminal,
  ArrowRight,
  CheckCircle2,
  Lock,
  Zap,
  RotateCcw,
  Layers,
  Radio,
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
    }, 200);
  };

  const handleSimulateFullAttack = async () => {
    setRunningSimulation('full');
    setError(null);
    try {
      const res = await api.simulateFullAttack();
      animateSteps(res);
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
    } catch (err: any) {
      setError(err.message || 'Simulation failed.');
      setRunningSimulation(null);
    }
  };

  const handleReset = async () => {
    if (!window.confirm('Reset all telemetry logs and incidents back to clean seed baseline?')) return;
    try {
      if (intervalRef.current) clearInterval(intervalRef.current);
      await api.resetTelemetry();
      setSimulationResult(null);
      setVisibleSteps([]);
    } catch (err: any) {
      setError(err.message || 'Reset failed.');
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-cyan-500/20 pb-4 font-mono">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-wider flex items-center gap-2">
            <Flame className="h-5 w-5 text-red-500 animate-pulse" />
            ADVERSARY ATTACK SIMULATOR // THREAT INJECTION ENGINE
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Simulate realistic adversary behaviors, evaluate detection rules, and verify automated multi-vector correlation
          </p>
        </div>

        <button
          onClick={handleReset}
          className="flex items-center gap-1.5 rounded-lg border border-cyan-500/30 bg-slate-900 px-3 py-1.5 text-xs font-bold text-slate-300 hover:text-white hover:border-cyan-400 transition-colors cursor-pointer"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          RESET TO BASELINE
        </button>
      </div>

      {/* Error Alert if any */}
      {error && (
        <div className="rounded-xl border border-red-800/80 bg-red-950/40 p-3.5 text-xs font-mono text-red-300 flex items-center gap-2">
          <span>Simulation Error: {error}</span>
        </div>
      )}

      {/* Pipeline Stage Visualization */}
      <div className="rounded-xl border border-cyan-500/20 bg-[#090e18] p-4 hidden md:block hacker-panel font-mono text-xs">
        <div className="flex items-center justify-between text-slate-400">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-cyan-950 border border-cyan-500/40 text-cyan-400 font-bold text-[11px]">1</span>
            <span className="font-bold text-slate-200">1. Log Packet Emission</span>
          </div>
          <ArrowRight className="h-3.5 w-3.5 text-slate-600" />
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-950 border border-amber-500/40 text-amber-400 font-bold text-[11px]">2</span>
            <span className="font-bold text-slate-200">2. Heuristic Rule Engine</span>
          </div>
          <ArrowRight className="h-3.5 w-3.5 text-slate-600" />
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-950 border border-purple-500/40 text-purple-400 font-bold text-[11px]">3</span>
            <span className="font-bold text-slate-200">3. Graph Entity Correlation</span>
          </div>
          <ArrowRight className="h-3.5 w-3.5 text-slate-600" />
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-red-950 border border-red-500/40 text-red-400 font-bold text-[11px]">4</span>
            <span className="font-bold text-slate-200">4. Risk Point Scoring & Incident</span>
          </div>
        </div>
      </div>

      {/* Primary Demo Scenario Card */}
      <div className="relative overflow-hidden rounded-xl border border-red-600/80 bg-gradient-to-br from-red-950/40 via-[#090e18] to-[#090e18] p-5 sm:p-6 hacker-panel-critical shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="flex items-center gap-2 font-mono">
              <span className="rounded bg-red-950/90 px-2 py-0.5 text-[10px] font-black tracking-widest text-red-300 border border-red-600 uppercase shadow-sm">
                PRIMARY HACKATHON DEMO SCENARIO
              </span>
              <span className="text-xs text-slate-400">• EXPECTED RISK SCORE: 90–100 CRITICAL</span>
            </div>

            <h2 className="text-lg sm:text-xl font-black text-white font-mono tracking-tight">
              Possible Account Takeover + Privilege Escalation + Data Exfiltration
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-mono">
              Injects a 9-event coordinated APT attack chain against user <code className="text-cyan-400 font-bold">admin01</code>.
              CyberSentinel evaluates detection rules, correlates disparate events across identity, privilege, and network egress,
              and generates a single unified CRITICAL incident.
            </p>

            <div className="pt-1 flex flex-wrap gap-2 text-[11px] font-mono text-slate-400">
              <span className="rounded bg-slate-900 border border-slate-800 px-2 py-0.5">
                09:10 Brute Force Failures
              </span>
              <span className="rounded bg-slate-900 border border-slate-800 px-2 py-0.5">
                09:12 Login Success
              </span>
              <span className="rounded bg-slate-900 border border-slate-800 px-2 py-0.5">
                09:13 Anomalous Device ID
              </span>
              <span className="rounded bg-slate-900 border border-slate-800 px-2 py-0.5">
                09:16 Priv Escalation
              </span>
              <span className="rounded bg-slate-900 border border-slate-800 px-2 py-0.5">
                09:22 8 GB Exfiltration
              </span>
            </div>
          </div>

          <div className="shrink-0 self-start lg:self-center font-mono">
            <button
              onClick={handleSimulateFullAttack}
              disabled={!!runningSimulation}
              className="flex items-center gap-2.5 rounded-xl bg-gradient-to-r from-red-600 via-red-500 to-orange-600 hover:from-red-500 hover:to-orange-500 px-6 py-4 text-xs font-black tracking-wider text-white shadow-[0_0_20px_rgba(239,68,68,0.5)] transition-all disabled:opacity-50 cursor-pointer"
            >
              <Flame className={`h-4 w-4 ${runningSimulation === 'full' ? 'animate-spin' : ''}`} />
              {runningSimulation === 'full' ? 'EXECUTING ATTACK CHAIN...' : 'SIMULATE FULL ATTACK CHAIN'}
            </button>
          </div>
        </div>
      </div>

      {/* Secondary Scenario Trigger Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono">
        {/* Brute Force */}
        <div className="rounded-xl border border-cyan-500/20 bg-[#090e18] p-4 flex flex-col justify-between space-y-3 hacker-panel">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <Lock className="h-4 w-4 text-orange-400" />
              <h3 className="text-xs font-bold text-white uppercase">
                Brute Force Spray
              </h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed font-normal">
              Injects 6 rapid authentication failures across SSH/Kerberos services to trigger BRUTE_FORCE_SUSPECTED.
            </p>
          </div>
          <button
            onClick={handleSimulateBruteForce}
            disabled={!!runningSimulation}
            className="flex items-center justify-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900 hover:bg-slate-800 px-3 py-2 text-xs font-bold text-slate-200 transition-colors disabled:opacity-50 cursor-pointer"
          >
            <Play className="h-3 w-3" />
            SIMULATE BRUTE FORCE
          </button>
        </div>

        {/* Account Takeover */}
        <div className="rounded-xl border border-cyan-500/20 bg-[#090e18] p-4 flex flex-col justify-between space-y-3 hacker-panel">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <Zap className="h-4 w-4 text-amber-400" />
              <h3 className="text-xs font-bold text-white uppercase">
                Account Takeover
              </h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed font-normal">
              Simulates authentication failures followed by login success from an unrecognized device ID.
            </p>
          </div>
          <button
            onClick={handleSimulateAccountTakeover}
            disabled={!!runningSimulation}
            className="flex items-center justify-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900 hover:bg-slate-800 px-3 py-2 text-xs font-bold text-slate-200 transition-colors disabled:opacity-50 cursor-pointer"
          >
            <Play className="h-3 w-3" />
            SIMULATE TAKEOVER
          </button>
        </div>

        {/* Data Exfiltration */}
        <div className="rounded-xl border border-cyan-500/20 bg-[#090e18] p-4 flex flex-col justify-between space-y-3 hacker-panel">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <Layers className="h-4 w-4 text-purple-400" />
              <h3 className="text-xs font-bold text-white uppercase">
                Data Exfiltration
              </h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed font-normal">
              Simulates staging of encrypted archives (7z.exe) and abnormal outbound egress of 3.5 GB.
            </p>
          </div>
          <button
            onClick={handleSimulateDataExfiltration}
            disabled={!!runningSimulation}
            className="flex items-center justify-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900 hover:bg-slate-800 px-3 py-2 text-xs font-bold text-slate-200 transition-colors disabled:opacity-50 cursor-pointer"
          >
            <Play className="h-3 w-3" />
            SIMULATE EXFILTRATION
          </button>
        </div>
      </div>

      {/* Live Simulation Output Console */}
      <div className="rounded-xl border border-cyan-500/30 bg-[#060a12] shadow-sm overflow-hidden hacker-panel font-mono">
        <div className="flex items-center justify-between border-b border-cyan-500/20 bg-[#090e18] px-5 py-3">
          <div className="flex items-center gap-2">
            <Terminal className="h-4 w-4 text-cyan-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              LIVE THREAT EMISSION & CORRELATION TERMINAL
            </h3>
          </div>
          {runningSimulation && (
            <span className="flex items-center gap-2 text-xs text-cyan-400 font-bold">
              <RefreshCw className="h-3 w-3 animate-spin" />
              PROCESSING DETECTION RULES...
            </span>
          )}
        </div>

        <div className="p-4 min-h-[220px] max-h-[380px] overflow-y-auto space-y-2 text-xs">
          {visibleSteps.length === 0 && !runningSimulation && (
            <div className="text-slate-500 text-center py-12 text-xs font-mono">
              [SYSTEM IDLE] Select an adversary attack scenario above to stream live event generation and automated AI correlation.
            </div>
          )}

          {visibleSteps && visibleSteps.filter(Boolean).map((step, idx) => (
            <div
              key={idx}
              className="flex items-start gap-3 rounded bg-slate-950/90 border border-slate-800 p-2.5 transition-all"
            >
              <span className="text-cyan-400 font-bold shrink-0">{step?.time_offset || '+00:00'}</span>
              <span className="rounded bg-slate-900 px-2 py-0.2 text-purple-300 border border-purple-900/60 text-[11px] font-bold shrink-0">
                {step?.event_type || 'EVENT'}
              </span>
              <span className="text-slate-300 flex-1 text-xs">{step?.description || ''}</span>
              <span className="text-emerald-400 text-[11px] shrink-0 font-bold flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" /> EMITTED
              </span>
            </div>
          ))}
        </div>

        {/* Result Callout when finished */}
        {simulationResult?.incident && (
          <div className="border-t border-cyan-500/20 bg-[#090e18] p-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-xl border border-red-600/80 bg-red-950/40 p-4">
              <div className="flex items-center gap-4">
                <RiskScoreMeter score={simulationResult.incident.risk_score} size={75} strokeWidth={7} />
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <SeverityBadge severity={simulationResult.incident.severity} size="sm" />
                    <span className="text-xs font-bold text-white">
                      {simulationResult.incident.title}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Risk Score: <strong className="text-red-400 font-mono">{simulationResult.incident.risk_score}/100</strong> • 
                    Events: <strong className="text-white font-mono">{simulationResult.events_generated}</strong> • 
                    Target: <strong className="text-cyan-300 font-mono">{simulationResult.incident.affected_user}</strong>
                  </p>
                </div>
              </div>

              <button
                onClick={() => onSelectIncident(simulationResult.incident!.id)}
                className="flex items-center gap-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 px-4 py-2 text-xs font-black text-slate-950 shadow-[0_0_12px_rgba(0,229,255,0.4)] transition-colors cursor-pointer shrink-0"
              >
                INVESTIGATE CREATED INCIDENT <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
