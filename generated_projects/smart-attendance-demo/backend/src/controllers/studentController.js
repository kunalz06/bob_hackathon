import bcrypt from 'bcryptjs';
import db from '../config/database.js';

export function getAllStudents(req, res) {
  try {
    const students = db.prepare(`
      SELECT 
        s.id, s.roll_number, s.class, s.section,
        u.id as user_id, u.name, u.email, u.username
      FROM students s
      JOIN users u ON s.user_id = u.id
      ORDER BY s.class, s.roll_number
    `).all();

    res.json(students);
  } catch (error) {
    console.error('Get students error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export function getStudentById(req, res) {
  try {
    const { id } = req.params;

    const student = db.prepare(`
      SELECT 
        s.id, s.roll_number, s.class, s.section,
        u.id as user_id, u.name, u.email, u.username
      FROM students s
      JOIN users u ON s.user_id = u.id
      WHERE s.id = ?
    `).get(id);

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    res.json(student);
  } catch (error) {
    console.error('Get student error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export function createStudent(req, res) {
  try {
    const { name, email, username, password, rollNumber, class: studentClass, section } = req.body;

    // Validation
    if (!name || !email || !username || !password || !rollNumber || !studentClass) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Hash password
    const hashedPassword = bcrypt.hashSync(password, 10);

    // Start transaction
    const insertUser = db.prepare(`
      INSERT INTO users (username, password, role, name, email)
      VALUES (?, ?, 'student', ?, ?)
    `);

    const insertStudent = db.prepare(`
      INSERT INTO students (user_id, roll_number, class, section)
      VALUES (?, ?, ?, ?)
    `);

    const transaction = db.transaction(() => {
      const userResult = insertUser.run(username, hashedPassword, name, email);
      const studentResult = insertStudent.run(userResult.lastInsertRowid, rollNumber, studentClass, section || null);
      return { userId: userResult.lastInsertRowid, studentId: studentResult.lastInsertRowid };
    });

    const result = transaction();

    res.status(201).json({
      id: result.studentId,
      user_id: result.userId,
      name,
      email,
      username,
      rollNumber,
      class: studentClass,
      section
    });
  } catch (error) {
    console.error('Create student error:', error);
    if (error.message.includes('UNIQUE constraint failed')) {
      return res.status(409).json({ error: 'Username, email, or roll number already exists' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
}

export function updateStudent(req, res) {
  try {
    const { id } = req.params;
    const { name, email, rollNumber, class: studentClass, section } = req.body;

    // Check if student exists
    const student = db.prepare('SELECT user_id FROM students WHERE id = ?').get(id);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Update user info
    if (name || email) {
      const updates = [];
      const values = [];
      
      if (name) {
        updates.push('name = ?');
        values.push(name);
      }
      if (email) {
        updates.push('email = ?');
        values.push(email);
      }
      
      values.push(student.user_id);
      db.prepare(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`).run(...values);
    }

    // Update student info
    if (rollNumber || studentClass || section !== undefined) {
      const updates = [];
      const values = [];
      
      if (rollNumber) {
        updates.push('roll_number = ?');
        values.push(rollNumber);
      }
      if (studentClass) {
        updates.push('class = ?');
        values.push(studentClass);
      }
      if (section !== undefined) {
        updates.push('section = ?');
        values.push(section);
      }
      
      values.push(id);
      db.prepare(`UPDATE students SET ${updates.join(', ')} WHERE id = ?`).run(...values);
    }

    // Get updated student
    const updatedStudent = db.prepare(`
      SELECT 
        s.id, s.roll_number, s.class, s.section,
        u.id as user_id, u.name, u.email, u.username
      FROM students s
      JOIN users u ON s.user_id = u.id
      WHERE s.id = ?
    `).get(id);

    res.json(updatedStudent);
  } catch (error) {
    console.error('Update student error:', error);
    if (error.message.includes('UNIQUE constraint failed')) {
      return res.status(409).json({ error: 'Email or roll number already exists' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
}

export function deleteStudent(req, res) {
  try {
    const { id } = req.params;

    const student = db.prepare('SELECT user_id FROM students WHERE id = ?').get(id);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Delete user (cascade will delete student)
    db.prepare('DELETE FROM users WHERE id = ?').run(student.user_id);

    res.json({ message: 'Student deleted successfully' });
  } catch (error) {
    console.error('Delete student error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// Made with Bob
