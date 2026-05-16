const path = require('path');
const { writeJSON } = require('../services/storage.service');
const { StorageError } = require('../utils/errors');
const { PATHS } = require('../config/constants');
const fs = require('fs').promises;

/**
 * Export blueprint as professional Markdown document
 * @param {Object} blueprint - Complete blueprint object
 * @returns {string} Formatted Markdown content
 * @throws {Error} If blueprint is invalid
 */
function exportToMarkdown(blueprint) {
  if (!blueprint || typeof blueprint !== 'object') {
    throw new Error('Invalid blueprint object');
  }

  const sections = [];

  // Title and Overview
  sections.push(generateHeader(blueprint));
  
  // Idea Section
  sections.push(generateIdeaSection(blueprint));
  
  // Problem Statement
  sections.push(generateProblemStatement(blueprint));
  
  // Target Users
  sections.push(generateTargetUsers(blueprint));
  
  // User Roles
  sections.push(generateUserRoles(blueprint));
  
  // Features
  sections.push(generateFeaturesSection(blueprint));
  
  // Non-Functional Requirements
  sections.push(generateNonFunctionalRequirements(blueprint));
  
  // Tech Stack
  sections.push(generateTechStack(blueprint));
  
  // Architecture
  sections.push(generateArchitecture(blueprint));
  
  // Database Schema
  sections.push(generateDatabaseSchema(blueprint));
  
  // API Routes
  sections.push(generateApiRoutes(blueprint));
  
  // Frontend Pages
  sections.push(generateFrontendPages(blueprint));
  
  // Test Plan
  sections.push(generateTestPlan(blueprint));
  
  // Deployment Plan
  sections.push(generateDeploymentPlan(blueprint));
  
  // GitHub Issues
  sections.push(generateGitHubIssues(blueprint));
  
  // IBM Bob Build Prompt
  sections.push(generateBobPrompt(blueprint));
  
  // Metadata Footer
  sections.push(generateFooter(blueprint));

  return sections.join('\n\n');
}

/**
 * Save markdown to exports directory
 * @param {Object} blueprint - Blueprint object
 * @param {string} markdown - Markdown content
 * @returns {Promise<string>} File path where markdown was saved
 * @throws {StorageError} If save fails
 */
async function saveMarkdownToFile(blueprint, markdown) {
  try {
    const projectId = blueprint.projectId || blueprint.id;
    const slug = blueprint.slug || blueprint.projectName || projectId;
    
    if (!projectId) {
      throw new Error('Blueprint must have an id or projectId');
    }
    
    // Create exports directory structure
    const exportsDir = path.join(PATHS.EXPORTS_DIR, projectId);
    
    // Ensure directory exists
    await fs.mkdir(exportsDir, { recursive: true });
    
    // Generate filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const filename = `${slug}-blueprint-${timestamp}.md`;
    const filepath = path.join(exportsDir, filename);
    
    // Write file
    await fs.writeFile(filepath, markdown, 'utf8');
    
    return filepath;
  } catch (error) {
    throw new StorageError(`Failed to save markdown file: ${error.message}`);
  }
}

/**
 * Safely get nested property with default value
 * @param {Object} obj - Object to traverse
 * @param {string} path - Dot-separated path
 * @param {any} defaultValue - Default value if path not found
 * @returns {any} Value at path or default
 */
function safeGet(obj, path, defaultValue = '') {
  return path.split('.').reduce((acc, part) => acc && acc[part], obj) || defaultValue;
}

/**
 * Generate header section
 */
function generateHeader(blueprint) {
  const title = safeGet(blueprint, 'projectName', 'Untitled Project');
  const description = safeGet(blueprint, 'idea', '');
  const createdAt = new Date(blueprint.createdAt || Date.now()).toLocaleString('en-US', {
    dateStyle: 'full',
    timeStyle: 'short'
  });
  
  return `# ${title}

> **Blueprint Document**

${description}

**Created:** ${createdAt}  
**Project ID:** ${blueprint.id || blueprint.projectId || 'N/A'}  
**Status:** ${safeGet(blueprint, 'metadata.status', 'Generated')}

---`;
}

/**
 * Generate idea section
 */
function generateIdeaSection(blueprint) {
  const idea = blueprint.idea || 'No idea provided';
  
  return `## 💡 Original Idea

${idea}`;
}

/**
 * Generate problem statement
 */
function generateProblemStatement(blueprint) {
  const problem = blueprint.problemStatement || 
                  safeGet(blueprint, 'artifacts.prd.problemStatement', 'No problem statement defined');
  
  return `## 🎯 Problem Statement

${problem}`;
}

