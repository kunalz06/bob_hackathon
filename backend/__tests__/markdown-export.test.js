const request = require('supertest');
const fs = require('fs');
const path = require('path');
const app = require('../src/app');

// Test data file paths
const blueprintsPath = path.join(__dirname, '../src/data/blueprints.json');
const testBlueprintsBackup = path.join(__dirname, '../src/data/blueprints.test.backup.json');

describe('Markdown Export', () => {
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

  describe('GET /api/blueprints/:id/export/markdown', () => {
    it('should return 404 for unknown blueprint ID', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';

      const response = await request(app)
        .get(`/api/blueprints/${fakeId}/export/markdown`)
        .expect(404)
        .expect('Content-Type', /json/);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('NOT_FOUND');
      expect(response.body.error.message).toBe('Blueprint not found');
    });

    it('should return Markdown for valid blueprint', async () => {
      // Create a test blueprint
      const createResponse = await request(app)
        .post('/api/blueprints/generate')
        .send({ idea: 'A recipe sharing platform with user profiles and cooking tutorials for home chefs' });
      
      const testBlueprintId = createResponse.body.projectId;

      const response = await request(app)
        .get(`/api/blueprints/${testBlueprintId}/export/markdown`)
        .expect(200)
        .expect('Content-Type', /markdown/);

      // Verify it's markdown content
      expect(typeof response.text).toBe('string');
      expect(response.text.length).toBeGreaterThan(0);
      
      // Check for markdown headers
      expect(response.text).toMatch(/^#\s+/m); // Should have at least one header
    });

    it('should include IBM Bob build prompt in Markdown', async () => {
      // Create a test blueprint
      const createResponse = await request(app)
        .post('/api/blueprints/generate')
        .send({ idea: 'A recipe sharing platform with user profiles and cooking tutorials for home chefs' });
      
      const testBlueprintId = createResponse.body.projectId;

      const response = await request(app)
        .get(`/api/blueprints/${testBlueprintId}/export/markdown`)
        .expect(200);

      const markdown = response.text;

      // Check for IBM Bob section
      expect(markdown).toContain('IBM Bob Build Prompt');
      expect(markdown).toContain('```'); // Code block for prompt
      
      // Verify prompt content exists
      expect(markdown.length).toBeGreaterThan(1000); // Should be substantial
    });

    it('should include all major sections in Markdown', async () => {
      // Create a test blueprint
      const createResponse = await request(app)
        .post('/api/blueprints/generate')
        .send({ idea: 'A recipe sharing platform with user profiles and cooking tutorials for home chefs' });
      
      const testBlueprintId = createResponse.body.projectId;

      const response = await request(app)
        .get(`/api/blueprints/${testBlueprintId}/export/markdown`)
        .expect(200);

      const markdown = response.text;

      // Check for key sections
      const expectedSections = [
        'Original Idea',
        'Problem Statement',
        'Features',
        'Tech Stack',
        'Architecture',
        'Database Schema',
        'API Routes',
        'Frontend Pages',
        'Test Plan',
        'Deployment Plan',
        'IBM Bob Build Prompt'
      ];

      expectedSections.forEach(section => {
        expect(markdown).toContain(section);
      });
    });

    it('should set correct Content-Disposition header', async () => {
      // Create a test blueprint
      const createResponse = await request(app)
        .post('/api/blueprints/generate')
        .send({ idea: 'A recipe sharing platform with user profiles and cooking tutorials for home chefs' });
      
      const testBlueprintId = createResponse.body.projectId;

      const response = await request(app)
        .get(`/api/blueprints/${testBlueprintId}/export/markdown`)
        .expect(200);

      expect(response.headers['content-disposition']).toMatch(/attachment; filename=".+-blueprint\.md"/);
    });

    it('should save markdown file to exports directory', async () => {
      // Create a test blueprint
      const createResponse = await request(app)
        .post('/api/blueprints/generate')
        .send({ idea: 'A recipe sharing platform with user profiles and cooking tutorials for home chefs' });
      
      const testBlueprintId = createResponse.body.projectId;

      await request(app)
        .get(`/api/blueprints/${testBlueprintId}/export/markdown`)
        .expect(200);

      // Check if exports directory was created
      const exportsDir = path.join(__dirname, '../exports', testBlueprintId);
      expect(fs.existsSync(exportsDir)).toBe(true);

      // Check if markdown file exists
      const files = fs.readdirSync(exportsDir);
      const markdownFiles = files.filter(f => f.endsWith('.md'));
      expect(markdownFiles.length).toBeGreaterThan(0);
    });
  });
});

// Made with Bob