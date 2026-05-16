# BobForge Backend

Backend API for BobForge - AI-powered app factory for the IBM Bob Hackathon.

## Overview

BobForge generates comprehensive application blueprints from simple idea descriptions. The backend orchestrates 8 specialized generators to create complete technical specifications including PRD, architecture, database schema, API plans, frontend structure, testing strategy, deployment plans, and IBM Bob build prompts.

## Features

- ✅ Blueprint generation from idea input (20+ character validation)
- ✅ Sequential generator pipeline (8 generators)
- ✅ Local JSON file storage
- ✅ RESTful API endpoints
- ✅ Markdown export functionality
- ✅ Comprehensive error handling
- ✅ CORS enabled for frontend integration

## Tech Stack

- **Runtime**: Node.js (v18+)
- **Framework**: Express.js
- **Storage**: Local JSON files
- **Dependencies**: cors, dotenv

## Project Structure

```
backend/
├── src/
│   ├── server.js              # Entry point
│   ├── app.js                 # Express app configuration
│   ├── routes/                # Route handlers
│   │   ├── health.routes.js
│   │   ├── blueprint.routes.js
│   │   └── artifact.routes.js
│   ├── controllers/           # Business logic
│   │   ├── blueprint.controller.js
│   │   └── artifact.controller.js
│   ├── services/              # Service layer
│   │   ├── storage.service.js
│   │   ├── blueprint.service.js
│   │   └── artifact.service.js
│   ├── generators/            # Generator modules
│   │   ├── prdGenerator.js
│   │   ├── architectureGenerator.js
│   │   ├── schemaGenerator.js
│   │   ├── apiPlanGenerator.js
│   │   ├── frontendPlanGenerator.js
│   │   ├── testPlanGenerator.js
│   │   ├── deploymentPlanGenerator.js
│   │   ├── bobPromptGenerator.js
│   │   └── githubIssuesGenerator.js
│   ├── exporters/             # Export modules
│   │   └── markdownExporter.js
│   ├── utils/                 # Utilities
│   │   ├── slugify.js
│   │   └── validators.js
│   └── data/                  # JSON storage
│       ├── blueprints.json
│       └── artifacts.json
├── package.json
├── .env.example
├── .gitignore
└── README.md
```

## Setup

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create environment file:**
   ```bash
   cp .env.example .env
   ```

4. **Configure environment variables** (optional):
   ```env
   PORT=3001
   NODE_ENV=development
   CORS_ORIGIN=http://localhost:5173
   ```

### Running the Server

**Development mode** (with auto-reload):
```bash
npm run dev
```

**Production mode**:
```bash
npm start
```

The server will start on `http://localhost:3001` (or the PORT specified in .env).

## API Endpoints

### Health Check

**GET** `/api/health`

Check server status.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "service": "BobForge Backend",
  "version": "1.0.0"
}
```

---

### Generate Blueprint

**POST** `/api/blueprints/generate`

Generate a complete blueprint from an idea.

**Request Body:**
```json
{
  "idea": "A task management app for developers with GitHub integration"
}
```

**Validation:**
- `idea` is required
- Must be a string
- Minimum 20 characters
- Cannot be only whitespace

**Response (201 Created):**
```json
{
  "success": true,
  "projectId": "uuid-here",
  "blueprint": {
    "projectId": "uuid-here",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "idea": {
      "raw": "...",
      "processed": {
        "title": "Task Management App",
        "description": "...",
        "slug": "task-management-app",
        "targetUsers": ["Developers"],
        "keyFeatures": ["User Authentication", "GitHub Integration"]
      }
    },
    "artifacts": {
      "prd": { /* PRD object */ },
      "architecture": { /* Architecture object */ },
      "schema": { /* Schema object */ },
      "api": { /* API plan object */ },
      "frontend": { /* Frontend plan object */ },
      "tests": { /* Test plan object */ },
      "deployment": { /* Deployment plan object */ },
      "bobPrompt": { /* IBM Bob prompt object */ }
    },
    "metadata": {
      "generationTime": 5000,
      "status": "complete",
      "version": "1.0.0"
    }
  }
}
```

**Error Response (400 Bad Request):**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid idea input",
    "details": ["Idea must be at least 20 characters long"]
  }
}
```

