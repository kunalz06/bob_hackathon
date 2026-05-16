# AGENTS.md

This file provides guidance to agents when working with code in this repository.

## Project: BobForge - AI App Factory for IBM Bob Hackathon

**Critical Goal**: Demonstrate IBM Bob as a full SDLC build partner. Every major development stage must generate an IBM Bob session report saved to [`bob_sessions/`](bob_sessions/).

## Tech Stack
- Frontend: React + Vite + Tailwind CSS
- Backend: Node.js + Express
- Storage: Local JSON files (MVP), SQLite (optional later)
- Export: Markdown and JSON formats

## Directory Structure
```
frontend/          # React + Vite UI
backend/           # Express API + generator modules
docs/              # Project documentation
bob_sessions/      # IBM Bob interaction evidence (REQUIRED for hackathon)
generated_projects/# Output from blueprint generator
sample_blueprints/ # Example blueprints for testing
exports/           # Markdown/JSON exports
```

## Core Modules (Backend)
1. Idea input processor
2. Blueprint generator (orchestrator)
3. PRD generator
4. Architecture generator
5. Database schema generator
6. API plan generator
7. Frontend page plan generator
8. Test plan generator
9. Deployment checklist generator
10. IBM Bob build prompt generator
11. Artifact tracker
12. IBM Bob evidence dashboard
13. Markdown export engine

## Development Rules

**Backend Architecture**:
- Keep generator logic in separate files under [`backend/generators/`](backend/generators/)
- Each generator module should be independently testable
- Use modular design - no monolithic files

**Security & Configuration**:
- NEVER commit `.env` files
- Use `.env.example` for template only
- No hardcoded secrets or API keys
- No paid APIs for MVP (use free/local alternatives)

**Error Handling**:
- Add validation for all user inputs
- Implement error handling in all generator functions
- Return structured error responses from API endpoints

**Testing**:
- Write simple unit tests for backend generator functions
- Test files should be colocated with source in [`backend/generators/`](backend/generators/)

**UI Standards**:
- Professional, enterprise-style design
- Use Tailwind CSS utility classes
- Responsive design required

**IBM Bob Integration** (CRITICAL):
- Every major development milestone must be documented
- Save IBM Bob session reports to [`bob_sessions/`](bob_sessions/)
- Include: planning sessions, code generation, refactoring, testing, documentation
- Dashboard must display IBM Bob's contributions across SDLC phases

## Build/Run Commands
```bash
# Frontend
cd frontend && npm install && npm run dev

# Backend
cd backend && npm install && npm start

# Tests
cd backend && npm test
```

## Export Format
- Blueprints export as both Markdown (human-readable) and JSON (machine-readable)
- Include all generated artifacts: PRD, architecture, schemas, API plans, test plans
- IBM Bob build prompt must be copyable from export