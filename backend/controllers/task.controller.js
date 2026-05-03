import * as taskService from '../services/task.service.js';

/**
 * @desc    Create a new task
 * @route   POST /api/tasks
 * @access  Private
 */
export const createTask = async (req, res) => {
  try {
    const task = await taskService.createTask(req.body, req.user.id);

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: { task },
    });
  } catch (error) {
    console.error('Create task error:', error);
    const statusCode = error.message === 'Project not found' ? 404 : 
                       error.message.includes('Access denied') ? 403 : 400;
    
    res.status(statusCode).json({
      success: false,
      message: error.message || 'Error creating task',
    });
  }
};

/**
 * @desc    Get tasks with filters
 * @route   GET /api/tasks
 * @access  Private
 */
export const getTasks = async (req, res) => {
  try {
    const filters = {
      projectId: req.query.projectId,
      status: req.query.status,
      priority: req.query.priority,
      assignedTo: req.query.assignedTo,
      overdue: req.query.overdue,
    };

    const tasks = await taskService.getTasks(filters, req.user.id);

    res.status(200).json({
      success: true,
      count: tasks.length,
      data: { tasks },
    });
  } catch (error) {
    console.error('Get tasks error:', error);
    const statusCode = error.message === 'Project not found' ? 404 : 
                       error.message.includes('Access denied') ? 403 : 500;
    
    res.status(statusCode).json({
      success: false,
      message: error.message || 'Error fetching tasks',
    });
  }
};

/**
 * @desc    Get a single task by ID
 * @route   GET /api/tasks/:id
 * @access  Private
 */
export const getTask = async (req, res) => {
  try {
    const task = await taskService.getTaskById(req.params.id, req.user.id);

    res.status(200).json({
      success: true,
      data: { task },
    });
  } catch (error) {
    console.error('Get task error:', error);
    const statusCode = error.message === 'Task not found' ? 404 : 
                       error.message.includes('Access denied') ? 403 : 500;
    
    res.status(statusCode).json({
      success: false,
      message: error.message || 'Error fetching task',
    });
  }
};

/**
 * @desc    Update a task
 * @route   PUT /api/tasks/:id
 * @access  Private
 */
export const updateTask = async (req, res) => {
  try {
    const task = await taskService.updateTask(
      req.params.id,
      req.body,
      req.user.id
    );

    res.status(200).json({
      success: true,
      message: 'Task updated successfully',
      data: { task },
    });
  } catch (error) {
    console.error('Update task error:', error);
    const statusCode = error.message === 'Task not found' ? 404 : 
                       error.message.includes('Access denied') ? 403 : 400;
    
    res.status(statusCode).json({
      success: false,
      message: error.message || 'Error updating task',
    });
  }
};

/**
 * @desc    Delete a task
 * @route   DELETE /api/tasks/:id
 * @access  Private
 */
export const deleteTask = async (req, res) => {
  try {
    const result = await taskService.deleteTask(req.params.id, req.user.id);

    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    console.error('Delete task error:', error);
    const statusCode = error.message === 'Task not found' ? 404 : 
                       error.message.includes('Access denied') || 
                       error.message.includes('Only task') ? 403 : 500;
    
    res.status(statusCode).json({
      success: false,
      message: error.message || 'Error deleting task',
    });
  }
};

/**
 * @desc    Move task (update status)
 * @route   PATCH /api/tasks/:id/move
 * @access  Private
 */
export const moveTask = async (req, res) => {
  try {
    const task = await taskService.moveTask(
      req.params.id,
      req.body.status,
      req.user.id
    );

    res.status(200).json({
      success: true,
      message: 'Task status updated successfully',
      data: { task },
    });
  } catch (error) {
    console.error('Move task error:', error);
    const statusCode = error.message === 'Task not found' ? 404 : 
                       error.message.includes('Access denied') ? 403 : 400;
    
    res.status(statusCode).json({
      success: false,
      message: error.message || 'Error moving task',
    });
  }
};

/**
 * @desc    Assign task to user
 * @route   PATCH /api/tasks/:id/assign
 * @access  Private
 */
export const assignTask = async (req, res) => {
  try {
    const task = await taskService.assignTask(
      req.params.id,
      req.body.assignedTo,
      req.user.id
    );

    res.status(200).json({
      success: true,
      message: 'Task assigned successfully',
      data: { task },
    });
  } catch (error) {
    console.error('Assign task error:', error);
    const statusCode = error.message === 'Task not found' ? 404 : 
                       error.message.includes('Access denied') ? 403 : 400;
    
    res.status(statusCode).json({
      success: false,
      message: error.message || 'Error assigning task',
    });
  }
};

