# BobForge Backend Implementation Guide

## Overview

This guide provides detailed implementation instructions for each module in the BobForge backend, including code examples, best practices, and testing strategies.

## Module Implementation Order

Follow this order for optimal development flow:

1. **Project Setup** (package.json, .env.example, .gitignore)
2. **Utility Modules** (slugify, validators)
3. **Storage Service** (JSON file operations)
4. **Generator Modules** (8 generators)
5. **Service Layer** (blueprint, artifact services)
6. **Controllers** (business logic)
7. **Routes** (HTTP endpoints)
8. **Express App** (app.js, server.js)
9. **Documentation** (README.md)

---

## 1. Project Setup

### package.json

```json
{
  "name": "bobforge-backend",
  "version": "1.0.0",
  "description": "Backend API for BobForge - AI App Factory",
  "main": "src/server.js",
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js",
    "test": "echo \"Tests not implemented yet\" && exit 0"
  },
  "keywords": ["bobforge", "ai", "app-factory", "ibm-bob"],
  "author": "Your Name",
  "license": "MIT",
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
```

### .env.example

```env
# Server Configuration
PORT=3001
NODE_ENV=development

# CORS Configuration
CORS_ORIGIN=http://localhost:5173

# Data Storage
DATA_DIR=./src/data

# Application Settings
APP_NAME=BobForge
APP_VERSION=1.0.0
```

### .gitignore

```gitignore
# Dependencies
node_modules/
package-lock.json

# Environment
.env
.env.local

# Data (optional - comment out if you want to commit sample data)
src/data/*.json

# Logs
logs/
*.log
npm-debug.log*

# OS
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/
*.swp
*.swo

# Build
dist/
build/
```

---

## 2. Utility Modules

### src/utils/slugify.js

```javascript
/**
 * Convert a string to a URL-friendly slug
 * @param {string} text - Text to slugify
 * @returns {string} Slugified text
 */
function slugify(text) {
  if (!text || typeof text !== 'string') {
    return '';
  }

  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w\-]+/g, '')       // Remove non-word chars
    .replace(/\-\-+/g, '-')         // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start
    .replace(/-+$/, '');            // Trim - from end
}

module.exports = { slugify };
```

### src/utils/validators.js

```javascript
/**
 * Validate idea input
 * @param {string} idea - User's idea input
 * @returns {Object} Validation result
 */
function validateIdea(idea) {
  const errors = [];

  // Check if idea exists
  if (!idea) {
    errors.push('Idea is required');
  }

  // Check if idea is a string
  if (typeof idea !== 'string') {
    errors.push('Idea must be a string');
  }

  // Check minimum length
  if (idea && idea.trim().length < 20) {
    errors.push('Idea must be at least 20 characters long');
  }

  // Check if idea is not just whitespace
  if (idea && idea.trim().length === 0) {
    errors.push('Idea cannot be empty or only whitespace');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate UUID format
 * @param {string} id - ID to validate
 * @returns {boolean} True if valid UUID
 */
function isValidUUID(id) {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
}

/**
 * Validate artifact type
 * @param {string} type - Artifact type
 * @returns {boolean} True if valid type
 */
function isValidArtifactType(type) {
  const validTypes = [
    'prd',
    'architecture',
    'schema',
    'api',
    'frontend',
    'tests',
    'deployment',
    'bobPrompt'
  ];
  return validTypes.includes(type);
}

module.exports = {
  validateIdea,
  isValidUUID,
  isValidArtifactType
};
```

---

## 3. Storage Service

### src/data/blueprints.json (Initial)

```json
[]
```

### src/data/artifacts.json (Initial)

```json
[]
```

### src/services/storage.service.js

