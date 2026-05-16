# BobForge Backend Foundation - Technical Plan

## Overview

This document outlines the detailed plan for building the backend foundation of BobForge, an AI-powered app factory for the IBM Bob Hackathon.

## Architecture Summary

### Core Principles
1. **Sequential Generator Pipeline**: Each generator depends on outputs from previous generators
2. **Module Isolation**: Generators are independently testable with no direct file I/O
3. **Local JSON Storage**: MVP uses JSON files instead of database
4. **Context-Based Flow**: Context object accumulates artifacts through the pipeline
5. **IBM Bob Evidence**: Every major phase generates session reports

### Technology Stack
- **Runtime**: Node.js (v18+)
- **Framework**: Express.js
- **Storage**: Local JSON files (fs/promises)
- **ID Generation**: crypto.randomUUID()
- **Middleware**: CORS, express.json()
- **Environment**: dotenv

## Directory Structure

```
backend/
├── package.json                    # Dependencies and scripts
├── .env.example                    # Environment template
├── .gitignore                      # Git ignore rules
├── README.md                       # Setup and usage docs
└── src/
    ├── server.js                   # Entry point
    ├── app.js                      # Express app configuration
    │
    ├── routes/
    │   ├── health.routes.js        # Health check endpoint
    │   ├── blueprint.routes.js     # Blueprint generation routes
    │   └── artifact.routes.js      # Artifact management routes
    │
    ├── controllers/
    │   ├── blueprint.controller.js # Blueprint business logic
    │   └── artifact.controller.js  # Artifact business logic
    │
    ├── services/
    │   ├── storage.service.js      # JSON file operations
    │   ├── blueprint.service.js    # Blueprint orchestration
    │   └── artifact.service.js     # Artifact management
    │
    ├── generators/
    │   ├── prdGenerator.js         # PRD generation
    │   ├── architectureGenerator.js # Architecture design
    │   ├── schemaGenerator.js      # Database schema
    │   ├── apiPlanGenerator.js     # API endpoint planning
    │   ├── frontendPlanGenerator.js # Frontend structure
    │   ├── testPlanGenerator.js    # Test strategy
    │   ├── deploymentPlanGenerator.js # Deployment checklist
    │   └── bobPromptGenerator.js   # IBM Bob build prompt
    │
    ├── utils/
    │   ├── slugify.js              # String to slug conversion
    │   └── validators.js           # Input validation
    │
    └── data/
        ├── blueprints.json         # Blueprint storage
        └── artifacts.json          # Artifact metadata
```

## API Endpoints Specification

### 1. Health Check
```
GET /api/health
Response: { status: 'ok', timestamp: ISO8601 }
```

### 2. Generate Blueprint
```
POST /api/blueprints/generate
Body: {
  idea: string (min 20 chars, required)
}
Response: {
  success: boolean,
  projectId: string,
  blueprint: {
    projectId: string,
    createdAt: timestamp,
    updatedAt: timestamp,
    idea: { raw: string, processed: object },
    artifacts: {
      prd: object,
      architecture: object,
      schema: object,
      api: object,
      frontend: object,
      tests: object,
      deployment: object,
      bobPrompt: object
    },
    metadata: object
  }
}
```

### 3. List Blueprints
```
GET /api/blueprints
Response: {
  success: boolean,
  blueprints: [
    {
      projectId: string,
      title: string,
      createdAt: timestamp,
      status: string
    }
  ]
}
```

### 4. Get Blueprint by ID
```
GET /api/blueprints/:id
Response: {
  success: boolean,
  blueprint: object
}
```

### 5. Export Blueprint as Markdown
```
GET /api/blueprints/:id/export/markdown
Response: Markdown file download
```

### 6. Create Artifact
```
POST /api/artifacts
Body: {
  projectId: string,
  type: string,
  content: object
}
Response: {
  success: boolean,
  artifactId: string
}
```

### 7. List Artifacts
```
GET /api/artifacts
Query: ?projectId=string (optional)
Response: {
  success: boolean,
  artifacts: array
}
```

### 8. Get Artifact by ID
```
GET /api/artifacts/:id
Response: {
  success: boolean,
  artifact: object
}
```

## Generator Pipeline Flow

### Sequential Execution Order
```
Idea Input
    ↓
PRD Generator (Product Requirements)
    ↓
Architecture Generator (System Design)
    ↓
Schema Generator (Database Design)
    ↓
API Plan Generator (Endpoint Design)
    ↓
Frontend Plan Generator (UI Structure)
    ↓
Test Plan Generator (Testing Strategy)
    ↓
Deployment Plan Generator (Deploy Checklist)
    ↓
IBM Bob Prompt Generator (Build Instructions)
```

### Context Object Structure
```javascript
{
  idea: {
    raw: string,
    processed: {
      title: string,
      description: string,
      targetUsers: array,
      keyFeatures: array,
      techPreferences: object
    }
  },
  prd: { /* PRD artifact */ },
  architecture: { /* Architecture artifact */ },
  schema: { /* Schema artifact */ },
  api: { /* API artifact */ },
  frontend: { /* Frontend artifact */ },
  tests: { /* Tests artifact */ },
  deployment: { /* Deployment artifact */ },
  bobPrompt: { /* Bob prompt artifact */ }
}
```