/**
 * Generate target users section
 */
function generateTargetUsers(blueprint) {
  const users = blueprint.targetUsers || 
                safeGet(blueprint, 'artifacts.prd.targetUsers', []);
  
  if (!Array.isArray(users) || users.length === 0) {
    return `## 👥 Target Users

No target users defined.`;
  }
  
  let content = `## 👥 Target Users\n\n`;
  
  if (typeof users[0] === 'string') {
    content += users.map(user => `- ${user}`).join('\n');
  } else if (typeof users[0] === 'object') {
    content += users.map(user => `
### ${user.type || user.name || 'User'}

**Needs:**
${(user.needs || []).map(need => `- ${need}`).join('\n') || '- Not specified'}

**Pain Points:**
${(user.painPoints || []).map(point => `- ${point}`).join('\n') || '- Not specified'}
`).join('\n');
  }
  
  return content;
}

/**
 * Generate user roles section
 */
function generateUserRoles(blueprint) {
  const roles = blueprint.userRoles || [];
  
  if (!Array.isArray(roles) || roles.length === 0) {
    return `## 🔐 User Roles

No user roles defined.`;
  }
  
  return `## 🔐 User Roles

${roles.map(role => `
### ${role.name || 'Unnamed Role'}

${role.description || 'No description'}

**Permissions:**
${(role.permissions || []).map(perm => `- ${perm}`).join('\n') || '- None specified'}
`).join('\n')}`;
}

/**
 * Generate features section
 */
function generateFeaturesSection(blueprint) {
  const coreFeatures = blueprint.coreFeatures || [];
  const mvpFeatures = blueprint.mvpFeatures || [];
  const advancedFeatures = blueprint.advancedFeatures || [];
  const prdFeatures = safeGet(blueprint, 'artifacts.prd.features', []);
  
  let content = `## ✨ Features\n\n`;
  
  // Core Features
  if (Array.isArray(coreFeatures) && coreFeatures.length > 0) {
    content += `### Core Features\n\n`;
    content += coreFeatures.map(feature => `
**${feature.id || ''} ${feature.name || 'Unnamed Feature'}** (${feature.priority || 'Medium'} Priority)

${feature.description || 'No description'}
`).join('\n');
  }
  
  // MVP Features
  if (Array.isArray(mvpFeatures) && mvpFeatures.length > 0) {
    content += `\n### MVP Features\n\n`;
    content += mvpFeatures.map(feature => `
- **${feature.name || 'Unnamed'}** (${feature.priority || 'Medium'} Priority): ${feature.description || 'No description'}
`).join('\n');
  }
  
  // Advanced Features
  if (Array.isArray(advancedFeatures) && advancedFeatures.length > 0) {
    content += `\n### Advanced Features\n\n`;
    content += advancedFeatures.map(feature => `
- **${feature.name || 'Unnamed'}** (${feature.priority || 'Low'} Priority): ${feature.description || 'No description'}
`).join('\n');
  }
  
  // PRD Features with User Stories
  if (Array.isArray(prdFeatures) && prdFeatures.length > 0) {
    content += `\n### Detailed Feature Specifications\n\n`;
    content += prdFeatures.map(feature => `
#### ${feature.id || 'F-?'}: ${feature.name || 'Unnamed'} (${feature.priority || 'Medium'} Priority)

${feature.description || 'No description'}

**User Stories:**
${(feature.userStories || []).map(story => `- ${story}`).join('\n') || '- None specified'}

**Acceptance Criteria:**
${(feature.acceptanceCriteria || []).map(criteria => `- ${criteria}`).join('\n') || '- None specified'}
`).join('\n');
  }
  
  if (coreFeatures.length === 0 && mvpFeatures.length === 0 && advancedFeatures.length === 0 && prdFeatures.length === 0) {
    content += 'No features defined.\n';
  }
  
  return content;
}

/**
 * Generate non-functional requirements
 */
function generateNonFunctionalRequirements(blueprint) {
  const nfr = blueprint.nonFunctionalRequirements || {};
  
  if (Object.keys(nfr).length === 0) {
    return `## 📋 Non-Functional Requirements

No non-functional requirements defined.`;
  }
  
  return `## 📋 Non-Functional Requirements

${Object.entries(nfr).map(([category, requirements]) => `
### ${category.charAt(0).toUpperCase() + category.slice(1)}

${Array.isArray(requirements) ? requirements.map(req => `- ${req}`).join('\n') : '- Not specified'}
`).join('\n')}`;
}

