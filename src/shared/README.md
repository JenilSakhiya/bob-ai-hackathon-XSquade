# 📦 CyberSentinel Shared Module (`src/shared/`)

> Shared data contracts, types, constants, and utilities common to the backend and frontend.

## 📂 Contents

| File | Purpose | Consumers |
|---|---|---|
| [`types.ts`](./types.ts) | Core TypeScript interfaces and domain models (Events, Incidents, Reports, Chat) | Frontend UI, tooling, clients |
| [`constants.ts`](./constants.ts) | Shared constants (MITRE ATT&CK taxonomy, severity thresholds, route constants) | Frontend & backend integrations |
| [`schemas.json`](./schemas.json) | JSON Schema validation schemas for events, incidents, and actions | API consumers, validation pipelines |

## 🏗️ Architecture Role

This module implements the **Web Application** pattern (`src/backend`, `src/frontend`, `src/shared`), ensuring:
- **Single Source of Truth** for domain entity models and enums.
- **Type Safety** across client-server interactions.
- **Maintainability**: Changes to core telemetry models are coordinated cleanly.
