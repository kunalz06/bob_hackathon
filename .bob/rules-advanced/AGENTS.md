# Advanced Mode Rules - BobForge

## Non-Obvious Patterns (Advanced-Specific)

### Storage Safety
- ALL file paths must go through `sanitizePath()` in [`storage.service.js`](../../backend/src/services/storage.service.js) - prevents directory traversal
- JSON files in [`backend/src/data/`](../../backend/src/data/) are the database (blueprints.json, artifacts.json)
- Storage auto-creates missing directories and initializes empty arrays

### Generator Context Flow
- Each generator receives accumulated context from ALL previous generators
- Must validate required fields from previous steps (e.g., PRD checks `context.idea.processed`)
- Return enhanced context with new artifact added
- Dependency chain: idea → prd → architecture → schema → api → frontend → tests → deployment → bobPrompt → githubIssues

### Test Configuration
- Tests run sequentially (`maxWorkers: 1` in jest.config.js) to prevent JSON file corruption
- Test files in `__tests__/` directory (NOT colocated despite what docs say)
- Tests use port 3002 to avoid dev server conflicts
- Run from backend directory: `cd backend && npm test`

### IBM Bob Evidence
- Session reports in [`bob_sessions/`](../../bob_sessions/) are REQUIRED for hackathon judging
- Format: `{timestamp}-{phase}.md`
- Dashboard aggregates these to prove IBM Bob's SDLC involvement

## Advanced Tools Available
- MCP tools available for extended functionality
- Browser tools available for research and documentation
- Use these tools when standard code generation needs enhancement