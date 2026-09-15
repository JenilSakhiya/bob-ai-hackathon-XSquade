# 📋 Hackathon Submission Template Guide

This guide details the standard layout and required artifacts for the Hackathon project submission.

---

## 📁 Repository Structure Overview

```
├── .github/                      # CI workflows and validation
├── demo/                         # Demo video link and UI screenshots
├── docs/                         # Architecture, guides, and problem statement
├── presentation/                 # Slide deck and presentation resources
├── src/                          # Application source code (backend, frontend, shared)
├── .gitignore                    # Ignored files (dependencies, builds, secrets)
├── CONTRIBUTING.md               # Guidelines for contributors
├── README.md                     # Main project presentation & documentation
└── submission.yaml               # Metadata file for automated validation
```

---

## 📝 Required Files & Directories

### 1. Root Metadata
- `submission.yaml`: Project title, track, team member details, and demo URLs.
- `README.md`: Problem statement, solution summary, architecture, and setup instructions.
- `CONTRIBUTING.md`: Development guidelines and testing procedures.
- `.gitignore`: Standard git exclusion patterns.

### 2. `src/` Folder
- `src/backend/`: Server-side API application and test suite.
- `src/frontend/`: Client-side user interface application.
- `src/shared/`: Shared domain models, constants, and JSON schemas.

### 3. `docs/` Folder
- `architecture.md`: Architectural overview, data flow, and components.
- `problem-statement.md`: Problem context and target persona.
- `solution-overview.md`: High-level summary of the solution.
- `setup-guide.md`: Detailed environment configuration and execution guide.

### 4. `demo/` & `presentation/` Folders
- `demo/demo-video-link.txt`: Link to the video walkthrough.
- `demo/screenshots/`: High-resolution UI captures.
- `presentation/presentation-link.txt`: Link to the slide deck.
