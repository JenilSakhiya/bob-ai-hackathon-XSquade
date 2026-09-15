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
| **Languages** | Python 3.10+, TypeScript |
| **Frameworks** | FastAPI (Backend REST API), React 19 + Vite (Frontend Command Center) |
| **Styling & UI** | Tailwind CSS, Lucide React (Cybersecurity Icons), Recharts (SOC Telemetry Charts) |
| **AI Architecture** | Pluggable `AIProvider` abstraction with deterministic offline `MockAIProvider` (100% offline, zero-config) and optional `OpenAICompatibleProvider` (Ollama, vLLM, Groq, OpenAI) |
| **Databases** | SQLite with SQLAlchemy 2.0 ORM & Pydantic v2 validation |
| **DevOps & Testing** | Docker, Docker Compose, Pytest (16 automated unit & integration tests) |

---

## 📁 Repository Structure

```
.
├── .github/                      # CI workflows and validation
│   └── workflows/
│       └── validate.yml          # Automated test & build validation pipeline
├── demo/                         # Demo video and screenshot assets
│   ├── demo-video-link.txt       # Video walkthrough URL
│   └── screenshots/              # UI walkthrough screenshots
├── docs/                         # Architecture, guides, and problem statement
│   ├── architecture.md           # High-level architecture & component diagram
│   ├── problem-statement.md      # Detailed problem background
│   ├── setup-guide.md            # Step-by-step installation instructions
│   ├── solution-overview.md      # Solution overview & system workflow
│   └── template-guide.md         # Submission template reference
├── presentation/                 # Slide deck and presentation resources
│   ├── presentation-link.txt     # Slide deck URL
│   └── README.md                 # Presentation overview
├── src/                          # Application source code
│   ├── backend/                  # API server code (Python FastAPI Backend)
│   │   ├── app/                  # FastAPI router, models, schemas, AI providers
│   │   ├── tests/                # Pytest automated test suite (16 tests)
│   │   ├── Dockerfile            # Backend container configuration
│   │   ├── requirements.txt      # Python dependencies
│   │   └── verify_demo.py        # Demo verification script
│   ├── frontend/                 # UI code (React 19 + Vite + TypeScript Command Center)
│   │   ├── src/                  # React components, pages, services, types
│   │   ├── package.json          # Frontend dependencies & npm scripts
│   │   ├── vite.config.ts        # Vite configuration & backend proxy
│   │   └── Dockerfile            # Frontend container configuration
│   ├── shared/                   # Shared utilities, types, schemas & constants
│   │   ├── types.ts              # Core TypeScript domain models & interfaces
│   │   ├── constants.ts          # MITRE taxonomy, risk thresholds, route constants
│   │   ├── schemas.json          # Shared JSON Schema specifications
│   │   └── README.md             # Shared layer documentation
│   ├── docker-compose.yml        # Multi-container orchestration
│   └── .env.example              # Environment configuration template
├── .gitignore                    # Git ignore rules
├── CONTRIBUTING.md               # Contribution and testing guidelines
├── README.md                     # Main repository documentation
└── submission.yaml               # Submission metadata
```

---

## ⚡ How to Run

### Prerequisites
- Python 3.10+
- Node.js 18+ and npm

### 1. Backend Setup & Startup
```powershell
# Windows PowerShell
cd src/backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt

# Start FastAPI backend (creates & seeds database automatically on startup)
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

- API Base: `http://127.0.0.1:8000`
- Swagger Docs: `http://127.0.0.1:8000/docs`

### 2. Frontend Setup & Startup
```powershell
# In a separate terminal
cd src/frontend
npm install
npm run dev
```

- Web UI: `http://localhost:5173`

### 3. Run with Docker Compose (Alternative)
```bash
cd src
docker compose up --build
```
