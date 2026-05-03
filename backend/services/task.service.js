import Task from '../models/task.model.js';
import Project from '../models/project.model.js';
import User from '../models/user.model.js';

/**
 * Task Service
 * Handles all business logic for task operations
 */

/**
 * Create a new task
 */
export const createTask = async (taskData, userId) => {
  try {
    // Verify project exists and user has access
    const project = await Project.findById(taskData.projectId);

    if (!project) {
      throw new Error('Project not found');
    }

    const hasAccess = 
      project.createdBy.toString() === userId.toString() ||
      project.isMember(userId);

    if (!hasAccess) {
      throw new Error('Access denied to this project');
    }

    // If assignedTo is provided, verify user exists and is a project member
    if (taskData.assignedTo) {
      const assignedUser = await User.findById(taskData.assignedTo);
      if (!assignedUser) {
        throw new Error('Assigned user not found');
      }

      if (!project.isMember(taskData.assignedTo)) {
        throw new Error('Assigned user is not a member of this project');
      }
    }

    const task = await Task.create({
      ...taskData,
      createdBy: userId,
    });

    // Populate references
    await task.populate('assignedTo', 'name email avatar');
    await task.populate('createdBy', 'name email avatar');
    await task.populate('projectId', 'title');

    return task;
  } catch (error) {
    throw error;
  }
};

/**
 * Get tasks with filters
 */
export const getTasks = async (filters, userId) => {
  try {
    const query = {};

    // If projectId is provided, verify access
    if (filters.projectId) {
      const project = await Project.findById(filters.projectId);
      
      if (!project) {
        throw new Error('Project not found');
      }

      const hasAccess = 
        project.createdBy.toString() === userId.toString() ||
        project.isMember(userId);

      if (!hasAccess) {
        throw new Error('Access denied to this project');
      }

      query.projectId = filters.projectId;
    } else {
      // Get all projects user has access to
      const userProjects = await Project.find({
        $or: [
          { createdBy: userId },
          { 'members.user': userId },
        ],
      }).select('_id');

      query.projectId = { $in: userProjects.map((p) => p._id) };
    }

    // Apply other filters
    if (filters.status) {
      query.status = filters.status;
    }

    if (filters.priority) {
      query.priority = filters.priority;
    }

    if (filters.assignedTo) {
      query.assignedTo = filters.assignedTo;
    }

    if (filters.overdue === true || filters.overdue === 'true') {
      query.status = { $ne: 'done' };
      query.dueDate = { $lt: new Date() };
    }

    const tasks = await Task.find(query)
      .populate('assignedTo', 'name email avatar')
      .populate('createdBy', 'name email avatar')
      .populate('projectId', 'title')
      .sort({ createdAt: -1 });

    return tasks;
  } catch (error) {
    throw error;
  }
};

/**
 * Get a single task by ID
 */
export const getTaskById = async (taskId, userId) => {
  try {
    const task = await Task.findById(taskId)
      .populate('assignedTo', 'name email avatar')
      .populate('createdBy', 'name email avatar')
      .populate('projectId', 'title')
      .populate('attachments.uploadedBy', 'name email avatar');

    if (!task) {
      throw new Error('Task not found');
    }

    // Verify user has access to the project
    const project = await Project.findById(task.projectId);
    
    const hasAccess = 
      project.createdBy.toString() === userId.toString() ||
      project.isMember(userId);

    if (!hasAccess) {
      throw new Error('Access denied to this task');
    }

    return task;
  } catch (error) {
    throw error;
  }
};

/**
 * Update a task
 */
export const updateTask = async (taskId, updateData, userId) => {
  try {
    const task = await Task.findById(taskId);

    if (!task) {
      throw new Error('Task not found');
    }

    // Verify user has access to the project
    const project = await Project.findById(task.projectId);
    
    const hasAccess = 
      project.createdBy.toString() === userId.toString() ||
      project.isMember(userId);

    if (!hasAccess) {
      throw new Error('Access denied to this task');
    }

    // If assignedTo is being updated, verify user exists and is a project member
    if (updateData.assignedTo) {
      const assignedUser = await User.findById(updateData.assignedTo);
      if (!assignedUser) {
        throw new Error('Assigned user not found');
      }

      if (!project.isMember(updateData.assignedTo)) {
        throw new Error('Assigned user is not a member of this project');
      }
    }

    // Update fields
    Object.keys(updateData).forEach((key) => {
      task[key] = updateData[key];
    });

    await task.save();

    // Populate and return
    await task.populate('assignedTo', 'name email avatar');
    await task.populate('createdBy', 'name email avatar');
    await task.populate('projectId', 'title');

    return task;
  } catch (error) {
    throw error;
  }
};

