import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../config/database.js';

export function login(req, res) {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    // Find user
    const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const isValidPassword = bcrypt.compareSync(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: user.id, 
        username: user.username, 
        role: user.role,
        name: user.name 
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    // Get additional info based on role
    let additionalInfo = {};
    if (user.role === 'student') {
      const student = db.prepare('SELECT * FROM students WHERE user_id = ?').get(user.id);
      additionalInfo = { studentId: student?.id, rollNumber: student?.roll_number, class: student?.class };
    } else if (user.role === 'teacher') {
      const teacher = db.prepare('SELECT * FROM teachers WHERE user_id = ?').get(user.id);
      additionalInfo = { teacherId: teacher?.id, employeeId: teacher?.employee_id };
    }

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        email: user.email,
        role: user.role,
        ...additionalInfo
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export function getCurrentUser(req, res) {
  try {
    const user = db.prepare('SELECT id, username, name, email, role FROM users WHERE id = ?').get(req.user.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get additional info based on role
    let additionalInfo = {};
    if (user.role === 'student') {
      const student = db.prepare('SELECT * FROM students WHERE user_id = ?').get(user.id);
      additionalInfo = { studentId: student?.id, rollNumber: student?.roll_number, class: student?.class };
    } else if (user.role === 'teacher') {
      const teacher = db.prepare('SELECT * FROM teachers WHERE user_id = ?').get(user.id);
      additionalInfo = { teacherId: teacher?.id, employeeId: teacher?.employee_id };
    }

    res.json({ ...user, ...additionalInfo });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// Made with Bob
