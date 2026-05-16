# BobForge Architecture Documentation

## System Overview

BobForge is a three-tier web application that generates comprehensive technical blueprints from simple idea descriptions. The system follows a modern, scalable architecture with clear separation of concerns.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         BobForge System                          │
│                     System Architecture                          │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      PRESENTATION LAYER                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │           React 18 Frontend (Vite + Tailwind)            │  │
│  │                                                           │  │
│  │  Components:                                             │  │
│  │  • IdeaInputPage         - Blueprint generation UI       │  │
│  │  • BlueprintDashboard    - View generated blueprints     │  │
│  │  • BobPromptPage         - IBM Bob build prompts         │  │
│  │  • ArtifactTrackerPage   - Track Bob's files            │  │
│  │  • BobEvidencePage       - SDLC evidence dashboard       │  │
│  │                                                           │  │
│  │  State Management: React Context + localStorage          │  │
│  │  Routing: React Router v6                                │  │
│  │  HTTP Client: Axios                                      │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
└────────────────────────┬─────────────────────────────────────────┘
                         │
                         │ REST API (HTTPS)
                         │ CORS Enabled
                         │
┌────────────────────────▼─────────────────────────────────────────┐
│                      BUSINESS LOGIC LAYER                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              Node.js + Express.js API                    │  │
│  │                                                           │  │
│  │  Routes:                                                 │  │
│  │  • /api/health           - Health check                  │  │
│  │  • /api/blueprints       - Blueprint CRUD                │  │
│  │  • /api/artifacts        - Artifact tracking             │  │
│  │                                                           │  │
│  │  Controllers:                                            │  │
│  │  • blueprint.controller  - Blueprint operations          │  │
│  │  • artifact.controller   - Artifact operations           │  │
│  │                                                           │  │
│  │  Services:                                               │  │
│  │  • blueprint.service     - Blueprint generation logic    │  │
│  │  • artifact.service      - Artifact management           │  │
│  │  • storage.service       - File I/O with security        │  │
│  │                                                           │  │
│  │  Generators (10):                                        │  │
│  │  1. Idea Processor       - Extract features & users      │  │
│  │  2. PRD Generator        - Product requirements          │  │
│  │  3. Architecture Gen     - System architecture           │  │
│  │  4. Schema Generator     - Database design               │  │
│  │  5. API Plan Generator   - REST endpoints                │  │
│  │  6. Frontend Generator   - UI structure                  │  │
│  │  7. Test Plan Generator  - Testing strategy              │  │
│  │  8. Deployment Generator - Deployment plan               │  │
│  │  9. Bob Prompt Generator - IBM Bob instructions          │  │
│  │  10. GitHub Issues Gen   - Development tasks             │  │
│  │                                                           │  │
│  │  Exporters:                                              │  │
│  │  • markdownExporter      - Blueprint to Markdown         │  │
│  │                                                           │  │
│  │  Middleware:                                             │  │
│  │  • CORS                  - Cross-origin support          │  │
│  │  • Body Parser           - JSON parsing                  │  │
│  │  • Error Handler         - Centralized error handling    │  │
│  │  • Logger                - Request/response logging      │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
└────────────────────────┬─────────────────────────────────────────┘
                         │
                         │ File I/O
                         │ Sanitized Paths
                         │
┌────────────────────────▼─────────────────────────────────────────┐
│                         DATA LAYER                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                   JSON File Storage                      │  │
│  │                                                           │  │
│  │  Files:                                                  │  │
│  │  • blueprints.json       - All generated blueprints      │  │
│  │  • artifacts.json        - Artifact tracking data        │  │
│  │                                                           │  │
│  │  Exports:                                                │  │
│  │  • exports/{projectId}/  - Exported Markdown files       │  │
│  │                                                           │  │
│  │  Security:                                               │  │
│  │  • Path sanitization     - Prevent directory traversal   │  │
│  │  • Auto-create dirs      - Safe directory creation       │  │
│  │  • Atomic writes         - Data integrity                │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow

### Blueprint Generation Flow

```
1. User Input
   └─> Frontend: IdeaInputPage
       └─> Validation (20+ chars)
           └─> POST /api/blueprints/generate

2. Backend Processing
   └─> blueprint.controller.generateBlueprint()
       └─> blueprint.service.generateBlueprint()
           └─> Generator Pipeline (Sequential):
               
               1. Idea Processor
                  Input: { idea: "..." }
                  Output: { title, description, features, users }
                  
               2. PRD Generator
                  Input: Previous context + idea
                  Output: { problemStatement, userRoles, features, requirements }
                  
               3. Architecture Generator
                  Input: Previous context + PRD
                  Output: { techStack, architecture, components }
                  
               4. Schema Generator
                  Input: Previous context + architecture
                  Output: { tables, columns, relationships, indexes }
                  
               5. API Plan Generator
                  Input: Previous context + schema
                  Output: { routes, methods, authentication }
                  
               6. Frontend Plan Generator
                  Input: Previous context + API
                  Output: { pages, components, routing }
                  
               7. Test Plan Generator
                  Input: Previous context + frontend
                  Output: { strategy, testCases, coverage }
                  
               8. Deployment Plan Generator
                  Input: Previous context + tests
                  Output: { platforms, steps, checklist }
                  
               9. Bob Prompt Generator
                  Input: All previous context
                  Output: { buildPrompt, instructions, priorities }
                  
               10. GitHub Issues Generator
                   Input: All previous context
                   Output: { issues[], priorities, labels }

3. Storage
   └─> storage.service.saveBlueprint()
       └─> Write to blueprints.json
           └─> Return complete blueprint

4. Response
   └─> 201 Created
       └─> { success: true, projectId, blueprint }
           └─> Frontend updates UI
               └─> Redirect to BlueprintDashboard
```

