# AGENTS.md

This file provides guidance to agents when working with code in this repository.

## Non-Obvious Project Patterns

### Test Configuration (Critical)
- Jest runs with `maxWorkers: 1` (sequential only) to prevent file corruption from parallel writes to JSON storage
- Tests use port 3002 (not 3000) to avoid conflicts with dev server
- Test files in `__tests__/` directory, NOT colocated with source (contradicts other documentation)

### Storage Implementation
- Uses `sanitizePath()` in [`storage.service.js`](backend/src/services/storage.service.js) to prevent directory traversal - all file paths MUST go through this
- JSON files in [`backend/src/data/`](backend/src/data/) are the actual database (blueprints.json, artifacts.json)
- Storage service auto-creates directories and initializes empty JSON arrays if files missing

### Generator Context Pattern
- Generators receive accumulated context object from ALL previous generators
- Each generator adds its output to context and returns enhanced context
- Context flows: idea → prd → architecture → schema → api → frontend → tests → deployment → bobPrompt → githubIssues
- Generators validate context has required fields from previous steps (e.g., PRD checks `context.idea.processed`)

### IBM Bob Evidence Requirement
- This is a hackathon project - IBM Bob session reports in [`bob_sessions/`](bob_sessions/) are REQUIRED for judging
- Every development phase must generate timestamped session report: `{timestamp}-{phase}.md`
- Dashboard must aggregate these to prove IBM Bob's SDLC involvement

### Commands
```bash
# Backend tests (must run from backend/ directory)
cd backend && npm test

# Single test file
cd backend && npm test -- artifact.test.js