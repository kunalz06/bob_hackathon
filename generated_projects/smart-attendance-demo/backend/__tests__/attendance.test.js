import request from 'supertest';
import app from '../src/app.js';
import db, { initializeDatabase } from '../src/config/database.js';
import bcrypt from 'bcryptjs';

describe('Attendance API', () => {
  let teacherToken;
  let studentId;
  let subjectId;

  beforeAll(async () => {
    // Initialize test database
    initializeDatabase();
    
    // Clear existing data
    db.exec('DELETE FROM attendance');
    db.exec('DELETE FROM subjects');
    db.exec('DELETE FROM students');
    db.exec('DELETE FROM teachers');
    db.exec('DELETE FROM users');
    
    const password = bcrypt.hashSync('test123', 10);

    // Create teacher
    const teacherUserResult = db.prepare(`
      INSERT INTO users (username, password, role, name, email)
      VALUES (?, ?, ?, ?, ?)
    `).run('teacher1', password, 'teacher', 'Teacher One', 'teacher1@test.com');

    const teacherResult = db.prepare(`
      INSERT INTO teachers (user_id, employee_id, department)
      VALUES (?, ?, ?)
    `).run(teacherUserResult.lastInsertRowid, 'T001', 'Computer Science');

    // Create student
    const studentUserResult = db.prepare(`
      INSERT INTO users (username, password, role, name, email)
      VALUES (?, ?, ?, ?, ?)
    `).run('student1', password, 'student', 'Student One', 'student1@test.com');

    const studentResult = db.prepare(`
      INSERT INTO students (user_id, roll_number, class, section)
      VALUES (?, ?, ?, ?)
    `).run(studentUserResult.lastInsertRowid, 'CS2024001', 'CS-A', 'A');

    studentId = studentResult.lastInsertRowid;

    // Create subject
    const subjectResult = db.prepare(`
      INSERT INTO subjects (name, code, class, teacher_id)
      VALUES (?, ?, ?, ?)
    `).run('Data Structures', 'CS201', 'CS-A', teacherResult.lastInsertRowid);

    subjectId = subjectResult.lastInsertRowid;

    // Login as teacher
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        username: 'teacher1',
        password: 'test123',
      });
    teacherToken = response.body.token;
  });

  afterAll(() => {
    db.close();
  });

  describe('POST /api/attendance/mark', () => {
    it('should mark attendance', async () => {
      const today = new Date().toISOString().split('T')[0];
      
      const response = await request(app)
        .post('/api/attendance/mark')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          studentId,
          subjectId,
          date: today,
          status: 'present',
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.status).toBe('present');
    });

    it('should update existing attendance', async () => {
      const today = new Date().toISOString().split('T')[0];
      
      const response = await request(app)
        .post('/api/attendance/mark')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          studentId,
          subjectId,
          date: today,
          status: 'absent',
        });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('absent');
    });

    it('should reject invalid status', async () => {
      const today = new Date().toISOString().split('T')[0];
      
      const response = await request(app)
        .post('/api/attendance/mark')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          studentId,
          subjectId,
          date: today,
          status: 'invalid',
        });

      expect(response.status).toBe(400);
    });

    it('should reject missing fields', async () => {
      const response = await request(app)
        .post('/api/attendance/mark')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          studentId,
          subjectId,
        });

      expect(response.status).toBe(400);
    });

    it('should reject unauthorized access', async () => {
      const today = new Date().toISOString().split('T')[0];
      
      const response = await request(app)
        .post('/api/attendance/mark')
        .send({
          studentId,
          subjectId,
          date: today,
          status: 'present',
        });

      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/attendance/bulk-mark', () => {
    it('should mark bulk attendance', async () => {
      const today = new Date().toISOString().split('T')[0];
      
      const response = await request(app)
        .post('/api/attendance/bulk-mark')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          attendanceRecords: [
            {
              studentId,
              subjectId,
              date: today,
              status: 'present',
            },
          ],
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message');
    });

    it('should reject empty array', async () => {
      const response = await request(app)
        .post('/api/attendance/bulk-mark')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          attendanceRecords: [],
        });

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/attendance/report', () => {
    it('should get attendance report', async () => {
      const response = await request(app)
        .get('/api/attendance/report')
        .set('Authorization', `Bearer ${teacherToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('attendance');
      expect(response.body).toHaveProperty('stats');
      expect(Array.isArray(response.body.attendance)).toBe(true);
    });

    it('should filter by student', async () => {
      const response = await request(app)
        .get(`/api/attendance/report?studentId=${studentId}`)
        .set('Authorization', `Bearer ${teacherToken}`);

      expect(response.status).toBe(200);
      expect(response.body.attendance.every(a => a.student_id === studentId)).toBe(true);
    });

    it('should filter by subject', async () => {
      const response = await request(app)
        .get(`/api/attendance/report?subjectId=${subjectId}`)
        .set('Authorization', `Bearer ${teacherToken}`);

      expect(response.status).toBe(200);
      expect(response.body.attendance.every(a => a.subject_id === subjectId)).toBe(true);
    });
  });

  describe('GET /api/attendance/student/:studentId', () => {
    it('should get student attendance', async () => {
      const response = await request(app)
        .get(`/api/attendance/student/${studentId}`)
        .set('Authorization', `Bearer ${teacherToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('student');
      expect(response.body).toHaveProperty('attendance');
      expect(response.body).toHaveProperty('subjectStats');
      expect(response.body.student.id).toBe(studentId);
    });

    it('should return 404 for non-existent student', async () => {
      const response = await request(app)
        .get('/api/attendance/student/99999')
        .set('Authorization', `Bearer ${teacherToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe('GET /api/attendance/export/csv', () => {
    it('should require class or subjectId', async () => {
      const response = await request(app)
        .get('/api/attendance/export/csv')
        .set('Authorization', `Bearer ${teacherToken}`);

      expect(response.status).toBe(400);
    });

    it('should export CSV with class filter', async () => {
      const response = await request(app)
        .get('/api/attendance/export/csv?class=CS-A')
        .set('Authorization', `Bearer ${teacherToken}`);

      // Should either download CSV or return 404 if no records
      expect([200, 404]).toContain(response.status);
    });
  });
});

// Made with Bob
