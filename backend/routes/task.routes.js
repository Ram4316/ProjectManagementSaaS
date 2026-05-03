import express from 'express';
import {
  createTask,
  getTasks,
  getTask,
  updateTask,
  deleteTask,
  moveTask,
  assignTask,
  unassignTask,
  addTimeTracking,
  addAttachment,
  removeAttachment,
  getMyAssignedTasks,
  getOverdueTasks,
} from '../controllers/task.controller.js';
import { protect } from '../middlewares/auth.js';
import {
  validate,
  validateQuery,
  createTaskSchema,
  updateTaskSchema,
  moveTaskSchema,
  assignTaskSchema,
  addTimeTrackingSchema,
  addAttachmentSchema,
  taskQuerySchema,
} from '../validators/task.validator.js';

const router = express.Router();

/**
 * All routes require authentication
 */
router.use(protect);

/**
 * @route   GET /api/tasks/my/assigned
 * @desc    Get user's assigned tasks
 * @access  Private
 * @query   status - Filter by task status
 * @query   priority - Filter by task priority
 */
router.get('/my/assigned', getMyAssignedTasks);

/**
 * @route   GET /api/tasks/overdue
 * @desc    Get overdue tasks
 * @access  Private
 * @query   projectId - Filter by project ID
 */
router.get('/overdue', getOverdueTasks);

/**
 * @route   POST /api/tasks
 * @desc    Create a new task
 * @access  Private
 */
router.post('/', validate(createTaskSchema), createTask);

/**
 * @route   GET /api/tasks
 * @desc    Get tasks with filters
 * @access  Private
 * @query   projectId - Filter by project ID
 * @query   status - Filter by task status
 * @query   priority - Filter by task priority
 * @query   assignedTo - Filter by assigned user ID
 * @query   overdue - Filter overdue tasks (boolean)
 */
router.get('/', validateQuery(taskQuerySchema), getTasks);

/**
 * @route   GET /api/tasks/:id
 * @desc    Get a single task by ID
 * @access  Private
 */
router.get('/:id', getTask);

/**
 * @route   PUT /api/tasks/:id
 * @desc    Update a task
 * @access  Private
 */
router.put('/:id', validate(updateTaskSchema), updateTask);

/**
 * @route   DELETE /api/tasks/:id
 * @desc    Delete a task
 * @access  Private (Creator/Project Owner/Admin only)
 */
router.delete('/:id', deleteTask);

/**
 * @route   PATCH /api/tasks/:id/move
 * @desc    Move task (update status)
 * @access  Private
 */
router.patch('/:id/move', validate(moveTaskSchema), moveTask);

/**
 * @route   PATCH /api/tasks/:id/assign
 * @desc    Assign task to user
 * @access  Private
 */
router.patch('/:id/assign', validate(assignTaskSchema), assignTask);

/**
 * @route   PATCH /api/tasks/:id/unassign
 * @desc    Unassign task
 * @access  Private
 */
router.patch('/:id/unassign', unassignTask);

/**
 * @route   POST /api/tasks/:id/time
 * @desc    Add time tracking to task
 * @access  Private
 */
router.post('/:id/time', validate(addTimeTrackingSchema), addTimeTracking);

/**
 * @route   POST /api/tasks/:id/attachments
 * @desc    Add attachment to task
 * @access  Private
 */
router.post('/:id/attachments', validate(addAttachmentSchema), addAttachment);

/**
 * @route   DELETE /api/tasks/:id/attachments/:attachmentId
 * @desc    Remove attachment from task
 * @access  Private
 */
router.delete('/:id/attachments/:attachmentId', removeAttachment);

export default router;

// Made with Bob
