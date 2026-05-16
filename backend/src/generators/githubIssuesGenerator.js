/**
 * GitHub Issues Generator
 * Generates GitHub issues for project implementation
 */

/**
 * Generate GitHub issues from context
 * @param {Object} context - Accumulated context including all artifacts
 * @returns {Object} Enhanced context with GitHub issues artifact
 */
async function generate(context) {
  validateContext(context);
  const input = extractInput(context);
  const githubIssues = await generateGithubIssues(input);
  validateGithubIssues(githubIssues);
  
  return {
    ...context,
    githubIssues
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
    features: context.prd.features || [],
    tables: context.schema.tables || [],
    endpoints: context.api.endpoints || [],
    pages: context.frontend.pages || [],
    hasAuth: context.api.authentication?.type !== 'None'
  };
}

async function generateGithubIssues(input) {
  const issues = [];
  let issueNumber = 1;

  // Setup issues
  issues.push({
    number: issueNumber++,
    title: 'Project Setup and Configuration',
    description: `Initialize the project with proper structure and configuration files.

**Tasks:**
- [ ] Initialize Git repository
- [ ] Set up frontend (React + Vite + Tailwind)
- [ ] Set up backend (Node.js + Express)
- [ ] Configure ESLint and Prettier
- [ ] Create .env.example files
- [ ] Set up basic folder structure
- [ ] Initialize package.json with dependencies`,
    priority: 'Critical',
    labels: ['setup', 'infrastructure'],
    affectedModule: 'Project Setup',
    acceptanceCriteria: [
      'Project structure follows best practices',
      'All configuration files are in place',
      'Dependencies are properly installed',
      'Development environment runs without errors'
    ],
    estimatedHours: 4
  });

  // Database setup
  issues.push({
    number: issueNumber++,
    title: 'Database Schema Implementation',
    description: `Set up database and implement the complete schema.

**Tables to Create:**
${input.tables.map(t => `- ${t.name} (${t.columns.length} columns)`).join('\n')}

**Tasks:**
- [ ] Set up SQLite database
- [ ] Create migration files
- [ ] Implement all ${input.tables.length} tables
- [ ] Add indexes and constraints
- [ ] Create seed data
- [ ] Test database connections`,
    priority: 'Critical',
    labels: ['database', 'backend'],
    affectedModule: 'Database',
    acceptanceCriteria: [
      'All tables created with correct schema',
      'Relationships properly defined',
      'Indexes created for performance',
      'Seed data loads successfully'
    ],
    estimatedHours: 6
  });

  // Authentication (if needed)
  if (input.hasAuth) {
    issues.push({
      number: issueNumber++,
      title: 'User Authentication System',
      description: `Implement complete user authentication system.

**Tasks:**
- [ ] Set up JWT authentication
- [ ] Implement user registration endpoint
- [ ] Implement login endpoint
- [ ] Implement logout endpoint
- [ ] Add password hashing (bcrypt)
- [ ] Create authentication middleware
- [ ] Add token refresh mechanism
- [ ] Implement protected routes`,
      priority: 'Critical',
      labels: ['authentication', 'backend', 'security'],
      affectedModule: 'Authentication',
      acceptanceCriteria: [
        'Users can register with email and password',
        'Users can login and receive JWT token',
        'Protected routes require valid token',
        'Passwords are securely hashed',
        'Token expiration works correctly'
      ],
      estimatedHours: 8
    });
  }

  // API endpoints by feature
  const featureGroups = groupEndpointsByFeature(input.endpoints);
  Object.entries(featureGroups).forEach(([feature, endpoints]) => {
    if (feature !== 'auth' && feature !== 'health') {
      issues.push({
        number: issueNumber++,
        title: `API Endpoints for ${capitalizeWords(feature)}`,
        description: `Implement all API endpoints for ${feature} management.

**Endpoints to Implement:**
${endpoints.map(e => `- ${e.method} ${e.path} - ${e.description}`).join('\n')}

**Tasks:**
- [ ] Create route handlers
- [ ] Implement request validation
- [ ] Add error handling
- [ ] Write unit tests
- [ ] Test all endpoints with Postman/Thunder Client`,
        priority: endpoints.length > 3 ? 'High' : 'Medium',
        labels: ['backend', 'api', feature],
        affectedModule: `Backend API - ${capitalizeWords(feature)}`,
        acceptanceCriteria: [
          'All endpoints return correct responses',
          'Input validation works properly',
          'Error handling is comprehensive',
          'Tests pass successfully'
        ],
        estimatedHours: endpoints.length * 2
      });
    }
  });

  // Frontend pages by feature
  const pageGroups = groupPagesByFeature(input.pages);
  Object.entries(pageGroups).forEach(([feature, pages]) => {
    if (pages.length > 0) {
      issues.push({
        number: issueNumber++,
        title: `Frontend Pages for ${capitalizeWords(feature)}`,
        description: `Build all frontend pages for ${feature}.

**Pages to Build:**
${pages.map(p => `- ${p.name} (${p.path}) - ${p.description}`).join('\n')}

**Tasks:**
- [ ] Create page components
- [ ] Implement routing
- [ ] Add form validation
- [ ] Connect to API endpoints
- [ ] Add loading states
- [ ] Add error handling
- [ ] Ensure responsive design`,
        priority: feature === 'auth' || feature === 'dashboard' ? 'High' : 'Medium',
        labels: ['frontend', 'ui', feature],
        affectedModule: `Frontend - ${capitalizeWords(feature)}`,
        acceptanceCriteria: [
          'All pages render correctly',
          'Forms validate user input',
          'API integration works',
          'Responsive on mobile and desktop',
          'Loading and error states handled'
        ],
        estimatedHours: pages.length * 3
      });
    }
  });

  // UI Components
  issues.push({
    number: issueNumber++,
    title: 'Reusable UI Components Library',
    description: `Create a library of reusable UI components.

**Components to Build:**
- [ ] Button (with variants)
- [ ] Input fields (text, email, password)
- [ ] Card component
- [ ] Modal/Dialog
- [ ] Loading spinner
- [ ] Error message display
- [ ] Navigation header
- [ ] Sidebar (if applicable)
- [ ] Footer
- [ ] Table component
- [ ] Pagination component

**Tasks:**
- [ ] Design component API (props)
- [ ] Implement with Tailwind CSS
- [ ] Add prop validation
- [ ] Create component documentation
- [ ] Test components in isolation`,
    priority: 'High',
    labels: ['frontend', 'ui', 'components'],
    affectedModule: 'Frontend Components',
    acceptanceCriteria: [
      'All components are reusable',
      'Components accept appropriate props',
      'Styling is consistent',
      'Components are accessible',
      'Documentation is clear'
    ],
    estimatedHours: 10
  });

  // Testing
  issues.push({
    number: issueNumber++,
    title: 'Comprehensive Test Suite',
    description: `Implement comprehensive testing across the application.

**Test Types:**
- [ ] Backend unit tests (API endpoints)
- [ ] Frontend component tests
- [ ] Integration tests (API + Database)
- [ ] E2E tests (critical user flows)
- [ ] API endpoint tests

**Tasks:**
- [ ] Set up testing frameworks (Vitest, React Testing Library, Playwright)
- [ ] Write backend unit tests
- [ ] Write frontend component tests
- [ ] Write integration tests
- [ ] Write E2E tests for critical flows
- [ ] Set up test coverage reporting
- [ ] Achieve minimum 70% code coverage`,
    priority: 'High',
    labels: ['testing', 'quality'],
    affectedModule: 'Testing',
    acceptanceCriteria: [
      'All test suites run successfully',
      'Code coverage meets 70% minimum',
      'Critical user flows covered by E2E tests',
      'Tests run in CI/CD pipeline'
    ],
    estimatedHours: 12
  });

  // Documentation
  issues.push({
    number: issueNumber++,
    title: 'Project Documentation',
    description: `Create comprehensive project documentation.

**Documentation to Create:**
- [ ] README.md with setup instructions
- [ ] API documentation (endpoints, request/response)
- [ ] Environment variables guide
- [ ] Deployment guide
- [ ] Contributing guidelines
- [ ] Code comments for complex logic
- [ ] Architecture diagram

**Tasks:**
- [ ] Write clear README with quick start
- [ ] Document all API endpoints
- [ ] Create .env.example with descriptions
- [ ] Write deployment instructions
- [ ] Add inline code comments
- [ ] Create architecture documentation`,
    priority: 'Medium',
    labels: ['documentation'],
    affectedModule: 'Documentation',
    acceptanceCriteria: [
      'README is clear and complete',
      'API documentation is accurate',
      'Setup instructions work for new developers',
      'All environment variables documented'
    ],
    estimatedHours: 6
  });

  // Deployment
  issues.push({
    number: issueNumber++,
    title: 'Production Deployment',
    description: `Deploy the application to production.

**Deployment Tasks:**
- [ ] Set up frontend hosting (Vercel/Netlify)
- [ ] Set up backend hosting (Railway/Render)
- [ ] Set up database (SQLite or PostgreSQL)
- [ ] Configure environment variables
- [ ] Set up custom domain (optional)
- [ ] Configure SSL/HTTPS
- [ ] Set up CI/CD pipeline
- [ ] Configure monitoring and logging

**Platforms:**
- Frontend: Vercel (recommended)
- Backend: Railway or Render
- Database: SQLite (local) or PostgreSQL (production)`,
    priority: 'High',
    labels: ['deployment', 'devops'],
    affectedModule: 'Deployment',
    acceptanceCriteria: [
      'Application is accessible via public URL',
      'All features work in production',
      'Environment variables properly configured',
      'SSL/HTTPS enabled',
      'Monitoring is active'
    ],
    estimatedHours: 8
  });

  // Security hardening
  issues.push({
    number: issueNumber++,
    title: 'Security Hardening',
    description: `Implement security best practices.

**Security Tasks:**
- [ ] Add rate limiting to API endpoints
- [ ] Implement CORS properly
- [ ] Add input sanitization
- [ ] Set security headers (helmet.js)
- [ ] Implement CSRF protection
- [ ] Add SQL injection prevention
- [ ] Implement XSS protection
- [ ] Add security audit with npm audit
- [ ] Review and fix security vulnerabilities

**Security Checklist:**
- [ ] All passwords hashed with bcrypt
- [ ] JWT tokens properly secured
- [ ] Environment variables not exposed
- [ ] API rate limiting active
- [ ] Input validation on all endpoints`,
    priority: 'High',
    labels: ['security', 'backend'],
    affectedModule: 'Security',
    acceptanceCriteria: [
      'No critical security vulnerabilities',
      'Rate limiting prevents abuse',
      'Input validation prevents injection attacks',
      'Security headers properly configured',
      'npm audit shows no high/critical issues'
    ],
    estimatedHours: 6
  });

  // Performance optimization
  issues.push({
    number: issueNumber++,
    title: 'Performance Optimization',
    description: `Optimize application performance.

**Optimization Tasks:**
- [ ] Add database indexes
- [ ] Implement API response caching
- [ ] Optimize database queries
- [ ] Add frontend code splitting
- [ ] Implement lazy loading for images
- [ ] Minify and compress assets
- [ ] Add CDN for static assets
- [ ] Optimize bundle size
- [ ] Run Lighthouse audit

**Performance Targets:**
- [ ] API response time < 200ms
- [ ] Page load time < 3 seconds
- [ ] Lighthouse score > 90`,
    priority: 'Medium',
    labels: ['performance', 'optimization'],
    affectedModule: 'Performance',
    acceptanceCriteria: [
      'API responses are fast',
      'Frontend loads quickly',
      'Lighthouse score meets targets',
      'No performance bottlenecks identified'
    ],
    estimatedHours: 8
  });

  // Bug fixes and polish
  issues.push({
    number: issueNumber++,
    title: 'Bug Fixes and UI Polish',
    description: `Fix bugs and polish the user interface.

**Tasks:**
- [ ] Fix any reported bugs
- [ ] Improve error messages
- [ ] Add loading indicators
- [ ] Improve form validation feedback
- [ ] Polish UI/UX
- [ ] Test on different browsers
- [ ] Test on mobile devices
- [ ] Fix accessibility issues
- [ ] Improve responsive design

**Quality Checklist:**
- [ ] No console errors
- [ ] All forms work correctly
- [ ] Navigation is intuitive
- [ ] Error messages are helpful
- [ ] UI is consistent across pages`,
    priority: 'Medium',
    labels: ['bug', 'ui', 'polish'],
    affectedModule: 'General',
    acceptanceCriteria: [
      'No critical bugs remain',
      'UI is polished and professional',
      'Application works on all major browsers',
      'Mobile experience is good',
      'Accessibility standards met'
    ],
    estimatedHours: 10
  });

  return {
    totalIssues: issues.length,
    issues,
    summary: {
      critical: issues.filter(i => i.priority === 'Critical').length,
      high: issues.filter(i => i.priority === 'High').length,
      medium: issues.filter(i => i.priority === 'Medium').length,
      low: issues.filter(i => i.priority === 'Low').length,
      totalEstimatedHours: issues.reduce((sum, i) => sum + i.estimatedHours, 0)
    },
    labels: [...new Set(issues.flatMap(i => i.labels))],
    modules: [...new Set(issues.map(i => i.affectedModule))]
  };
}

function groupEndpointsByFeature(endpoints) {
  const groups = {};
  
  endpoints.forEach(endpoint => {
    const pathParts = endpoint.path.split('/').filter(p => p);
    const feature = pathParts[1] || 'general'; // /api/feature/...
    
    if (!groups[feature]) {
      groups[feature] = [];
    }
    groups[feature].push(endpoint);
  });
  
  return groups;
}

function groupPagesByFeature(pages) {
  const groups = {};
  
  pages.forEach(page => {
    const pathParts = page.path.split('/').filter(p => p && !p.startsWith(':'));
    const feature = pathParts[0] || 'home';
    
    if (!groups[feature]) {
      groups[feature] = [];
    }
    groups[feature].push(page);
  });
  
  return groups;
}

function capitalizeWords(str) {
  return str
    .split(/[-_]/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function validateGithubIssues(githubIssues) {
  if (!githubIssues || !githubIssues.issues || githubIssues.issues.length === 0) {
    throw new Error('Invalid GitHub issues structure');
  }
}

module.exports = { generate };

// Made with Bob