```javascript
const fs = require('fs').promises;
const path = require('path');

const DATA_DIR = path.join(__dirname, '../data');
const BLUEPRINTS_FILE = path.join(DATA_DIR, 'blueprints.json');
const ARTIFACTS_FILE = path.join(DATA_DIR, 'artifacts.json');

/**
 * Ensure data directory and files exist
 */
async function ensureDataFiles() {
  try {
    // Create data directory if it doesn't exist
    await fs.mkdir(DATA_DIR, { recursive: true });

    // Create blueprints.json if it doesn't exist
    try {
      await fs.access(BLUEPRINTS_FILE);
    } catch {
      await fs.writeFile(BLUEPRINTS_FILE, JSON.stringify([], null, 2));
    }

    // Create artifacts.json if it doesn't exist
    try {
      await fs.access(ARTIFACTS_FILE);
    } catch {
      await fs.writeFile(ARTIFACTS_FILE, JSON.stringify([], null, 2));
    }
  } catch (error) {
    console.error('Error ensuring data files:', error);
    throw error;
  }
}

/**
 * Read all blueprints
 * @returns {Promise<Array>} Array of blueprints
 */
async function readBlueprints() {
  await ensureDataFiles();
  const data = await fs.readFile(BLUEPRINTS_FILE, 'utf-8');
  return JSON.parse(data);
}

/**
 * Read blueprint by ID
 * @param {string} id - Blueprint ID
 * @returns {Promise<Object|null>} Blueprint or null if not found
 */
async function readBlueprintById(id) {
  const blueprints = await readBlueprints();
  return blueprints.find(bp => bp.projectId === id) || null;
}

/**
 * Save a new blueprint
 * @param {Object} blueprint - Blueprint to save
 * @returns {Promise<Object>} Saved blueprint
 */
async function saveBlueprint(blueprint) {
  const blueprints = await readBlueprints();
  blueprints.push(blueprint);
  await fs.writeFile(BLUEPRINTS_FILE, JSON.stringify(blueprints, null, 2));
  return blueprint;
}

/**
 * Update an existing blueprint
 * @param {string} id - Blueprint ID
 * @param {Object} updates - Updates to apply
 * @returns {Promise<Object|null>} Updated blueprint or null if not found
 */
async function updateBlueprint(id, updates) {
  const blueprints = await readBlueprints();
  const index = blueprints.findIndex(bp => bp.projectId === id);
  
  if (index === -1) {
    return null;
  }

  blueprints[index] = {
    ...blueprints[index],
    ...updates,
    updatedAt: new Date().toISOString()
  };

  await fs.writeFile(BLUEPRINTS_FILE, JSON.stringify(blueprints, null, 2));
  return blueprints[index];
}

/**
 * Delete a blueprint
 * @param {string} id - Blueprint ID
 * @returns {Promise<boolean>} True if deleted, false if not found
 */
async function deleteBlueprint(id) {
  const blueprints = await readBlueprints();
  const filtered = blueprints.filter(bp => bp.projectId !== id);
  
  if (filtered.length === blueprints.length) {
    return false;
  }

  await fs.writeFile(BLUEPRINTS_FILE, JSON.stringify(filtered, null, 2));
  return true;
}

/**
 * Read all artifacts
 * @param {string} projectId - Optional project ID filter
 * @returns {Promise<Array>} Array of artifacts
 */
async function readArtifacts(projectId = null) {
  await ensureDataFiles();
  const data = await fs.readFile(ARTIFACTS_FILE, 'utf-8');
  const artifacts = JSON.parse(data);
  
  if (projectId) {
    return artifacts.filter(a => a.projectId === projectId);
  }
  
  return artifacts;
}

/**
 * Read artifact by ID
 * @param {string} id - Artifact ID
 * @returns {Promise<Object|null>} Artifact or null if not found
 */
async function readArtifactById(id) {
  const artifacts = await readArtifacts();
  return artifacts.find(a => a.artifactId === id) || null;
}

/**
 * Save a new artifact
 * @param {Object} artifact - Artifact to save
 * @returns {Promise<Object>} Saved artifact
 */
async function saveArtifact(artifact) {
  const artifacts = await readArtifacts();
  artifacts.push(artifact);
  await fs.writeFile(ARTIFACTS_FILE, JSON.stringify(artifacts, null, 2));
  return artifact;
}

/**
 * Delete an artifact
 * @param {string} id - Artifact ID
 * @returns {Promise<boolean>} True if deleted, false if not found
 */
async function deleteArtifact(id) {
  const artifacts = await readArtifacts();
  const filtered = artifacts.filter(a => a.artifactId !== id);
  
  if (filtered.length === artifacts.length) {
    return false;
  }

  await fs.writeFile(ARTIFACTS_FILE, JSON.stringify(filtered, null, 2));
  return true;
}

module.exports = {
  ensureDataFiles,
  readBlueprints,
  readBlueprintById,
  saveBlueprint,
  updateBlueprint,
  deleteBlueprint,
  readArtifacts,
  readArtifactById,
  saveArtifact,
  deleteArtifact
};
```

