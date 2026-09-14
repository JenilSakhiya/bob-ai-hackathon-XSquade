import React from 'react';
import {
  ShieldAlert,
  Activity,
  Terminal,
  Cpu,
  Layers,
  Flame,
  Radio,
} from 'lucide-react';
import { SystemStatus } from '../types';

interface Props {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  systemStatus?: SystemStatus;
}

export const Navbar: React.FC<Props> = ({ activeTab, onSelectTab, systemStatus }) => {
  const isCritical = systemStatus?.threat_level === 'CRITICAL';

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/90 bg-[#070a12]/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left: Branding */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => onSelectTab('dashboard')}>
          <div className="relative flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-600/30 border border-cyan-500/40 text-cyan-400 shadow-[0_0_15px_rgba(0,240,255,0.25)]">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-black tracking-wider text-white font-mono">
                CYBER<span className="text-cyan-400">SENTINEL</span>
              </span>
              <span className="rounded bg-cyan-950/60 px-1.5 py-0.5 text-[10px] font-bold font-mono tracking-widest text-cyan-400 border border-cyan-800/40">
                AI SOC
              </span>
            </div>
            <p className="text-[11px] font-medium tracking-wide text-slate-400">
              AI Security Command Center
            </p>
          </div>
        </div>

        {/* Center: Navigation */}
        <nav className="hidden md:flex items-center space-x-1">
          <button
            onClick={() => onSelectTab('dashboard')}
            className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold uppercase tracking-wider transition-all duration-150 font-mono ${
              activeTab === 'dashboard'
                ? 'bg-slate-800/80 text-cyan-400 border border-cyan-500/30 shadow-[0_0_10px_rgba(0,240,255,0.15)]'
                : 'text-slate-400 hover:bg-slate-850 hover:text-slate-200'
            }`}
          >
            <Activity className="h-4 w-4" />
            Dashboard
          </button>

          <button
            onClick={() => onSelectTab('incidents')}
            className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold uppercase tracking-wider transition-all duration-150 font-mono ${
              activeTab === 'incidents'
                ? 'bg-slate-800/80 text-cyan-400 border border-cyan-500/30 shadow-[0_0_10px_rgba(0,240,255,0.15)]'
                : 'text-slate-400 hover:bg-slate-850 hover:text-slate-200'
            }`}
          >
            <ShieldAlert className="h-4 w-4" />
            Incidents
          </button>

          <button
            onClick={() => onSelectTab('events')}
            className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold uppercase tracking-wider transition-all duration-150 font-mono ${
              activeTab === 'events'
                ? 'bg-slate-800/80 text-cyan-400 border border-cyan-500/30 shadow-[0_0_10px_rgba(0,240,255,0.15)]'
                : 'text-slate-400 hover:bg-slate-850 hover:text-slate-200'
            }`}
          >
            <Layers className="h-4 w-4" />
            Events
          </button>

          <button
            onClick={() => onSelectTab('simulator')}
            className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold uppercase tracking-wider transition-all duration-150 font-mono ${
              activeTab === 'simulator'
                ? 'bg-red-950/50 text-red-400 border border-red-600/50 shadow-[0_0_12px_rgba(239,68,68,0.25)]'
                : 'text-red-400/80 hover:bg-red-950/30 hover:text-red-300'
            }`}
          >
            <Flame className="h-4 w-4" />
            Attack Simulator
          </button>
        </nav>

        {/* Right: Telemetry Status Badges */}
        <div className="flex items-center gap-3 font-mono text-xs">
          {/* System Status */}
          <div className="hidden sm:flex items-center gap-1.5 rounded-md border border-emerald-900/60 bg-emerald-950/40 px-2.5 py-1 text-emerald-400">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
            </span>
            <span className="text-[11px] font-bold">
              SYS: {systemStatus?.system_status || 'OPERATIONAL'}
            </span>
          </div>

          {/* AI Status */}
          <div className="hidden sm:flex items-center gap-1.5 rounded-md border border-purple-900/60 bg-purple-950/40 px-2.5 py-1 text-purple-300">
            <Cpu className="h-3.5 w-3.5 text-purple-400" />
            <span className="text-[11px] font-bold">
              AI: {systemStatus?.ai_status || 'READY'}
            </span>
          </div>

          {/* Threat Level */}
          <div
            className={`flex items-center gap-1.5 rounded-md border px-2.5 py-1 ${
              isCritical
                ? 'border-red-700/80 bg-red-950/60 text-red-400 animate-pulse'
                : 'border-orange-800/60 bg-orange-950/40 text-orange-400'
            }`}
          >
            <Radio className="h-3.5 w-3.5" />
            <span className="text-[11px] font-bold tracking-wide">
              THREAT: {systemStatus?.threat_level || 'ELEVATED'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