## Generator Module Interface

Each generator follows this standard interface:

```javascript
/**
 * Generator function
 * @param {Object} context - Accumulated context from previous generators
 * @returns {Object} Enhanced context with new artifact
 */
async function generate(context) {
  // 1. Validate input context
  validateContext(context);
  
  // 2. Extract relevant data
  const input = extractInput(context);
  
  // 3. Generate artifact (using templates/AI)
  const artifact = await generateArtifact(input);
  
  // 4. Validate output
  validateArtifact(artifact);
  
  // 5. Return enhanced context
  return {
    ...context,
    [artifactName]: artifact
  };
}

module.exports = { generate };
```

## Data Models

### Blueprint Model
```javascript
{
  projectId: string,              // UUID
  createdAt: string,              // ISO 8601
  updatedAt: string,              // ISO 8601
  idea: {
    raw: string,
    processed: {
      title: string,
      description: string,
      targetUsers: string[],
      keyFeatures: string[],
      techPreferences: object
    }
  },
  artifacts: {
    prd: object,
    architecture: object,
    schema: object,
    api: object,
    frontend: object,
    tests: object,
    deployment: object,
    bobPrompt: object
  },
  metadata: {
    generationTime: number,       // milliseconds
    status: string,               // 'complete' | 'partial' | 'error'
    version: string
  }
}
```

### Artifact Model
```javascript
{
  artifactId: string,             // UUID
  projectId: string,              // Reference to blueprint
  type: string,                   // 'prd' | 'architecture' | etc.
  content: object,                // Artifact-specific content
  createdAt: string,              // ISO 8601
  updatedAt: string               // ISO 8601
}
```

## Storage Service Design

### File Structure
```
backend/src/data/
├── blueprints.json             # Array of all blueprints
└── artifacts.json              # Array of all artifacts
```

### Storage Operations
```javascript
// Read operations
async function readBlueprints()
async function readBlueprintById(id)
async function readArtifacts()
async function readArtifactById(id)

// Write operations
async function saveBlueprint(blueprint)
async function updateBlueprint(id, updates)
async function saveArtifact(artifact)

// Delete operations
async function deleteBlueprint(id)
async function deleteArtifact(id)
```

## Validation Rules

### Idea Input Validation
- **Required**: `idea` field must be present
- **Type**: Must be a string
- **Length**: Minimum 20 characters
- **Content**: Must not be only whitespace

### Blueprint Validation
- **projectId**: Must be valid UUID
- **timestamps**: Must be valid ISO 8601 dates
- **artifacts**: All required artifacts must be present

## Error Handling Strategy

### Error Response Format
```javascript
{
  success: false,
  error: {
    code: string,           // 'VALIDATION_ERROR', 'NOT_FOUND', etc.
    message: string,        // Human-readable message
    details: object         // Additional error details
  }
}
```

### HTTP Status Codes
- `200`: Success
- `201`: Created
- `400`: Bad Request (validation errors)
- `404`: Not Found
- `500`: Internal Server Error

## Environment Variables

### .env.example
```
PORT=3001
NODE_ENV=development
DATA_DIR=./src/data
CORS_ORIGIN=http://localhost:5173
```

## Package Dependencies

### Production Dependencies
```json
{
  "express": "^4.18.2",
  "cors": "^2.8.5",
  "dotenv": "^16.3.1"
}
```

### Development Dependencies
```json
{
  "nodemon": "^3.0.1"
}
```

## NPM Scripts

```json
{
  "start": "node src/server.js",
  "dev": "nodemon src/server.js",
  "test": "echo \"Tests not implemented yet\" && exit 0"
}
```

## Implementation Checklist

### Phase 1: Project Setup
- [x] Analyze requirements and architecture
- [ ] Create backend directory structure
- [ ] Initialize package.json with dependencies
- [ ] Create .env.example file
- [ ] Create .gitignore file

### Phase 2: Utility Modules
- [ ] Implement [`slugify.js`](../backend/src/utils/slugify.js)
- [ ] Implement [`validators.js`](../backend/src/utils/validators.js)

### Phase 3: Storage Layer
- [ ] Implement [`storage.service.js`](../backend/src/services/storage.service.js)
- [ ] Create initial data files (blueprints.json, artifacts.json)

### Phase 4: Generator Modules
- [ ] Implement [`prdGenerator.js`](../backend/src/generators/prdGenerator.js)
- [ ] Implement [`architectureGenerator.js`](../backend/src/generators/architectureGenerator.js)
- [ ] Implement [`schemaGenerator.js`](../backend/src/generators/schemaGenerator.js)
- [ ] Implement [`apiPlanGenerator.js`](../backend/src/generators/apiPlanGenerator.js)
- [ ] Implement [`frontendPlanGenerator.js`](../backend/src/generators/frontendPlanGenerator.js)
- [ ] Implement [`testPlanGenerator.js`](../backend/src/generators/testPlanGenerator.js)
- [ ] Implement [`deploymentPlanGenerator.js`](../backend/src/generators/deploymentPlanGenerator.js)
- [ ] Implement [`bobPromptGenerator.js`](../backend/src/generators/bobPromptGenerator.js)