---

### List Blueprints

**GET** `/api/blueprints`

Get all blueprints (summary view).

**Response:**
```json
{
  "success": true,
  "blueprints": [
    {
      "projectId": "uuid-here",
      "title": "Task Management App",
      "description": "A task management app for developers...",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "status": "complete"
    }
  ]
}
```

---

### Get Blueprint by ID

**GET** `/api/blueprints/:id`

Get a specific blueprint by ID.

**Response:**
```json
{
  "success": true,
  "blueprint": { /* Full blueprint object */ }
}
```

**Error Response (404 Not Found):**
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Blueprint not found"
  }
}
```

---

### Export Blueprint as Markdown

**GET** `/api/blueprints/:id/export/markdown`

Export a blueprint as a professional Markdown document. The file is automatically saved to the `exports/` directory and returned as a downloadable file.

**Path Parameters:**
- `id` (required): Blueprint project ID

**Response Headers:**
- `Content-Type`: `text/markdown; charset=utf-8`
- `Content-Disposition`: `attachment; filename="{slug}-blueprint.md"`

**Response Body:**
Comprehensive Markdown document including:
- 📋 Project overview and metadata
- 💡 Original idea
- 🎯 Problem statement
- 👥 Target users
- 🔐 User roles and permissions
- ✨ Features (core, MVP, advanced)
- 📋 Non-functional requirements
- 🛠️ Tech stack details
- 🏗️ Architecture and components
- 🗄️ Database schema with tables
- 🌐 API routes and endpoints
- 📱 Frontend pages and structure
- 🧪 Test plan and strategy
- 🚀 Deployment plan
- 📋 GitHub issues
- 🤖 IBM Bob build prompt

**File Storage:**
Exported files are saved to: `exports/{projectId}/{slug}-blueprint-{timestamp}.md`

**Example Request:**
```bash
curl -X GET http://localhost:3001/api/blueprints/abc-123/export/markdown \
  -o my-blueprint.md
```

**Example Response:**
```markdown
# Task Management App

> **Blueprint Document**

A comprehensive task management application...

**Created:** January 1, 2024 at 12:00 PM
**Project ID:** abc-123
**Status:** Generated

---

## 💡 Original Idea

A task management app for developers with GitHub integration...

[... full markdown content ...]
```

**Error Response (404 Not Found):**
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Blueprint not found"
  }
}
```

**Error Response (500 Internal Server Error):**
```json
{
  "success": false,
  "error": {
    "code": "EXPORT_ERROR",
    "message": "Failed to export blueprint",
    "details": "Error details here"
  }
}
```

---

### Create Artifact

**POST** `/api/artifacts`

Create a new artifact.

**Request Body:**
```json
{
  "projectId": "uuid-here",
  "type": "prd",
  "content": { /* Artifact content */ }
}
```

**Valid Types:**
- `prd`
- `architecture`
- `schema`
- `api`
- `frontend`
- `tests`
- `deployment`
- `bobPrompt`

