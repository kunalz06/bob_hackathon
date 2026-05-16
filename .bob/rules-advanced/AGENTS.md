# Advanced Mode Rules - BobForge

## Backend Generator Architecture
- Each generator in [`backend/generators/`](../../backend/generators/) must be a pure function
- Generators return structured objects, not strings (orchestrator handles formatting)
- All generators must accept a `context` object containing previous generator outputs

## Module Dependencies
- Blueprint generator orchestrates all other generators in sequence
- Each generator can access outputs from previous generators via context
- Dependency order: Idea → PRD → Architecture → Schema → API → Frontend → Tests → Deployment

## File Organization
- Generator modules: [`backend/generators/`](../../backend/generators/)
- Test files colocated: `generatorName.js` + `generatorName.test.js`
- Shared utilities: [`backend/utils/`](../../backend/utils/)
- API routes: [`backend/routes/`](../../backend/routes/)

## Error Handling Pattern
```javascript
// All generators must follow this pattern
try {
  // validation
  if (!input) throw new Error('Missing required input');
  // generation logic
  return { success: true, data: result };
} catch (error) {
  return { success: false, error: error.message };
}
```

## Storage Conventions
- Generated blueprints: [`generated_projects/{projectId}/blueprint.json`](../../generated_projects/)
- IBM Bob sessions: [`bob_sessions/{timestamp}-{phase}.md`](../../bob_sessions/)
- Exports: [`exports/{projectId}/`](../../exports/) (both .md and .json)

## Testing Requirements
- Each generator must have unit tests
- Mock external dependencies (no real file I/O in tests)
- Test both success and error cases
- Run tests: `cd backend && npm test`

## IBM Bob Evidence
- Every code generation session must be documented
- Save session reports with timestamps and phase names
- Include: prompt used, code generated, iterations, final result
- Dashboard must aggregate all session data from [`bob_sessions/`](../../bob_sessions/)

## Advanced Tools Available
- MCP tools available for extended functionality
- Browser tools available for research and documentation
- Use these tools when standard code generation needs enhancement