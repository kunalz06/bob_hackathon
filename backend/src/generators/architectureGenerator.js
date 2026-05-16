/**
 * Architecture Generator
 * Generates system architecture design from PRD
 */

/**
 * Generate architecture from context
 * @param {Object} context - Accumulated context including PRD
 * @returns {Object} Enhanced context with architecture artifact
 */
async function generate(context) {
  validateContext(context);
  const input = extractInput(context);
  const architecture = await generateArchitecture(input);
  validateArchitecture(architecture);
  
  return {
    ...context,
    architecture
  };
}

function validateContext(context) {
  if (!context.prd) {
    throw new Error('Context must include PRD');
  }
}

function extractInput(context) {
  return {
    title: context.idea.processed.title,
    features: context.prd.features || [],
    targetUsers: context.prd.targetUsers || []
  };
}

async function generateArchitecture(input) {
  // Template-based architecture generation for MVP
  const hasAuth = input.features.some(f => 
    f.name.toLowerCase().includes('auth') || 
    f.name.toLowerCase().includes('login') ||
    f.name.toLowerCase().includes('user')
  );

  const hasDashboard = input.features.some(f => 
    f.name.toLowerCase().includes('dashboard') ||
    f.name.toLowerCase().includes('analytics')
  );

  const hasAPI = input.features.some(f => 
    f.name.toLowerCase().includes('api') ||
    f.name.toLowerCase().includes('integration')
  );

  return {
    overview: `The ${input.title} follows a modern three-tier architecture with clear separation of concerns. The system is designed to be scalable, maintainable, and secure.`,
    architecturePattern: 'Three-Tier Architecture (Presentation, Business Logic, Data)',
    components: [
      {
        name: 'Frontend Layer',
        description: 'React-based single-page application',
        technologies: ['React', 'React Router', 'Tailwind CSS', 'Axios'],
        responsibilities: [
          'User interface rendering',
          'Client-side routing',
          'State management',
          'API communication'
        ]
      },
      {
        name: 'Backend API Layer',
        description: 'RESTful API server',
        technologies: ['Node.js', 'Express.js', 'JWT (if auth required)'],
        responsibilities: [
          'Business logic processing',
          'Request validation',
          'Authentication and authorization',
          'Data transformation'
        ]
      },
      {
        name: 'Data Layer',
        description: 'Database and storage',
        technologies: ['PostgreSQL/MongoDB', 'Redis (caching)'],
        responsibilities: [
          'Data persistence',
          'Query optimization',
          'Data integrity',
          'Backup and recovery'
        ]
      }
    ],
    dataFlow: `
1. User interacts with React frontend
2. Frontend sends HTTP requests to Express API
3. API validates requests and processes business logic
4. API queries database for data operations
5. Database returns results to API
6. API transforms and sends response to frontend
7. Frontend updates UI based on response
    `.trim(),
    techStack: {
      frontend: {
        framework: 'React 18+',
        stateManagement: 'React Context API / Redux Toolkit',
        styling: 'Tailwind CSS',
        routing: 'React Router v6',
        httpClient: 'Axios',
        formHandling: 'React Hook Form',
        validation: 'Zod / Yup'
      },
      backend: {
        runtime: 'Node.js 18+',
        framework: 'Express.js',
        authentication: hasAuth ? 'JWT + bcrypt' : 'Not required',
        validation: 'express-validator',
        logging: 'Winston / Morgan',
        errorHandling: 'Custom middleware'
      },
      database: {
        primary: 'PostgreSQL 14+',
        orm: 'Prisma / Sequelize',
        caching: 'Redis (optional)',
        migrations: 'Prisma Migrate / Sequelize'
      },
      devOps: {
        containerization: 'Docker',
        cicd: 'GitHub Actions',
        hosting: 'Vercel (frontend) + Railway/Render (backend)',
        monitoring: 'Sentry (error tracking)'
      }
    },
    integrations: hasAPI ? [
      {
        name: 'Third-party API Integration',
        purpose: 'External service integration',
        protocol: 'REST/GraphQL',
        authentication: 'API Keys / OAuth 2.0'
      }
    ] : [],
    scalability: {
      horizontal: 'Load balancer with multiple API instances',
      vertical: 'Optimize database queries and add indexes',
      caching: 'Redis for frequently accessed data',
      cdn: 'Static assets served via CDN'
    },
    security: {
      authentication: hasAuth ? 'JWT-based authentication with refresh tokens' : 'Not required',
      authorization: hasAuth ? 'Role-based access control (RBAC)' : 'Not required',
      dataProtection: 'HTTPS/TLS encryption for data in transit',
      inputValidation: 'Server-side validation for all inputs',
      sqlInjection: 'Parameterized queries via ORM',
      xss: 'Content Security Policy headers',
      csrf: 'CSRF tokens for state-changing operations',
      rateLimit: 'API rate limiting to prevent abuse'
    },
    performanceOptimizations: [
      'Database query optimization with proper indexes',
      'API response caching with Redis',
      'Frontend code splitting and lazy loading',
      'Image optimization and lazy loading',
      'Gzip compression for API responses',
      'Database connection pooling'
    ],
    monitoringAndLogging: {
      applicationLogs: 'Winston for structured logging',
      errorTracking: 'Sentry for error monitoring',
      performanceMonitoring: 'New Relic / DataDog (optional)',
      uptime: 'UptimeRobot / Pingdom'
    }
  };
}

function validateArchitecture(architecture) {
  if (!architecture || !architecture.components || architecture.components.length === 0) {
    throw new Error('Invalid architecture structure');
  }
}

module.exports = { generate };

// Made with Bob