---

## 4. Generator Modules

### Generator Template Structure

Each generator follows this pattern:

```javascript
/**
 * [Generator Name] Generator
 * Generates [artifact type] from context
 */

/**
 * Generate [artifact] from context
 * @param {Object} context - Accumulated context from previous generators
 * @returns {Object} Enhanced context with new artifact
 */
async function generate(context) {
  // 1. Validate input context
  validateContext(context);
  
  // 2. Extract relevant data
  const input = extractInput(context);
  
  // 3. Generate artifact
  const artifact = await generateArtifact(input);
  
  // 4. Validate output
  validateArtifact(artifact);
  
  // 5. Return enhanced context
  return {
    ...context,
    [artifactName]: artifact
  };
}

function validateContext(context) {
  // Validate required fields from previous generators
  if (!context.idea) {
    throw new Error('Context must include idea');
  }
  // Add more validations as needed
}

function extractInput(context) {
  // Extract relevant data from context
  return {
    // Extract fields needed for this generator
  };
}

async function generateArtifact(input) {
  // Generate the artifact using templates or AI
  // For MVP, use template-based generation
  return {
    // Artifact structure
  };
}

function validateArtifact(artifact) {
  // Validate generated artifact structure
  if (!artifact) {
    throw new Error('Artifact generation failed');
  }
  // Add more validations
}

module.exports = { generate };
```

### src/generators/prdGenerator.js (Example Implementation)

```javascript
const { slugify } = require('../utils/slugify');

/**
 * PRD Generator
 * Generates Product Requirements Document from processed idea
 */

async function generate(context) {
  validateContext(context);
  const input = extractInput(context);
  const prd = await generatePRD(input);
  validatePRD(prd);
  
  return {
    ...context,
    prd
  };
}

function validateContext(context) {
  if (!context.idea || !context.idea.processed) {
    throw new Error('Context must include processed idea');
  }
}

function extractInput(context) {
  return {
    title: context.idea.processed.title,
    description: context.idea.processed.description,
    targetUsers: context.idea.processed.targetUsers || [],
    keyFeatures: context.idea.processed.keyFeatures || []
  };
}

async function generatePRD(input) {
  // Template-based PRD generation for MVP
  return {
    title: input.title,
    overview: input.description,
    problemStatement: `This application addresses the need for ${input.description.toLowerCase()}.`,
    targetUsers: input.targetUsers.map(user => ({
      type: user,
      needs: [`Needs related to ${user}`],
      painPoints: [`Pain points for ${user}`]
    })),
    features: input.keyFeatures.map((feature, index) => ({
      id: `F${index + 1}`,
      name: feature,
      description: `Implementation of ${feature}`,
      priority: index < 3 ? 'High' : 'Medium',
      userStories: [
        `As a user, I want to ${feature.toLowerCase()} so that I can achieve my goals`
      ]
    })),
    userStories: input.keyFeatures.map((feature, index) => ({
      id: `US${index + 1}`,
      title: feature,
      description: `As a user, I want to ${feature.toLowerCase()}`,
      acceptanceCriteria: [
        'Feature is accessible',
        'Feature works as expected',
        'Feature provides value'
      ]
    })),
    successMetrics: [
      'User adoption rate',
      'Feature usage frequency',
      'User satisfaction score',
      'Task completion rate'
    ],
    constraints: [
      'Must be web-based',
      'Must be responsive',
      'Must be accessible',
      'Must follow best practices'
    ]
  };
}

function validatePRD(prd) {
  if (!prd || !prd.title || !prd.features) {
    throw new Error('Invalid PRD structure');
  }
}

module.exports = { generate };
```

