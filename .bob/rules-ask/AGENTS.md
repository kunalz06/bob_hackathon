# Ask Mode Rules - BobForge

## Project Context for Questions

### Architecture Overview
- **Frontend**: React + Vite in [`frontend/`](../../frontend/) - handles UI for blueprint creation
- **Backend**: Express API in [`backend/`](../../backend/) - orchestrates 13 generator modules
- **Generators**: Modular functions in [`backend/generators/`](../../backend/generators/) - each creates one artifact type

### Key Directories
- [`bob_sessions/`](../../bob_sessions/) - IBM Bob interaction evidence (CRITICAL for hackathon judging)
- [`generated_projects/`](../../generated_projects/) - Output blueprints with all artifacts
- [`sample_blueprints/`](../../sample_blueprints/) - Example blueprints for testing
- [`exports/`](../../exports/) - Markdown and JSON exports of blueprints

### Generator Pipeline
1. Idea input → 2. PRD → 3. Architecture → 4. Database schema → 5. API routes → 6. Frontend pages → 7. Test plan → 8. Deployment checklist → 9. IBM Bob build prompt

### IBM Bob Integration (Non-Obvious)
- This project is FOR the IBM Bob Hackathon
- Goal: Demonstrate IBM Bob as full SDLC partner
- Every development phase must generate a session report
- Dashboard aggregates IBM Bob's contributions across all phases
- Session reports prove IBM Bob's involvement in planning, coding, testing, documenting

### Storage Strategy
- MVP uses local JSON files (no database)
- Each blueprint stored as: `generated_projects/{projectId}/blueprint.json`
- Optional SQLite for later versions
- No paid APIs allowed in MVP

### Export Format (Non-Standard)
- Dual format: Markdown (human) + JSON (machine)
- Markdown includes formatted sections for each artifact
- JSON preserves full structure for re-import
- IBM Bob build prompt must be copyable from export

### Testing Approach
- Unit tests colocated with generators
- No separate test directory
- Mock file I/O in tests
- Focus on generator logic, not integration