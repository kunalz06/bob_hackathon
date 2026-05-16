/**
 * Test script for Markdown export functionality
 * Run with: node test-markdown-export.js
 */

const { exportToMarkdown, saveMarkdownToFile } = require('./src/exporters/markdownExporter');
const fs = require('fs');
const path = require('path');

// Sample blueprint data (simplified version)
const sampleBlueprint = {
  projectId: 'test-project-123',
  id: 'test-project-123',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  idea: {
    raw: 'Build a task management app for developers',
    processed: {
      title: 'Task Management App',
      description: 'A comprehensive task management application for developers',
      slug: 'task-management-app',
      targetUsers: ['Developers', 'Project Managers'],
      keyFeatures: ['User Authentication', 'Task Tracking', 'Team Collaboration']
    }
  },
  problemStatement: 'Developers need a better way to manage their tasks and collaborate with team members.',
  targetUsers: ['Developers', 'Project Managers'],
  userRoles: [
    {
      name: 'Admin',
      description: 'System administrator with full access',
      permissions: ['Manage users', 'Configure system', 'View all data']
    },
    {
      name: 'Developer',
      description: 'Regular user with task management access',
      permissions: ['Create tasks', 'Update tasks', 'View team tasks']
    }
  ],
  coreFeatures: [
    {
      id: 'F1',
      name: 'User Authentication',
      description: 'Secure login and registration system',
      priority: 'High'
    },
    {
      id: 'F2',
      name: 'Task Management',
      description: 'Create, update, and track tasks',
      priority: 'High'
    }
  ],
  mvpFeatures: [
    {
      name: 'Basic Task CRUD',
      description: 'Create, read, update, delete tasks',
      priority: 'High'
    }
  ],
  advancedFeatures: [
    {
      name: 'Real-time Collaboration',
      description: 'Live updates and notifications',
      priority: 'Medium'
    }
  ],
  nonFunctionalRequirements: {
    performance: ['Page load < 2s', 'API response < 200ms'],
    security: ['HTTPS only', 'JWT authentication', 'Input validation'],
    usability: ['Responsive design', 'Intuitive UI']
  },
  techStack: {
    frontend: {
      framework: 'React 18',
      styling: 'Tailwind CSS',
      stateManagement: 'Redux Toolkit'
    },
    backend: {
      runtime: 'Node.js 18',
      framework: 'Express.js'
    },
    database: {
      primary: 'PostgreSQL',
      orm: 'Prisma'
    }
  },
  architecture: {
    overview: 'Modern three-tier architecture with clear separation of concerns',
    architecturePattern: 'MVC (Model-View-Controller)',
    components: [
      {
        name: 'Frontend',
        description: 'React-based single page application',
        technologies: ['React', 'Tailwind CSS', 'Redux'],
        responsibilities: ['User interface', 'State management', 'API communication']
      }
    ]
  },
  architectureDiagramText: '┌─────────────┐\n│   Frontend  │\n└──────┬──────┘\n       │\n┌──────▼──────┐\n│   Backend   │\n└──────┬──────┘\n       │\n┌──────▼──────┐\n│  Database   │\n└─────────────┘',
  databaseSchema: {
    database: 'PostgreSQL',
    version: '15',
    tables: [
      {
        name: 'users',
        description: 'User accounts',
        columns: [
          { name: 'id', type: 'INTEGER', primaryKey: true, autoIncrement: true },
          { name: 'email', type: 'VARCHAR(255)', unique: true, nullable: false },
          { name: 'password_hash', type: 'VARCHAR(255)', nullable: false }
        ],
        indexes: [
          { name: 'idx_users_email', columns: ['email'], unique: true }
        ]
      }
    ]
  },
  apiRoutes: [
    {
      method: 'POST',
      path: '/api/auth/login',
      description: 'User login',
      authentication: false
    },
    {
      method: 'GET',
      path: '/api/tasks',
      description: 'Get all tasks',
      authentication: true
    }
  ],
  frontendPages: [
    {
      name: 'LoginPage',
      path: '/login',
      description: 'User login page',
      protected: false,
      components: ['LoginForm', 'Logo']
    },
    {
      name: 'DashboardPage',
      path: '/dashboard',
      description: 'Main dashboard',
      protected: true,
      components: ['TaskList', 'Sidebar', 'Header']
    }
  ],
  testPlan: {
    strategy: {
      approach: 'Test-Driven Development',
      pyramid: {
        unit: '70% - Fast, isolated tests',
        integration: '20% - Component interaction',
        e2e: '10% - Critical user flows'
      }
    },
    unitTests: {
      framework: 'Jest',
      totalTests: 50,
      coverage: { target: '80%' }
    },
    integrationTests: {
      framework: 'Supertest',
      totalTests: 20
    },
    e2eTests: {
      framework: 'Playwright',
      totalTests: 10
    }
  },
  deploymentPlan: {
    platforms: {
      frontend: { platform: 'Vercel' },
      backend: { platform: 'Railway' },
      database: { platform: 'Supabase' }
    },
    steps: [
      {
        phase: 'Pre-deployment',
        tasks: [
          {
            name: 'Environment Setup',
            checklist: ['Configure environment variables', 'Set up CI/CD pipeline']
          }
        ]
      }
    ]
  },
  githubIssues: [
    {
      number: 1,
      title: 'Setup Project Structure',
      description: 'Initialize project with proper folder structure',
      priority: 'Critical',
      labels: ['setup', 'infrastructure'],
      affectedModule: 'Project Setup'
    },
    {
      number: 2,
      title: 'Implement Authentication',
      description: 'Add user login and registration',
      priority: 'High',
      labels: ['backend', 'security'],
      affectedModule: 'Authentication'
    }
  ],
  bobBuildPrompt: 'Build a task management app for developers with authentication, task CRUD, and team collaboration features. Use React + Node.js + PostgreSQL.',
  metadata: {
    generationTime: 5000,
    status: 'complete',
    version: '1.0.0'
  }
};

