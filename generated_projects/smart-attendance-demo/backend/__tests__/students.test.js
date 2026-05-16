import request from 'supertest';
import app from '../src/app.js';
import db, { initializeDatabase } from '../src/config/database.js';
import bcrypt from 'bcryptjs';

describe('Students API', () => {
  let adminToken;
  let studentId;

  beforeAll(async () => {
    // Initialize test database
    initializeDatabase();
    
    // Clear existing data
    db.exec('DELETE FROM students');
    db.exec('DELETE FROM users');
    
    // Create admin user
    const password = bcrypt.hashSync('admin123', 10);
    db.prepare(`
      INSERT INTO users (username, password, role, name, email)
      VALUES (?, ?, ?, ?, ?)
    `).run('admin', password, 'admin', 'Admin User', 'admin@test.com');

    // Login as admin
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        username: 'admin',
        password: 'admin123',
      });
    adminToken = response.body.token;
  });

  afterAll(() => {
    db.close();
  });

  describe('POST /api/students', () => {
    it('should create a new student', async () => {
      const response = await request(app)
        .post('/api/students')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'John Doe',
          email: 'john.doe@student.edu',
          username: 'johndoe',
          password: 'password123',
          rollNumber: 'CS2024001',
          class: 'CS-A',
          section: 'A',
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe('John Doe');
      expect(response.body.rollNumber).toBe('CS2024001');
      studentId = response.body.id;
    });

    it('should reject duplicate roll number', async () => {
      const response = await request(app)
        .post('/api/students')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Jane Doe',
          email: 'jane.doe@student.edu',
          username: 'janedoe',
          password: 'password123',
          rollNumber: 'CS2024001', // Duplicate
          class: 'CS-A',
          section: 'A',
        });

      expect(response.status).toBe(409);
      expect(response.body).toHaveProperty('error');
    });

    it('should reject missing required fields', async () => {
      const response = await request(app)
        .post('/api/students')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Test Student',
          email: 'test@student.edu',
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should reject unauthorized access', async () => {
      const response = await request(app)
        .post('/api/students')
        .send({
          name: 'Test Student',
          email: 'test@student.edu',
          username: 'test',
          password: 'password123',
          rollNumber: 'CS2024999',
          class: 'CS-A',
        });

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/students', () => {
    it('should get all students', async () => {
      const response = await request(app)
        .get('/api/students')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    it('should reject unauthorized access', async () => {
      const response = await request(app)
        .get('/api/students');

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/students/:id', () => {
    it('should get student by id', async () => {
      const response = await request(app)
        .get(`/api/students/${studentId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(studentId);
      expect(response.body.name).toBe('John Doe');
    });

    it('should return 404 for non-existent student', async () => {
      const response = await request(app)
        .get('/api/students/99999')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe('PUT /api/students/:id', () => {
    it('should update student', async () => {
      const response = await request(app)
        .put(`/api/students/${studentId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'John Updated',
          section: 'B',
        });

      expect(response.status).toBe(200);
      expect(response.body.name).toBe('John Updated');
      expect(response.body.section).toBe('B');
    });

    it('should return 404 for non-existent student', async () => {
      const response = await request(app)
        .put('/api/students/99999')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Test',
        });

      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /api/students/:id', () => {
    it('should delete student', async () => {
      const response = await request(app)
        .delete(`/api/students/${studentId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message');
    });

    it('should return 404 for already deleted student', async () => {
      const response = await request(app)
        .delete(`/api/students/${studentId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
    });
  });
});

// Made with Bob
