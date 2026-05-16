import express from 'express';
import {
  getAllStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
} from '../controllers/studentController.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticateToken, getAllStudents);
router.get('/:id', authenticateToken, getStudentById);
router.post('/', authenticateToken, authorizeRoles('admin'), createStudent);
router.put('/:id', authenticateToken, authorizeRoles('admin'), updateStudent);
router.delete('/:id', authenticateToken, authorizeRoles('admin'), deleteStudent);

export default router;

// Made with Bob
