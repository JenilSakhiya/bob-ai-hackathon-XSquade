/**
 * CyberSentinel Shared Type Definitions
 * Used across frontend, backend contracts, and shared tooling.
 */

export type Severity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type IncidentStatus = 'OPEN' | 'INVESTIGATING' | 'CONTAINED' | 'RESOLVED';
export type ActionStatus = 'RECOMMENDED' | 'APPROVED' | 'COMPLETED';
export type ActionPriority = 'LOW' | 'MEDIUM' | 'HIGH';

export interface SecurityEvent {
  id: number;
  timestamp: string;
  event_type: string;
  username: string;
  source_ip: string;
  destination_ip?: string | null;
  device_id?: string | null;
  hostname?: string | null;
  location?: string | null;
  severity: Severity;
  description: string;
  metadata: Record<string, any>;
  created_at: string;
}

export interface RiskFactor {
  indicator: string;
  evidence: string;
  contribution: number;
}

export interface ResponseAction {
  id: number;
  incident_id: string;
  action: string;
  priority: ActionPriority;
  reason: string;
  status: ActionStatus;
  created_at: string;
}

export interface Incident {
  id: string;
  title: string;
  description: string;
  severity: Severity;
  risk_score: number;
  status: IncidentStatus;
  attack_type: string;
  affected_user: string;
  affected_asset: string;
  confidence: number;
  first_seen: string;
  last_seen: string;
  created_at: string;
  updated_at: string;
  event_count: number;
}

export interface IncidentDetail extends Incident {
  ai_summary?: string | null;
  attack_hypothesis?: string | null;
  why_dangerous?: string | null;
  analyst_notes?: string | null;
  risk_factors: RiskFactor[];
  events: SecurityEvent[];
  actions: ResponseAction[];
}

export interface KPIMetrics {
  critical_incidents: number;
  high_risk_incidents: number;
  events_today: number;
  open_investigations: number;
}

export interface SystemStatus {
  system_status: string;
  ai_status: string;
  threat_level: string;
  ai_provider: string;
}

export interface TimeSeriesPoint {
  time: string;
  count: number;
}

export interface SeverityCount {
  severity: string;
  count: number;
  color: string;
}

export interface AttackTypeCount {
  type: string;
  count: number;
}

export interface RiskBucketCount {
  range: string;
  count: number;
}

export interface DashboardData {
  kpi: KPIMetrics;
  system_status: SystemStatus;
  events_over_time: TimeSeriesPoint[];
  incidents_by_severity: SeverityCount[];
  attack_types: AttackTypeCount[];
  risk_distribution: RiskBucketCount[];
  recent_critical_incidents: Incident[];
}

export interface ChatMessage {
  id: number;
  incident_id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface ChatResponse {
  incident_id: string;
  reply: string;
  history: ChatMessage[];
}

export interface IncidentReport {
  incident_id: string;
  title: string;
  severity: Severity;
  risk_score: number;
  confidence: number;
  status: IncidentStatus;
  affected_user: string;
  affected_asset: string;
  first_seen: string;
  last_seen: string;
  summary: string;
  attack_hypothesis: string;
  why_dangerous: string;
  risk_factors: RiskFactor[];
  timeline: Array<{
    timestamp: string;
    time_short: string;
    event_type: string;
    description: string;
    source_ip: string;
    severity: string;
  }>;
  recommended_actions: Array<{
    action: string;
    priority: string;
    reason: string;
    status: string;
  }>;
  analyst_notes: string;
  markdown: string;
}

export interface SimulationStep {
  time_offset: string;
  event_type: string;
  description: string;
  status: string;
}

export interface SimulationResult {
  simulation_name: string;
  incident_id?: string | null;
  events_generated: number;
  incident?: IncidentDetail | null;
  steps: SimulationStep[];
  message: string;
}