### Generator Implementation Notes

For the MVP, implement these generators with template-based logic:

1. **prdGenerator.js** - Use the example above
2. **architectureGenerator.js** - Generate tech stack and component structure
3. **schemaGenerator.js** - Generate database tables based on features
4. **apiPlanGenerator.js** - Generate REST endpoints based on features
5. **frontendPlanGenerator.js** - Generate page structure based on features
6. **testPlanGenerator.js** - Generate test cases for features
7. **deploymentPlanGenerator.js** - Generate deployment checklist
8. **bobPromptGenerator.js** - Compile all artifacts into IBM Bob prompt

---

## 5. Service Layer

### src/services/blueprint.service.js

```javascript
const crypto = require('crypto');
const storageService = require('./storage.service');
const prdGenerator = require('../generators/prdGenerator');
const architectureGenerator = require('../generators/architectureGenerator');
const schemaGenerator = require('../generators/schemaGenerator');
const apiPlanGenerator = require('../generators/apiPlanGenerator');
const frontendPlanGenerator = require('../generators/frontendPlanGenerator');
const testPlanGenerator = require('../generators/testPlanGenerator');
const deploymentPlanGenerator = require('../generators/deploymentPlanGenerator');
const bobPromptGenerator = require('../generators/bobPromptGenerator');
const { slugify } = require('../utils/slugify');

/**
 * Generate complete blueprint from idea
 * @param {string} idea - User's idea input
 * @returns {Promise<Object>} Complete blueprint
 */
async function generateBlueprint(idea) {
  const startTime = Date.now();
  
  try {
    // Initialize context with processed idea
    let context = {
      idea: {
        raw: idea,
        processed: processIdea(idea)
      }
    };

    // Execute generator pipeline sequentially
    context = await prdGenerator.generate(context);
    context = await architectureGenerator.generate(context);
    context = await schemaGenerator.generate(context);
    context = await apiPlanGenerator.generate(context);
    context = await frontendPlanGenerator.generate(context);
    context = await testPlanGenerator.generate(context);
    context = await deploymentPlanGenerator.generate(context);
    context = await bobPromptGenerator.generate(context);

    // Create blueprint object
    const blueprint = {
      projectId: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      idea: context.idea,
      artifacts: {
        prd: context.prd,
        architecture: context.architecture,
        schema: context.schema,
        api: context.api,
        frontend: context.frontend,
        tests: context.tests,
        deployment: context.deployment,
        bobPrompt: context.bobPrompt
      },
      metadata: {
        generationTime: Date.now() - startTime,
        status: 'complete',
        version: '1.0.0'
      }
    };

    // Save blueprint
    await storageService.saveBlueprint(blueprint);

    return blueprint;
  } catch (error) {
    console.error('Blueprint generation failed:', error);
    throw error;
  }
}

/**
 * Process raw idea into structured format
 * @param {string} idea - Raw idea text
 * @returns {Object} Processed idea
 */
function processIdea(idea) {
  // Simple processing for MVP
  const lines = idea.split('\n').filter(line => line.trim());
  const title = lines[0] || 'Untitled Project';
  const description = lines.slice(1).join(' ') || idea;

  return {
    title: title.substring(0, 100),
    description: description.substring(0, 500),
    slug: slugify(title),
    targetUsers: extractTargetUsers(idea),
    keyFeatures: extractKeyFeatures(idea),
    techPreferences: {}
  };
}

function extractTargetUsers(idea) {
  // Simple extraction for MVP
  const lowerIdea = idea.toLowerCase();
  const users = [];
  
  if (lowerIdea.includes('developer') || lowerIdea.includes('programmer')) {
    users.push('Developers');
  }
  if (lowerIdea.includes('business') || lowerIdea.includes('manager')) {
    users.push('Business Users');
  }
  if (lowerIdea.includes('admin')) {
    users.push('Administrators');
  }
  
  return users.length > 0 ? users : ['General Users'];
}

function extractKeyFeatures(idea) {
  // Simple extraction for MVP
  const features = [];
  const lowerIdea = idea.toLowerCase();
  
  if (lowerIdea.includes('auth') || lowerIdea.includes('login')) {
    features.push('User Authentication');
  }
  if (lowerIdea.includes('dashboard')) {
    features.push('Dashboard');
  }
  if (lowerIdea.includes('crud') || lowerIdea.includes('manage')) {
    features.push('Data Management');
  }
  if (lowerIdea.includes('api')) {
    features.push('API Integration');
  }
  
  return features.length > 0 ? features : ['Core Functionality'];
}

/**
 * Get all blueprints
 * @returns {Promise<Array>} Array of blueprint summaries
 */
async function getAllBlueprints() {
  const blueprints = await storageService.readBlueprints();
  
  // Return summaries only
  return blueprints.map(bp => ({
    projectId: bp.projectId,
    title: bp.idea.processed.title,
    description: bp.idea.processed.description,
    createdAt: bp.createdAt,
    status: bp.metadata.status
  }));
}

/**
 * Get blueprint by ID
 * @param {string} id - Blueprint ID
 * @returns {Promise<Object|null>} Blueprint or null
 */
async function getBlueprintById(id) {
  return await storageService.readBlueprintById(id);
}

module.exports = {
  generateBlueprint,
  getAllBlueprints,
  getBlueprintById
};
```

