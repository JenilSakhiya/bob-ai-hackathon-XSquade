import React, { useState, useEffect } from 'react';
import {
  Shield,
  LayoutDashboard,
  ShieldAlert,
  ScrollText,
  Flame,
  Radio,
  Clock,
  Cpu,
  Terminal,
} from 'lucide-react';
import { SystemStatus } from '../types';

interface Props {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  systemStatus?: SystemStatus;
}

export const Navbar: React.FC<Props> = ({ activeTab, onSelectTab, systemStatus }) => {
  const [timeString, setTimeString] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeString(
        now.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        })
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const isCritical = systemStatus?.threat_level === 'CRITICAL';

  return (
    <header className="sticky top-0 z-40 w-full border-b border-cyan-500/20 bg-[#060a12]/95 backdrop-blur-md">
      <div className="w-full max-w-[1720px] mx-auto flex h-16 items-center justify-between px-3 sm:px-5 lg:px-6">
        {/* Left: Tactical Brand */}
        <div
          className="flex items-center gap-3 cursor-pointer group"
          onClick={() => onSelectTab('dashboard')}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-950/60 border border-cyan-500/40 text-cyan-400 group-hover:border-cyan-400 group-hover:shadow-[0_0_12px_rgba(0,229,255,0.4)] transition-all">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-black tracking-wider text-white font-mono">
                CYBER<span className="text-cyan-400">SENTINEL</span>
              </span>
              <span className="rounded bg-cyan-950/80 px-1.5 py-0.2 text-[10px] font-bold font-mono tracking-widest text-cyan-300 border border-cyan-700/60">
                v2.4
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono tracking-tight flex items-center gap-1.5">
              <span className="text-cyan-400">$</span> SOC THREAT INTELLIGENCE & RESPONSE
            </p>
          </div>
        </div>

        {/* Center: Main Navigation Tabs */}
        <nav className="hidden md:flex items-center rounded-xl bg-slate-950/90 p-1 border border-cyan-500/20 shadow-inner">
          <button
            onClick={() => onSelectTab('dashboard')}
            className={`flex items-center gap-2 rounded-lg px-4 py-1.5 text-xs font-mono font-bold tracking-wider uppercase transition-all ${
              activeTab === 'dashboard'
                ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 shadow-[0_0_10px_rgba(0,229,255,0.2)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            <LayoutDashboard className="h-3.5 w-3.5 text-cyan-400" />
            Dashboard
          </button>

          <button
            onClick={() => onSelectTab('incidents')}
            className={`flex items-center gap-2 rounded-lg px-4 py-1.5 text-xs font-mono font-bold tracking-wider uppercase transition-all ${
              activeTab === 'incidents'
                ? 'bg-amber-950/80 text-amber-300 border border-amber-500/40 shadow-[0_0_10px_rgba(245,158,11,0.2)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            <ShieldAlert className="h-3.5 w-3.5 text-amber-400" />
            Incidents
          </button>

          <button
            onClick={() => onSelectTab('events')}
            className={`flex items-center gap-2 rounded-lg px-4 py-1.5 text-xs font-mono font-bold tracking-wider uppercase transition-all ${
              activeTab === 'events'
                ? 'bg-indigo-950/80 text-indigo-300 border border-indigo-500/40 shadow-[0_0_10px_rgba(99,102,241,0.2)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            <ScrollText className="h-3.5 w-3.5 text-indigo-400" />
            Event Stream
          </button>

          <button
            onClick={() => onSelectTab('simulator')}
            className={`flex items-center gap-2 rounded-lg px-4 py-1.5 text-xs font-mono font-bold tracking-wider uppercase transition-all ${
              activeTab === 'simulator'
                ? 'bg-red-950/80 text-red-300 border border-red-500/50 shadow-[0_0_12px_rgba(239,68,68,0.3)]'
                : 'text-red-400/80 hover:text-red-200 hover:bg-red-950/30'
            }`}
          >
            <Flame className="h-3.5 w-3.5 text-red-400" />
            Attack Simulator
          </button>
        </nav>

        {/* Right: Tactical Telemetry Status Badges */}
        <div className="flex items-center gap-2.5 font-mono text-xs">
          {/* Live UTC/Local Clock */}
          <div className="hidden lg:flex items-center gap-1.5 rounded-lg border border-cyan-900/50 bg-[#090e18] px-2.5 py-1 text-cyan-400 text-[11px] shadow-sm">
            <Clock className="h-3 w-3 text-cyan-400" />
            <span>{timeString || '00:00:00'} LOCAL</span>
          </div>

          {/* Engine Status */}
          <div className="hidden sm:flex items-center gap-1.5 rounded-lg border border-emerald-900/60 bg-emerald-950/40 px-2.5 py-1 text-emerald-400 text-[11px] font-bold">
            <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(0,255,136,0.8)]"></span>
            <span>SYS: ONLINE</span>
          </div>

          {/* AI Engine Status */}
          <div className="hidden sm:flex items-center gap-1.5 rounded-lg border border-purple-900/60 bg-purple-950/40 px-2.5 py-1 text-purple-300 text-[11px] font-bold">
            <Cpu className="h-3 w-3 text-purple-400" />
            <span>AI: CORRELATING</span>
          </div>

          {/* Threat Level */}
          <div
            className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[11px] font-black tracking-wider transition-all ${
              isCritical
                ? 'border-red-600/80 bg-red-950/70 text-red-300 shadow-[0_0_12px_rgba(239,68,68,0.35)] animate-pulse'
                : 'border-amber-700/60 bg-amber-950/50 text-amber-300'
            }`}
          >
            <Radio className="h-3 w-3" />
            <span>THREAT: {systemStatus?.threat_level || 'ELEVATED'}</span>
          </div>
        </div>
      </div>
    </header>
  );
};