**Response (201 Created):**
```json
{
  "success": true,
  "artifactId": "uuid-here",
  "artifact": {
    "artifactId": "uuid-here",
    "projectId": "uuid-here",
    "type": "prd",
    "content": { /* Artifact content */ },
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

### List Artifacts

**GET** `/api/artifacts`

Get all artifacts, optionally filtered by project.

**Query Parameters:**
- `projectId` (optional): Filter by project ID

**Response:**
```json
{
  "success": true,
  "artifacts": [
    {
      "artifactId": "uuid-here",
      "projectId": "uuid-here",
      "type": "prd",
      "content": { /* Artifact content */ },
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

---

### Get Artifact by ID

**GET** `/api/artifacts/:id`

Get a specific artifact by ID.

**Response:**
```json
{
  "success": true,
  "artifact": { /* Artifact object */ }
}
```

## Generator Pipeline

The blueprint generation follows a sequential pipeline:

1. **Idea Processing** → Extract title, features, target users
2. **PRD Generator** → Product Requirements Document
3. **Architecture Generator** → System architecture and tech stack
4. **Schema Generator** → Database schema design
5. **API Plan Generator** → REST API endpoint specifications
6. **Frontend Plan Generator** → UI structure and components
7. **Test Plan Generator** → Testing strategy and test cases
8. **Deployment Plan Generator** → Deployment checklist
9. **IBM Bob Prompt Generator** → Complete build prompt for IBM Bob

Each generator receives context from previous generators and adds its artifact to the context.

## Data Storage

- **Location**: `backend/src/data/`
- **Format**: JSON files
- **Files**:
  - `blueprints.json` - All generated blueprints
  - `artifacts.json` - Individual artifacts

Data files are automatically created on first server start.

## Error Handling

All endpoints return structured error responses:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable message",
    "details": "Additional details (optional)"
  }
}
```

**Common Error Codes:**
- `VALIDATION_ERROR` (400) - Invalid input data
- `NOT_FOUND` (404) - Resource not found
- `GENERATION_ERROR` (500) - Blueprint generation failed
- `FETCH_ERROR` (500) - Data retrieval failed
- `INTERNAL_ERROR` (500) - Unexpected server error

## Development

### Adding a New Generator

1. Create generator file in `src/generators/`
2. Implement the standard interface:
   ```javascript
   async function generate(context) {
     // Validate context
     // Extract input
     // Generate artifact
     // Return enhanced context
   }
   module.exports = { generate };
   ```
3. Add to pipeline in `src/services/blueprint.service.js`

### Testing

The backend includes comprehensive automated tests using Jest and Supertest.

**Run all tests:**
```bash
npm test
```

**Run tests in watch mode:**
```bash
npm test:watch
```

**Run tests with coverage:**
```bash
npm test
```

**Test Coverage:**
The test suite includes:
- ✅ Health route tests
- ✅ Blueprint generation tests (validation, generation, storage)
- ✅ Markdown export tests (404 handling, content validation, IBM Bob prompt inclusion)
- ✅ Artifact tracker tests (CRUD operations, validation)

**Test Files:**
- `__tests__/health.test.js` - Health endpoint tests
- `__tests__/blueprint.test.js` - Blueprint generation and retrieval tests
- `__tests__/markdown-export.test.js` - Markdown export functionality tests
- `__tests__/artifact.test.js` - Artifact tracker tests

**Coverage Thresholds:**
- Branches: 70%
- Functions: 70%
- Lines: 70%
- Statements: 70%

**Test Isolation:**
Tests use backup/restore mechanisms to avoid corrupting existing data. Test data is automatically cleaned up after test runs.

### Code Style

- Use meaningful variable names
- Add comments for complex logic
- Follow existing patterns
- Handle errors properly

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3001` | Server port |
| `NODE_ENV` | `development` | Environment mode |
| `CORS_ORIGIN` | `http://localhost:5173` | Allowed CORS origin |
| `DATA_DIR` | `./src/data` | Data storage directory |

## Troubleshooting

### Server won't start

- Check if port 3001 is available
- Verify Node.js version (18+)
- Ensure all dependencies are installed

### Blueprint generation fails

- Check idea input meets validation requirements (20+ chars)
- Review server logs for specific error
- Verify data directory is writable

### CORS errors

- Update `CORS_ORIGIN` in `.env` to match frontend URL
- Restart server after changing environment variables

## Contributing

1. Follow existing code structure
2. Add error handling for all operations
3. Validate all inputs
4. Document new endpoints
5. Test thoroughly before committing

## License

MIT

## Support

For issues or questions, please refer to the project documentation or create an issue in the repository.

---

**Built for IBM Bob Hackathon** 🚀