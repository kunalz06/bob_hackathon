/**
 * Application-wide constants
 */

const path = require('path');

const PATHS = {
  DATA_DIR: path.join(__dirname, '../data'),
  BLUEPRINTS_FILE: path.join(__dirname, '../data/blueprints.json'),
  ARTIFACTS_FILE: path.join(__dirname, '../data/artifacts.json'),
  EXPORTS_DIR: path.join(__dirname, '../../exports'),
};

const VALIDATION = {
  MIN_IDEA_LENGTH: 10,
  MAX_IDEA_LENGTH: 1000,
  MIN_TITLE_LENGTH: 3,
  MAX_TITLE_LENGTH: 200,
  MIN_DESCRIPTION_LENGTH: 10,
  MAX_DESCRIPTION_LENGTH: 5000,
};

const GENERATOR_TYPES = {
  PRD: 'prd',
  ARCHITECTURE: 'architecture',
  SCHEMA: 'schema',
  API_PLAN: 'apiPlan',
  FRONTEND_PLAN: 'frontendPlan',
  TEST_PLAN: 'testPlan',
  DEPLOYMENT_PLAN: 'deploymentPlan',
  BOB_PROMPT: 'bobPrompt',
  GITHUB_ISSUES: 'githubIssues',
};

const ARTIFACT_TYPES = {
  SESSION_REPORT: 'session_report',
  CODE_GENERATION: 'code_generation',
  REFACTORING: 'refactoring',
  TESTING: 'testing',
  DOCUMENTATION: 'documentation',
};

const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  NOT_FOUND: 404,
  INTERNAL_ERROR: 500,
};

module.exports = {
  PATHS,
  VALIDATION,
  GENERATOR_TYPES,
  ARTIFACT_TYPES,
  HTTP_STATUS,
};

// Made with Bob
