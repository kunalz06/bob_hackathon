# BobForge Backend Test Suite

## Overview

Comprehensive automated test suite for the BobForge backend API using Jest and Supertest.

## Test Coverage

### 1. Health Route Tests (`__tests__/health.test.js`)
- ✅ Returns ok status
- ✅ Returns valid timestamp
- ✅ Returns correct service name and version

### 2. Blueprint Generation Tests (`__tests__/blueprint.test.js`)
- ✅ Rejects empty idea
- ✅ Rejects idea shorter than 20 characters
- ✅ Rejects missing idea field
- ✅ Generates blueprint for valid idea
- ✅ Generated blueprint contains all required fields:
  - projectName
  - coreFeatures
  - architecture
  - databaseSchema
  - apiRoutes
  - frontendPages
  - testPlan
  - deploymentPlan
  - bobBuildPrompt
- ✅ Saves blueprint to local JSON storage
- ✅ Lists all blueprints
- ✅ Returns blueprint by ID
- ✅ Returns 404 for non-existent blueprint

### 3. Markdown Export Tests (`__tests__/markdown-export.test.js`)
- ✅ Returns 404 for unknown blueprint ID
- ✅ Returns Markdown for valid blueprint
- ✅ Markdown contains IBM Bob build prompt
- ✅ Markdown includes all major sections:
  - Original Idea
  - Problem Statement
  - Features
  - Tech Stack
  - Architecture
  - Database Schema
  - API Routes
  - Frontend Pages
  - Test Plan
  - Deployment Plan
  - IBM Bob Build Prompt
- ✅ Sets correct Content-Disposition header
- ✅ Saves markdown file to exports directory

### 4. Artifact Tracker Tests (`__tests__/artifact.test.js`)
- ✅ Creates artifact with valid data
- ✅ Rejects artifact with missing filePath
- ✅ Rejects artifact with missing projectName
- ✅ Rejects artifact with missing artifactType
- ✅ Rejects artifact with missing purpose
- ✅ Creates artifact with optional fields
- ✅ Auto-generates ID and timestamp
- ✅ Lists all artifacts
- ✅ Filters artifacts by projectName
- ✅ Returns empty array for non-existent project
- ✅ Returns artifact by ID
- ✅ Returns 404 for non-existent artifact
- ✅ Deletes artifact by ID
- ✅ Returns 404 when deleting non-existent artifact

## Test Configuration

### Jest Configuration (`jest.config.js`)
```javascript
{
  testEnvironment: 'node',
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/server.js',
    '!src/data/**',
    '!**/node_modules/**'
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  },
  verbose: true,
  testTimeout: 10000
}
```

### Test Setup (`__tests__/setup.js`)
- Sets NODE_ENV to 'test'
- Uses different port (3002) for tests
- Prevents port conflicts with development server

## Running Tests

### Run all tests:
```bash
npm test
```

### Run tests in watch mode:
```bash
npm test:watch
```

### Run specific test file:
```bash
npx jest __tests__/health.test.js
```

## Test Isolation

All tests use backup/restore mechanisms to avoid corrupting existing data:

1. **Before tests**: Backup original data files
2. **Run tests**: Use test data
3. **After tests**: Restore original data files

This ensures:
- Tests don't affect production data
- Tests can run repeatedly without side effects
- Clean state for each test run

## Test Data Management

Test files automatically:
- Create backup files (`.test.backup.json`)
- Restore original data after tests
- Clean up temporary test files
- Handle missing data files gracefully

## Dependencies

- **jest**: ^29.7.0 - Testing framework
- **supertest**: ^6.3.3 - HTTP assertion library

## Coverage Goals

Target coverage: **70%** for:
- Branches
- Functions
- Lines
- Statements

## Best Practices

1. **Isolation**: Each test is independent
2. **Cleanup**: All tests clean up after themselves
3. **Descriptive names**: Test names clearly describe what they test
4. **Assertions**: Multiple assertions per test when appropriate
5. **Error cases**: Both success and failure scenarios tested
6. **Timeouts**: Extended timeouts for blueprint generation (15s)

## Future Enhancements

Potential additions:
- Integration tests for generator pipeline
- Performance tests for blueprint generation
- Load testing for concurrent requests
- Mock external dependencies
- Snapshot testing for generated content

---

**Built for IBM Bob Hackathon** 🚀