### src/services/artifact.service.js

```javascript
const crypto = require('crypto');
const storageService = require('./storage.service');
const { isValidArtifactType } = require('../utils/validators');

/**
 * Create a new artifact
 * @param {Object} data - Artifact data
 * @returns {Promise<Object>} Created artifact
 */
async function createArtifact(data) {
  const { projectId, type, content } = data;

  if (!isValidArtifactType(type)) {
    throw new Error(`Invalid artifact type: ${type}`);
  }

  const artifact = {
    artifactId: crypto.randomUUID(),
    projectId,
    type,
    content,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  await storageService.saveArtifact(artifact);
  return artifact;
}

/**
 * Get all artifacts, optionally filtered by project
 * @param {string} projectId - Optional project ID filter
 * @returns {Promise<Array>} Array of artifacts
 */
async function getAllArtifacts(projectId = null) {
  return await storageService.readArtifacts(projectId);
}

/**
 * Get artifact by ID
 * @param {string} id - Artifact ID
 * @returns {Promise<Object|null>} Artifact or null
 */
async function getArtifactById(id) {
  return await storageService.readArtifactById(id);
}

module.exports = {
  createArtifact,
  getAllArtifacts,
  getArtifactById
};
```

---

## 6. Controllers

### src/controllers/blueprint.controller.js

```javascript
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

function generateMarkdown(blueprint) {
  // Simple Markdown generation for MVP
  return `# ${blueprint.idea.processed.title}

## Overview
${blueprint.idea.processed.description}

## Product Requirements Document
${JSON.stringify(blueprint.artifacts.prd, null, 2)}

## Architecture
${JSON.stringify(blueprint.artifacts.architecture, null, 2)}

## Database Schema
${JSON.stringify(blueprint.artifacts.schema, null, 2)}

## API Plan
${JSON.stringify(blueprint.artifacts.api, null, 2)}