/**
 * Generate tech stack section
 */
function generateTechStack(blueprint) {
  const techStack = blueprint.techStack || 
                    safeGet(blueprint, 'artifacts.architecture.techStack', {});
  
  if (Object.keys(techStack).length === 0) {
    return `## 🛠️ Tech Stack

No tech stack defined.`;
  }
  
  let content = `## 🛠️ Tech Stack\n\n`;
  
  // Frontend
  if (techStack.frontend && typeof techStack.frontend === 'object') {
    content += `### Frontend\n\n`;
    content += Object.entries(techStack.frontend)
      .map(([key, value]) => `- **${key}:** ${value}`)
      .join('\n');
    content += '\n\n';
  }
  
  // Backend
  if (techStack.backend && typeof techStack.backend === 'object') {
    content += `### Backend\n\n`;
    content += Object.entries(techStack.backend)
      .map(([key, value]) => `- **${key}:** ${value}`)
      .join('\n');
    content += '\n\n';
  }
  
  // Database
  if (techStack.database && typeof techStack.database === 'object') {
    content += `### Database\n\n`;
    content += Object.entries(techStack.database)
      .map(([key, value]) => `- **${key}:** ${value}`)
      .join('\n');
  }
  
  return content;
}

/**
 * Generate architecture section
 */
function generateArchitecture(blueprint) {
  const architecture = blueprint.architecture || 
                       safeGet(blueprint, 'artifacts.architecture', {});
  
  let content = `## 🏗️ Architecture\n\n`;
  
  if (architecture.overview) {
    content += `### Overview\n\n${architecture.overview}\n\n`;
  }
  
  if (architecture.architecturePattern) {
    content += `### Architecture Pattern\n\n${architecture.architecturePattern}\n\n`;
  }
  
  if (Array.isArray(architecture.components) && architecture.components.length > 0) {
    content += `### Components\n\n`;
    content += architecture.components.map(comp => `
**${comp.name || 'Unnamed Component'}**

${comp.description || 'No description'}

- **Technologies:** ${Array.isArray(comp.technologies) ? comp.technologies.join(', ') : 'Not specified'}

**Responsibilities:**
${Array.isArray(comp.responsibilities) ? comp.responsibilities.map(r => `- ${r}`).join('\n') : '- Not specified'}
`).join('\n');
  }
  
  // Architecture Diagram
  const diagram = blueprint.architectureDiagramText || 
                  safeGet(blueprint, 'artifacts.architecture.diagram');
  
  if (diagram) {
    content += `\n### Architecture Diagram\n\n\`\`\`\n${diagram}\n\`\`\`\n`;
  }
  
  if (!architecture.overview && !architecture.architecturePattern && (!architecture.components || architecture.components.length === 0)) {
    content += 'No architecture details defined.\n';
  }
  
  return content;
}

/**
 * Generate database schema section
 */
function generateDatabaseSchema(blueprint) {
  const schema = blueprint.databaseSchema || 
                 safeGet(blueprint, 'artifacts.schema', {});
  
  if (!schema.tables || !Array.isArray(schema.tables) || schema.tables.length === 0) {
    return `## 🗄️ Database Schema

No database schema defined.`;
  }
  
  let content = `## 🗄️ Database Schema\n\n`;
  
  content += `**Database:** ${schema.database || 'Not specified'} ${schema.version || ''}\n\n`;
  
  content += `### Tables\n\n`;
  
  content += schema.tables.map(table => `
#### ${table.name || 'Unnamed Table'}

${table.description || ''}

**Columns:**

| Column | Type | Constraints |
|--------|------|-------------|
${Array.isArray(table.columns) ? table.columns.map(col => {
  const constraints = [];
  if (col.primaryKey) constraints.push('PRIMARY KEY');
  if (col.unique) constraints.push('UNIQUE');
  if (col.nullable === false) constraints.push('NOT NULL');
  if (col.default) constraints.push(`DEFAULT ${col.default}`);
  if (col.foreignKey) constraints.push(`FK → ${col.foreignKey}`);
  return `| ${col.name || 'unnamed'} | ${col.type || 'unknown'} | ${constraints.join(', ') || '-'} |`;
}).join('\n') : '| - | - | - |'}

${Array.isArray(table.indexes) && table.indexes.length > 0 ? `**Indexes:**
${table.indexes.map(idx => `- ${idx.name || 'unnamed'}${idx.unique ? ' (UNIQUE)' : ''}`).join('\n')}` : ''}
`).join('\n');
  
  return content;
}

