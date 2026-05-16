const blueprintService = require('../services/blueprint.service');
const { validateIdea } = require('../utils/validators');

/**
 * Generate a new blueprint
 */
async function generateBlueprint(req, res) {
  try {
    const { idea } = req.body;

    // Validate idea
    const validation = validateIdea(idea);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid idea input',
          details: validation.errors
        }
      });
    }

    // Generate blueprint
    const blueprint = await blueprintService.generateBlueprint(idea);

    res.status(201).json({
      success: true,
      projectId: blueprint.projectId,
      blueprint
    });
  } catch (error) {
    console.error('Error generating blueprint:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'GENERATION_ERROR',
        message: 'Failed to generate blueprint',
        details: error.message
      }
    });
  }
}

/**
 * Get all blueprints
 */
async function getAllBlueprints(req, res) {
  try {
    const blueprints = await blueprintService.getAllBlueprints();

    res.json({
      success: true,
      blueprints
    });
  } catch (error) {
    console.error('Error fetching blueprints:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_ERROR',
        message: 'Failed to fetch blueprints',
        details: error.message
      }
    });
  }
}

/**
 * Get blueprint by ID
 */
async function getBlueprintById(req, res) {
  try {
    const { id } = req.params;
    const blueprint = await blueprintService.getBlueprintById(id);

    if (!blueprint) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Blueprint not found'
        }
      });
    }

    res.json({
      success: true,
      blueprint
    });
  } catch (error) {
    console.error('Error fetching blueprint:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_ERROR',
        message: 'Failed to fetch blueprint',
        details: error.message
      }
    });
  }
}

/**
 * Export blueprint as Markdown
 */
async function exportBlueprintMarkdown(req, res) {
  try {
    const { id } = req.params;
    const blueprint = await blueprintService.getBlueprintById(id);

    if (!blueprint) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Blueprint not found'
        }
      });
    }

    // Generate Markdown content
    const markdown = generateMarkdown(blueprint);

    // Set headers for file download
    res.setHeader('Content-Type', 'text/markdown');
    res.setHeader('Content-Disposition', `attachment; filename="${blueprint.idea.processed.slug}-blueprint.md"`);
    res.send(markdown);
  } catch (error) {
    console.error('Error exporting blueprint:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'EXPORT_ERROR',
        message: 'Failed to export blueprint',
        details: error.message
      }
    });
  }
}

/**
 * Generate Markdown from blueprint
 * @param {Object} blueprint - Blueprint object
 * @returns {string} Markdown content
 */
function generateMarkdown(blueprint) {
  const { idea, artifacts, metadata } = blueprint;
  
  return `# ${idea.processed.title}

## Project Overview
${idea.processed.description}

**Created:** ${new Date(blueprint.createdAt).toLocaleString()}  
**Generation Time:** ${metadata.generationTime}ms  
**Status:** ${metadata.status}

---

## Product Requirements Document

### Overview
${artifacts.prd.overview}

### Problem Statement
${artifacts.prd.problemStatement}

### Target Users
${artifacts.prd.targetUsers.map(user => `
**${user.type}**
- Needs: ${user.needs.join(', ')}
- Pain Points: ${user.painPoints.join(', ')}
`).join('\n')}

### Features
${artifacts.prd.features.map(feature => `
#### ${feature.id}: ${feature.name} (${feature.priority} Priority)
${feature.description}

**User Stories:**
${feature.userStories.map(story => `- ${story}`).join('\n')}

**Acceptance Criteria:**
${feature.acceptanceCriteria.map(criteria => `- ${criteria}`).join('\n')}
`).join('\n')}

### Success Metrics
${artifacts.prd.successMetrics.map(metric => `- ${metric}`).join('\n')}

---

## Architecture

### Overview
${artifacts.architecture.overview}

### Architecture Pattern
${artifacts.architecture.architecturePattern}

### Components
${artifacts.architecture.components.map(comp => `
**${comp.name}**
${comp.description}

Technologies: ${comp.technologies.join(', ')}

Responsibilities:
${comp.responsibilities.map(r => `- ${r}`).join('\n')}
`).join('\n')}

### Tech Stack

**Frontend:**
- Framework: ${artifacts.architecture.techStack.frontend.framework}
- State Management: ${artifacts.architecture.techStack.frontend.stateManagement}
- Styling: ${artifacts.architecture.techStack.frontend.styling}

**Backend:**
- Runtime: ${artifacts.architecture.techStack.backend.runtime}
- Framework: ${artifacts.architecture.techStack.backend.framework}

**Database:**
- Database: ${artifacts.architecture.techStack.database.primary}
- ORM: ${artifacts.architecture.techStack.database.orm}

---

## Database Schema

### Database
${artifacts.schema.database} ${artifacts.schema.version}

### Tables
${artifacts.schema.tables.map(table => `
**${table.name}**
${table.description}

Columns:
${table.columns.map(col => `- ${col.name}: ${col.type}${col.primaryKey ? ' (PK)' : ''}${col.unique ? ' (UNIQUE)' : ''}`).join('\n')}

Indexes:
${table.indexes.map(idx => `- ${idx.name}`).join('\n')}
`).join('\n')}

---

## API Endpoints

### Base URL
${artifacts.api.baseUrl}

### Authentication
${artifacts.api.authentication.type}

### Endpoints
${artifacts.api.endpoints.map(endpoint => `
**${endpoint.method} ${endpoint.path}**
${endpoint.description}
${endpoint.authentication ? '🔒 Requires Authentication' : '🌐 Public'}
`).join('\n')}

---

## Frontend Structure

### Framework
${artifacts.frontend.framework}

### Pages
${artifacts.frontend.pages.map(page => `
**${page.name}**
- Route: ${page.path}
- ${page.description}
- Components: ${page.components.join(', ')}
`).join('\n')}

### State Management
- Global: ${artifacts.frontend.stateManagement.global}
- Forms: ${artifacts.frontend.stateManagement.forms}
- Server: ${artifacts.frontend.stateManagement.server}

---

## Testing Strategy

### Coverage Target
${artifacts.tests.unitTests.coverage.target}

### Test Counts
- Unit Tests: ${artifacts.tests.unitTests.totalTests}
- Integration Tests: ${artifacts.tests.integrationTests.totalTests}
- E2E Tests: ${artifacts.tests.e2eTests.totalTests}

### Frameworks
- Unit: ${artifacts.tests.unitTests.framework}
- Integration: ${artifacts.tests.integrationTests.framework}
- E2E: ${artifacts.tests.e2eTests.framework}

---

## Deployment Plan

### Platforms
- Frontend: ${artifacts.deployment.platforms.frontend.platform}
- Backend: ${artifacts.deployment.platforms.backend.platform}
- Database: ${artifacts.deployment.platforms.database.platform}

### Deployment Steps
${artifacts.deployment.steps.map(phase => `
**${phase.phase}**
${phase.tasks.map(task => `
${task.name}:
${task.checklist.map(item => `  - [ ] ${item}`).join('\n')}
`).join('\n')}
`).join('\n')}

---

## IBM Bob Build Prompt

${artifacts.bobPrompt.prompt}

---

## Metadata

- **Project ID:** ${blueprint.projectId}
- **Created:** ${blueprint.createdAt}
- **Updated:** ${blueprint.updatedAt}
- **Generation Time:** ${metadata.generationTime}ms
- **Version:** ${metadata.version}

---

*Generated by BobForge - AI App Factory*
`;
}

module.exports = {
  generateBlueprint,
  getAllBlueprints,
  getBlueprintById,
  exportBlueprintMarkdown
};

// Made with Bob
