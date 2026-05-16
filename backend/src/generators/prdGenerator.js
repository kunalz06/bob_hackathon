const { slugify } = require('../utils/slugify');

/**
 * PRD Generator
 * Generates Product Requirements Document from processed idea
 * Updated: Fixed validation to use coreFeatures
 */

/**
 * Generate PRD from context
 * @param {Object} context - Accumulated context from previous generators
 * @returns {Object} Enhanced context with PRD artifact
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
  // Determine user roles based on features and target users
  const userRoles = determineUserRoles(input);
  
  // Categorize features into MVP and advanced
  const { mvpFeatures, advancedFeatures } = categorizeFeatures(input.keyFeatures);
  
  return {
    title: input.title,
    overview: input.description,
    problemStatement: generateProblemStatement(input),
    targetUsers: input.targetUsers.map(user => ({
      type: user,
      needs: generateUserNeeds(user, input.title),
      painPoints: generatePainPoints(user)
    })),
    userRoles: userRoles,
    coreFeatures: input.keyFeatures.map((feature, index) => ({
      id: `F${index + 1}`,
      name: feature,
      description: `Implementation of ${feature} to enhance user experience and productivity`,
      priority: index < 3 ? 'High' : 'Medium',
      userStories: [
        `As a user, I want to ${feature.toLowerCase()} so that I can achieve my goals efficiently`
      ],
      acceptanceCriteria: [
        'Feature is accessible from main interface',
        'Feature works as expected with proper validation',
        'Feature provides clear feedback to users'
      ]
    })),
    mvpFeatures: mvpFeatures,
    advancedFeatures: advancedFeatures,
    nonFunctionalRequirements: {
      performance: [
        'Page load time < 3 seconds',
        'API response time < 200ms',
        'Support 100+ concurrent users'
      ],
      security: [
        'Secure authentication and authorization',
        'Data encryption in transit (HTTPS)',
        'Input validation and sanitization',
        'Protection against common vulnerabilities (XSS, CSRF, SQL Injection)'
      ],
      usability: [
        'Intuitive user interface',
        'Responsive design (mobile, tablet, desktop)',
        'Accessibility compliance (WCAG 2.1 Level AA)',
        'Clear error messages and feedback'
      ],
      reliability: [
        'System uptime > 99.5%',
        'Automated backups',
        'Error logging and monitoring',
        'Graceful error handling'
      ],
      scalability: [
        'Horizontal scaling capability',
        'Database optimization',
        'Caching strategy',
        'CDN for static assets'
      ]
    },
    userStories: input.keyFeatures.map((feature, index) => ({
      id: `US${index + 1}`,
      title: feature,
      description: `As a user, I want to ${feature.toLowerCase()}`,
      acceptanceCriteria: [
        'Feature is accessible',
        'Feature works as expected',
        'Feature provides value to users'
      ],
      priority: index < 3 ? 'High' : 'Medium',
      estimatedEffort: index < 3 ? '5-8 hours' : '3-5 hours'
    })),
    successMetrics: [
      'User adoption rate > 70%',
      'Feature usage frequency > 3 times per week',
      'User satisfaction score > 4.0/5.0',
      'Task completion rate > 85%',
      'Average response time < 2 seconds'
    ],
    constraints: [
      'Must be web-based and accessible via modern browsers',
      'Must be responsive and work on mobile devices',
      'Must follow WCAG 2.1 accessibility guidelines',
      'Must implement proper security best practices',
      'Must have clean, maintainable code architecture'
    ],
    assumptions: [
      'Users have basic computer literacy',
      'Users have stable internet connection',
      'Users are using modern web browsers',
      'Application will be hosted on reliable infrastructure'
    ],
    risks: [
      {
        risk: 'Technical complexity may exceed initial estimates',
        mitigation: 'Break down features into smaller, manageable tasks',
        impact: 'Medium'
      },
      {
        risk: 'User adoption may be slower than expected',
        mitigation: 'Implement comprehensive onboarding and documentation',
        impact: 'Medium'
      },
      {
        risk: 'Performance issues with large datasets',
        mitigation: 'Implement pagination and caching strategies',
        impact: 'Low'
      }
    ]
  };
}

function determineUserRoles(input) {
  const roles = [];
  const lowerTitle = input.title.toLowerCase();
  const lowerDesc = input.description.toLowerCase();
  const combined = `${lowerTitle} ${lowerDesc}`.toLowerCase();
  
  // Check for admin role
  if (combined.includes('admin')) {
    roles.push({
      name: 'Administrator',
      permissions: ['Full system access', 'User management', 'System configuration', 'View all data'],
      description: 'System administrator with full access to all features'
    });
  }
  
  // Check for teacher/instructor role
  if (combined.includes('teacher') || combined.includes('instructor') || combined.includes('faculty')) {
    roles.push({
      name: 'Teacher',
      permissions: ['Manage classes', 'Mark attendance', 'View reports', 'Manage students'],
      description: 'Teacher with access to class management and attendance features'
    });
  }
  
  // Check for student role
  if (combined.includes('student')) {
    roles.push({
      name: 'Student',
      permissions: ['View attendance', 'View profile', 'Submit requests'],
      description: 'Student with limited access to view their own data'
    });
  }
  
  // Check for manager role
  if (combined.includes('manager')) {
    roles.push({
      name: 'Manager',
      permissions: ['View reports', 'Manage team', 'Approve requests'],
      description: 'Manager with access to team management and reporting'
    });
  }
  
  // Default user role if no specific roles found
  if (roles.length === 0) {
    roles.push({
      name: 'User',
      permissions: ['View data', 'Create records', 'Edit own records', 'Basic features'],
      description: 'Standard user with basic access'
    });
  }
  
  return roles;
}

function categorizeFeatures(features) {
  const mvpFeatures = [];
  const advancedFeatures = [];
  
  features.forEach((feature, index) => {
    const featureObj = {
      name: feature,
      description: `${feature} functionality`,
      priority: index < 3 ? 'High' : 'Medium'
    };
    
    // First 60% are MVP, rest are advanced
    if (index < Math.ceil(features.length * 0.6)) {
      mvpFeatures.push(featureObj);
    } else {
      advancedFeatures.push(featureObj);
    }
  });
  
  return { mvpFeatures, advancedFeatures };
}

function generateProblemStatement(input) {
  const title = input.title.toLowerCase();
  return `This application addresses the need for ${input.description.toLowerCase()}. Current solutions often lack efficiency, user-friendliness, and proper integration. ${input.title} aims to provide a comprehensive, modern solution that streamlines workflows, enhances productivity, and delivers an excellent user experience.`;
}

function generateUserNeeds(user, title) {
  return [
    `Efficient ${title.toLowerCase()} management`,
    `Easy-to-use and intuitive interface`,
    `Reliable and fast performance`,
    `Access to relevant data and insights`,
    `Mobile-friendly access`
  ];
}

function generatePainPoints(user) {
  return [
    `Current solutions are too complex or outdated`,
    `Lack of integration with existing tools`,
    `Poor user experience and slow performance`,
    `Difficult to access on mobile devices`,
    `Insufficient reporting and analytics`
  ];
}

function validatePRD(prd) {
  if (!prd || !prd.title || !prd.coreFeatures || prd.coreFeatures.length === 0) {
    throw new Error('Invalid PRD structure');
  }
}

module.exports = { generate };

// Made with Bob
