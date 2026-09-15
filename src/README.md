# 🚀 CyberSentinel — AI-Powered SOC Analyst

> Autonomous Security Operations Center assistant that detects, correlates, investigates, scores risk, and recommends prescriptive response actions for enterprise security incidents.

---

## 👥 Team

| Field | Value |
|---|---|
| **Team Name** | CyberSentinel AI |
| **Track** | AI / Cybersecurity |
| **Team Lead** | Security Engineer — [lead@example.com] |
| **Members** | Full-Stack AI Engineer, Cybersecurity Analyst, UI/UX Designer |

---

## 🎯 Problem Statement

> In 2–3 sentences: What problem does your project solve? Who experiences this problem?

Modern Security Operations Centers (SOCs) are overwhelmed by tens of thousands of fragmented, disconnected alerts generated across identity providers, endpoints, and perimeter firewalls. Security analysts suffer from severe alert fatigue and must spend 30–45 minutes manually investigating logs across disparate consoles to piece together attack chains. This investigation bottleneck gives attackers critical dwell time to escalate privileges and exfiltrate sensitive corporate data before containment begins.

---

## 💡 Solution

> In 2–3 sentences: What did you build? How does it solve the problem above?

We built **CyberSentinel**, an end-to-end AI SOC Analyst that continuously ingests security event streams, executes deterministic threat detection rules, and automatically clusters related events across users, IPs, hosts, and 30-minute time windows into unified incidents. The engine calculates transparent, explainable risk scores (0–100), performs autonomous AI investigations to formulate MITRE ATT&CK hypotheses, generates prescriptive non-destructive response playbooks, and powers an interactive, evidence-grounded natural language investigation assistant.

---

## ✨ Key Features

- **Deterministic Threat Detection:** Rule-based detection for brute-force attacks, logins after brute force, unrecognized devices, privilege escalation, suspicious process execution (`powershell.exe`, `cmd.exe`), and large outbound data transfers (> 1 GB).
- **Multi-Vector Event Correlation:** Autonomously clusters disparate authentication, endpoint, and egress events sharing common entities (`username`, `source_ip`, `device_id`, `hostname`) within configurable time windows into single cohesive incidents.
- **Explainable Point-Based Risk Scoring:** Transparent 0–100 risk scoring with visible evidence breakdowns and point contributions (+15, +20, +10, +20, +10, +15), eliminating ambiguous black-box security ratings.
- **Interactive SOC Command Center:** Dark cybersecurity dashboard featuring real-time telemetry indicators (`SYS: OPERATIONAL`, `AI: READY`, `THREAT: ELEVATED`), KPI metrics cards, and dynamic Recharts visualizers (12-hour event stream, severity donut, ATT&CK classifications, risk score histogram).
- **Evidence-Grounded AI SOC Chat:** Conversational analyst assistant strictly constrained to the telemetry of the selected incident with zero hallucination, providing rapid answers to inquiries like *"Why is this incident critical?"* and *"What should the security team do first?"*.
- **One-Click Attack Simulator:** Built-in interactive simulator featuring the primary hackathon demo scenario (*Possible Account Takeover + Privilege Escalation + Data Exfiltration*), live-streaming event emissions and producing a verified CRITICAL incident (Risk Score 90–100, AI Confidence 94%).
- **Official SOC Incident Reporting:** Instant export of comprehensive TLP:AMBER incident reports in formatted UI preview, downloadable Markdown (`.md`), and structured JSON.

---

## 🛠️ Tech Stack

| Category | Technologies |
|---|---|
| **Languages** | Python 3.10, TypeScript |
| **Frameworks** | FastAPI (Backend REST API), React 19 + Vite 8 (Frontend Command Center) |
| **Styling & UI** | Tailwind CSS v4, Lucide React (Cybersecurity Icons), Recharts (SOC Telemetry Charts) |
| **AI Architecture** | Pluggable `AIProvider` abstraction with deterministic offline `MockAIProvider` (100% offline, zero-config) and optional `OpenAICompatibleProvider` (Ollama, vLLM, Groq, OpenAI) |
| **Databases** | SQLite with SQLAlchemy 2.0 ORM & Pydantic v2 validation |
| **DevOps & Testing** | Docker, Docker Compose, Pytest (16 automated unit & integration tests) |

---

## 📁 Repository Structure

