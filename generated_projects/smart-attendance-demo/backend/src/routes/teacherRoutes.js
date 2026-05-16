import express from 'express';
import {
  getAllTeachers,
  getTeacherById,
  createTeacher,
  updateTeacher,
  deleteTeacher,
} from '../controllers/teacherController.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticateToken, getAllTeachers);
router.get('/:id', authenticateToken, getTeacherById);
router.post('/', authenticateToken, authorizeRoles('admin'), createTeacher);
router.put('/:id', authenticateToken, authorizeRoles('admin'), updateTeacher);
router.delete('/:id', authenticateToken, authorizeRoles('admin'), deleteTeacher);

export default router;

// Made with Bob
