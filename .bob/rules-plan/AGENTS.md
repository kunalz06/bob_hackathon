# Plan Mode Rules - BobForge

## Architectural Constraints

### Generator Pipeline (Sequential Dependencies)
- Each generator depends on outputs from previous generators
- Blueprint generator orchestrates the entire sequence
- Cannot parallelize - each step needs context from prior steps
- Order: Idea → PRD → Architecture → Schema → API → Frontend → Tests → Deployment → IBM Bob Prompt

### Module Isolation Requirements
- Each generator in [`backend/generators/`](../../backend/generators/) must be independently testable
- No direct file I/O in generators (orchestrator handles persistence)
- Generators receive context object, return structured data
- No shared state between generators except via context parameter

### Storage Architecture (Non-Standard)
- MVP uses local JSON files, NOT a database
- Each project gets own directory: `generated_projects/{projectId}/`
- Blueprint stored as single JSON file with all artifacts
- Session reports stored separately in [`bob_sessions/`](../../bob_sessions/)
- Exports create duplicate copies in [`exports/`](../../exports/) (both formats)

### IBM Bob Evidence System (Critical for Hackathon)
- Every major development phase must generate a session report
- Reports saved with timestamp and phase name: `{timestamp}-{phase}.md`
- Dashboard must aggregate and display all IBM Bob contributions
- Evidence proves IBM Bob's role across full SDLC: planning, coding, refactoring, testing, documenting
- This is NOT optional - it's the core hackathon requirement

### Frontend-Backend Communication
- Frontend sends idea input to backend
- Backend orchestrates all 13 generators
- Frontend receives complete blueprint with all artifacts
- Frontend displays artifacts in organized sections
- Frontend provides export functionality (Markdown + JSON)

### Export Format Design
- Dual format required: Markdown (human-readable) + JSON (machine-readable)
- Markdown must be well-formatted with sections for each artifact
- JSON preserves full structure for potential re-import
- IBM Bob build prompt must be easily copyable from export
- Both formats generated simultaneously from same blueprint data

### Testing Strategy (Colocated)
- Test files live next to source files, not in separate directory
- Pattern: `generatorName.js` + `generatorName.test.js`
- Mock all file I/O operations in tests
- Focus on generator logic correctness
- No integration tests in MVP

### Security Constraints
- No paid APIs allowed in MVP (free/local only)
- No hardcoded secrets or API keys
- Use `.env.example` for configuration templates
- Never commit `.env` files