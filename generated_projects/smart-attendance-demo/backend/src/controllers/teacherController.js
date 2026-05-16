import bcrypt from 'bcryptjs';
import db from '../config/database.js';

export function getAllTeachers(req, res) {
  try {
    const teachers = db.prepare(`
      SELECT 
        t.id, t.employee_id, t.department,
        u.id as user_id, u.name, u.email, u.username
      FROM teachers t
      JOIN users u ON t.user_id = u.id
      ORDER BY u.name
    `).all();

    res.json(teachers);
  } catch (error) {
    console.error('Get teachers error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export function getTeacherById(req, res) {
  try {
    const { id } = req.params;

    const teacher = db.prepare(`
      SELECT 
        t.id, t.employee_id, t.department,
        u.id as user_id, u.name, u.email, u.username
      FROM teachers t
      JOIN users u ON t.user_id = u.id
      WHERE t.id = ?
    `).get(id);

    if (!teacher) {
      return res.status(404).json({ error: 'Teacher not found' });
    }

    res.json(teacher);
  } catch (error) {
    console.error('Get teacher error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export function createTeacher(req, res) {
  try {
    const { name, email, username, password, employeeId, department } = req.body;

    // Validation
    if (!name || !email || !username || !password || !employeeId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Hash password
    const hashedPassword = bcrypt.hashSync(password, 10);

    // Start transaction
    const insertUser = db.prepare(`
      INSERT INTO users (username, password, role, name, email)
      VALUES (?, ?, 'teacher', ?, ?)
    `);

    const insertTeacher = db.prepare(`
      INSERT INTO teachers (user_id, employee_id, department)
      VALUES (?, ?, ?)
    `);

    const transaction = db.transaction(() => {
      const userResult = insertUser.run(username, hashedPassword, name, email);
      const teacherResult = insertTeacher.run(userResult.lastInsertRowid, employeeId, department || null);
      return { userId: userResult.lastInsertRowid, teacherId: teacherResult.lastInsertRowid };
    });

    const result = transaction();

    res.status(201).json({
      id: result.teacherId,
      user_id: result.userId,
      name,
      email,
      username,
      employeeId,
      department
    });
  } catch (error) {
    console.error('Create teacher error:', error);
    if (error.message.includes('UNIQUE constraint failed')) {
      return res.status(409).json({ error: 'Username, email, or employee ID already exists' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
}

export function updateTeacher(req, res) {
  try {
    const { id } = req.params;
    const { name, email, employeeId, department } = req.body;

    // Check if teacher exists
    const teacher = db.prepare('SELECT user_id FROM teachers WHERE id = ?').get(id);
    if (!teacher) {
      return res.status(404).json({ error: 'Teacher not found' });
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
      
      values.push(teacher.user_id);
      db.prepare(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`).run(...values);
    }

    // Update teacher info
    if (employeeId || department !== undefined) {
      const updates = [];
      const values = [];
      
      if (employeeId) {
        updates.push('employee_id = ?');
        values.push(employeeId);
      }
      if (department !== undefined) {
        updates.push('department = ?');
        values.push(department);
      }
      
      values.push(id);
      db.prepare(`UPDATE teachers SET ${updates.join(', ')} WHERE id = ?`).run(...values);
    }

    // Get updated teacher
    const updatedTeacher = db.prepare(`
      SELECT 
        t.id, t.employee_id, t.department,
        u.id as user_id, u.name, u.email, u.username
      FROM teachers t
      JOIN users u ON t.user_id = u.id
      WHERE t.id = ?
    `).get(id);

    res.json(updatedTeacher);
  } catch (error) {
    console.error('Update teacher error:', error);
    if (error.message.includes('UNIQUE constraint failed')) {
      return res.status(409).json({ error: 'Email or employee ID already exists' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
}

export function deleteTeacher(req, res) {
  try {
    const { id } = req.params;

    const teacher = db.prepare('SELECT user_id FROM teachers WHERE id = ?').get(id);
    if (!teacher) {
      return res.status(404).json({ error: 'Teacher not found' });
    }

    // Delete user (cascade will delete teacher)
    db.prepare('DELETE FROM users WHERE id = ?').run(teacher.user_id);

    res.json({ message: 'Teacher deleted successfully' });
  } catch (error) {
    console.error('Delete teacher error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// Made with Bob