/**
 * Generate API routes section
 */
function generateApiRoutes(blueprint) {
  const routes = blueprint.apiRoutes || 
                 safeGet(blueprint, 'artifacts.api.endpoints', []);
  
  if (!Array.isArray(routes) || routes.length === 0) {
    return `## 🌐 API Routes

No API routes defined.`;
  }
  
  const baseUrl = safeGet(blueprint, 'artifacts.api.baseUrl', '/api');
  const authType = safeGet(blueprint, 'artifacts.api.authentication.type', 'JWT');
  
  let content = `## 🌐 API Routes\n\n`;
  content += `**Base URL:** ${baseUrl}\n`;
  content += `**Authentication:** ${authType}\n\n`;
  
  content += `### Endpoints\n\n`;
  
  content += `| Method | Path | Description | Auth Required |\n`;
  content += `|--------|------|-------------|---------------|\n`;
  
  content += routes.map(route => {
    const method = route.method || 'GET';
    const path = route.path || '/';
    const description = route.description || '';
    const auth = route.authentication ? '🔒 Yes' : '🌐 No';
    return `| ${method} | ${path} | ${description} | ${auth} |`;
  }).join('\n');
  
  return content;
}

/**
 * Generate frontend pages section
 */
function generateFrontendPages(blueprint) {
  const pages = blueprint.frontendPages || 
                safeGet(blueprint, 'artifacts.frontend.pages', []);
  
  if (!Array.isArray(pages) || pages.length === 0) {
    return `## 📱 Frontend Pages

No frontend pages defined.`;
  }
  
  const framework = safeGet(blueprint, 'artifacts.frontend.framework') || 
                    safeGet(blueprint, 'techStack.frontend.framework', 'React');
  
  let content = `## 📱 Frontend Pages\n\n`;
  content += `**Framework:** ${framework}\n\n`;
  
  content += pages.map(page => `
### ${page.name || 'Unnamed Page'}

- **Route:** ${page.path || '/'}
- **Protected:** ${page.protected ? '🔒 Yes' : '🌐 No'}
- **Description:** ${page.description || 'No description'}
${Array.isArray(page.components) && page.components.length > 0 ? `- **Components:** ${page.components.join(', ')}` : ''}
`).join('\n');
  
  // State Management
  const stateManagement = safeGet(blueprint, 'artifacts.frontend.stateManagement');
  if (stateManagement && typeof stateManagement === 'object') {
    content += `\n### State Management\n\n`;
    content += Object.entries(stateManagement)
      .map(([key, value]) => `- **${key}:** ${value}`)
      .join('\n');
  }
  
  return content;
}

/**
 * Generate test plan section
 */
function generateTestPlan(blueprint) {
  const testPlan = blueprint.testPlan || 
                   safeGet(blueprint, 'artifacts.tests', {});
  
  if (Object.keys(testPlan).length === 0) {
    return `## 🧪 Test Plan

No test plan defined.`;
  }
  
  let content = `## 🧪 Test Plan\n\n`;
  
  // Strategy
  if (testPlan.strategy) {
    content += `### Testing Strategy\n\n`;
    if (testPlan.strategy.approach) {
      content += `**Approach:** ${testPlan.strategy.approach}\n\n`;
    }
    if (testPlan.strategy.pyramid && typeof testPlan.strategy.pyramid === 'object') {
      content += `**Test Pyramid:**\n`;
      content += Object.entries(testPlan.strategy.pyramid)
        .map(([level, desc]) => `- **${level}:** ${desc}`)
        .join('\n');
      content += '\n\n';
    }
  }
  
  // Unit Tests
  if (testPlan.unitTests) {
    content += `### Unit Tests\n\n`;
    content += `- **Framework:** ${testPlan.unitTests.framework || 'Not specified'}\n`;
    content += `- **Total Tests:** ${testPlan.unitTests.totalTests || 0}\n`;
    if (testPlan.unitTests.coverage) {
      content += `- **Coverage Target:** ${testPlan.unitTests.coverage.target || 'Not specified'}\n`;
    }
    content += '\n';
  }
  
  // Integration Tests
  if (testPlan.integrationTests) {
    content += `### Integration Tests\n\n`;
    content += `- **Framework:** ${testPlan.integrationTests.framework || 'Not specified'}\n`;
    content += `- **Total Tests:** ${testPlan.integrationTests.totalTests || 0}\n\n`;
  }
  
  // E2E Tests
  if (testPlan.e2eTests) {
    content += `### End-to-End Tests\n\n`;
    content += `- **Framework:** ${testPlan.e2eTests.framework || 'Not specified'}\n`;
    content += `- **Total Tests:** ${testPlan.e2eTests.totalTests || 0}\n`;
  }
  
  return content;
}