```
src/
├── backend/                      # API server code (Python FastAPI Backend)
│   ├── app/
│   │   ├── main.py               # FastAPI entry point, lifespan startup & CORS
│   │   ├── config.py             # Settings, thresholds & environment config
│   │   ├── database.py           # SQLAlchemy engine & SQLite session provider
│   │   ├── models/               # Database ORM models (Events, Incidents, Actions, Chat)
│   │   ├── schemas/              # Pydantic v2 schemas for strict API validation
│   │   ├── api/                  # REST endpoints (Dashboard, Incidents, Events, Chat, Sim)
│   │   ├── services/             # Detection, Correlation, Risk, Investigation, Simulation
│   │   ├── ai/                   # AI Provider abstraction, Mock provider & LLM adapter
│   │   └── seed/                 # Realistic telemetry seed generator (170+ events, 9 incidents)
│   ├── tests/                    # Automated Pytest suite (16 tests, 100% passing)
│   ├── Dockerfile                # Backend containerization
│   ├── requirements.txt          # Python dependencies
│   └── verify_demo.py            # Demo verification script
├── frontend/                     # UI code (React 19 + Vite + TypeScript Command Center)
│   ├── src/
│   │   ├── components/           # Navbar, SeverityBadge, RiskScoreMeter, Timeline, ChatDrawer
│   │   ├── pages/                # DashboardPage, IncidentsPage, IncidentDetailPage, Events, Simulator
│   │   ├── services/api.ts       # Centralized REST API client
│   │   ├── types/index.ts        # Frontend type references & re-exports
│   │   ├── App.tsx               # Primary router & SOC layout container
│   │   ├── App.css               # Component styles
│   │   ├── index.css             # Cyber command-center dark theme & animations
│   │   └── main.tsx              # React DOM entry point
│   ├── Dockerfile                # Frontend containerization
│   ├── index.html                # Single-page application root HTML
│   ├── package.json              # Node dependencies & npm scripts
│   ├── tsconfig.json             # TypeScript compiler configuration
│   └── vite.config.ts            # Vite bundler configuration with backend proxy
├── shared/                       # Shared utilities, types, schemas & constants
│   ├── types.ts                  # Core TypeScript domain models & interfaces
│   ├── constants.ts              # MITRE ATT&CK taxonomy, risk thresholds, route constants
│   ├── schemas.json              # Shared JSON Schema specifications
│   └── README.md                 # Shared layer documentation
├── docker-compose.yml            # Multi-container orchestration
├── .env.example                  # Environment configuration template
└── README.md                     # Project overview & documentation
```

---

## ⚡ How to Run

> **Local setup instructions using standard development tools.**

### Prerequisites
- Python 3.10+
- Node.js 18+ and npm

### 1. Clone the Repository
```bash
git clone https://github.com/JenilSakhiya/bob-ai-hackathon-XSquade.git
cd bob-ai-hackathon-XSquade
```

### 2. Backend Setup & Startup
```powershell
# Windows PowerShell
cd src/backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt

# Start FastAPI backend (creates & seeds database automatically on startup)
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

```bash
# Linux / macOS
cd src/backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

### 3. Frontend Setup & Startup (In a Separate Terminal)
```bash
# Run from repository root
npm install
npm run dev
```

Open **`http://localhost:5173`** in your browser to access the CyberSentinel Command Center.

### 4. Optional: Docker Compose
```bash
docker compose up --build
```
- Frontend: `http://localhost:5173`
- Backend API Docs: `http://localhost:8000/docs`

---

## 🖥️ Demo

| Artifact | Link |
|---|---|
| 📹 Demo Video | [See demo/demo-video-link.txt](demo/demo-video-link.txt) |
| 🌐 Live Demo | `http://localhost:5173` (Local Ready) |
| 🖼️ Screenshots | [See demo/screenshots/](demo/screenshots/) |
| 📊 Architecture Doc | [See docs/architecture.md](docs/architecture.md) |
| 📋 Setup Guide | [See docs/setup-guide.md](docs/setup-guide.md) |

### 3-Minute Demonstration Script
1. **Command Center Overview (0:00 – 1:00):** View real-time telemetry indicators (`SYS: OPERATIONAL`, `AI: READY`, `THREAT: ELEVATED`), KPI cards, and Recharts telemetry graphs.
2. **Execute Attack Simulation (1:00 – 2:00):** Navigate to the **Attack Simulator**, review the primary scenario (*Possible Account Takeover + Privilege Escalation + Data Exfiltration*), click **`[ SIMULATE FULL ATTACK CHAIN ]`**, and observe the live log emission, detection rule evaluation, and correlation into a **CRITICAL** incident with a Risk Score of **90–100/100**.
3. **Deep AI Investigation (2:00 – 3:00):** Click **Investigate Created Incident**, inspect the visual SVG Risk Meter, review the *"Why is this dangerous?"* assessment card with point contributions, scroll the attack sequence timeline, and review prescriptive mitigations.
4. **Interactive AI SOC Chat & Report (3:00 – 3:30):** Click **Ask CyberSentinel AI**, click prompt chip *"Why is this incident critical?"*, observe the zero-hallucination grounded reply, and click **Generate Incident Report** to view and download the official Markdown report.

---

## ⚠️ Known Limitations

- **Simulated Response Actions:** In strict adherence to safe SOC operational standards, recommended response actions (session revocation, endpoint isolation, firewall blocking) are simulated status toggles in this MVP to prevent destructive modifications against real production infrastructure.
- **Rule Engine Scope:** The deterministic detection engine includes 6 core threat rules tailored for authentication spray, privilege escalation, and egress. Enterprise deployments would integrate additional Sigma or YARA rulesets.
- **Single-Node SQLite Storage:** The MVP uses SQLite for zero-configuration, instant offline portability. Production deployments would point SQLAlchemy to PostgreSQL or TimescaleDB.

---

## 🏅 What We're Most Proud Of

- **End-to-End Workflow Without Black Boxes:** We built the complete journey from raw log ingestion to rule detection, entity correlation, explainable additive risk points, and AI-driven narrative investigation without relying on opaque mockups.
- **Zero-Dependency Deterministic AI Abstraction:** CyberSentinel works 100% offline out-of-the-box without requiring third-party API keys or cloud accounts, while maintaining clean architecture to connect to any standard OpenAI-compatible local LLM (e.g. Ollama, Groq) via simple configuration.
- **Grounded AI SOC Analyst:** The conversational assistant strictly adheres to evidence recorded within the active incident, eliminating hallucinations and ensuring trustworthy answers for security analysts.
- **Engineering Quality:** 16 automated backend tests passing in under 1.5 seconds, sub-4-second frontend production bundling, strict TypeScript typing, and full Pydantic v2 validation.