## Frontend Plan
${JSON.stringify(blueprint.artifacts.frontend, null, 2)}

## Test Plan
${JSON.stringify(blueprint.artifacts.tests, null, 2)}

## Deployment Plan
${JSON.stringify(blueprint.artifacts.deployment, null, 2)}

## IBM Bob Build Prompt
${blueprint.artifacts.bobPrompt.prompt}
`;
}

module.exports = {
  generateBlueprint,
  getAllBlueprints,
  getBlueprintById,
  exportBlueprintMarkdown
};
```

### src/controllers/artifact.controller.js

```javascript
const artifactService = require('../services/artifact.service');

/**
 * Create a new artifact
 */
async function createArtifact(req, res) {
  try {
    const { projectId, type, content } = req.body;

    if (!projectId || !type || !content) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Missing required fields: projectId, type, content'
        }
      });
    }

    const artifact = await artifactService.createArtifact({ projectId, type, content });

    res.status(201).json({
      success: true,
      artifactId: artifact.artifactId,
      artifact
    });
  } catch (error) {
    console.error('Error creating artifact:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'CREATION_ERROR',
        message: 'Failed to create artifact',
        details: error.message
      }
    });
  }
}

/**
 * Get all artifacts
 */
async function getAllArtifacts(req, res) {
  try {
    const { projectId } = req.query;
    const artifacts = await artifactService.getAllArtifacts(projectId);

    res.json({
      success: true,
      artifacts
    });
  } catch (error) {
    console.error('Error fetching artifacts:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_ERROR',
        message: 'Failed to fetch artifacts',
        details: error.message
      }
    });
  }
}

/**
 * Get artifact by ID
 */
async function getArtifactById(req, res) {
  try {
    const { id } = req.params;
    const artifact = await artifactService.getArtifactById(id);

    if (!artifact) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Artifact not found'
        }
      });
    }

    res.json({
      success: true,
      artifact
    });
  } catch (error) {
    console.error('Error fetching artifact:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_ERROR',
        message: 'Failed to fetch artifact',
        details: error.message
      }
    });
  }
}

module.exports = {
  createArtifact,
  getAllArtifacts,
  getArtifactById
};
```

---

## 7. Routes

### src/routes/health.routes.js

```javascript
const express = require('express');
const router = express.Router();

/**
 * Health check endpoint
 */
router.get('/', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'BobForge Backend',
    version: '1.0.0'
  });
});

module.exports = router;
```

### src/routes/blueprint.routes.js

```javascript
const express = require('express');
const router = express.Router();
const blueprintController = require('../controllers/blueprint.controller');

// Generate new blueprint
router.post('/generate', blueprintController.generateBlueprint);

// Get all blueprints
router.get('/', blueprintController.getAllBlueprints);

// Get blueprint by ID
router.get('/:id', blueprintController.getBlueprintById);

// Export blueprint as Markdown
router.get('/:id/export/markdown', blueprintController.exportBlueprintMarkdown);

module.exports = router;
```

### src/routes/artifact.routes.js

```javascript
const express = require('express');
const router = express.Router();
const artifactController = require('../controllers/artifact.controller');

// Create new artifact
router.post('/', artifactController.createArtifact);

// Get all artifacts (with optional projectId query param)
router.get('/', artifactController.getAllArtifacts);

// Get artifact by ID
router.get('/:id', artifactController.getArtifactById);

module.exports = router;
```

---

## 8. Express App

### src/app.js

```javascript
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const healthRoutes = require('./routes/health.routes');
const blueprintRoutes = require('./routes/blueprint.routes');
const artifactRoutes = require('./routes/artifact.routes');

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/health', healthRoutes);
app.use('/api/blueprints', blueprintRoutes);
app.use('/api/artifacts', artifactRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: 'Endpoint not found'
    }
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    }
  });
});

module.exports = app;
```

### src/server.js

