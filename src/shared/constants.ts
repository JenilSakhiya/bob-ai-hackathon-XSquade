/**
 * CyberSentinel Shared Constants
 * Shared across frontend client, backend services, and testing utilities.
 */

export const SEVERITY_LEVELS = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const;

export const INCIDENT_STATUSES = ['OPEN', 'INVESTIGATING', 'CONTAINED', 'RESOLVED'] as const;

export const ACTION_STATUSES = ['RECOMMENDED', 'APPROVED', 'COMPLETED'] as const;

export const ACTION_PRIORITIES = ['LOW', 'MEDIUM', 'HIGH'] as const;

export const SEVERITY_COLORS: Record<string, string> = {
  CRITICAL: '#ef4444',
  HIGH: '#f97316',
  MEDIUM: '#eab308',
  LOW: '#3b82f6',
};

export const MITRE_TECHNIQUES: Record<string, { id: string; tactic: string; name: string }> = {
  BRUTE_FORCE: {
    id: 'T1110',
    tactic: 'Credential Access',
    name: 'Brute Force',
  },
  ACCOUNT_TAKEOVER: {
    id: 'T1078',
    tactic: 'Defense Evasion / Initial Access',
    name: 'Valid Accounts',
  },
  PRIVILEGE_ESCALATION: {
    id: 'T1068',
    tactic: 'Privilege Escalation',
    name: 'Exploitation for Privilege Escalation',
  },
  COMMAND_AND_SCRIPTING: {
    id: 'T1059',
    tactic: 'Execution',
    name: 'Command and Scripting Interpreter',
  },
  DATA_EXFILTRATION: {
    id: 'T1048',
    tactic: 'Exfiltration',
    name: 'Exfiltration Over Alternative Protocol',
  },
  DEFENSE_EVASION: {
    id: 'T1562',
    tactic: 'Defense Evasion',
    name: 'Impair Defenses',
  },
};

export const RISK_SCORE_THRESHOLDS = {
  CRITICAL: 80,
  HIGH: 60,
  MEDIUM: 30,
  LOW: 0,
} as const;

export const API_ROUTES = {
  DASHBOARD: '/api/v1/dashboard',
  INCIDENTS: '/api/v1/incidents',
  EVENTS: '/api/v1/events',
  CHAT: '/api/v1/chat',
  SIMULATION: '/api/v1/simulation',
} as const;
