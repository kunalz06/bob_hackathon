/**
 * Frontend Plan Generator
 * Generates frontend structure and component plan from API specification
 */

/**
 * Generate frontend plan from context
 * @param {Object} context - Accumulated context including API plan
 * @returns {Object} Enhanced context with frontend plan artifact
 */
async function generate(context) {
  validateContext(context);
  const input = extractInput(context);
  const frontend = await generateFrontendPlan(input);
  validateFrontendPlan(frontend);
  
  return {
    ...context,
    frontend
  };
}

function validateContext(context) {
  if (!context.api) {
    throw new Error('Context must include API plan');
  }
}

function extractInput(context) {
  return {
    title: context.idea.processed.title,
    features: context.prd.features || [],
    endpoints: context.api.endpoints || [],
    hasAuth: context.api.authentication?.type !== 'None'
  };
}

async function generateFrontendPlan(input) {
  const pages = [];
  const components = [];

  // Authentication pages
  if (input.hasAuth) {
    pages.push(
      {
        name: 'LoginPage',
        path: '/login',
        description: 'User login page',
        components: ['LoginForm', 'Logo', 'ErrorMessage'],
        features: ['Email/password authentication', 'Remember me option', 'Forgot password link'],
        layout: 'AuthLayout'
      },
      {
        name: 'RegisterPage',
        path: '/register',
        description: 'User registration page',
        components: ['RegisterForm', 'Logo', 'ErrorMessage'],
        features: ['User registration form', 'Email validation', 'Password strength indicator'],
        layout: 'AuthLayout'
      },
      {
        name: 'ProfilePage',
        path: '/profile',
        description: 'User profile management',
        components: ['ProfileForm', 'AvatarUpload', 'PasswordChange'],
        features: ['View/edit profile', 'Change password', 'Account settings'],
        layout: 'MainLayout',
        protected: true
      }
    );

    components.push(
      {
        name: 'LoginForm',
        type: 'Form Component',
        props: ['onSubmit', 'loading', 'error'],
        state: ['email', 'password', 'rememberMe'],
        description: 'Login form with validation'
      },
      {
        name: 'RegisterForm',
        type: 'Form Component',
        props: ['onSubmit', 'loading', 'error'],
        state: ['email', 'password', 'confirmPassword', 'firstName', 'lastName'],
        description: 'Registration form with validation'
      },
      {
        name: 'ProtectedRoute',
        type: 'HOC Component',
        props: ['children', 'redirectTo'],
        description: 'Route wrapper for authenticated pages'
      }
    );
  }

  // Home/Landing page
  pages.push({
    name: 'HomePage',
    path: '/',
    description: 'Landing page with overview',
    components: ['Hero', 'FeatureList', 'CallToAction'],
    features: ['Application overview', 'Key features showcase', 'Call to action'],
    layout: 'MainLayout',
    protected: false
  });

  // Dashboard page
  pages.push({
    name: 'DashboardPage',
    path: '/dashboard',
    description: 'Main dashboard with overview',
    components: ['StatCards', 'RecentActivity', 'QuickActions'],
    features: ['Statistics overview', 'Recent activity feed', 'Quick action buttons'],
    layout: 'MainLayout',
    protected: input.hasAuth
  });

  // Feature-specific pages
  input.features.forEach(feature => {
    const featureName = feature.name.replace(/\s+/g, '');
    const routePath = feature.name.toLowerCase().replace(/\s+/g, '-');

    pages.push(
      {
        name: `${featureName}ListPage`,
        path: `/${routePath}`,
        description: `List all ${feature.name.toLowerCase()}`,
        components: [`${featureName}Table`, 'SearchBar', 'FilterPanel', 'Pagination'],
        features: ['View all items', 'Search and filter', 'Pagination', 'Sort columns'],
        layout: 'MainLayout',
        protected: input.hasAuth
      },
      {
        name: `${featureName}DetailPage`,
        path: `/${routePath}/:id`,
        description: `View ${feature.name.toLowerCase()} details`,
        components: [`${featureName}Detail`, 'ActionButtons', 'RelatedItems'],
        features: ['View details', 'Edit/delete actions', 'Related information'],
        layout: 'MainLayout',
        protected: input.hasAuth
      },
      {
        name: `${featureName}CreatePage`,
        path: `/${routePath}/new`,
        description: `Create new ${feature.name.toLowerCase()}`,
        components: [`${featureName}Form`, 'FormValidation'],
        features: ['Create new item', 'Form validation', 'Success feedback'],
        layout: 'MainLayout',
        protected: input.hasAuth
      }
    );

    components.push(
      {
        name: `${featureName}Table`,
        type: 'Data Display Component',
        props: ['data', 'loading', 'onSort', 'onFilter'],
        state: ['sortColumn', 'sortDirection', 'filters'],
        description: `Table displaying ${feature.name.toLowerCase()} with sorting and filtering`
      },
      {
        name: `${featureName}Form`,
        type: 'Form Component',
        props: ['initialData', 'onSubmit', 'loading'],
        state: ['formData', 'errors', 'touched'],
        description: `Form for creating/editing ${feature.name.toLowerCase()}`
      },
      {
        name: `${featureName}Detail`,
        type: 'Display Component',
        props: ['data', 'loading', 'onEdit', 'onDelete'],
        description: `Detailed view of ${feature.name.toLowerCase()}`
      }
    );
  });

  // Common components
  components.push(
    {
      name: 'Header',
      type: 'Layout Component',
      props: ['user', 'onLogout'],
      description: 'Application header with navigation and user menu'
    },
    {
      name: 'Sidebar',
      type: 'Layout Component',
      props: ['activeRoute', 'collapsed'],
      description: 'Navigation sidebar with menu items'
    },
    {
      name: 'Footer',
      type: 'Layout Component',
      props: [],
      description: 'Application footer with links and copyright'
    },
    {
      name: 'LoadingSpinner',
      type: 'UI Component',
      props: ['size', 'color'],
      description: 'Loading indicator'
    },
    {
      name: 'ErrorMessage',
      type: 'UI Component',
      props: ['message', 'type', 'onClose'],
      description: 'Error/success message display'
    },
    {
      name: 'Modal',
      type: 'UI Component',
      props: ['isOpen', 'onClose', 'title', 'children'],
      description: 'Reusable modal dialog'
    },
    {
      name: 'Button',
      type: 'UI Component',
      props: ['variant', 'size', 'loading', 'disabled', 'onClick'],
      description: 'Reusable button component'
    },
    {
      name: 'Card',
      type: 'UI Component',
      props: ['title', 'children', 'actions'],
      description: 'Card container component'
    }
  );

  return {
    framework: 'React 18+',
    buildTool: 'Vite',
    pages,
    components,
    routing: {
      library: 'React Router v6',
      strategy: 'Client-side routing',
      routes: pages.map(page => ({
        path: page.path,
        component: page.name,
        protected: page.protected || false,
        layout: page.layout
      }))
    },
    stateManagement: {
      global: 'React Context API',
      forms: 'React Hook Form',
      server: 'TanStack Query (React Query)',
      stores: [
        {
          name: 'AuthContext',
          purpose: 'User authentication state',
          state: ['user', 'token', 'isAuthenticated', 'loading']
        },
        {
          name: 'ThemeContext',
          purpose: 'Theme and UI preferences',
          state: ['theme', 'sidebarCollapsed']
        }
      ]
    },
    styling: {
      framework: 'Tailwind CSS',
      approach: 'Utility-first CSS',
      customization: 'tailwind.config.js for theme customization',
      components: 'Headless UI for accessible components'
    },
    dataFetching: {
      library: 'TanStack Query',
      features: ['Caching', 'Automatic refetching', 'Optimistic updates', 'Error handling'],
      apiClient: 'Axios with interceptors'
    },
    formHandling: {
      library: 'React Hook Form',
      validation: 'Zod schema validation',
      features: ['Field-level validation', 'Error messages', 'Async validation']
    },
    accessibility: {
      standards: 'WCAG 2.1 Level AA',
      features: [
        'Semantic HTML',
        'ARIA labels and roles',
        'Keyboard navigation',
        'Focus management',
        'Screen reader support'
      ]
    },
    performance: {
      optimizations: [
        'Code splitting with React.lazy',
        'Route-based code splitting',
        'Image lazy loading',
        'Memoization with useMemo/useCallback',
        'Virtual scrolling for large lists'
      ]
    },
    testing: {
      unit: 'Vitest + React Testing Library',
      e2e: 'Playwright',
      coverage: 'Minimum 70% code coverage'
    },
    buildOptimization: {
      bundler: 'Vite',
      features: [
        'Tree shaking',
        'Minification',
        'Asset optimization',
        'Environment-based builds'
      ]
    }
  };
}

function validateFrontendPlan(frontend) {
  if (!frontend || !frontend.pages || frontend.pages.length === 0) {
    throw new Error('Invalid frontend plan structure');
  }
}

module.exports = { generate };

// Made with Bob