/**
 * Delete a task
 */
export const deleteTask = async (taskId, userId) => {
  try {
    const task = await Task.findById(taskId);

    if (!task) {
      throw new Error('Task not found');
    }

    // Verify user has access to the project
    const project = await Project.findById(task.projectId);
    
    const hasAccess = 
      project.createdBy.toString() === userId.toString() ||
      project.isMember(userId);

    if (!hasAccess) {
      throw new Error('Access denied to this task');
    }

    // Only creator or project owner/admin can delete
    const userRole = project.getMemberRole(userId);
    const isTaskCreator = task.createdBy.toString() === userId.toString();
    const isProjectOwner = project.createdBy.toString() === userId.toString();

    if (!isTaskCreator && !isProjectOwner && userRole !== 'admin' && userRole !== 'owner') {
      throw new Error('Only task creator or project owner/admin can delete the task');
    }

    await Task.findByIdAndDelete(taskId);

    return { message: 'Task deleted successfully' };
  } catch (error) {
    throw error;
  }
};

/**
 * Move task (update status)
 */
export const moveTask = async (taskId, newStatus, userId) => {
  try {
    const task = await Task.findById(taskId);

    if (!task) {
      throw new Error('Task not found');
    }

    // Verify user has access to the project
    const project = await Project.findById(task.projectId);
    
    const hasAccess = 
      project.createdBy.toString() === userId.toString() ||
      project.isMember(userId);

    if (!hasAccess) {
      throw new Error('Access denied to this task');
    }

    task.status = newStatus;
    await task.save();

    await task.populate('assignedTo', 'name email avatar');
    await task.populate('createdBy', 'name email avatar');
    await task.populate('projectId', 'title');

    return task;
  } catch (error) {
    throw error;
  }
};

/**
 * Assign task to user
 */
export const assignTask = async (taskId, assignedToUserId, userId) => {
  try {
    const task = await Task.findById(taskId);

    if (!task) {
      throw new Error('Task not found');
    }

    // Verify user has access to the project
    const project = await Project.findById(task.projectId);
    
    const hasAccess = 
      project.createdBy.toString() === userId.toString() ||
      project.isMember(userId);

    if (!hasAccess) {
      throw new Error('Access denied to this task');
    }

    // Verify assigned user exists and is a project member
    const assignedUser = await User.findById(assignedToUserId);
    if (!assignedUser) {
      throw new Error('Assigned user not found');
    }

    if (!project.isMember(assignedToUserId)) {
      throw new Error('Assigned user is not a member of this project');
    }

    task.assignedTo = assignedToUserId;
    await task.save();

    await task.populate('assignedTo', 'name email avatar');
    await task.populate('createdBy', 'name email avatar');
    await task.populate('projectId', 'title');

    return task;
  } catch (error) {
    throw error;
  }
};

/**
 * Unassign task
 */
export const unassignTask = async (taskId, userId) => {
  try {
    const task = await Task.findById(taskId);

    if (!task) {
      throw new Error('Task not found');
    }

    // Verify user has access to the project
    const project = await Project.findById(task.projectId);
    
    const hasAccess = 
      project.createdBy.toString() === userId.toString() ||
      project.isMember(userId);

    if (!hasAccess) {
      throw new Error('Access denied to this task');
    }

    task.assignedTo = null;
    await task.save();

    await task.populate('createdBy', 'name email avatar');
    await task.populate('projectId', 'title');

    return task;
  } catch (error) {
    throw error;
  }
};

/**
 * Add time tracking to task
 */
