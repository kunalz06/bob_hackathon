/**
 * API Plan Generator
 * Generates REST API endpoint specifications from schema
 */

/**
 * Generate API plan from context
 * @param {Object} context - Accumulated context including schema
 * @returns {Object} Enhanced context with API plan artifact
 */
async function generate(context) {
  validateContext(context);
  const input = extractInput(context);
  const api = await generateAPIPlan(input);
  validateAPIPlan(api);
  
  return {
    ...context,
    api
  };
}

function validateContext(context) {
  if (!context.schema) {
    throw new Error('Context must include schema');
  }
}

function extractInput(context) {
  return {
    title: context.idea.processed.title,
    tables: context.schema.tables || [],
    features: context.prd.features || []
  };
}

async function generateAPIPlan(input) {
  const hasAuth = input.tables.some(t => t.name === 'users');
  const endpoints = [];

  // Authentication endpoints
  if (hasAuth) {
    endpoints.push(
      {
        method: 'POST',
        path: '/api/auth/register',
        description: 'Register a new user account',
        authentication: false,
        requestBody: {
          email: 'string (required)',
          password: 'string (required, min 8 chars)',
          firstName: 'string (optional)',
          lastName: 'string (optional)'
        },
        responses: {
          201: { description: 'User created successfully', body: { user: 'object', token: 'string' } },
          400: { description: 'Validation error', body: { error: 'string' } },
          409: { description: 'Email already exists', body: { error: 'string' } }
        }
      },
      {
        method: 'POST',
        path: '/api/auth/login',
        description: 'Authenticate user and get access token',
        authentication: false,
        requestBody: {
          email: 'string (required)',
          password: 'string (required)'
        },
        responses: {
          200: { description: 'Login successful', body: { user: 'object', token: 'string' } },
          401: { description: 'Invalid credentials', body: { error: 'string' } }
        }
      },
      {
        method: 'POST',
        path: '/api/auth/logout',
        description: 'Logout user and invalidate token',
        authentication: true,
        responses: {
          200: { description: 'Logout successful', body: { message: 'string' } }
        }
      },
      {
        method: 'GET',
        path: '/api/auth/me',
        description: 'Get current user profile',
        authentication: true,
        responses: {
          200: { description: 'User profile', body: { user: 'object' } },
          401: { description: 'Unauthorized', body: { error: 'string' } }
        }
      }
    );
  }

  // CRUD endpoints for each table (except users and audit_logs)
  input.tables
    .filter(table => table.name !== 'users' && table.name !== 'audit_logs')
    .forEach(table => {
      const resourceName = table.name;
      const singularName = resourceName.endsWith('s') ? resourceName.slice(0, -1) : resourceName;

      endpoints.push(
        {
          method: 'GET',
          path: `/api/${resourceName}`,
          description: `Get all ${resourceName}`,
          authentication: hasAuth,
          queryParams: {
            page: 'number (optional, default: 1)',
            limit: 'number (optional, default: 10)',
            sort: 'string (optional)',
            filter: 'string (optional)'
          },
          responses: {
            200: { 
              description: `List of ${resourceName}`, 
              body: { 
                data: 'array', 
                pagination: { page: 'number', limit: 'number', total: 'number' } 
              } 
            }
          }
        },
        {
          method: 'GET',
          path: `/api/${resourceName}/:id`,
          description: `Get ${singularName} by ID`,
          authentication: hasAuth,
          pathParams: {
            id: 'UUID (required)'
          },
          responses: {
            200: { description: `${singularName} details`, body: { data: 'object' } },
            404: { description: 'Not found', body: { error: 'string' } }
          }
        },
        {
          method: 'POST',
          path: `/api/${resourceName}`,
          description: `Create new ${singularName}`,
          authentication: hasAuth,
          requestBody: {
            name: 'string (required)',
            description: 'string (optional)',
            status: 'string (optional)'
          },
          responses: {
            201: { description: `${singularName} created`, body: { data: 'object' } },
            400: { description: 'Validation error', body: { error: 'string' } }
          }
        },
        {
          method: 'PUT',
          path: `/api/${resourceName}/:id`,
          description: `Update ${singularName}`,
          authentication: hasAuth,
          pathParams: {
            id: 'UUID (required)'
          },
          requestBody: {
            name: 'string (optional)',
            description: 'string (optional)',
            status: 'string (optional)'
          },
          responses: {
            200: { description: `${singularName} updated`, body: { data: 'object' } },
            404: { description: 'Not found', body: { error: 'string' } },
            400: { description: 'Validation error', body: { error: 'string' } }
          }
        },
        {
          method: 'DELETE',
          path: `/api/${resourceName}/:id`,
          description: `Delete ${singularName}`,
          authentication: hasAuth,
          pathParams: {
            id: 'UUID (required)'
          },
          responses: {
            200: { description: `${singularName} deleted`, body: { message: 'string' } },
            404: { description: 'Not found', body: { error: 'string' } }
          }
        }
      );
    });

  // Health check endpoint
  endpoints.unshift({
    method: 'GET',
    path: '/api/health',
    description: 'Health check endpoint',
    authentication: false,
    responses: {
      200: { description: 'Service is healthy', body: { status: 'string', timestamp: 'string' } }
    }
  });

  return {
    baseUrl: 'http://localhost:3001',
    version: 'v1',
    authentication: hasAuth ? {
      type: 'JWT Bearer Token',
      header: 'Authorization: Bearer <token>',
      tokenExpiry: '24 hours',
      refreshToken: 'Supported'
    } : {
      type: 'None',
      description: 'No authentication required'
    },
    endpoints,
    errorHandling: {
      format: {
        error: 'string (error message)',
        code: 'string (error code)',
        details: 'object (optional additional details)'
      },
      commonErrors: [
        { code: 400, message: 'Bad Request - Invalid input data' },
        { code: 401, message: 'Unauthorized - Missing or invalid token' },
        { code: 403, message: 'Forbidden - Insufficient permissions' },
        { code: 404, message: 'Not Found - Resource does not exist' },
        { code: 409, message: 'Conflict - Resource already exists' },
        { code: 422, message: 'Unprocessable Entity - Validation failed' },
        { code: 429, message: 'Too Many Requests - Rate limit exceeded' },
        { code: 500, message: 'Internal Server Error - Something went wrong' }
      ]
    },
    rateLimit: {
      enabled: true,
      windowMs: 900000,
      maxRequests: 100,
      message: 'Too many requests, please try again later'
    },
    cors: {
      enabled: true,
      origins: ['http://localhost:5173', 'http://localhost:3000'],
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
      credentials: true
    },
    documentation: {
      format: 'OpenAPI 3.0',
      tools: ['Swagger UI', 'Postman Collection'],
      location: '/api/docs'
    },
    versioning: {
      strategy: 'URL path versioning',
      currentVersion: 'v1',
      deprecationPolicy: 'Minimum 6 months notice before deprecation'
    },
    pagination: {
      defaultLimit: 10,
      maxLimit: 100,
      format: {
        page: 'Current page number',
        limit: 'Items per page',
        total: 'Total number of items',
        totalPages: 'Total number of pages'
      }
    },
    filtering: {
      supported: true,
      operators: ['eq', 'ne', 'gt', 'gte', 'lt', 'lte', 'like', 'in'],
      example: '?filter[status]=active&filter[created_at][gte]=2024-01-01'
    },
    sorting: {
      supported: true,
      format: '?sort=field1,-field2 (- prefix for descending)',
      example: '?sort=-created_at,name'
    }
  };
}

function validateAPIPlan(api) {
  if (!api || !api.endpoints || api.endpoints.length === 0) {
    throw new Error('Invalid API plan structure');
  }
}

module.exports = { generate };

// Made with Bob
