import {
  DashboardData,
  Incident,
  IncidentDetail,
  SecurityEvent,
  ChatMessage,
  ChatResponse,
  IncidentReport,
  SimulationResult,
  ActionStatus,
  IncidentStatus,
} from '../types';

const API_BASE = '/api';

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let errorDetail = `Request failed with status ${res.status}`;
    try {
      const err = await res.json();
      if (err.detail) errorDetail = err.detail;
    } catch (_) {}
    throw new Error(errorDetail);
  }
  return res.json();
}

export const api = {
  // Dashboard
  async getDashboard(): Promise<DashboardData> {
    const res = await fetch(`${API_BASE}/dashboard`);
    return handleResponse<DashboardData>(res);
  },

  // Events
  async getEvents(params: {
    event_type?: string;
    severity?: string;
    username?: string;
    search?: string;
    page?: number;
    page_size?: number;
  }): Promise<{ total: number; page: number; page_size: number; events: SecurityEvent[] }> {
    const query = new URLSearchParams();
    if (params.event_type && params.event_type !== 'ALL') query.append('event_type', params.event_type);
    if (params.severity && params.severity !== 'ALL') query.append('severity', params.severity);
    if (params.username) query.append('username', params.username);
    if (params.search) query.append('search', params.search);
    if (params.page) query.append('page', params.page.toString());
    if (params.page_size) query.append('page_size', params.page_size.toString());

    const res = await fetch(`${API_BASE}/events?${query.toString()}`);
    return handleResponse<{ total: number; page: number; page_size: number; events: SecurityEvent[] }>(res);
  },

  // Incidents
  async getIncidents(params?: {
    severity?: string;
    status?: string;
    attack_type?: string;
    search?: string;
  }): Promise<{ total: number; incidents: Incident[] }> {
    const query = new URLSearchParams();
    if (params?.severity && params.severity !== 'ALL') query.append('severity', params.severity);
    if (params?.status && params.status !== 'ALL') query.append('status', params.status);
    if (params?.attack_type && params.attack_type !== 'ALL') query.append('attack_type', params.attack_type);
    if (params?.search) query.append('search', params.search);

    const res = await fetch(`${API_BASE}/incidents?${query.toString()}`);
    return handleResponse<{ total: number; incidents: Incident[] }>(res);
  },

  async getIncident(id: string): Promise<IncidentDetail> {
    const res = await fetch(`${API_BASE}/incidents/${id}`);
    return handleResponse<IncidentDetail>(res);
  },

  async updateIncidentStatus(id: string, status: IncidentStatus): Promise<Incident> {
    const res = await fetch(`${API_BASE}/incidents/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    return handleResponse<Incident>(res);
  },

  async triggerInvestigation(id: string): Promise<any> {
    const res = await fetch(`${API_BASE}/incidents/${id}/investigate`, {
      method: 'POST',
    });
    return handleResponse<any>(res);
  },

  async updateActionStatus(incidentId: string, actionId: number, status: ActionStatus): Promise<any> {
    const res = await fetch(`${API_BASE}/incidents/${incidentId}/actions/${actionId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    return handleResponse<any>(res);
  },

  // Chat
  async sendChatMessage(incidentId: string, message: string): Promise<ChatResponse> {
    const res = await fetch(`${API_BASE}/incidents/${incidentId}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
    });
    return handleResponse<ChatResponse>(res);
  },

  async getChatHistory(incidentId: string): Promise<ChatMessage[]> {
    const res = await fetch(`${API_BASE}/incidents/${incidentId}/chat`);
    return handleResponse<ChatMessage[]>(res);
  },

  // Reports
  async generateReport(incidentId: string): Promise<IncidentReport> {
    const res = await fetch(`${API_BASE}/incidents/${incidentId}/report`, {
      method: 'POST',
    });
    return handleResponse<IncidentReport>(res);
  },

  // Simulations
  async simulateFullAttack(): Promise<SimulationResult> {
    const res = await fetch(`${API_BASE}/simulation/full-attack`, {
      method: 'POST',
    });
    return handleResponse<SimulationResult>(res);
  },

  async simulateBruteForce(): Promise<SimulationResult> {
    const res = await fetch(`${API_BASE}/simulation/brute-force`, {
      method: 'POST',
    });
    return handleResponse<SimulationResult>(res);
  },

  async simulateAccountTakeover(): Promise<SimulationResult> {
    const res = await fetch(`${API_BASE}/simulation/account-takeover`, {
      method: 'POST',
    });
    return handleResponse<SimulationResult>(res);
  },

  async simulateDataExfiltration(): Promise<SimulationResult> {
    const res = await fetch(`${API_BASE}/simulation/data-exfiltration`, {
      method: 'POST',
    });
    return handleResponse<SimulationResult>(res);
  },

  async resetTelemetry(): Promise<{ status: string; message: string }> {
    const res = await fetch(`${API_BASE}/simulation/reset`, {
      method: 'POST',
    });
    return handleResponse<{ status: string; message: string }>(res);
  },
};
