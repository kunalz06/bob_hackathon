# Ask Mode Rules - BobForge

## Non-Obvious Documentation Context

### Test Location Contradiction
- Documentation says tests are colocated with source files
- Reality: Tests are in `__tests__/` directory, NOT colocated
- This is intentional for Jest configuration reasons

### Storage Architecture (Hidden)
- "Database" is actually JSON files in [`backend/src/data/`](../../backend/src/data/)
- All file operations go through `sanitizePath()` security check in [`storage.service.js`](../../backend/src/services/storage.service.js)
- Storage auto-creates missing directories and files (not documented in API)

### Generator Dependencies (Non-Linear)
- Generators appear independent but have strict sequential dependencies
- Each generator validates context from ALL previous generators
- Missing context fields cause cryptic errors (e.g., PRD fails if `context.idea.processed` missing)
- Dependency chain: idea → prd → architecture → schema → api → frontend → tests → deployment → bobPrompt → githubIssues

### IBM Bob Evidence System
- [`bob_sessions/`](../../bob_sessions/) directory is REQUIRED for hackathon judging (not optional)
- Session reports must follow format: `{timestamp}-{phase}.md`
- Dashboard aggregates these to prove IBM Bob's SDLC involvement
- This is the PRIMARY hackathon deliverable, not the app itself

### Test Port Configuration
- Tests use port 3002 (not 3000) to avoid dev server conflicts
- Configured in [`__tests__/setup.js`](../../backend/__tests__/setup.js)
- Tests run sequentially (`maxWorkers: 1`) to prevent JSON file corruption from parallel writes