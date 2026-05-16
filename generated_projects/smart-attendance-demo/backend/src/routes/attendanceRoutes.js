import express from 'express';
import {
  markAttendance,
  bulkMarkAttendance,
  getAttendanceReport,
  getStudentAttendance,
  exportAttendanceCSV,
} from '../controllers/attendanceController.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

router.post('/mark', authenticateToken, authorizeRoles('teacher', 'admin'), markAttendance);
router.post('/bulk-mark', authenticateToken, authorizeRoles('teacher', 'admin'), bulkMarkAttendance);
router.get('/report', authenticateToken, getAttendanceReport);
router.get('/student/:studentId', authenticateToken, getStudentAttendance);
router.get('/export/csv', authenticateToken, authorizeRoles('admin', 'teacher'), exportAttendanceCSV);

export default router;

// Made with Bob
