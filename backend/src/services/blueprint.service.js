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
const githubIssuesGenerator = require('../generators/githubIssuesGenerator');
const { slugify } = require('../utils/slugify');
const { GeneratorError, ValidationError } = require('../utils/errors');

/**
 * Execute a generator with error handling
 * @param {Object} generator - Generator module with generate function
 * @param {string} generatorName - Name of generator for error messages
 * @param {Object} context - Context object to pass to generator
 * @returns {Promise<Object>} Updated context
 * @throws {GeneratorError} If generation fails
 */
async function executeGenerator(generator, generatorName, context) {
  try {
    if (!generator || typeof generator.generate !== 'function') {
      throw new Error(`Invalid generator: ${generatorName}`);
    }
    
    const result = await generator.generate(context);
    
    if (!result) {
      throw new Error(`No output produced`);
    }
    
    return result;
  } catch (error) {
    throw new GeneratorError(error.message, generatorName);
  }
}

/**
 * Generate complete blueprint from idea
 * @param {string} idea - User's idea input
 * @returns {Promise<Object>} Complete blueprint
 * @throws {ValidationError} If idea is invalid
 * @throws {GeneratorError} If any generator fails
 */
async function generateBlueprint(idea) {
  if (!idea || typeof idea !== 'string' || idea.trim().length === 0) {
    throw new ValidationError('Idea is required and must be a non-empty string');
  }

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
    console.log('1/9 Generating PRD...');
    context = await executeGenerator(prdGenerator, 'PRD', context);
    
    console.log('2/9 Generating Architecture...');
    context = await executeGenerator(architectureGenerator, 'Architecture', context);
    
    console.log('3/9 Generating Database Schema...');
    context = await executeGenerator(schemaGenerator, 'Schema', context);
    
    console.log('4/9 Generating API Plan...');
    context = await executeGenerator(apiPlanGenerator, 'API Plan', context);
    
    console.log('5/9 Generating Frontend Plan...');
    context = await executeGenerator(frontendPlanGenerator, 'Frontend Plan', context);
    
    console.log('6/9 Generating Test Plan...');
    context = await executeGenerator(testPlanGenerator, 'Test Plan', context);
    
    console.log('7/9 Generating Deployment Plan...');
    context = await executeGenerator(deploymentPlanGenerator, 'Deployment Plan', context);
    
    console.log('8/9 Generating GitHub Issues...');
    context = await executeGenerator(githubIssuesGenerator, 'GitHub Issues', context);
    
    console.log('9/9 Generating IBM Bob Prompt...');
    context = await executeGenerator(bobPromptGenerator, 'Bob Prompt', context);

    // Generate clean project name
    const projectName = generateProjectName(context.idea.processed.title);
    const slug = slugify(projectName);

    // Create blueprint object with all required fields
    const blueprint = {
      id: crypto.randomUUID(),
      projectName: projectName,
      slug: slug,
      idea: context.idea.raw,
      problemStatement: context.prd.problemStatement,
      targetUsers: context.prd.targetUsers.map(u => u.type),
      userRoles: context.prd.userRoles,
      coreFeatures: context.prd.coreFeatures,
      mvpFeatures: context.prd.mvpFeatures,
      advancedFeatures: context.prd.advancedFeatures,
      nonFunctionalRequirements: context.prd.nonFunctionalRequirements,
      techStack: context.architecture.techStack,
      architecture: context.architecture,
      architectureDiagramText: context.architecture.architectureDiagramText,
      databaseSchema: context.schema,
      apiRoutes: context.api.endpoints,
      frontendPages: context.frontend.pages,
      testPlan: context.tests,
      deploymentPlan: context.deployment,
      githubIssues: context.githubIssues.issues,
      bobBuildPrompt: context.bobPrompt.prompt,
      createdAt: new Date().toISOString(),
      
      // Keep full artifacts for backward compatibility
      artifacts: {
        prd: context.prd,
        architecture: context.architecture,
        schema: context.schema,
        api: context.api,
        frontend: context.frontend,
        tests: context.tests,
        deployment: context.deployment,
        githubIssues: context.githubIssues,
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
 * Generate a clean project name from title
 * @param {string} title - Raw title
 * @returns {string} Clean project name
 */
function generateProjectName(title) {
  // Remove common generic words
  const genericWords = ['app', 'system', 'application', 'platform', 'tool', 'software', 'solution'];
  
  let name = title.trim();
  
  // If title is just a generic word, keep it but make it more specific
  const lowerName = name.toLowerCase();
  const isGeneric = genericWords.some(word => lowerName === word || lowerName === word + 's');
  
  if (isGeneric) {
    return 'My ' + name;
  }
  
  // Remove trailing generic words if they exist
  genericWords.forEach(word => {
    const regex = new RegExp(`\\s+${word}$`, 'i');
    name = name.replace(regex, '');
  });
  
  // Capitalize first letter of each word
  name = name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
  
  return name.trim() || 'My Project';
}

/**
 * Get all blueprints
 * @returns {Promise<Array>} Array of blueprint summaries
 */
async function getAllBlueprints() {
  const blueprints = await storageService.readBlueprints();
  
  // Return summaries only
  return blueprints.map(bp => ({
    projectId: bp.id || bp.projectId,
    projectName: bp.projectName || bp.idea?.processed?.title || 'Untitled',
    slug: bp.slug,
    description: bp.idea?.processed?.description || bp.problemStatement || '',
    createdAt: bp.createdAt,
    status: bp.metadata?.status || 'complete'
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
