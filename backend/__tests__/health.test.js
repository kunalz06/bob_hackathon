const request = require('supertest');
const app = require('../src/app');

describe('Health Route', () => {
  describe('GET /api/health', () => {
    it('should return ok status', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200)
        .expect('Content-Type', /json/);

      expect(response.body).toHaveProperty('status', 'ok');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('service', 'BobForge Backend');
      expect(response.body).toHaveProperty('version', '1.0.0');
    });

    it('should return valid timestamp', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      const timestamp = new Date(response.body.timestamp);
      expect(timestamp).toBeInstanceOf(Date);
      expect(timestamp.getTime()).not.toBeNaN();
    });
  });
});

// Made with Bob