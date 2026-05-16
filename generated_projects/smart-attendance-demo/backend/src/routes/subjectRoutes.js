import express from 'express';
import {
  getAllSubjects,
  getSubjectById,
  createSubject,
  updateSubject,
  deleteSubject,
} from '../controllers/subjectController.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticateToken, getAllSubjects);
router.get('/:id', authenticateToken, getSubjectById);
router.post('/', authenticateToken, authorizeRoles('admin'), createSubject);
router.put('/:id', authenticateToken, authorizeRoles('admin'), updateSubject);
router.delete('/:id', authenticateToken, authorizeRoles('admin'), deleteSubject);

export default router;

// Made with Bob
