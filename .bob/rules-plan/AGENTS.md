# Plan Mode Rules - BobForge

## Non-Obvious Architectural Constraints

### Generator Sequential Dependency (Hidden Coupling)
- Generators appear modular but have strict sequential dependencies
- Each generator validates context contains outputs from ALL previous generators
- Cannot parallelize - breaking the chain causes cryptic validation errors
- Order: idea → prd → architecture → schema → api → frontend → tests → deployment → bobPrompt → githubIssues
- Example: PRD generator fails with "Context must include processed idea" if idea step skipped

### Storage Architecture (Not a Database)
- MVP uses JSON files in [`backend/src/data/`](../../backend/src/data/), NOT a database
- All file paths MUST go through `sanitizePath()` in [`storage.service.js`](../../backend/src/services/storage.service.js) to prevent directory traversal
- Storage auto-creates missing directories and initializes empty arrays (undocumented behavior)
- Parallel writes corrupt JSON files - hence `maxWorkers: 1` in jest.config.js

### Test Configuration (Counterintuitive)
- Documentation claims tests are colocated with source
- Reality: Tests in `__tests__/` directory (contradicts docs)
- Tests use port 3002 (not 3000) to avoid dev server conflicts
- Sequential execution required to prevent JSON corruption from parallel writes

### IBM Bob Evidence System (Primary Deliverable)
- [`bob_sessions/`](../../bob_sessions/) is REQUIRED for hackathon judging (not optional feature)
- Format: `{timestamp}-{phase}.md` for each development phase
- Dashboard aggregates these to prove IBM Bob's SDLC involvement
- This evidence is the PRIMARY hackathon deliverable, not the app functionality itself