import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { DashboardPage } from './pages/DashboardPage';
import { IncidentsPage } from './pages/IncidentsPage';
import { IncidentDetailPage } from './pages/IncidentDetailPage';
import { EventsPage } from './pages/EventsPage';
import { SimulatorPage } from './pages/SimulatorPage';
import { SystemStatus } from './types';
import { api } from './services/api';

export function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(null);
  const [systemStatus, setSystemStatus] = useState<SystemStatus | undefined>(undefined);

  const fetchStatus = async () => {
    try {
      const data = await api.getDashboard();
      setSystemStatus(data.system_status);
    } catch (_) {
      // Fallback default status
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
    const interval = setInterval(fetchStatus, 30000);
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
    <div className="min-h-screen bg-[#070a12] text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-black">
      {/* Top Cybersecurity Navbar */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={handleTabChange}
        systemStatus={systemStatus}
      />

      {/* Main Command Center Container */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 pt-6">
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

      {/* SOC Footer */}
      <footer className="border-t border-slate-800/80 bg-[#090d18] py-4 text-center text-xs text-slate-500 font-mono">
        <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>CyberSentinel AI SOC Assistant • MITRE ATT&CK Correlated Telemetry</span>
          <span>Offline Autonomous Threat Engine • Operational Guardrails Active</span>
        </div>
      </footer>
    </div>
  );
}

export default App;
