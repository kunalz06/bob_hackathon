/**
 * IBM Bob Prompt Generator
 * Generates comprehensive build prompt for IBM Bob from all artifacts
 */

/**
 * Generate IBM Bob build prompt from context
 * @param {Object} context - Complete context with all artifacts
 * @returns {Object} Enhanced context with Bob prompt artifact
 */
async function generate(context) {
  validateContext(context);
  const input = extractInput(context);
  const bobPrompt = await generateBobPrompt(input);
  validateBobPrompt(bobPrompt);
  
  return {
    ...context,
    bobPrompt
  };
}

function validateContext(context) {
  if (!context.deployment) {
    throw new Error('Context must include deployment plan');
  }
}

function extractInput(context) {
  return {
    title: context.idea.processed.title,
    description: context.idea.processed.description,
    prd: context.prd,
    architecture: context.architecture,
    schema: context.schema,
    api: context.api,
    frontend: context.frontend,
    tests: context.tests,
    deployment: context.deployment
  };
}

async function generateBobPrompt(input) {
  const prompt = `# IBM Bob Build Prompt: ${input.title}

## Project Overview
${input.description}

## Your Mission
Build a complete, production-ready ${input.title} application following the specifications below. This is a comprehensive blueprint that includes all technical details needed for implementation.

---

## 1. Product Requirements

### Features to Implement
${(input.prd.features || []).map((f, i) => `${i + 1}. **${f.name}** (Priority: ${f.priority})
   - ${f.description}
   - User Story: ${(f.userStories || [])[0] || 'N/A'}
   - Acceptance Criteria:
${(f.acceptanceCriteria || []).map(ac => `     - ${ac}`).join('\n')}`).join('\n\n')}

### Success Metrics
${(input.prd.successMetrics || []).map(m => `- ${m}`).join('\n')}

---

## 2. Technical Architecture

### System Architecture
${input.architecture.overview}

### Tech Stack
**Frontend:**
- Framework: ${input.architecture.techStack.frontend.framework}
- State Management: ${input.architecture.techStack.frontend.stateManagement}
- Styling: ${input.architecture.techStack.frontend.styling}
- Routing: ${input.architecture.techStack.frontend.routing}

**Backend:**
- Runtime: ${input.architecture.techStack.backend.runtime}
- Framework: ${input.architecture.techStack.backend.framework}
- Authentication: ${input.architecture.techStack.backend.authentication}

**Database:**
- Database: ${input.architecture.techStack.database.primary}
- ORM: ${input.architecture.techStack.database.orm}

---

## 3. Database Schema

### Tables to Create
${input.schema.tables.map(table => `
**${table.name}**
${table.description}

Columns:
${table.columns.map(col => `- ${col.name}: ${col.type}${col.primaryKey ? ' (PRIMARY KEY)' : ''}${col.unique ? ' (UNIQUE)' : ''}${col.nullable === false ? ' (NOT NULL)' : ''}`).join('\n')}

Indexes:
${table.indexes.map(idx => `- ${idx.name} on (${idx.columns.join(', ')})${idx.unique ? ' UNIQUE' : ''}`).join('\n')}
`).join('\n')}

### Relationships
${input.schema.relationships.map(rel => `- ${rel.from} → ${rel.to} (${rel.type}) via ${rel.foreignKey}`).join('\n')}

---

## 4. API Endpoints

### Base URL
${input.api.baseUrl}

### Authentication
${input.api.authentication.type}
${input.api.authentication.type !== 'None' ? `- Header: ${input.api.authentication.header}\n- Token Expiry: ${input.api.authentication.tokenExpiry}` : ''}

### Endpoints to Implement
${input.api.endpoints.map(endpoint => `
**${endpoint.method} ${endpoint.path}**
${endpoint.description}
${endpoint.authentication ? '🔒 Requires Authentication' : '🌐 Public'}

${endpoint.requestBody ? `Request Body:\n${JSON.stringify(endpoint.requestBody, null, 2)}` : ''}
${endpoint.queryParams ? `Query Parameters:\n${JSON.stringify(endpoint.queryParams, null, 2)}` : ''}
${endpoint.pathParams ? `Path Parameters:\n${JSON.stringify(endpoint.pathParams, null, 2)}` : ''}

Responses:
${Object.entries(endpoint.responses).map(([code, resp]) => `- ${code}: ${resp.description}`).join('\n')}
`).join('\n')}

---

## 5. Frontend Structure

### Pages to Build
${input.frontend.pages.map(page => `
**${page.name}**
- Route: ${page.path}
- Description: ${page.description}
- Layout: ${page.layout}
${page.protected ? '- 🔒 Protected Route (requires authentication)' : '- 🌐 Public Route'}
- Components: ${page.components.join(', ')}
- Features:
${page.features.map(f => `  - ${f}`).join('\n')}
`).join('\n')}

### Components to Build
${input.frontend.components.slice(0, 10).map(comp => `
**${comp.name}** (${comp.type})
- ${comp.description}
- Props: ${comp.props ? comp.props.join(', ') : 'None'}
${comp.state ? `- State: ${comp.state.join(', ')}` : ''}
`).join('\n')}

${input.frontend.components.length > 10 ? `\n... and ${input.frontend.components.length - 10} more components` : ''}

### State Management
- Global State: ${input.frontend.stateManagement.global}
- Form Handling: ${input.frontend.stateManagement.forms}
- Server State: ${input.frontend.stateManagement.server}

---

## 6. Testing Requirements

### Test Coverage Target
- Overall: ${input.tests.unitTests.coverage.target}
- Unit Tests: ${input.tests.unitTests.totalTests} tests
- Integration Tests: ${input.tests.integrationTests.totalTests} tests
- E2E Tests: ${input.tests.e2eTests.totalTests} tests

### Testing Frameworks
- Unit: ${input.tests.unitTests.framework}
- Integration: ${input.tests.integrationTests.framework}
- E2E: ${input.tests.e2eTests.framework}

### Critical Test Scenarios
${input.tests.e2eTests.tests.slice(0, 5).map(test => `
**${test.name}**
${test.testCases.map(tc => `- ${tc.name} (${tc.priority} priority)`).join('\n')}
`).join('\n')}

---

## 7. Deployment Instructions

### Platform Recommendations
- **Frontend**: ${input.deployment.platforms.frontend.platform}
- **Backend**: ${input.deployment.platforms.backend.platform}
- **Database**: ${input.deployment.platforms.database.platform}

### Environment Variables Required

**Frontend:**
${input.deployment.platforms.frontend.configuration.environmentVariables.map(v => `- ${v}`).join('\n')}

**Backend:**
${input.deployment.platforms.backend.configuration.environmentVariables.map(v => `- ${v}`).join('\n')}

### Deployment Steps
${input.deployment.steps.map(phase => `
**${phase.phase}** (Step ${phase.order})
${phase.tasks.map(task => `
${task.name}:
${task.checklist.map(item => `  ☐ ${item}`).join('\n')}
`).join('\n')}
`).join('\n')}

---

## 8. Security Considerations

### Implementation Requirements
${input.architecture.security ? Object.entries(input.architecture.security).map(([key, value]) => `- **${key}**: ${value}`).join('\n') : 'Standard security practices'}

### Security Checklist
- ☐ Input validation on all endpoints
- ☐ SQL injection prevention via ORM
- ☐ XSS protection with Content Security Policy
- ☐ CSRF protection for state-changing operations
- ☐ Rate limiting on API endpoints
- ☐ Secure password hashing (bcrypt)
- ☐ HTTPS/TLS encryption
- ☐ Environment variables for secrets

---

## 9. Performance Optimizations

### Backend
${input.architecture.performanceOptimizations.slice(0, 3).map(opt => `- ${opt}`).join('\n')}

### Frontend
${input.frontend.performance.optimizations.slice(0, 3).map(opt => `- ${opt}`).join('\n')}

---

## 10. Code Quality Standards

### Requirements
- ✅ Clean, readable code with meaningful variable names
- ✅ Comprehensive comments for complex logic
- ✅ Consistent code formatting (Prettier)
- ✅ ESLint rules followed
- ✅ No console.log statements in production
- ✅ Error handling for all async operations
- ✅ Proper TypeScript types (if using TypeScript)

---

## 11. Documentation Requirements

### Must Include
1. **README.md** with setup instructions
2. **API Documentation** (OpenAPI/Swagger)
3. **Component Documentation** (Storybook optional)
4. **Environment Variables Guide**
5. **Deployment Guide**
6. **Contributing Guidelines**

---

## 12. IBM Bob Specific Instructions

### Build Approach
1. **Start with Backend**: Set up Express server, database models, and API endpoints
2. **Then Frontend**: Build React components and pages
3. **Integration**: Connect frontend to backend APIs
4. **Testing**: Write and run tests
5. **Deployment**: Deploy to recommended platforms

### Code Organization
- Use modular architecture with clear separation of concerns
- Follow the directory structure specified in the architecture
- Keep files focused and under 300 lines when possible
- Use meaningful file and folder names

### Best Practices
- Write self-documenting code
- Add error handling for all operations
- Validate all user inputs
- Use environment variables for configuration
- Follow REST API conventions
- Implement proper logging

### Deliverables
1. ✅ Fully functional application
2. ✅ All features implemented and tested
3. ✅ Comprehensive documentation
4. ✅ Deployed and accessible
5. ✅ Source code in Git repository

---

## Success Criteria

The application is complete when:
- ✅ All ${(input.prd.features || []).length} features are implemented
- ✅ All ${(input.api.endpoints || []).length} API endpoints are working
- ✅ All ${(input.frontend.pages || []).length} pages are built and functional
- ✅ Test coverage meets ${input.tests?.unitTests?.coverage?.target || '80%'} target
- ✅ Application is deployed and accessible
- ✅ Documentation is complete and clear

---

## Additional Context

**Project Type**: ${input.architecture.architecturePattern}
**Estimated Complexity**: Medium
**Estimated Timeline**: 2-3 weeks for full implementation
**Target Users**: ${input.prd.targetUsers.map(u => u.type).join(', ')}

---

## Final Notes

This is a complete blueprint for building ${input.title}. Follow the specifications carefully, implement all features, write tests, and deploy the application. Focus on code quality, security, and user experience. Good luck! 🚀`;

  return {
    prompt,
    metadata: {
      generatedAt: new Date().toISOString(),
      totalFeatures: (input.prd.features || []).length,
      totalEndpoints: (input.api.endpoints || []).length,
      totalPages: (input.frontend.pages || []).length,
      totalComponents: (input.frontend.components || []).length,
      estimatedComplexity: 'Medium',
      estimatedTimeline: '2-3 weeks'
    },
    instructions: [
      'Read the entire prompt carefully before starting',
      'Follow the specified tech stack and architecture',
      'Implement features in priority order',
      'Write tests as you build features',
      'Document your code and decisions',
      'Deploy early and iterate',
      'Ask for clarification if anything is unclear'
    ],
    expectedOutput: {
      codeRepository: 'Git repository with complete source code',
      documentation: 'README and API documentation',
      deployment: 'Live, accessible application',
      tests: 'Comprehensive test suite',
      quality: 'Production-ready code'
    }
  };
}

function validateBobPrompt(bobPrompt) {
  if (!bobPrompt || !bobPrompt.prompt || bobPrompt.prompt.length < 100) {
    throw new Error('Invalid Bob prompt structure');
  }
}

module.exports = { generate };

// Made with Bob
