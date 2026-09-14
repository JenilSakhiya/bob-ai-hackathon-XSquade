from datetime import datetime
from typing import List, Dict, Any, Optional
from app.ai.provider import AIProvider
from app.models.incident import Incident
from app.models.event import SecurityEvent


class MockAIProvider(AIProvider):
    """
    Deterministic, zero-config AI provider that performs realistic SOC investigations
    strictly grounded in security event telemetry.
    """

    def investigate_incident(
        self,
        incident: Incident,
        events: List[SecurityEvent],
        risk_score: int,
        risk_factors: List[Dict[str, Any]],
        asset_info: Dict[str, Any]
    ) -> Dict[str, Any]:
        user = incident.affected_user
        asset = incident.affected_asset
        event_types = {e.event_type for e in events}

        if "LOGIN_FAILED" in event_types and "PRIVILEGE_CHANGE" in event_types:
            summary = f"CyberSentinel detected a likely account takeover involving user '{user}' on asset '{asset}'."
            hypothesis = (
                f"An attacker may have obtained valid credentials for '{user}' through repeated authentication attempts, "
                f"successfully authenticated from an unrecognized endpoint, escalated privileges to administrator, and initiated "
                f"abnormal outbound data transfer. The pattern closely matches an automated brute-force compromise followed by interactive hands-on-keyboard activity."
            )
            why_suspicious = (
                "CyberSentinel identified multiple correlated indicators that strongly suggest account compromise: rapid authentication failures "
                "culminating in an anomalous login, unauthorized privilege elevation within 4 minutes of access, and high-volume data exfiltration."
            )
            confidence = 94
            notes = (
                f"Automated AI investigation completed for incident {incident.id}. "
                f"High confidence ({confidence}%) correlation across {len(events)} telemetry events. "
                "Immediate containment of credentials and endpoint network isolation is strongly recommended."
            )
        elif "DATA_TRANSFER" in event_types:
            summary = f"CyberSentinel detected suspected abnormal data exfiltration originating from user '{user}'."
            hypothesis = (
                f"Session activity for '{user}' initiated high-volume outbound network egress exceeding baseline thresholds. "
                "This activity may indicate unauthorized exfiltration of corporate data or compromised credential abuse."
            )
            why_suspicious = "Outbound transfer volume significantly exceeds standard baseline traffic for this host/user."
            confidence = 88
            notes = f"Investigated large egress transfer on asset '{asset}'. Destination IP should be blocked immediately."
        else:
            summary = f"CyberSentinel detected anomalous security activity associated with user '{user}'."
            hypothesis = (
                f"Telemetry indicators suggest suspicious operational behavior by or targeting user account '{user}'. "
                "Correlated events diverge from established behavioral baselines."
            )
            why_suspicious = "Multiple correlated security events detected within a compressed operational window."
            confidence = 82
            notes = f"Telemetry review for {incident.id} flagged {len(events)} correlated events."

        return {
            "incident_id": incident.id,
            "incident_summary": summary,
            "attack_hypothesis": hypothesis,
            "why_suspicious": why_suspicious,
            "confidence": confidence,
            "affected_assets": [asset] if asset else ["Unknown"],
            "risk_score": risk_score,
            "severity": incident.severity,
            "risk_factors": risk_factors,
            "analyst_notes": notes
        }

    def explain_risk(
        self,
        incident: Incident,
        risk_factors: List[Dict[str, Any]]
    ) -> str:
        factor_names = [f.get("indicator", "") for f in risk_factors]
        return (
            f"CyberSentinel identified multiple correlated indicators ({', '.join(factor_names)}) "
            f"that strongly suggest active compromise. Each indicator individually elevates threat posture, but the rapid temporal sequence "
            f"from initial authentication anomalies through administrative privilege change and data egress indicates a high probability of malicious intent."
        )

    def generate_response_plan(
        self,
        incident: Incident,
        events: List[SecurityEvent]
    ) -> List[Dict[str, Any]]:
        return [
            {
                "action": "Revoke active sessions and force password reset",
                "priority": "HIGH",
                "reason": "Prevent continued unauthorized access by invalidating all active refresh tokens.",
                "status": "RECOMMENDED"
            },
            {
                "action": "Enforce mandatory MFA verification on next logon",
                "priority": "HIGH",
                "reason": "Ensure account cannot be reused even if primary password remains exposed.",
                "status": "RECOMMENDED"
            },
            {
                "action": "Revert unauthorized administrative privileges",
                "priority": "HIGH",
                "reason": "Prevent attacker from disabling security agents, altering event logs, or establishing persistence.",
                "status": "RECOMMENDED"
            },
            {
                "action": "Block suspicious destination IP at perimeter firewall",
                "priority": "HIGH",
                "reason": "Sever active command-and-control and exfiltration channels.",
                "status": "RECOMMENDED"
            },
            {
                "action": "Isolate affected endpoint asset from internal VLANs",
                "priority": "MEDIUM",
                "reason": "Contain blast radius and prevent lateral movement across sensitive corporate networks.",
                "status": "RECOMMENDED"
            },
            {
                "action": "Preserve volatile memory dump and forensic audit logs",
                "priority": "MEDIUM",
                "reason": "Capture injected DLLs, uncommitted disk artifacts, and ensure evidentiary integrity.",
                "status": "RECOMMENDED"
            },
            {
                "action": "Review accessed files and database query logs",
                "priority": "LOW",
                "reason": "Determine regulatory scope and verify which sensitive records or PII were accessed.",
                "status": "RECOMMENDED"
            }
        ]

    def generate_report(
        self,
        incident: Incident,
        events: List[SecurityEvent],
        investigation: Dict[str, Any]
    ) -> str:
        timestamp_str = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")
        
        # Build timeline markdown
        timeline_rows = []
        for e in sorted(events, key=lambda x: x.timestamp):
            t_str = e.timestamp.strftime("%H:%M:%S")
            timeline_rows.append(f"| {t_str} | `{e.event_type}` | {e.description} | `{e.source_ip}` | `{e.severity}` |")
        timeline_md = "\n".join(timeline_rows) if timeline_rows else "| - | No events recorded | - | - | - |"

        # Build risk factors markdown
        factors_rows = []
        for rf in incident.risk_factors:
            factors_rows.append(f"| {rf.get('indicator')} | +{rf.get('contribution')} | {rf.get('evidence')} |")
        factors_md = "\n".join(factors_rows) if factors_rows else "| None | 0 | Standard baseline |"

        # Build actions markdown
        actions_rows = []
        for act in (incident.actions or []):
            actions_rows.append(f"- **[{act.priority}]** {act.action} — *{act.reason}* (Status: `{act.status}`)")
        actions_md = "\n".join(actions_rows) if actions_rows else "- No response actions recorded."

        return f"""# CyberSentinel SOC Incident Report
**Incident ID**: `{incident.id}`  
**Report Generated**: {timestamp_str}  
**Classification**: TLP:AMBER (Internal Security Use Only)  

---

## 1. Executive Summary
- **Incident Title**: {incident.title}
- **Severity**: **{incident.severity}**
- **Calculated Risk Score**: **{incident.risk_score} / 100**
- **AI Confidence**: **{incident.confidence}%**
- **Incident Status**: `{incident.status}`
- **Affected User Account**: `{incident.affected_user}`
- **Affected Asset / Host**: `{incident.affected_asset}`
- **First Seen**: {incident.first_seen.strftime('%Y-%m-%d %H:%M:%S')}
- **Last Seen**: {incident.last_seen.strftime('%Y-%m-%d %H:%M:%S')}

### AI Assessment Summary
{incident.ai_summary or investigation.get('incident_summary', 'Automated investigation complete.')}

---

## 2. Attack Hypothesis & Dangerousness
**Hypothesis**:  
{incident.attack_hypothesis or investigation.get('attack_hypothesis', 'Attack pattern observed matching known MITRE ATT&CK techniques.')}

**Why This Incident is Dangerous**:  
{incident.why_dangerous or investigation.get('why_suspicious', 'Multi-stage correlation indicates critical threat posture.')}

---

## 3. Risk Factor Breakdown
| Risk Indicator | Contribution | Observed Telemetry Evidence |
| :--- | :--- | :--- |
{factors_md}

---

## 4. Attack Timeline ({len(events)} Events)
| Time (UTC) | Event Type | Description | Source IP | Severity |
| :--- | :--- | :--- | :--- | :--- |
{timeline_md}

---

## 5. Recommended Response Actions
> **Notice**: Recommended response actions are non-destructive and require authorized SOC analyst sign-off prior to execution.

{actions_md}

---

## 6. SOC Analyst Notes & Sign-off
{incident.analyst_notes or investigation.get('analyst_notes', 'Investigation approved for SOC review.')}

*Report autonomously compiled by CyberSentinel AI Engine.*
"""

    def answer_question(
        self,
        incident: Incident,
        events: List[SecurityEvent],
        question: str,
        chat_history: Optional[List[Dict[str, str]]] = None
    ) -> str:
        q = question.lower().strip()
        sorted_events = sorted(events, key=lambda x: x.timestamp)
        first_event = sorted_events[0] if sorted_events else None
        last_event = sorted_events[-1] if sorted_events else None

        # 1. Why is this incident critical?
        if "why" in q and ("critical" in q or "dangerous" in q or "high" in q or "risk" in q):
            factor_list = [f"{f.get('indicator')} (+{f.get('contribution')})" for f in incident.risk_factors]
            factors_text = ", ".join(factor_list) if factor_list else "rapid multi-vector security alerts"
            return (
                f"This incident is rated {incident.severity} with a Risk Score of {incident.risk_score}/100 because "
                f"CyberSentinel correlated multiple high-risk indicators in rapid succession: {factors_text}. "
                f"The sequence shows an initial unauthorized authentication followed immediately by administrative privilege escalation "
                f"and large outbound data transfer, which represents an active threat to organizational assets."
            )

        # 2. What happened first?
        if "first" in q or "initial" in q or "start" in q:
            if first_event:
                return (
                    f"The attack chain commenced at {first_event.timestamp.strftime('%H:%M:%S UTC')}. "
                    f"The initial event was '{first_event.event_type}': {first_event.description} "
                    f"originating from source IP {first_event.source_ip} targeting user '{first_event.username}'."
                )
            return "Insufficient evidence in the current incident data to determine the initial event."

        # 3. Which user is affected?
        if "user" in q or "who" in q or "account" in q:
            return (
                f"The primary affected user is '{incident.affected_user}'. "
                f"Associated asset: '{incident.affected_asset}'. All correlated telemetry events specifically target this user's identity."
            )

        # 4. What evidence suggests account takeover?
        if "account takeover" in q or "takeover" in q or "evidence" in q or "compromise" in q:
            evidence_points = [f.get("evidence") for f in incident.risk_factors]
            evidence_text = "\n- ".join(evidence_points) if evidence_points else "Repeated failed logins followed by anomalous success."
            return (
                f"The evidence suggesting account takeover includes:\n- {evidence_text}\n\n"
                f"Specifically, we observe failed logins followed by successful authentication from a new device ID and anomalous IP, "
                f"directly succeeded by privilege elevation to administrator."
            )

        # 5. What should the security team do first?
        if "what should" in q or "do first" in q or "action" in q or "recommend" in q or "next" in q:
            high_actions = [a.action for a in (incident.actions or []) if a.priority == "HIGH"]
            actions_text = "\n1. ".join([""] + (high_actions or ["Revoke active user sessions", "Force password reset", "Block destination IP"]))
            return (
                f"The security team should execute the following immediate containment actions:{actions_text}\n\n"
                "Priority must be given to invalidating the compromised session to prevent further lateral movement or exfiltration."
            )

        # 6. Summarize for management
        if "summarize" in q or "management" in q or "summary" in q or "brief" in q:
            return (
                f"Executive Summary for Management:\n\n"
                f"• Incident: {incident.title} (ID: {incident.id})\n"
                f"• Severity: {incident.severity} (Risk Score: {incident.risk_score}/100, AI Confidence: {incident.confidence}%)\n"
                f"• Affected Identity & Asset: User '{incident.affected_user}' on host '{incident.affected_asset}'\n"
                f"• Threat Assessment: Suspected credential compromise leading to unauthorized admin rights and outbound data exfiltration.\n"
                f"• Immediate Recommended Action: Revoke credentials, terminate active sessions, block external exfiltration IP, and isolate the endpoint."
            )

        # 7. Check if question asks about specific event types or IP
        if "ip" in q or "address" in q:
            ips = {e.source_ip for e in events if e.source_ip}
            dest_ips = {e.destination_ip for e in events if e.destination_ip}
            return (
                f"Incident telemetry recorded source IP(s): {', '.join(ips) or 'N/A'}. "
                f"Destination IP(s): {', '.join(dest_ips) or 'N/A'}."
            )

        if "timeline" in q or "events" in q:
            return f"This incident encompasses {len(events)} correlated security events spanning from {incident.first_seen.strftime('%H:%M:%S')} to {incident.last_seen.strftime('%H:%M:%S')}."

        # Strict grounding rule: if information is not in the incident data
        return (
            f"Based strictly on the telemetry for incident {incident.id}: user '{incident.affected_user}' is involved with "
            f"{len(events)} correlated events resulting in a {incident.severity} risk score of {incident.risk_score}/100. "
            f"Insufficient evidence in the current incident data for details beyond recorded telemetry."
        )
