import db from '../config/database.js';

export function getAllSubjects(req, res) {
  try {
    const subjects = db.prepare(`
      SELECT 
        s.id, s.name, s.code, s.class, s.teacher_id,
        t.employee_id, u.name as teacher_name
      FROM subjects s
      LEFT JOIN teachers t ON s.teacher_id = t.id
      LEFT JOIN users u ON t.user_id = u.id
      ORDER BY s.class, s.name
    `).all();

    res.json(subjects);
  } catch (error) {
    console.error('Get subjects error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export function getSubjectById(req, res) {
  try {
    const { id } = req.params;

    const subject = db.prepare(`
      SELECT 
        s.id, s.name, s.code, s.class, s.teacher_id,
        t.employee_id, u.name as teacher_name
      FROM subjects s
      LEFT JOIN teachers t ON s.teacher_id = t.id
      LEFT JOIN users u ON t.user_id = u.id
      WHERE s.id = ?
    `).get(id);

    if (!subject) {
      return res.status(404).json({ error: 'Subject not found' });
    }

    res.json(subject);
  } catch (error) {
    console.error('Get subject error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export function createSubject(req, res) {
  try {
    const { name, code, class: subjectClass, teacherId } = req.body;

    // Validation
    if (!name || !code || !subjectClass) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Verify teacher exists if provided
    if (teacherId) {
      const teacher = db.prepare('SELECT id FROM teachers WHERE id = ?').get(teacherId);
      if (!teacher) {
        return res.status(404).json({ error: 'Teacher not found' });
      }
    }

    const result = db.prepare(`
      INSERT INTO subjects (name, code, class, teacher_id)
      VALUES (?, ?, ?, ?)
    `).run(name, code, subjectClass, teacherId || null);

    const subject = db.prepare(`
      SELECT 
        s.id, s.name, s.code, s.class, s.teacher_id,
        t.employee_id, u.name as teacher_name
      FROM subjects s
      LEFT JOIN teachers t ON s.teacher_id = t.id
      LEFT JOIN users u ON t.user_id = u.id
      WHERE s.id = ?
    `).get(result.lastInsertRowid);

    res.status(201).json(subject);
  } catch (error) {
    console.error('Create subject error:', error);
    if (error.message.includes('UNIQUE constraint failed')) {
      return res.status(409).json({ error: 'Subject code already exists' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
}

export function updateSubject(req, res) {
  try {
    const { id } = req.params;
    const { name, code, class: subjectClass, teacherId } = req.body;

    // Check if subject exists
    const subject = db.prepare('SELECT id FROM subjects WHERE id = ?').get(id);
    if (!subject) {
      return res.status(404).json({ error: 'Subject not found' });
    }

    // Verify teacher exists if provided
    if (teacherId) {
      const teacher = db.prepare('SELECT id FROM teachers WHERE id = ?').get(teacherId);
      if (!teacher) {
        return res.status(404).json({ error: 'Teacher not found' });
      }
    }

    const updates = [];
    const values = [];

    if (name) {
      updates.push('name = ?');
      values.push(name);
    }
    if (code) {
      updates.push('code = ?');
      values.push(code);
    }
    if (subjectClass) {
      updates.push('class = ?');
      values.push(subjectClass);
    }
    if (teacherId !== undefined) {
      updates.push('teacher_id = ?');
      values.push(teacherId);
    }

    if (updates.length > 0) {
      values.push(id);
      db.prepare(`UPDATE subjects SET ${updates.join(', ')} WHERE id = ?`).run(...values);
    }

    // Get updated subject
    const updatedSubject = db.prepare(`
      SELECT 
        s.id, s.name, s.code, s.class, s.teacher_id,
        t.employee_id, u.name as teacher_name
      FROM subjects s
      LEFT JOIN teachers t ON s.teacher_id = t.id
      LEFT JOIN users u ON t.user_id = u.id
      WHERE s.id = ?
    `).get(id);

    res.json(updatedSubject);
  } catch (error) {
    console.error('Update subject error:', error);
    if (error.message.includes('UNIQUE constraint failed')) {
      return res.status(409).json({ error: 'Subject code already exists' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
}

export function deleteSubject(req, res) {
  try {
    const { id } = req.params;

    const subject = db.prepare('SELECT id FROM subjects WHERE id = ?').get(id);
    if (!subject) {
      return res.status(404).json({ error: 'Subject not found' });
    }

    db.prepare('DELETE FROM subjects WHERE id = ?').run(id);

    res.json({ message: 'Subject deleted successfully' });
  } catch (error) {
    console.error('Delete subject error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// Made with Bob