export const addTimeTracking = async (taskId, minutes, userId) => {
  try {
    const task = await Task.findById(taskId);

    if (!task) {
      throw new Error('Task not found');
    }

    // Verify user has access to the project
    const project = await Project.findById(task.projectId);
    
    const hasAccess = 
      project.createdBy.toString() === userId.toString() ||
      project.isMember(userId);

    if (!hasAccess) {
      throw new Error('Access denied to this task');
    }

    await task.addTimeTracked(minutes);

    await task.populate('assignedTo', 'name email avatar');
    await task.populate('createdBy', 'name email avatar');
    await task.populate('projectId', 'title');

    return task;
  } catch (error) {
    throw error;
  }
};

/**
 * Add attachment to task
 */
export const addAttachment = async (taskId, attachmentData, userId) => {
  try {
    const task = await Task.findById(taskId);

    if (!task) {
      throw new Error('Task not found');
    }

    // Verify user has access to the project
    const project = await Project.findById(task.projectId);
    
    const hasAccess = 
      project.createdBy.toString() === userId.toString() ||
      project.isMember(userId);

    if (!hasAccess) {
      throw new Error('Access denied to this task');
    }

    await task.addAttachment({
      ...attachmentData,
      uploadedBy: userId,
    });

    await task.populate('assignedTo', 'name email avatar');
    await task.populate('createdBy', 'name email avatar');
    await task.populate('projectId', 'title');
    await task.populate('attachments.uploadedBy', 'name email avatar');

    return task;
  } catch (error) {
    throw error;
  }
};

/**
 * Remove attachment from task
 */
export const removeAttachment = async (taskId, attachmentId, userId) => {
  try {
    const task = await Task.findById(taskId);

    if (!task) {
      throw new Error('Task not found');
    }

    // Verify user has access to the project
    const project = await Project.findById(task.projectId);
    
    const hasAccess = 
      project.createdBy.toString() === userId.toString() ||
      project.isMember(userId);

    if (!hasAccess) {
      throw new Error('Access denied to this task');
    }

    await task.removeAttachment(attachmentId);

    await task.populate('assignedTo', 'name email avatar');
    await task.populate('createdBy', 'name email avatar');
    await task.populate('projectId', 'title');
    await task.populate('attachments.uploadedBy', 'name email avatar');

    return task;
  } catch (error) {
    throw error;
  }
};

/**
 * Get user's assigned tasks
 */
export const getUserAssignedTasks = async (userId, filters = {}) => {
  try {
    const query = { assignedTo: userId };

    if (filters.status) {
      query.status = filters.status;
    }

    if (filters.priority) {
      query.priority = filters.priority;
    }

    const tasks = await Task.find(query)
      .populate('createdBy', 'name email avatar')
      .populate('projectId', 'title')
      .sort({ dueDate: 1, priority: -1 });

    return tasks;
  } catch (error) {
    throw error;
  }
};

/**
 * Get overdue tasks
 */
export const getOverdueTasks = async (userId, projectId = null) => {
  try {
    const query = {
      status: { $ne: 'done' },
      dueDate: { $lt: new Date() },
    };

    if (projectId) {
      // Verify access to project
      const project = await Project.findById(projectId);
      
      if (!project) {
        throw new Error('Project not found');
      }

      const hasAccess = 
        project.createdBy.toString() === userId.toString() ||
        project.isMember(userId);

      if (!hasAccess) {
        throw new Error('Access denied to this project');
      }

      query.projectId = projectId;
    } else {
      // Get all projects user has access to
      const userProjects = await Project.find({
        $or: [
          { createdBy: userId },
          { 'members.user': userId },
        ],
      }).select('_id');

      query.projectId = { $in: userProjects.map((p) => p._id) };
    }

    const tasks = await Task.find(query)
      .populate('assignedTo', 'name email avatar')
      .populate('createdBy', 'name email avatar')
      .populate('projectId', 'title')
      .sort({ dueDate: 1 });

    return tasks;
  } catch (error) {
    throw error;
  }
};

export default {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
  moveTask,
  assignTask,
  unassignTask,
  addTimeTracking,
  addAttachment,
  removeAttachment,
  getUserAssignedTasks,
  getOverdueTasks,
};

// Made with Bob
