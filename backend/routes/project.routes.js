import express from 'express';
import {
  createProject,
  getUserProjects,
  getProject,
  updateProject,
  deleteProject,
  addMembers,
  removeMember,
  updateMemberRole,
  getProjectStats,
} from '../controllers/project.controller.js';
import { protect } from '../middlewares/auth.js';
import {
  validate,
  createProjectSchema,
  updateProjectSchema,
  updateMembersSchema,
} from '../validators/project.validator.js';

const router = express.Router();

/**
 * All routes require authentication
 */
router.use(protect);

/**
 * @route   POST /api/projects
 * @desc    Create a new project
 * @access  Private
 */
router.post('/', validate(createProjectSchema), createProject);

/**
 * @route   GET /api/projects
 * @desc    Get all projects for the logged-in user
 * @access  Private
 * @query   status - Filter by project status (active, archived, completed)
 */
router.get('/', getUserProjects);

/**
 * @route   GET /api/projects/:id
 * @desc    Get a single project by ID
 * @access  Private
 */
router.get('/:id', getProject);

/**
 * @route   PUT /api/projects/:id
 * @desc    Update a project
 * @access  Private (Owner/Admin only)
 */
router.put('/:id', validate(updateProjectSchema), updateProject);

/**
 * @route   DELETE /api/projects/:id
 * @desc    Delete a project
 * @access  Private (Owner only)
 */
router.delete('/:id', deleteProject);

/**
 * @route   GET /api/projects/:id/stats
 * @desc    Get project statistics
 * @access  Private
 */
router.get('/:id/stats', getProjectStats);

/**
 * @route   POST /api/projects/:id/members
 * @desc    Add members to a project
 * @access  Private (Owner/Admin only)
 */
router.post('/:id/members', validate(updateMembersSchema), addMembers);

/**
 * @route   DELETE /api/projects/:id/members/:userId
 * @desc    Remove a member from a project
 * @access  Private (Owner/Admin only)
 */
router.delete('/:id/members/:userId', removeMember);

/**
 * @route   PUT /api/projects/:id/members/:userId/role
 * @desc    Update member role in a project
 * @access  Private (Owner only)
 */
router.put('/:id/members/:userId/role', updateMemberRole);

export default router;

// Made with Bob
