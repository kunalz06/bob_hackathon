import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import db, { initializeDatabase } from '../config/database.js';

dotenv.config();

function seedDatabase() {
  console.log('Starting database seeding...');

  // Initialize database schema
  initializeDatabase();

  // Clear existing data
  db.exec('DELETE FROM attendance');
  db.exec('DELETE FROM subjects');
  db.exec('DELETE FROM students');
  db.exec('DELETE FROM teachers');
  db.exec('DELETE FROM users');

  // Hash password for all users
  const password = bcrypt.hashSync('password123', 10);

  // Create admin user
  const adminResult = db.prepare(`
    INSERT INTO users (username, password, role, name, email)
    VALUES (?, ?, 'admin', ?, ?)
  `).run('admin', password, 'Admin User', 'admin@college.edu');
  console.log('✓ Admin user created');

  // Create teachers
  const teachers = [
    { username: 'teacher1', name: 'Dr. Sarah Johnson', email: 'sarah.johnson@college.edu', employeeId: 'T001', department: 'Computer Science' },
    { username: 'teacher2', name: 'Prof. Michael Chen', email: 'michael.chen@college.edu', employeeId: 'T002', department: 'Mathematics' },
    { username: 'teacher3', name: 'Dr. Emily Davis', email: 'emily.davis@college.edu', employeeId: 'T003', department: 'Physics' },
  ];

  const teacherIds = [];
  teachers.forEach(teacher => {
    const userResult = db.prepare(`
      INSERT INTO users (username, password, role, name, email)
      VALUES (?, ?, 'teacher', ?, ?)
    `).run(teacher.username, password, teacher.name, teacher.email);

    const teacherResult = db.prepare(`
      INSERT INTO teachers (user_id, employee_id, department)
      VALUES (?, ?, ?)
    `).run(userResult.lastInsertRowid, teacher.employeeId, teacher.department);

    teacherIds.push(teacherResult.lastInsertRowid);
  });
  console.log(`✓ ${teachers.length} teachers created`);

  // Create students
  const students = [
    { username: 'student1', name: 'John Smith', email: 'john.smith@student.edu', rollNumber: 'CS2024001', class: 'CS-A', section: 'A' },
    { username: 'student2', name: 'Emma Wilson', email: 'emma.wilson@student.edu', rollNumber: 'CS2024002', class: 'CS-A', section: 'A' },
    { username: 'student3', name: 'James Brown', email: 'james.brown@student.edu', rollNumber: 'CS2024003', class: 'CS-A', section: 'A' },
    { username: 'student4', name: 'Olivia Taylor', email: 'olivia.taylor@student.edu', rollNumber: 'CS2024004', class: 'CS-A', section: 'A' },
    { username: 'student5', name: 'William Anderson', email: 'william.anderson@student.edu', rollNumber: 'CS2024005', class: 'CS-A', section: 'A' },
    { username: 'student6', name: 'Sophia Martinez', email: 'sophia.martinez@student.edu', rollNumber: 'CS2024006', class: 'CS-B', section: 'B' },
    { username: 'student7', name: 'Liam Garcia', email: 'liam.garcia@student.edu', rollNumber: 'CS2024007', class: 'CS-B', section: 'B' },
    { username: 'student8', name: 'Ava Rodriguez', email: 'ava.rodriguez@student.edu', rollNumber: 'CS2024008', class: 'CS-B', section: 'B' },
  ];

  const studentIds = [];
  students.forEach(student => {
    const userResult = db.prepare(`
      INSERT INTO users (username, password, role, name, email)
      VALUES (?, ?, 'student', ?, ?)
    `).run(student.username, password, student.name, student.email);

    const studentResult = db.prepare(`
      INSERT INTO students (user_id, roll_number, class, section)
      VALUES (?, ?, ?, ?)
    `).run(userResult.lastInsertRowid, student.rollNumber, student.class, student.section);

    studentIds.push(studentResult.lastInsertRowid);
  });
  console.log(`✓ ${students.length} students created`);

  // Create subjects
  const subjects = [
    { name: 'Data Structures', code: 'CS201', class: 'CS-A', teacherId: teacherIds[0] },
    { name: 'Algorithms', code: 'CS202', class: 'CS-A', teacherId: teacherIds[0] },
    { name: 'Database Systems', code: 'CS203', class: 'CS-A', teacherId: teacherIds[0] },
    { name: 'Discrete Mathematics', code: 'MATH301', class: 'CS-A', teacherId: teacherIds[1] },
    { name: 'Linear Algebra', code: 'MATH302', class: 'CS-B', teacherId: teacherIds[1] },
    { name: 'Physics I', code: 'PHY101', class: 'CS-B', teacherId: teacherIds[2] },
  ];

  const subjectIds = [];
  subjects.forEach(subject => {
    const result = db.prepare(`
      INSERT INTO subjects (name, code, class, teacher_id)
      VALUES (?, ?, ?, ?)
    `).run(subject.name, subject.code, subject.class, subject.teacherId);

    subjectIds.push(result.lastInsertRowid);
  });
  console.log(`✓ ${subjects.length} subjects created`);

  // Create sample attendance records (last 7 days)
  const today = new Date();
  const attendanceRecords = [];

  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];

    // Mark attendance for CS-A students in their subjects
    for (let j = 0; j < 5; j++) {
      const studentId = studentIds[j];
      // Data Structures
      attendanceRecords.push({
        studentId,
        subjectId: subjectIds[0],
        date: dateStr,
        status: Math.random() > 0.2 ? 'present' : 'absent',
        markedBy: adminResult.lastInsertRowid,
      });
      // Algorithms
      attendanceRecords.push({
        studentId,
        subjectId: subjectIds[1],
        date: dateStr,
        status: Math.random() > 0.15 ? 'present' : 'absent',
        markedBy: adminResult.lastInsertRowid,
      });
    }

    // Mark attendance for CS-B students
    for (let j = 5; j < 8; j++) {
      const studentId = studentIds[j];
      // Linear Algebra
      attendanceRecords.push({
        studentId,
        subjectId: subjectIds[4],
        date: dateStr,
        status: Math.random() > 0.25 ? 'present' : 'absent',
        markedBy: adminResult.lastInsertRowid,
      });
    }
  }

  const insertAttendance = db.prepare(`
    INSERT INTO attendance (student_id, subject_id, date, status, marked_by)
    VALUES (?, ?, ?, ?, ?)
  `);

  attendanceRecords.forEach(record => {
    insertAttendance.run(
      record.studentId,
      record.subjectId,
      record.date,
      record.status,
      record.markedBy
    );
  });
  console.log(`✓ ${attendanceRecords.length} attendance records created`);

  console.log('\n✅ Database seeding completed successfully!');
  console.log('\nDefault credentials:');
  console.log('Admin: username=admin, password=password123');
  console.log('Teacher: username=teacher1, password=password123');
  console.log('Student: username=student1, password=password123');
}

// Run seeding
try {
  seedDatabase();
  process.exit(0);
} catch (error) {
  console.error('❌ Seeding failed:', error);
  process.exit(1);
}

// Made with Bob
