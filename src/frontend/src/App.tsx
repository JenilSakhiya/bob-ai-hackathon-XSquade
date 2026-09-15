import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { DashboardPage } from './pages/DashboardPage';
import { IncidentsPage } from './pages/IncidentsPage';
import { IncidentDetailPage } from './pages/IncidentDetailPage';
import { EventsPage } from './pages/EventsPage';
import { SimulatorPage } from './pages/SimulatorPage';
import { SystemStatus } from './types';
import { api } from './services/api';
import { Shield, Activity, Radio, Terminal, Cpu } from 'lucide-react';

export function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(null);
  const [systemStatus, setSystemStatus] = useState<SystemStatus | undefined>(undefined);

  const fetchStatus = async () => {
    try {
      const data = await api.getDashboard();
      setSystemStatus(data.system_status);
    } catch (_) {
      setSystemStatus({
        system_status: 'OPERATIONAL',
        ai_status: 'READY',
        threat_level: 'ELEVATED',
        ai_provider: 'Mock AI (Zero-Config Offline)',
      });
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 20000);
    return () => clearInterval(interval);
  }, []);

  const handleSelectIncident = (id: string) => {
    setSelectedIncidentId(id);
    setActiveTab('incident-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToIncidents = () => {
    setSelectedIncidentId(null);
    setActiveTab('incidents');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleTabChange = (tab: string) => {
    setSelectedIncidentId(null);
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#04070d] text-slate-100 flex flex-col selection:bg-cyan-500/30 selection:text-cyan-200 cyber-matrix-bg">
      {/* Top High-Tech SOC Navbar */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={handleTabChange}
        systemStatus={systemStatus}
      />

      {/* Main Command Center Full-Width Container */}
      <main className="flex-1 w-full max-w-[1720px] mx-auto px-3 sm:px-5 lg:px-6 pt-4 pb-8">
        {activeTab === 'dashboard' && (
          <DashboardPage
            onSelectIncident={handleSelectIncident}
            onNavigateToSimulator={() => handleTabChange('simulator')}
          />
        )}

        {activeTab === 'incidents' && (
          <IncidentsPage onSelectIncident={handleSelectIncident} />
        )}

        {activeTab === 'events' && <EventsPage />}

        {activeTab === 'simulator' && (
          <SimulatorPage onSelectIncident={handleSelectIncident} />
        )}

        {activeTab === 'incident-detail' && selectedIncidentId && (
          <IncidentDetailPage
            incidentId={selectedIncidentId}
            onBack={handleBackToIncidents}
          />
        )}
      </main>

      {/* High-Tech Tactical SOC Footer */}
      <footer className="border-t border-white/[0.08] bg-[#060a12]/95 backdrop-blur-md py-3 text-xs text-slate-400 font-mono">
        <div className="w-full max-w-[1720px] mx-auto px-3 sm:px-5 lg:px-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400"></span>
            <span>CYBERSENTINEL SOC CORE // NODE: ALPHA-01</span>
            <span className="text-slate-600">|</span>
            <span className="text-cyan-400">MITRE ATT&CK MATRIX EVALUATION: ACTIVE</span>
          </div>

          <div className="flex items-center gap-3 text-[11px] text-slate-400">
            <span>OFFLINE HEURISTIC & AI ENGINE</span>
            <span className="text-slate-600">|</span>
            <span className="text-emerald-400">DEFENSE PROTOCOL: LEVEL-2 ENGAGED</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