```javascript
require('dotenv').config();
const app = require('./app');
const { ensureDataFiles } = require('./services/storage.service');

const PORT = process.env.PORT || 3001;

// Initialize data files before starting server
async function startServer() {
  try {
    // Ensure data files exist
    await ensureDataFiles();
    console.log('Data files initialized');

    // Start server
    app.listen(PORT, () => {
      console.log(`
╔════════════════════════════════════════╗
║     BobForge Backend Server Started    ║
╠════════════════════════════════════════╣
║  Port: ${PORT}                           ║
║  Environment: ${process.env.NODE_ENV || 'development'}              ║
║  Time: ${new Date().toISOString()}  ║
╚════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
```

---

## 9. Documentation

### backend/README.md

```markdown
# BobForge Backend

Backend API for BobForge - AI-powered app factory for the IBM Bob Hackathon.

## Features

- Blueprint generation from idea input
- Sequential generator pipeline (PRD → Architecture → Schema → API → Frontend → Tests → Deployment → Bob Prompt)
- Local JSON file storage
- RESTful API endpoints
- Markdown export functionality

## Tech Stack

- Node.js (v18+)
- Express.js
- Local JSON storage
- CORS enabled

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file:
```bash
cp .env.example .env
```

3. Start development server:
```bash
npm run dev
```

4. Start production server:
```bash
npm start
```

## API Endpoints

### Health Check
- `GET /api/health` - Server health status

### Blueprints
- `POST /api/blueprints/generate` - Generate blueprint from idea
- `GET /api/blueprints` - List all blueprints
- `GET /api/blueprints/:id` - Get blueprint by ID
- `GET /api/blueprints/:id/export/markdown` - Export as Markdown

### Artifacts
- `POST /api/artifacts` - Create artifact
- `GET /api/artifacts` - List artifacts (optional ?projectId filter)
- `GET /api/artifacts/:id` - Get artifact by ID

## Project Structure

```
backend/
├── src/
│   ├── server.js              # Entry point
│   ├── app.js                 # Express app
│   ├── routes/                # Route handlers
│   ├── controllers/           # Business logic
│   ├── services/              # Service layer
│   ├── generators/            # Generator modules
│   ├── utils/                 # Utilities
│   └── data/                  # JSON storage
├── package.json
├── .env.example
└── README.md
```

## Development

- Run in development mode: `npm run dev`
- Run tests: `npm test`

## Environment Variables

See `.env.example` for required configuration.

## License

MIT
```

---

## Testing Checklist

After implementation, test these scenarios:

1. **Health Check**
   - GET /api/health returns 200 OK

2. **Blueprint Generation**
   - POST /api/blueprints/generate with valid idea (20+ chars)
   - POST /api/blueprints/generate with invalid idea (< 20 chars)
   - POST /api/blueprints/generate with missing idea

3. **Blueprint Retrieval**
   - GET /api/blueprints returns array
   - GET /api/blueprints/:id with valid ID
   - GET /api/blueprints/:id with invalid ID

4. **Blueprint Export**
   - GET /api/blueprints/:id/export/markdown downloads file

5. **Artifact Management**
   - POST /api/artifacts creates artifact
   - GET /api/artifacts returns array
   - GET /api/artifacts?projectId=xxx filters by project
   - GET /api/artifacts/:id returns artifact

6. **Error Handling**
   - Invalid endpoints return 404
   - Invalid data returns 400
   - Server errors return 500

---

## Next Steps

After completing the backend:

1. Test all endpoints with Postman/Thunder Client
2. Verify data persistence in JSON files
3. Check error handling for edge cases
4. Review code for consistency
5. Prepare for frontend integration
6. Document any issues or improvements needed

## Success Criteria

- ✅ All 8 API endpoints working
- ✅ Blueprint generation completes in < 10 seconds
- ✅ Data persists correctly to JSON files
- ✅ Proper error handling and validation
- ✅ Clean, maintainable code structure
- ✅ README documentation complete