### Phase 5: Service Layer
- [ ] Implement [`blueprint.service.js`](../backend/src/services/blueprint.service.js) (orchestrator)
- [ ] Implement [`artifact.service.js`](../backend/src/services/artifact.service.js)

### Phase 6: Controllers
- [ ] Implement [`blueprint.controller.js`](../backend/src/controllers/blueprint.controller.js)
- [ ] Implement [`artifact.controller.js`](../backend/src/controllers/artifact.controller.js)

### Phase 7: Routes
- [ ] Implement [`health.routes.js`](../backend/src/routes/health.routes.js)
- [ ] Implement [`blueprint.routes.js`](../backend/src/routes/blueprint.routes.js)
- [ ] Implement [`artifact.routes.js`](../backend/src/routes/artifact.routes.js)

### Phase 8: Express App
- [ ] Implement [`app.js`](../backend/src/app.js) (Express configuration)
- [ ] Implement [`server.js`](../backend/src/server.js) (Entry point)

### Phase 9: Documentation
- [ ] Write [`README.md`](../backend/README.md) with setup instructions

### Phase 10: Validation
- [ ] Test all API endpoints
- [ ] Verify error handling
- [ ] Validate data persistence

## Key Design Decisions

### 1. Why Local JSON Storage?
- **MVP Speed**: Faster to implement than database
- **Simplicity**: No database setup required
- **Portability**: Easy to move/backup data
- **Future Migration**: Can migrate to SQLite/PostgreSQL later

### 2. Why Sequential Generator Pipeline?
- **Dependencies**: Each generator needs context from previous ones
- **Clarity**: Clear execution order is easier to debug
- **Consistency**: Ensures all artifacts are coherent

### 3. Why Separate Services and Controllers?
- **Separation of Concerns**: Business logic separate from HTTP handling
- **Testability**: Services can be tested independently
- **Reusability**: Services can be used by multiple controllers

### 4. Why Context Object Pattern?
- **Immutability**: Each generator returns new context
- **Traceability**: Easy to see what each generator added
- **Flexibility**: Easy to add new generators to pipeline

## Testing Strategy (Future)

### Unit Tests (Colocated)
```
generators/
├── prdGenerator.js
├── prdGenerator.test.js
├── architectureGenerator.js
├── architectureGenerator.test.js
...
```

### Test Focus Areas
1. Generator input validation
2. Generator output structure
3. Context accumulation
4. Error handling
5. Storage operations

## Security Considerations

### MVP Security Measures
- Input validation on all endpoints
- No hardcoded secrets
- Environment variables for configuration
- CORS configuration for frontend
- Error messages don't leak sensitive info

### Future Security Enhancements
- Rate limiting
- Authentication/Authorization
- Input sanitization
- SQL injection prevention (when using DB)

## Performance Considerations

### MVP Performance
- Synchronous file operations acceptable for MVP
- In-memory caching not required initially
- Generator execution time: ~5-10 seconds total

### Future Optimizations
- Async file operations
- Caching frequently accessed blueprints
- Streaming large exports
- Background job processing

## IBM Bob Integration Points

### Session Report Generation
- After blueprint generation: Planning phase report
- During implementation: Coding phase reports
- After testing: Testing phase reports
- After deployment: Deployment phase reports

### Evidence Storage
```
bob_sessions/
├── {timestamp}-planning.md
├── {timestamp}-coding.md
├── {timestamp}-testing.md
└── {timestamp}-deployment.md
```

## Next Steps

After completing the backend foundation:

1. **Frontend Development**: Build React UI to consume APIs
2. **Generator Enhancement**: Improve artifact quality with better templates
3. **Export Functionality**: Implement Markdown/JSON export
4. **IBM Bob Dashboard**: Display session reports
5. **Testing**: Add comprehensive test coverage
6. **Documentation**: Create API documentation
7. **Demo Application**: Build sample app using generated blueprint

## Success Criteria

### Functional Requirements
- ✅ All 8 API endpoints working
- ✅ Blueprint generation completes successfully
- ✅ Data persists to JSON files
- ✅ Proper error handling and validation
- ✅ Clean JSON responses

### Code Quality
- ✅ Modular, maintainable code structure
- ✅ Consistent coding style
- ✅ Meaningful comments where needed
- ✅ No hardcoded values
- ✅ Proper error messages

### Documentation
- ✅ README with setup instructions
- ✅ API endpoint documentation
- ✅ Code comments for complex logic
- ✅ Environment variable documentation

## Conclusion

This plan provides a comprehensive roadmap for building the BobForge backend foundation. The architecture is designed to be simple yet extensible, with clear separation of concerns and a focus on the MVP requirements while allowing for future enhancements.

The sequential generator pipeline ensures consistency across all generated artifacts, while the modular design makes it easy to test and maintain individual components.