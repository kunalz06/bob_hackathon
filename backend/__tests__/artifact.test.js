const request = require('supertest');
const fs = require('fs');
const path = require('path');
const app = require('../src/app');

// Test data file paths
const artifactsPath = path.join(__dirname, '../src/data/artifacts.json');
const testArtifactsBackup = path.join(__dirname, '../src/data/artifacts.test.backup.json');

describe('Artifact Tracker', () => {
  let originalArtifacts;

  beforeAll(() => {
    // Backup original artifacts
    if (fs.existsSync(artifactsPath)) {
      originalArtifacts = fs.readFileSync(artifactsPath, 'utf8');
      fs.writeFileSync(testArtifactsBackup, originalArtifacts);
    }
  });

  afterAll(() => {
    // Restore original artifacts
    if (originalArtifacts) {
      fs.writeFileSync(artifactsPath, originalArtifacts);
    }
    // Clean up backup
    if (fs.existsSync(testArtifactsBackup)) {
      fs.unlinkSync(testArtifactsBackup);
    }
  });

  describe('POST /api/artifacts', () => {
    it('should create artifact with valid data', async () => {
      const artifactData = {
        projectName: 'Test Project',
        filePath: '/src/components/TestComponent.jsx',
        artifactType: 'frontend',
        purpose: 'Main dashboard component',
        createdBy: 'IBM Bob',
        status: 'completed'
      };

      const response = await request(app)
        .post('/api/artifacts')
        .send(artifactData)
        .expect(201)
        .expect('Content-Type', /json/);

      expect(response.body.success).toBe(true);
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('artifact');
      expect(response.body.artifact.projectName).toBe(artifactData.projectName);
      expect(response.body.artifact.filePath).toBe(artifactData.filePath);
      expect(response.body.artifact.artifactType).toBe(artifactData.artifactType);
    });

    it('should reject artifact with missing filePath', async () => {
      const invalidData = {
        projectName: 'Test Project',
        artifactType: 'frontend',
        purpose: 'Test component'
        // Missing filePath
      };

      const response = await request(app)
        .post('/api/artifacts')
        .send(invalidData)
        .expect(400)
        .expect('Content-Type', /json/);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('ValidationError');
      expect(response.body.error.message).toContain('filePath');
    });

    it('should reject artifact with missing projectName', async () => {
      const invalidData = {
        filePath: '/src/test.js',
        artifactType: 'backend',
        purpose: 'Test file'
        // Missing projectName
      };

      const response = await request(app)
        .post('/api/artifacts')
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('ValidationError');
    });

    it('should reject artifact with missing artifactType', async () => {
      const invalidData = {
        projectName: 'Test Project',
        filePath: '/src/test.js',
        purpose: 'Test file'
        // Missing artifactType
      };

      const response = await request(app)
        .post('/api/artifacts')
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('ValidationError');
    });

    it('should reject artifact with missing purpose', async () => {
      const invalidData = {
        projectName: 'Test Project',
        filePath: '/src/test.js',
        artifactType: 'backend'
        // Missing purpose
      };

      const response = await request(app)
        .post('/api/artifacts')
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('ValidationError');
    });

    it('should create artifact with optional fields', async () => {
      const artifactData = {
        projectName: 'Test Project',
        filePath: '/tests/unit/test.spec.js',
        artifactType: 'test',
        purpose: 'Unit tests for authentication',
        createdBy: 'IBM Bob',
        bobSessionFile: 'bob_sessions/2024-01-15-auth-tests.md',
        status: 'in-progress',
        notes: 'Additional test coverage needed'
      };

      const response = await request(app)
        .post('/api/artifacts')
        .send(artifactData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.artifact.bobSessionFile).toBe(artifactData.bobSessionFile);
      expect(response.body.artifact.notes).toBe(artifactData.notes);
      expect(response.body.artifact.status).toBe(artifactData.status);
    });

    it('should auto-generate ID and timestamp', async () => {
      const artifactData = {
        projectName: 'Test Project',
        filePath: '/src/utils/helper.js',
        artifactType: 'backend',
        purpose: 'Utility functions'
      };

      const response = await request(app)
        .post('/api/artifacts')
        .send(artifactData)
        .expect(201);

      expect(response.body.artifact).toHaveProperty('id');
      expect(response.body.artifact).toHaveProperty('createdAt');
      expect(response.body.artifact.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
    });
  });

  describe('GET /api/artifacts', () => {
    beforeAll(async () => {
      // Create some test artifacts
      const artifacts = [
        {
          projectName: 'Project A',
          filePath: '/src/app.js',
          artifactType: 'backend',
          purpose: 'Main application file'
        },
        {
          projectName: 'Project A',
          filePath: '/src/components/Header.jsx',
          artifactType: 'frontend',
          purpose: 'Header component'
        },
        {
          projectName: 'Project B',
          filePath: '/src/index.js',
          artifactType: 'backend',
          purpose: 'Entry point'
        }
      ];

      for (const artifact of artifacts) {
        await request(app).post('/api/artifacts').send(artifact);
      }
    });

    it('should list all artifacts', async () => {
      const response = await request(app)
        .get('/api/artifacts')
        .expect(200)
        .expect('Content-Type', /json/);

      expect(response.body.success).toBe(true);
      expect(response.body).toHaveProperty('artifacts');
      expect(Array.isArray(response.body.artifacts)).toBe(true);
      expect(response.body.artifacts.length).toBeGreaterThan(0);
    });

    it('should filter artifacts by projectName', async () => {
      const response = await request(app)
        .get('/api/artifacts?projectName=Project A')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.artifacts.length).toBeGreaterThan(0);
      
      // All returned artifacts should be from Project A
      response.body.artifacts.forEach(artifact => {
        expect(artifact.projectName).toBe('Project A');
      });
    });

    it('should return empty array for non-existent project', async () => {
      const response = await request(app)
        .get('/api/artifacts?projectName=NonExistentProject')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.artifacts).toEqual([]);
    });
  });

  describe('GET /api/artifacts/:id', () => {
    let testArtifactId;

    beforeAll(async () => {
      // Create a test artifact
      const response = await request(app)
        .post('/api/artifacts')
        .send({
          projectName: 'Test Project',
          filePath: '/src/test.js',
          artifactType: 'backend',
          purpose: 'Test file for retrieval'
        });
      
      testArtifactId = response.body.id;
    });

    it('should return artifact by ID', async () => {
      const response = await request(app)
        .get(`/api/artifacts/${testArtifactId}`)
        .expect(200)
        .expect('Content-Type', /json/);

      expect(response.body.success).toBe(true);
      expect(response.body.artifact).toBeDefined();
      expect(response.body.artifact.id).toBe(testArtifactId);
    });

    it('should return 404 for non-existent artifact', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      
      const response = await request(app)
        .get(`/api/artifacts/${fakeId}`)
        .expect(404)
        .expect('Content-Type', /json/);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('NotFoundError');
    });
  });

  describe('DELETE /api/artifacts/:id', () => {
    let testArtifactId;

    beforeEach(async () => {
      // Create a test artifact for deletion
      const response = await request(app)
        .post('/api/artifacts')
        .send({
          projectName: 'Test Project',
          filePath: '/src/to-delete.js',
          artifactType: 'backend',
          purpose: 'File to be deleted'
        });
      
      testArtifactId = response.body.id;
    });

    it('should delete artifact by ID', async () => {
      const response = await request(app)
        .delete(`/api/artifacts/${testArtifactId}`)
        .expect(200)
        .expect('Content-Type', /json/);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Artifact deleted successfully');

      // Verify artifact is deleted
      await request(app)
        .get(`/api/artifacts/${testArtifactId}`)
        .expect(404);
    });

    it('should return 404 when deleting non-existent artifact', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      
      const response = await request(app)
        .delete(`/api/artifacts/${fakeId}`)
        .expect(404)
        .expect('Content-Type', /json/);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('NotFoundError');
    });
  });
});

// Made with Bob