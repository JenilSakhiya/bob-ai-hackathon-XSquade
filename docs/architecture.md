# CyberSentinel System Architecture

## Overview
CyberSentinel uses a clean, decoupled 3-tier Web Application architecture:
1. **Frontend (`src/frontend/`)**: React 19 + TypeScript + Vite + Tailwind CSS command center.
2. **Backend (`src/backend/`)**: FastAPI + Pydantic v2 + SQLAlchemy ORM with SQLite storage.
3. **Shared Contracts (`src/shared/`)**: Common TypeScript types, constants, and JSON Schema definitions.
4. **Detection Engine**: Deterministic rule evaluation for brute-force, priv-esc, and data exfiltration.
5. **Correlation Engine**: Multi-vector clustering linking related events across users, IPs, and 30-minute windows.
6. **AI Provider Abstraction**: Pluggable interface supporting deterministic offline Mock AI and external OpenAI-compatible endpoints.

```
+-------------------------------------------------------------+
|               CyberSentinel Command Center UI               |
|  (React 19 / TypeScript / Vite / Tailwind CSS / Recharts)  |
+-------------------------------------------------------------+
                               |
                               | REST API (HTTP / JSON)
                               v
+-------------------------------------------------------------+
|                    FastAPI Backend Router                   |
|   /dashboard  |  /incidents  |  /events  |  /simulation    |
+-------------------------------------------------------------+
                               |
       +-----------------------+-----------------------+
       |                       |                       |
       v                       v                       v
+---------------+     +-----------------+     +-----------------+
| Detection Svc |     | Correlation Svc |     |  Risk Score Svc |
| (6 Rule Sets) |     |  (Time Window)  |     |  (0-100 Points) |
+---------------+     +-----------------+     +-----------------+
                               |
                               v
+-------------------------------------------------------------+
|                     AI Provider Layer                       |
|        AIProvider Interface (Grounded Investigation)        |
|    - MockAIProvider (Offline, Zero-Key, Deterministic)      |
|    - OpenAICompatibleProvider (Ollama, Groq, vLLM)          |
+-------------------------------------------------------------+
                               |
                               v
+-------------------------------------------------------------+
|                   SQLAlchemy 2.0 ORM Store                  |
|             (SecurityEvents, Incidents, Actions)            |
+-------------------------------------------------------------+
```
