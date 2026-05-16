import db from '../config/database.js';
import { createObjectCsvWriter } from 'csv-writer';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export function markAttendance(req, res) {
  try {
    const { studentId, subjectId, date, status } = req.body;

    // Validation
    if (!studentId || !subjectId || !date || !status) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (!['present', 'absent', 'late'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status. Must be present, absent, or late' });
    }

    // Verify student exists
    const student = db.prepare('SELECT id FROM students WHERE id = ?').get(studentId);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Verify subject exists
    const subject = db.prepare('SELECT id FROM subjects WHERE id = ?').get(subjectId);
    if (!subject) {
      return res.status(404).json({ error: 'Subject not found' });
    }

    // Insert or update attendance
    const result = db.prepare(`
      INSERT INTO attendance (student_id, subject_id, date, status, marked_by)
      VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(student_id, subject_id, date) 
      DO UPDATE SET status = ?, marked_by = ?
    `).run(studentId, subjectId, date, status, req.user.id, status, req.user.id);

    const attendance = db.prepare(`
      SELECT 
        a.id, a.date, a.status,
        s.id as student_id, s.roll_number,
        u.name as student_name,
        sub.id as subject_id, sub.name as subject_name, sub.code as subject_code
      FROM attendance a
      JOIN students s ON a.student_id = s.id
      JOIN users u ON s.user_id = u.id
      JOIN subjects sub ON a.subject_id = sub.id
      WHERE a.student_id = ? AND a.subject_id = ? AND a.date = ?
    `).get(studentId, subjectId, date);

    res.status(result.changes > 0 ? 200 : 201).json(attendance);
  } catch (error) {
    console.error('Mark attendance error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export function bulkMarkAttendance(req, res) {
  try {
    const { attendanceRecords } = req.body;

    if (!Array.isArray(attendanceRecords) || attendanceRecords.length === 0) {
      return res.status(400).json({ error: 'attendanceRecords must be a non-empty array' });
    }

    const insertStmt = db.prepare(`
      INSERT INTO attendance (student_id, subject_id, date, status, marked_by)
      VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(student_id, subject_id, date) 
      DO UPDATE SET status = ?, marked_by = ?
    `);

    const transaction = db.transaction((records) => {
      for (const record of records) {
        const { studentId, subjectId, date, status } = record;
        insertStmt.run(studentId, subjectId, date, status, req.user.id, status, req.user.id);
      }
    });

    transaction(attendanceRecords);

    res.json({ message: `${attendanceRecords.length} attendance records marked successfully` });
  } catch (error) {
    console.error('Bulk mark attendance error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export function getAttendanceReport(req, res) {
  try {
    const { studentId, subjectId, class: studentClass, startDate, endDate } = req.query;

    let query = `
      SELECT 
        a.id, a.date, a.status,
        s.id as student_id, s.roll_number, s.class,
        u.name as student_name,
        sub.id as subject_id, sub.name as subject_name, sub.code as subject_code,
        marker.name as marked_by_name
      FROM attendance a
      JOIN students s ON a.student_id = s.id
      JOIN users u ON s.user_id = u.id
      JOIN subjects sub ON a.subject_id = sub.id
      JOIN users marker ON a.marked_by = marker.id
      WHERE 1=1
    `;

    const params = [];

    if (studentId) {
      query += ' AND a.student_id = ?';
      params.push(studentId);
    }

    if (subjectId) {
      query += ' AND a.subject_id = ?';
      params.push(subjectId);
    }

    if (studentClass) {
      query += ' AND s.class = ?';
      params.push(studentClass);
    }

    if (startDate) {
      query += ' AND a.date >= ?';
      params.push(startDate);
    }

    if (endDate) {
      query += ' AND a.date <= ?';
      params.push(endDate);
    }

    query += ' ORDER BY a.date DESC, s.roll_number';

    const attendance = db.prepare(query).all(...params);

    // Calculate statistics
    const stats = {
      total: attendance.length,
      present: attendance.filter(a => a.status === 'present').length,
      absent: attendance.filter(a => a.status === 'absent').length,
      late: attendance.filter(a => a.status === 'late').length,
    };

    res.json({ attendance, stats });
  } catch (error) {
    console.error('Get attendance report error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export function getStudentAttendance(req, res) {
  try {
    const { studentId } = req.params;
    const { subjectId, startDate, endDate } = req.query;

    // Verify student exists
    const student = db.prepare(`
      SELECT s.id, s.roll_number, s.class, u.name
      FROM students s
      JOIN users u ON s.user_id = u.id
      WHERE s.id = ?
    `).get(studentId);

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    let query = `
      SELECT 
        a.id, a.date, a.status,
        sub.id as subject_id, sub.name as subject_name, sub.code as subject_code
      FROM attendance a
      JOIN subjects sub ON a.subject_id = sub.id
      WHERE a.student_id = ?
    `;

    const params = [studentId];

    if (subjectId) {
      query += ' AND a.subject_id = ?';
      params.push(subjectId);
    }

    if (startDate) {
      query += ' AND a.date >= ?';
      params.push(startDate);
    }

    if (endDate) {
      query += ' AND a.date <= ?';
      params.push(endDate);
    }

    query += ' ORDER BY a.date DESC';

    const attendance = db.prepare(query).all(...params);

    // Calculate statistics by subject
    const subjectStats = {};
    attendance.forEach(record => {
      if (!subjectStats[record.subject_id]) {
        subjectStats[record.subject_id] = {
          subjectName: record.subject_name,
          subjectCode: record.subject_code,
          total: 0,
          present: 0,
          absent: 0,
          late: 0,
        };
      }
      subjectStats[record.subject_id].total++;
      subjectStats[record.subject_id][record.status]++;
    });

    // Calculate percentage
    Object.values(subjectStats).forEach(stat => {
      stat.percentage = stat.total > 0 ? ((stat.present + stat.late) / stat.total * 100).toFixed(2) : 0;
    });

    res.json({
      student,
      attendance,
      subjectStats: Object.values(subjectStats),
    });
  } catch (error) {
    console.error('Get student attendance error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function exportAttendanceCSV(req, res) {
  try {
    const { class: studentClass, subjectId, startDate, endDate } = req.query;

    if (!studentClass && !subjectId) {
      return res.status(400).json({ error: 'Either class or subjectId is required' });
    }

    let query = `
      SELECT 
        s.roll_number,
        u.name as student_name,
        s.class,
        sub.code as subject_code,
        sub.name as subject_name,
        a.date,
        a.status
      FROM attendance a
      JOIN students s ON a.student_id = s.id
      JOIN users u ON s.user_id = u.id
      JOIN subjects sub ON a.subject_id = sub.id
      WHERE 1=1
    `;

    const params = [];

    if (studentClass) {
      query += ' AND s.class = ?';
      params.push(studentClass);
    }

    if (subjectId) {
      query += ' AND a.subject_id = ?';
      params.push(subjectId);
    }

    if (startDate) {
      query += ' AND a.date >= ?';
      params.push(startDate);
    }

    if (endDate) {
      query += ' AND a.date <= ?';
      params.push(endDate);
    }

    query += ' ORDER BY s.roll_number, a.date';

    const records = db.prepare(query).all(...params);

    if (records.length === 0) {
      return res.status(404).json({ error: 'No attendance records found' });
    }

    // Create CSV file
    const exportDir = join(__dirname, '../../exports');
    if (!fs.existsSync(exportDir)) {
      fs.mkdirSync(exportDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `attendance-report-${timestamp}.csv`;
    const filepath = join(exportDir, filename);

    const csvWriter = createObjectCsvWriter({
      path: filepath,
      header: [
        { id: 'roll_number', title: 'Roll Number' },
        { id: 'student_name', title: 'Student Name' },
        { id: 'class', title: 'Class' },
        { id: 'subject_code', title: 'Subject Code' },
        { id: 'subject_name', title: 'Subject Name' },
        { id: 'date', title: 'Date' },
        { id: 'status', title: 'Status' },
      ],
    });

    await csvWriter.writeRecords(records);

    res.download(filepath, filename, (err) => {
      if (err) {
        console.error('Download error:', err);
      }
      // Clean up file after download
      fs.unlink(filepath, (unlinkErr) => {
        if (unlinkErr) console.error('File cleanup error:', unlinkErr);
      });
    });
  } catch (error) {
    console.error('Export CSV error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// Made with Bob
