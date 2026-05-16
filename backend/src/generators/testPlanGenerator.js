/**
 * Test Plan Generator
 * Generates comprehensive testing strategy from frontend and API plans
 */

/**
 * Generate test plan from context
 * @param {Object} context - Accumulated context including frontend plan
 * @returns {Object} Enhanced context with test plan artifact
 */
async function generate(context) {
  validateContext(context);
  const input = extractInput(context);
  const tests = await generateTestPlan(input);
  validateTestPlan(tests);
  
  return {
    ...context,
    tests
  };
}

function validateContext(context) {
  if (!context.frontend) {
    throw new Error('Context must include frontend plan');
  }
}

function extractInput(context) {
  return {
    title: context.idea.processed.title,
    features: context.prd.features || [],
    endpoints: context.api.endpoints || [],
    pages: context.frontend.pages || [],
    components: context.frontend.components || []
  };
}

async function generateTestPlan(input) {
  const unitTests = [];
  const integrationTests = [];
  const e2eTests = [];

  // Backend unit tests
  input.endpoints.forEach(endpoint => {
    if (endpoint.path !== '/api/health') {
      unitTests.push({
        category: 'Backend API',
        name: `${endpoint.method} ${endpoint.path}`,
        description: `Test ${endpoint.description}`,
        testCases: [
          {
            name: 'Should return success response with valid data',
            type: 'positive',
            setup: 'Mock valid request data',
            execution: `Call ${endpoint.method} ${endpoint.path}`,
            assertion: 'Response status matches expected success code',
            priority: 'high'
          },
          {
            name: 'Should return error with invalid data',
            type: 'negative',
            setup: 'Mock invalid request data',
            execution: `Call ${endpoint.method} ${endpoint.path}`,
            assertion: 'Response status is 400 with error message',
            priority: 'high'
          },
          ...(endpoint.authentication ? [{
            name: 'Should return 401 without authentication',
            type: 'security',
            setup: 'No authentication token',
            execution: `Call ${endpoint.method} ${endpoint.path}`,
            assertion: 'Response status is 401',
            priority: 'high'
          }] : [])
        ]
      });
    }
  });

  // Frontend component unit tests
  input.components.forEach(component => {
    unitTests.push({
      category: 'Frontend Component',
      name: component.name,
      description: `Test ${component.description}`,
      testCases: [
        {
          name: 'Should render without crashing',
          type: 'smoke',
          setup: 'Render component with default props',
          execution: 'Component renders',
          assertion: 'Component is in the document',
          priority: 'high'
        },
        {
          name: 'Should handle props correctly',
          type: 'functional',
          setup: 'Render component with various props',
          execution: 'Pass different prop values',
          assertion: 'Component displays correct data',
          priority: 'medium'
        },
        ...(component.type === 'Form Component' ? [{
          name: 'Should validate form inputs',
          type: 'validation',
          setup: 'Render form with validation rules',
          execution: 'Submit form with invalid data',
          assertion: 'Validation errors are displayed',
          priority: 'high'
        }] : [])
      ]
    });
  });

  // Integration tests
  input.features.forEach(feature => {
    integrationTests.push({
      category: 'Feature Integration',
      name: feature.name,
      description: `Test ${feature.name} end-to-end flow`,
      testCases: [
        {
          name: `Should complete ${feature.name.toLowerCase()} workflow`,
          type: 'workflow',
          setup: 'Set up test database and mock data',
          execution: 'Execute complete feature workflow',
          assertion: 'All steps complete successfully',
          priority: 'high'
        },
        {
          name: 'Should handle API errors gracefully',
          type: 'error-handling',
          setup: 'Mock API error responses',
          execution: 'Trigger feature with error conditions',
          assertion: 'Error messages displayed to user',
          priority: 'medium'
        }
      ]
    });
  });

  // E2E tests for critical user flows
  input.pages.forEach(page => {
    if (page.protected || page.path === '/') {
      e2eTests.push({
        category: 'User Flow',
        name: `${page.name} Flow`,
        description: `Test complete user flow for ${page.description}`,
        testCases: [
          {
            name: `Should navigate to ${page.path} and interact`,
            type: 'user-flow',
            setup: 'Start browser and navigate to application',
            execution: `Navigate to ${page.path} and perform actions`,
            assertion: 'Page loads and interactions work correctly',
            priority: page.path === '/' ? 'critical' : 'high'
          },
          ...(page.protected ? [{
            name: 'Should redirect unauthenticated users',
            type: 'security',
            setup: 'Clear authentication tokens',
            execution: `Navigate to ${page.path}`,
            assertion: 'User is redirected to login page',
            priority: 'high'
          }] : [])
        ]
      });
    }
  });

  // Add authentication flow E2E test if auth is present
  if (input.endpoints.some(e => e.path.includes('/auth/'))) {
    e2eTests.push({
      category: 'Authentication Flow',
      name: 'Complete Authentication Flow',
      description: 'Test user registration, login, and logout',
      testCases: [
        {
          name: 'Should register new user',
          type: 'user-flow',
          setup: 'Navigate to registration page',
          execution: 'Fill form and submit',
          assertion: 'User is registered and redirected',
          priority: 'critical'
        },
        {
          name: 'Should login with valid credentials',
          type: 'user-flow',
          setup: 'Navigate to login page',
          execution: 'Enter credentials and submit',
          assertion: 'User is logged in and redirected to dashboard',
          priority: 'critical'
        },
        {
          name: 'Should logout successfully',
          type: 'user-flow',
          setup: 'User is logged in',
          execution: 'Click logout button',
          assertion: 'User is logged out and redirected to home',
          priority: 'high'
        }
      ]
    });
  }

  return {
    strategy: {
      approach: 'Test-Driven Development (TDD) encouraged',
      pyramid: {
        unit: '70% - Fast, isolated tests',
        integration: '20% - Component interaction tests',
        e2e: '10% - Critical user flow tests'
      },
      automation: 'Fully automated test suite',
      cicd: 'Tests run on every commit and PR'
    },
    unitTests: {
      framework: 'Vitest (backend) + React Testing Library (frontend)',
      coverage: {
        target: '80% code coverage',
        statements: '80%',
        branches: '75%',
        functions: '80%',
        lines: '80%'
      },
      tests: unitTests,
      totalTests: unitTests.reduce((sum, test) => sum + test.testCases.length, 0)
    },
    integrationTests: {
      framework: 'Vitest + Supertest (API) + React Testing Library (Frontend)',
      approach: 'Test component and API integration',
      tests: integrationTests,
      totalTests: integrationTests.reduce((sum, test) => sum + test.testCases.length, 0)
    },
    e2eTests: {
      framework: 'Playwright',
      browsers: ['Chromium', 'Firefox', 'WebKit'],
      approach: 'Test critical user journeys',
      tests: e2eTests,
      totalTests: e2eTests.reduce((sum, test) => sum + test.testCases.length, 0)
    },
    performanceTesting: {
      tool: 'Lighthouse CI',
      metrics: [
        'First Contentful Paint < 1.8s',
        'Largest Contentful Paint < 2.5s',
        'Time to Interactive < 3.8s',
        'Cumulative Layout Shift < 0.1',
        'Total Blocking Time < 200ms'
      ]
    },
    securityTesting: {
      tools: ['npm audit', 'Snyk', 'OWASP ZAP'],
      checks: [
        'Dependency vulnerability scanning',
        'SQL injection prevention',
        'XSS prevention',
        'CSRF protection',
        'Authentication/authorization'
      ]
    },
    accessibilityTesting: {
      tool: 'axe-core + Lighthouse',
      standards: 'WCAG 2.1 Level AA',
      checks: [
        'Keyboard navigation',
        'Screen reader compatibility',
        'Color contrast',
        'ARIA labels',
        'Focus management'
      ]
    },
    testData: {
      approach: 'Factory pattern for test data generation',
      tools: ['Faker.js for mock data'],
      strategy: 'Isolated test database for integration tests'
    },
    cicdIntegration: {
      pipeline: 'GitHub Actions',
      stages: [
        'Lint and format check',
        'Unit tests',
        'Integration tests',
        'E2E tests (on main branch)',
        'Coverage report',
        'Security scan'
      ],
      failurePolicy: 'Block merge if tests fail'
    },
    reportingAndMonitoring: {
      coverage: 'Codecov / Coveralls',
      testResults: 'GitHub Actions summary',
      trends: 'Track test execution time and flakiness'
    }
  };
}

function validateTestPlan(tests) {
  if (!tests || !tests.unitTests || !tests.integrationTests || !tests.e2eTests) {
    throw new Error('Invalid test plan structure');
  }
}

module.exports = { generate };

// Made with Bob