### Export Flow

```
1. User Action
   └─> Click "Export as Markdown"
       └─> GET /api/blueprints/:id/export/markdown

2. Backend Processing
   └─> blueprint.controller.exportMarkdown()
       └─> Fetch blueprint from storage
           └─> markdownExporter.exportToMarkdown()
               └─> Generate formatted Markdown
                   └─> Save to exports/{projectId}/
                       └─> Return file stream

3. Response
   └─> Content-Type: text/markdown
       └─> Content-Disposition: attachment
           └─> Browser downloads file
```

## Component Architecture

### Frontend Components

```
src/
├── pages/
│   ├── IdeaInputPage.jsx
│   │   └─> Input form + validation
│   │   └─> Example ideas
│   │   └─> Generate button
│   │
│   ├── BlueprintDashboardPage.jsx
│   │   └─> Blueprint summary
│   │   └─> Artifact sections
│   │   └─> Export button
│   │   └─> Navigation to Bob prompt
│   │
│   ├── BobPromptPage.jsx
│   │   └─> Display generated prompt
│   │   └─> Copy to clipboard
│   │   └─> Usage instructions
│   │
│   ├── ArtifactTrackerPage.jsx
│   │   └─> List artifacts
│   │   └─> Add new artifacts
│   │   └─> Track status
│   │
│   └── BobEvidencePage.jsx
│       └─> SDLC phase tracking
│       └─> Session reports
│       └─> Completion metrics
│
├── components/
│   ├── Layout.jsx              - Page wrapper
│   ├── Navbar.jsx              - Navigation
│   ├── LoadingSpinner.jsx      - Loading state
│   ├── CopyButton.jsx          - Copy functionality
│   ├── FeatureCard.jsx         - Feature display
│   ├── SectionCard.jsx         - Generic section
│   ├── BlueprintSummary.jsx    - Overview card
│   ├── ApiRouteTable.jsx       - API routes table
│   ├── SchemaTable.jsx         - Database schema table
│   ├── IssueTable.jsx          - GitHub issues table
│   └── EvidenceTable.jsx       - Bob evidence table
│
└── api/
    └── client.js               - Axios instance + interceptors
```

### Backend Services

```
src/
├── routes/
│   ├── health.routes.js        - Health check
│   ├── blueprint.routes.js     - Blueprint endpoints
│   └── artifact.routes.js      - Artifact endpoints
│
├── controllers/
│   ├── blueprint.controller.js
│   │   └─> generateBlueprint()
│   │   └─> listBlueprints()
│   │   └─> getBlueprintById()
│   │   └─> exportMarkdown()
│   │
│   └── artifact.controller.js
│       └─> createArtifact()
│       └─> listArtifacts()
│       └─> getArtifactById()
│
├── services/
│   ├── blueprint.service.js
│   │   └─> generateBlueprint()
│   │   └─> Orchestrates generator pipeline
│   │   └─> Manages context flow
│   │
│   ├── artifact.service.js
│   │   └─> CRUD operations for artifacts
│   │
│   └── storage.service.js
│       └─> readFile()
│       └─> writeFile()
│       └─> sanitizePath()      - Security
│       └─> ensureDirectory()
│
├── generators/
│   ├── BaseGenerator.js        - Abstract base class
│   ├── prdGenerator.js
│   ├── architectureGenerator.js
│   ├── schemaGenerator.js
│   ├── apiPlanGenerator.js
│   ├── frontendPlanGenerator.js
│   ├── testPlanGenerator.js
│   ├── deploymentPlanGenerator.js
│   ├── bobPromptGenerator.js
│   └── githubIssuesGenerator.js
│
└── exporters/
    └── markdownExporter.js
        └─> exportToMarkdown()
        └─> Format sections
        └─> Generate tables
```

## Key Design Patterns

### 1. Generator Pipeline Pattern

Each generator follows a consistent interface:

```javascript
async function generate(context) {
  // 1. Validate context has required fields
  validateContext(context);
  
  // 2. Extract input from context
  const input = extractInput(context);
  
  // 3. Generate artifact
  const artifact = await generateArtifact(input);
  
  // 4. Return enhanced context
  return {
    ...context,
    [artifactName]: artifact
  };
}
```

