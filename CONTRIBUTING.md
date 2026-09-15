# Contributing to CyberSentinel

Thank you for your interest in contributing to **CyberSentinel**! We welcome contributions to improve threat detection rules, AI prompt templates, UI visualizers, and integration tests.

---

## 🛠️ Development Workflow

### 1. Repository Structure
- **`src/backend/`**: FastAPI REST API, SQLAlchemy database models, rule engines, AI providers, and Pytest suite.
- **`src/frontend/`**: React 19 + TypeScript + Vite + Tailwind CSS SOC command center.
- **`src/shared/`**: Shared TypeScript types, schemas, and constants.
- **`docs/`**: Architecture diagrams, problem statements, and setup guides.
- **`demo/`**: Walkthrough links and screenshots.
- **`presentation/`**: Slide decks and hackathon presentation material.

### 2. Setting Up Locally
Follow the detailed steps in [`docs/setup-guide.md`](./docs/setup-guide.md).

1. Clone the repository.
2. Create and activate a Python virtual environment in `src/backend/` and install `requirements.txt`.
3. Run `npm install` in `src/frontend/`.

---

## 🧪 Testing Guidelines

Before opening a pull request or submitting changes, ensure all automated tests pass:

### Backend Tests (Pytest)
```powershell
cd src/backend
pytest -v
```

### Frontend Build & Lint Check
```powershell
cd src/frontend
npm run build
```

---

## 📝 Commit & Submission Standards

- Use clear and conventional commit messages (`feat:`, `fix:`, `chore:`, `docs:`).
- Verify metadata in [`submission.yaml`](./submission.yaml) matches your project details.
