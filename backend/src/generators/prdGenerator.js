const { slugify } = require('../utils/slugify');

/**
 * PRD Generator
 * Generates Product Requirements Document from processed idea
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
  // Template-based PRD generation for MVP
  return {
    title: input.title,
    overview: input.description,
    problemStatement: `This application addresses the need for ${input.description.toLowerCase()}. It aims to provide a comprehensive solution that streamlines workflows and enhances user productivity.`,
    targetUsers: input.targetUsers.map(user => ({
      type: user,
      needs: [
        `Efficient ${input.title.toLowerCase()} management`,
        `Easy-to-use interface`,
        `Reliable and fast performance`
      ],
      painPoints: [
        `Current solutions are too complex`,
        `Lack of integration with existing tools`,
        `Poor user experience`
      ]
    })),
    features: input.keyFeatures.map((feature, index) => ({
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

function validatePRD(prd) {
  if (!prd || !prd.title || !prd.features || prd.features.length === 0) {
    throw new Error('Invalid PRD structure');
  }
}

module.exports = { generate };

// Made with Bob