**Benefits:**
- Consistent interface across all generators
- Easy to add new generators
- Context flows naturally through pipeline
- Each generator is independently testable

### 2. Context Accumulation Pattern

Context grows as it flows through generators:

```javascript
// Initial context
{ idea: { raw, processed } }

// After PRD
{ idea, prd }

// After Architecture
{ idea, prd, architecture }

// After Schema
{ idea, prd, architecture, schema }

// ... continues through all generators
```

**Benefits:**
- Each generator has full context
- Ensures consistency across artifacts
- Enables cross-referencing
- Supports validation at each step

### 3. Storage Service Pattern

All file I/O goes through storage service:

```javascript
// Always sanitize paths
const safePath = sanitizePath(userPath);

// Auto-create directories
await ensureDirectory(dirname(safePath));

// Atomic writes
await writeFile(safePath, data);
```

**Benefits:**
- Centralized security (path sanitization)
- Consistent error handling
- Easy to swap storage backend
- Prevents directory traversal attacks

### 4. Error Handling Pattern

Structured error responses:

```javascript
{
  success: false,
  error: {
    code: "ERROR_CODE",
    message: "Human-readable message",
    details: "Additional context"
  }
}
```

**Benefits:**
- Consistent error format
- Easy to handle on frontend
- Supports error tracking
- Clear error categorization

## Security Considerations

### 1. Path Sanitization
- All file paths sanitized through `sanitizePath()`
- Prevents directory traversal attacks
- Validates against allowed directories

### 2. Input Validation
- Idea input: 20+ characters, non-empty
- Type validation for all API inputs
- Sanitization of user-provided strings

### 3. CORS Configuration
- Configured allowed origins
- Credentials support disabled
- Preflight request handling

### 4. Error Information
- No sensitive data in error messages
- Stack traces only in development
- Generic messages in production

## Performance Optimizations

### 1. Sequential Generation
- Generators run sequentially (not parallel)
- Ensures context consistency
- Prevents race conditions
- Typical generation time: 2-5 seconds

### 2. File-Based Storage
- JSON files for simplicity
- Fast read/write operations
- No database overhead
- Easy backup and migration

### 3. Frontend Optimization
- Code splitting with React Router
- Lazy loading of components
- Memoization of expensive computations
- Efficient re-renders with React

### 4. Caching Strategy
- localStorage for latest blueprint ID
- Browser caching for static assets
- No server-side caching (stateless)

## Scalability Considerations

### Current Scale
- Designed for: 100+ concurrent users
- Storage: File-based (suitable for 1000s of blueprints)
- Response time: < 5 seconds for generation

### Future Scaling Options

**Database Migration:**
- Replace JSON files with PostgreSQL/MongoDB
- Add indexing for faster queries
- Support complex filtering

**Caching Layer:**
- Add Redis for frequently accessed blueprints
- Cache generated artifacts
- Session management

**Horizontal Scaling:**
- Stateless backend (ready for load balancing)
- Shared storage (S3, cloud storage)
- Multiple backend instances

**Queue System:**
- Add job queue for long-running generations
- Background processing
- Progress tracking

## Testing Strategy

### Unit Tests (70%)
- Individual generator functions
- Service layer methods
- Utility functions
- Validation logic

### Integration Tests (20%)
- API endpoint testing
- Generator pipeline flow
- Storage operations
- Error handling

### E2E Tests (10%)
- Complete blueprint generation
- Export functionality
- User workflows

**Test Coverage: 70%+ across all modules**

## Deployment Architecture

### Development
```
Frontend: localhost:5173 (Vite dev server)
Backend: localhost:3001 (Node.js)
Storage: Local file system
```

### Production (Recommended)
```
Frontend: Vercel/Netlify (Static hosting + CDN)
Backend: Railway/Render (Node.js hosting)
Storage: Cloud storage (S3) or bundled with backend
Database: Optional PostgreSQL migration
```

## Monitoring & Logging

### Backend Logging
- Request/response logging (Morgan)
- Error logging (Winston)
- Generation metrics
- Performance tracking

### Frontend Monitoring
- Error boundary for React errors
- API error tracking
- User interaction analytics (optional)

## Future Enhancements

### Planned Features
1. **Real-time Generation**: WebSocket for live updates
2. **Collaboration**: Multi-user blueprint editing
3. **Version Control**: Blueprint versioning and history
4. **Templates**: Pre-built blueprint templates
5. **AI Enhancement**: Integration with more AI models
6. **Export Formats**: PDF, DOCX, JSON exports
7. **GitHub Integration**: Direct repository creation
8. **CI/CD Templates**: Auto-generate pipeline configs

### Technical Improvements
1. **Database Migration**: PostgreSQL for better querying
2. **Caching Layer**: Redis for performance
3. **Queue System**: Background job processing
4. **Microservices**: Split generators into services
5. **GraphQL API**: Alternative to REST
6. **TypeScript**: Type safety across codebase

---

**Last Updated**: May 16, 2026  
**Version**: 1.0.0  
**Maintained By**: BobForge Team