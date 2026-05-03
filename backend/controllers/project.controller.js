import * as projectService from '../services/project.service.js';

/**
 * @desc    Create a new project
 * @route   POST /api/projects
 * @access  Private
 */
export const createProject = async (req, res) => {
  try {
    const project = await projectService.createProject(req.body, req.user.id);

    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      data: { project },
    });
  } catch (error) {
    console.error('Create project error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Error creating project',
    });
  }
};

/**
 * @desc    Get all projects for the logged-in user
 * @route   GET /api/projects
 * @access  Private
 */
export const getUserProjects = async (req, res) => {
  try {
    const filters = {
      status: req.query.status,
    };

    const projects = await projectService.getUserProjects(req.user.id, filters);

    res.status(200).json({
      success: true,
      count: projects.length,
      data: { projects },
    });
  } catch (error) {
    console.error('Get user projects error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching projects',
    });
  }
};

/**
 * @desc    Get a single project by ID
 * @route   GET /api/projects/:id
 * @access  Private
 */
export const getProject = async (req, res) => {
  try {
    const project = await projectService.getProjectById(
      req.params.id,
      req.user.id
    );

    res.status(200).json({
      success: true,
      data: { project },
    });
  } catch (error) {
    console.error('Get project error:', error);
    const statusCode = error.message === 'Project not found' ? 404 : 
                       error.message === 'Access denied to this project' ? 403 : 500;
    
    res.status(statusCode).json({
      success: false,
      message: error.message || 'Error fetching project',
    });
  }
};

/**
 * @desc    Update a project
 * @route   PUT /api/projects/:id
 * @access  Private
 */
export const updateProject = async (req, res) => {
  try {
    const project = await projectService.updateProject(
      req.params.id,
      req.body,
      req.user.id
    );

    res.status(200).json({
      success: true,
      message: 'Project updated successfully',
      data: { project },
    });
  } catch (error) {
    console.error('Update project error:', error);
    const statusCode = error.message === 'Project not found' ? 404 : 
                       error.message.includes('Only project') ? 403 : 400;
    
    res.status(statusCode).json({
      success: false,
      message: error.message || 'Error updating project',
    });
  }
};

/**
 * @desc    Delete a project
 * @route   DELETE /api/projects/:id
 * @access  Private
 */
export const deleteProject = async (req, res) => {
  try {
    const result = await projectService.deleteProject(
      req.params.id,
      req.user.id
    );

    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    console.error('Delete project error:', error);
    const statusCode = error.message === 'Project not found' ? 404 : 
                       error.message.includes('Only project') ? 403 : 500;
    
    res.status(statusCode).json({
      success: false,
      message: error.message || 'Error deleting project',
    });
  }
};

/**
 * @desc    Add members to a project
 * @route   POST /api/projects/:id/members
 * @access  Private
 */
export const addMembers = async (req, res) => {
  try {
    const project = await projectService.addMembers(
      req.params.id,
      req.body.members,
      req.user.id
    );

    res.status(200).json({
      success: true,
      message: 'Members added successfully',
      data: { project },
    });
  } catch (error) {
    console.error('Add members error:', error);
    const statusCode = error.message === 'Project not found' ? 404 : 
                       error.message.includes('Only project') ? 403 : 400;
    
    res.status(statusCode).json({
      success: false,
      message: error.message || 'Error adding members',
    });
  }
};

/**
 * @desc    Remove a member from a project
 * @route   DELETE /api/projects/:id/members/:userId
 * @access  Private
 */
export const removeMember = async (req, res) => {
  try {
    const project = await projectService.removeMember(
      req.params.id,
      req.params.userId,
      req.user.id
    );

    res.status(200).json({
      success: true,
      message: 'Member removed successfully',
      data: { project },
    });
  } catch (error) {
    console.error('Remove member error:', error);
    const statusCode = error.message === 'Project not found' ? 404 : 
                       error.message.includes('Only project') || 
                       error.message.includes('Cannot remove') ? 403 : 400;
    
    res.status(statusCode).json({
      success: false,
      message: error.message || 'Error removing member',
    });
  }
};

/**
 * @desc    Update member role in a project
 * @route   PUT /api/projects/:id/members/:userId/role
 * @access  Private
 */
export const updateMemberRole = async (req, res) => {
  try {
    const project = await projectService.updateMemberRole(
      req.params.id,
      req.params.userId,
      req.body.role,
      req.user.id
    );

    res.status(200).json({
      success: true,
      message: 'Member role updated successfully',
      data: { project },
    });
  } catch (error) {
    console.error('Update member role error:', error);
    const statusCode = error.message === 'Project not found' ? 404 : 
                       error.message.includes('Only project') || 
                       error.message.includes('Cannot change') ? 403 : 400;
    
    res.status(statusCode).json({
      success: false,
      message: error.message || 'Error updating member role',
    });
  }
};

/**
 * @desc    Get project statistics
 * @route   GET /api/projects/:id/stats
 * @access  Private
 */
export const getProjectStats = async (req, res) => {
  try {
    const stats = await projectService.getProjectStats(
      req.params.id,
      req.user.id
    );

    res.status(200).json({
      success: true,
      data: { stats },
    });
  } catch (error) {
    console.error('Get project stats error:', error);
    const statusCode = error.message === 'Project not found' ? 404 : 
                       error.message === 'Access denied to this project' ? 403 : 500;
    
    res.status(statusCode).json({
      success: false,
      message: error.message || 'Error fetching project statistics',
    });
  }
};

export default {
  createProject,
  getUserProjects,
  getProject,
  updateProject,
  deleteProject,
  addMembers,
  removeMember,
  updateMemberRole,
  getProjectStats,
};

// Made with Bob