/**
 * Generate deployment plan section
 */
function generateDeploymentPlan(blueprint) {
  const deployment = blueprint.deploymentPlan || 
                     safeGet(blueprint, 'artifacts.deployment', {});
  
  if (Object.keys(deployment).length === 0) {
    return `## 🚀 Deployment Plan

No deployment plan defined.`;
  }
  
  let content = `## 🚀 Deployment Plan\n\n`;
  
  // Platforms
  if (deployment.platforms) {
    content += `### Deployment Platforms\n\n`;
    
    if (deployment.platforms.frontend) {
      content += `**Frontend:** ${deployment.platforms.frontend.platform || 'Not specified'}\n`;
    }
    if (deployment.platforms.backend) {
      content += `**Backend:** ${deployment.platforms.backend.platform || 'Not specified'}\n`;
    }
    if (deployment.platforms.database) {
      content += `**Database:** ${deployment.platforms.database.platform || 'Not specified'}\n`;
    }
    content += '\n';
  }
  
  // Deployment Steps
  if (Array.isArray(deployment.steps) && deployment.steps.length > 0) {
    content += `### Deployment Steps\n\n`;
    content += deployment.steps.map(phase => `
#### ${phase.phase || 'Unnamed Phase'}

${Array.isArray(phase.tasks) ? phase.tasks.map(task => `
**${task.name || 'Unnamed Task'}**

${Array.isArray(task.checklist) ? task.checklist.map(item => `- [ ] ${item}`).join('\n') : '- No checklist'}
`).join('\n') : 'No tasks defined'}
`).join('\n');
  }
  
  return content;
}

/**
 * Generate GitHub issues section
 */
function generateGitHubIssues(blueprint) {
  const issues = blueprint.githubIssues || 
                 safeGet(blueprint, 'artifacts.githubIssues.issues', []);
  
  if (!Array.isArray(issues) || issues.length === 0) {
    return `## 📋 GitHub Issues

No GitHub issues defined.`;
  }
  
  let content = `## 📋 GitHub Issues\n\n`;
  content += `Total Issues: ${issues.length}\n\n`;
  
  // Group by priority
  const priorities = ['Critical', 'High', 'Medium', 'Low'];
  
  priorities.forEach(priority => {
    const priorityIssues = issues.filter(issue => issue.priority === priority);
    if (priorityIssues.length > 0) {
      content += `### ${priority} Priority\n\n`;
      content += priorityIssues.map(issue => `
#### #${issue.number || '?'}: ${issue.title || 'Untitled'}

${issue.description || 'No description'}

- **Labels:** ${Array.isArray(issue.labels) ? issue.labels.join(', ') : 'None'}
- **Module:** ${issue.affectedModule || 'General'}
`).join('\n');
    }
  });
  
  return content;
}

/**
 * Generate IBM Bob build prompt section
 */
function generateBobPrompt(blueprint) {
  const prompt = blueprint.bobBuildPrompt || 
                 safeGet(blueprint, 'artifacts.bobPrompt.prompt', 'No IBM Bob build prompt generated.');
  
  return `## 🤖 IBM Bob Build Prompt

\`\`\`
${prompt}
\`\`\`

---

**How to use this prompt:**
1. Copy the entire prompt above
2. Paste it into IBM Bob
3. Let Bob guide you through the implementation
4. Document the session in \`bob_sessions/\` directory`;
}

/**
 * Generate footer with metadata
 */
function generateFooter(blueprint) {
  const createdAt = new Date(blueprint.createdAt || Date.now()).toLocaleString();
  const updatedAt = blueprint.updatedAt ? new Date(blueprint.updatedAt).toLocaleString() : createdAt;
  
  return `---

## 📊 Metadata

- **Project ID:** ${blueprint.id || blueprint.projectId || 'N/A'}
- **Created:** ${createdAt}
- **Updated:** ${updatedAt}
- **Generation Time:** ${safeGet(blueprint, 'metadata.generationTime', 0)}ms
- **Version:** ${safeGet(blueprint, 'metadata.version', '1.0.0')}

---

*Generated by **BobForge** - AI App Factory*  
*Powered by IBM Bob for the IBM Bob Hackathon*`;
}

module.exports = {
  exportToMarkdown,
  saveMarkdownToFile
};

// Made with Bob