console.log('🧪 Testing Markdown Export Functionality\n');
console.log('=' .repeat(50));

try {
  // Test 1: Generate Markdown
  console.log('\n✓ Test 1: Generating Markdown content...');
  const markdown = exportToMarkdown(sampleBlueprint);
  
  if (!markdown || markdown.length === 0) {
    throw new Error('Generated markdown is empty');
  }
  
  console.log(`  ✓ Generated ${markdown.length} characters of markdown`);
  console.log(`  ✓ Contains ${markdown.split('\n').length} lines`);
  
  // Test 2: Verify sections
  console.log('\n✓ Test 2: Verifying markdown sections...');
  const requiredSections = [
    '# Task Management App',
    '## 💡 Original Idea',
    '## 🎯 Problem Statement',
    '## 👥 Target Users',
    '## 🔐 User Roles',
    '## ✨ Features',
    '## 📋 Non-Functional Requirements',
    '## 🛠️ Tech Stack',
    '## 🏗️ Architecture',
    '## 🗄️ Database Schema',
    '## 🌐 API Routes',
    '## 📱 Frontend Pages',
    '## 🧪 Test Plan',
    '## 🚀 Deployment Plan',
    '## 📋 GitHub Issues',
    '## 🤖 IBM Bob Build Prompt',
    '## 📊 Metadata'
  ];
  
  const missingSections = [];
  requiredSections.forEach(section => {
    if (!markdown.includes(section)) {
      missingSections.push(section);
    }
  });
  
  if (missingSections.length > 0) {
    console.log(`  ⚠ Missing sections: ${missingSections.join(', ')}`);
  } else {
    console.log(`  ✓ All ${requiredSections.length} required sections present`);
  }
  
  // Test 3: Save to file
  console.log('\n✓ Test 3: Saving markdown to file...');
  const filepath = saveMarkdownToFile(sampleBlueprint, markdown);
  
  if (!fs.existsSync(filepath)) {
    throw new Error('File was not created');
  }
  
  const fileContent = fs.readFileSync(filepath, 'utf8');
  if (fileContent !== markdown) {
    throw new Error('File content does not match generated markdown');
  }
  
  console.log(`  ✓ File saved successfully: ${filepath}`);
  console.log(`  ✓ File size: ${fs.statSync(filepath).size} bytes`);
  
  // Test 4: Verify exports directory structure
  console.log('\n✓ Test 4: Verifying exports directory structure...');
  const exportsDir = path.join(process.cwd(), 'exports', sampleBlueprint.projectId);
  
  if (!fs.existsSync(exportsDir)) {
    throw new Error('Exports directory was not created');
  }
  
  const files = fs.readdirSync(exportsDir);
  console.log(`  ✓ Exports directory created: ${exportsDir}`);
  console.log(`  ✓ Files in directory: ${files.length}`);
  
  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('✅ All tests passed successfully!\n');
  console.log('Summary:');
  console.log(`  - Markdown generated: ${markdown.length} characters`);
  console.log(`  - Sections included: ${requiredSections.length}`);
  console.log(`  - File saved to: ${filepath}`);
  console.log(`  - Export directory: ${exportsDir}`);
  
  process.exit(0);
  
} catch (error) {
  console.error('\n❌ Test failed:', error.message);
  console.error('\nStack trace:', error.stack);
  process.exit(1);
}

// Made with Bob