/**
 * @desc    Unassign task
 * @route   PATCH /api/tasks/:id/unassign
 * @access  Private
 */
export const unassignTask = async (req, res) => {
  try {
    const task = await taskService.unassignTask(req.params.id, req.user.id);

    res.status(200).json({
      success: true,
      message: 'Task unassigned successfully',
      data: { task },
    });
  } catch (error) {
    console.error('Unassign task error:', error);
    const statusCode = error.message === 'Task not found' ? 404 : 
                       error.message.includes('Access denied') ? 403 : 500;
    
    res.status(statusCode).json({
      success: false,
      message: error.message || 'Error unassigning task',
    });
  }
};

/**
 * @desc    Add time tracking to task
 * @route   POST /api/tasks/:id/time
 * @access  Private
 */
export const addTimeTracking = async (req, res) => {
  try {
    const task = await taskService.addTimeTracking(
      req.params.id,
      req.body.minutes,
      req.user.id
    );

    res.status(200).json({
      success: true,
      message: 'Time tracking added successfully',
      data: { task },
    });
  } catch (error) {
    console.error('Add time tracking error:', error);
    const statusCode = error.message === 'Task not found' ? 404 : 
                       error.message.includes('Access denied') ? 403 : 400;
    
    res.status(statusCode).json({
      success: false,
      message: error.message || 'Error adding time tracking',
    });
  }
};

/**
 * @desc    Add attachment to task
 * @route   POST /api/tasks/:id/attachments
 * @access  Private
 */
export const addAttachment = async (req, res) => {
  try {
    const task = await taskService.addAttachment(
      req.params.id,
      req.body,
      req.user.id
    );

    res.status(200).json({
      success: true,
      message: 'Attachment added successfully',
      data: { task },
    });
  } catch (error) {
    console.error('Add attachment error:', error);
    const statusCode = error.message === 'Task not found' ? 404 : 
                       error.message.includes('Access denied') ? 403 : 400;
    
    res.status(statusCode).json({
      success: false,
      message: error.message || 'Error adding attachment',
    });
  }
};

/**
 * @desc    Remove attachment from task
 * @route   DELETE /api/tasks/:id/attachments/:attachmentId
 * @access  Private
 */
export const removeAttachment = async (req, res) => {
  try {
    const task = await taskService.removeAttachment(
      req.params.id,
      req.params.attachmentId,
      req.user.id
    );

    res.status(200).json({
      success: true,
      message: 'Attachment removed successfully',
      data: { task },
    });
  } catch (error) {
    console.error('Remove attachment error:', error);
    const statusCode = error.message === 'Task not found' ? 404 : 
                       error.message.includes('Access denied') ? 403 : 500;
    
    res.status(statusCode).json({
      success: false,
      message: error.message || 'Error removing attachment',
    });
  }
};

/**
 * @desc    Get user's assigned tasks
 * @route   GET /api/tasks/my/assigned
 * @access  Private
 */
export const getMyAssignedTasks = async (req, res) => {
  try {
    const filters = {
      status: req.query.status,
      priority: req.query.priority,
    };

    const tasks = await taskService.getUserAssignedTasks(req.user.id, filters);

    res.status(200).json({
      success: true,
      count: tasks.length,
      data: { tasks },
    });
  } catch (error) {
    console.error('Get assigned tasks error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching assigned tasks',
    });
  }
};

/**
 * @desc    Get overdue tasks
 * @route   GET /api/tasks/overdue
 * @access  Private
 */
export const getOverdueTasks = async (req, res) => {
  try {
    const tasks = await taskService.getOverdueTasks(
      req.user.id,
      req.query.projectId
    );

    res.status(200).json({
      success: true,
      count: tasks.length,
      data: { tasks },
    });
  } catch (error) {
    console.error('Get overdue tasks error:', error);
    const statusCode = error.message === 'Project not found' ? 404 : 
                       error.message.includes('Access denied') ? 403 : 500;
    
    res.status(statusCode).json({
      success: false,
      message: error.message || 'Error fetching overdue tasks',
    });
  }
};

export default {
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
};

// Made with Bob
