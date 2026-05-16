const request = require('supertest');
const fs = require('fs');
const path = require('path');
const app = require('../src/app');

// Test data file paths
const blueprintsPath = path.join(__dirname, '../src/data/blueprints.json');
const testBlueprintsBackup = path.join(__dirname, '../src/data/blueprints.test.backup.json');

describe('Blueprint Generation', () => {
  let originalBlueprints;

  beforeAll(() => {
    // Backup original blueprints
    if (fs.existsSync(blueprintsPath)) {
      originalBlueprints = fs.readFileSync(blueprintsPath, 'utf8');
      fs.writeFileSync(testBlueprintsBackup, originalBlueprints);
    }
  });

  afterAll(() => {
    // Restore original blueprints
    if (originalBlueprints) {
      fs.writeFileSync(blueprintsPath, originalBlueprints);
    }
    // Clean up backup
    if (fs.existsSync(testBlueprintsBackup)) {
      fs.unlinkSync(testBlueprintsBackup);
    }
  });

  describe('POST /api/blueprints', () => {
    it('should reject empty idea', async () => {
      const response = await request(app)
        .post('/api/blueprints/generate')
        .send({ idea: '' })
        .expect(400)
        .expect('Content-Type', /json/);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
      expect(response.body.error.details).toContain('Idea is required');
    });

    it('should reject idea shorter than 20 characters', async () => {
      const response = await request(app)
        .post('/api/blueprints/generate')
        .send({ idea: 'Short idea' })
        .expect(400)
        .expect('Content-Type', /json/);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
      expect(response.body.error.details).toContain('Idea must be at least 20 characters long');
    });

    it('should reject missing idea field', async () => {
      const response = await request(app)
        .post('/api/blueprints/generate')
        .send({})
        .expect(400)
        .expect('Content-Type', /json/);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should generate blueprint for valid idea', async () => {
      const validIdea = 'A task management application for teams to collaborate and track project progress efficiently';

      const response = await request(app)
        .post('/api/blueprints/generate')
        .send({ idea: validIdea })
        .expect(201)
        .expect('Content-Type', /json/);

      expect(response.body.success).toBe(true);
      expect(response.body).toHaveProperty('projectId');
      expect(response.body).toHaveProperty('blueprint');
      expect(response.body.blueprint).toHaveProperty('id');
    }, 15000); // Increase timeout for generation

    it('should generate blueprint with all required fields', async () => {
      const validIdea = 'An e-commerce platform for selling handmade crafts with payment integration and inventory management';

      const response = await request(app)
        .post('/api/blueprints/generate')
        .send({ idea: validIdea })
        .expect(201);

      const blueprint = response.body.blueprint;

      // Check all required fields
      expect(blueprint).toHaveProperty('projectName');
      expect(blueprint).toHaveProperty('coreFeatures');
      expect(blueprint).toHaveProperty('architecture');
      expect(blueprint).toHaveProperty('databaseSchema');
      expect(blueprint).toHaveProperty('apiRoutes');
      expect(blueprint).toHaveProperty('frontendPages');
      expect(blueprint).toHaveProperty('testPlan');
      expect(blueprint).toHaveProperty('deploymentPlan');
      expect(blueprint).toHaveProperty('bobBuildPrompt');

      // Verify types
      expect(typeof blueprint.projectName).toBe('string');
      expect(Array.isArray(blueprint.coreFeatures)).toBe(true);
      expect(typeof blueprint.architecture).toBe('object');
      expect(typeof blueprint.databaseSchema).toBe('object');
      expect(Array.isArray(blueprint.apiRoutes)).toBe(true);
      expect(Array.isArray(blueprint.frontendPages)).toBe(true);
      expect(typeof blueprint.testPlan).toBe('object');
      expect(typeof blueprint.deploymentPlan).toBe('object');
      expect(typeof blueprint.bobBuildPrompt).toBe('string');
    }, 15000);

    it('should save blueprint to local JSON storage', async () => {
      const validIdea = 'A simple blog platform with user authentication and comment system for writers';

      const response = await request(app)
        .post('/api/blueprints/generate')
        .send({ idea: validIdea })
        .expect(201);

      const projectId = response.body.projectId;

      // Verify blueprint was saved
      const blueprints = JSON.parse(fs.readFileSync(blueprintsPath, 'utf8'));
      const savedBlueprint = blueprints.find(bp => bp.id === projectId);

      expect(savedBlueprint).toBeDefined();
      expect(savedBlueprint.id).toBe(projectId);
      expect(savedBlueprint.projectName).toBeDefined();
    }, 15000);
  });

  describe('GET /api/blueprints', () => {
    it('should return list of blueprints', async () => {
      const response = await request(app)
        .get('/api/blueprints')
        .expect(200)
        .expect('Content-Type', /json/);

      expect(response.body.success).toBe(true);
      expect(response.body).toHaveProperty('blueprints');
      expect(Array.isArray(response.body.blueprints)).toBe(true);
    });
  });

  describe('GET /api/blueprints/:id', () => {
    let testBlueprintId;

    beforeAll(async () => {
      // Create a test blueprint
      const response = await request(app)
        .post('/api/blueprints/generate')
        .send({ idea: 'A fitness tracking app with workout plans and progress monitoring for athletes' });
      
      testBlueprintId = response.body.projectId;
    }, 15000);

    it('should return blueprint by ID', async () => {
      const response = await request(app)
        .get(`/api/blueprints/${testBlueprintId}`)
        .expect(200)
        .expect('Content-Type', /json/);

      expect(response.body.success).toBe(true);
      expect(response.body.blueprint).toBeDefined();
      expect(response.body.blueprint.id).toBe(testBlueprintId);
    });

    it('should return 404 for non-existent blueprint', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      
      const response = await request(app)
        .get(`/api/blueprints/${fakeId}`)
        .expect(404)
        .expect('Content-Type', /json/);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });
  });
});

// Made with Bob