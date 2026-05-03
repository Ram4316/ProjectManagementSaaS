import express from 'express';
import {
  uploadTaskAttachment,
  uploadMultipleTaskAttachments,
  uploadAvatar,
  deleteFile,
  getUploadStats,
  cleanOldFiles,
} from '../controllers/upload.controller.js';
import { protect, authorize } from '../middlewares/auth.js';
import { upload } from '../utils/upload.js';

const router = express.Router();

/**
 * All routes require authentication
 */
router.use(protect);

/**
 * @route   POST /api/upload/task/:taskId
 * @desc    Upload file and attach to task
 * @access  Private
 */
router.post('/task/:taskId', upload.single('file'), uploadTaskAttachment);

/**
 * @route   POST /api/upload/task/:taskId/multiple
 * @desc    Upload multiple files and attach to task
 * @access  Private
 */
router.post(
  '/task/:taskId/multiple',
  upload.array('files', 10), // Max 10 files
  uploadMultipleTaskAttachments
);

/**
 * @route   POST /api/upload/avatar
 * @desc    Upload avatar image
 * @access  Private
 */
router.post('/avatar', upload.single('avatar'), uploadAvatar);

/**
 * @route   DELETE /api/upload/:filename
 * @desc    Delete file
 * @access  Private
 */
router.delete('/:filename', deleteFile);

/**
 * @route   GET /api/upload/stats
 * @desc    Get upload statistics
 * @access  Private (Admin only)
 */
router.get('/stats', authorize('admin'), getUploadStats);

/**
 * @route   POST /api/upload/clean
 * @desc    Clean old files
 * @access  Private (Admin only)
 */
router.post('/clean', authorize('admin'), cleanOldFiles);

export default router;

// Made with Bob
