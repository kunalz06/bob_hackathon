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

    console.log('Starting blueprint generation...');

    // Execute generator pipeline sequentially
    console.log('1/8 Generating PRD...');
    context = await prdGenerator.generate(context);
    
    console.log('2/8 Generating Architecture...');
    context = await architectureGenerator.generate(context);
    
    console.log('3/8 Generating Database Schema...');
    context = await schemaGenerator.generate(context);
    
    console.log('4/8 Generating API Plan...');
    context = await apiPlanGenerator.generate(context);
    
    console.log('5/8 Generating Frontend Plan...');
    context = await frontendPlanGenerator.generate(context);
    
    console.log('6/8 Generating Test Plan...');
    context = await testPlanGenerator.generate(context);
    
    console.log('7/8 Generating Deployment Plan...');
    context = await deploymentPlanGenerator.generate(context);
    
    console.log('8/8 Generating IBM Bob Prompt...');
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

    console.log(`Blueprint generation complete in ${blueprint.metadata.generationTime}ms`);

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

/**
 * Extract target users from idea text
 * @param {string} idea - Idea text
 * @returns {Array} Target users
 */
function extractTargetUsers(idea) {
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
  if (lowerIdea.includes('customer') || lowerIdea.includes('client')) {
    users.push('Customers');
  }
  if (lowerIdea.includes('student') || lowerIdea.includes('teacher')) {
    users.push('Students/Teachers');
  }
  
  return users.length > 0 ? users : ['General Users'];
}

/**
 * Extract key features from idea text
 * @param {string} idea - Idea text
 * @returns {Array} Key features
 */
function extractKeyFeatures(idea) {
  const features = [];
  const lowerIdea = idea.toLowerCase();
  
  // Authentication
  if (lowerIdea.includes('auth') || lowerIdea.includes('login') || lowerIdea.includes('sign in')) {
    features.push('User Authentication');
  }
  
  // Dashboard
  if (lowerIdea.includes('dashboard')) {
    features.push('Dashboard');
  }
  
  // CRUD operations
  if (lowerIdea.includes('crud') || lowerIdea.includes('manage') || lowerIdea.includes('create')) {
    features.push('Data Management');
  }
  
  // Search
  if (lowerIdea.includes('search') || lowerIdea.includes('find')) {
    features.push('Search Functionality');
  }
  
  // Reports
  if (lowerIdea.includes('report') || lowerIdea.includes('analytics')) {
    features.push('Reporting & Analytics');
  }
  
  // API
  if (lowerIdea.includes('api') || lowerIdea.includes('integration')) {
    features.push('API Integration');
  }
  
  // Notifications
  if (lowerIdea.includes('notif') || lowerIdea.includes('alert')) {
    features.push('Notifications');
  }
  
  // File upload
  if (lowerIdea.includes('upload') || lowerIdea.includes('file')) {
    features.push('File Upload');
  }
  
  // Real-time
  if (lowerIdea.includes('real-time') || lowerIdea.includes('live')) {
    features.push('Real-time Updates');
  }
  
  // If no features detected, add generic ones
  if (features.length === 0) {
    features.push('Core Functionality', 'User Interface', 'Data Storage');
  }
  
  return features;
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

// Made with Bob
