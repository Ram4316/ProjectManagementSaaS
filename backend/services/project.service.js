import Project from '../models/project.model.js';
import User from '../models/user.model.js';
import mongoose from 'mongoose';

/**
 * Project Service
 * Handles all business logic for project operations
 */

/**
 * Create a new project
 */
export const createProject = async (projectData, userId) => {
  try {
    // Add creator as owner in members array
    const members = projectData.members || [];
    
    // Check if creator is already in members
    const creatorExists = members.some(
      (member) => member.user.toString() === userId.toString()
    );

    if (!creatorExists) {
      members.unshift({
        user: userId,
        role: 'owner',
      });
    }

    // Verify all member users exist
    const memberUserIds = members.map((m) => m.user);
    const users = await User.find({ _id: { $in: memberUserIds } });

    if (users.length !== memberUserIds.length) {
      throw new Error('One or more member users do not exist');
    }

    const project = await Project.create({
      ...projectData,
      createdBy: userId,
      members,
    });

    // Populate creator and members
    await project.populate('createdBy', 'name email avatar');
    await project.populate('members.user', 'name email avatar');

    return project;
  } catch (error) {
    throw error;
  }
};

/**
 * Get all projects for a user
 */
export const getUserProjects = async (userId, filters = {}) => {
  try {
    const query = {
      $or: [
        { createdBy: userId },
        { 'members.user': userId },
      ],
    };

    // Apply filters
    if (filters.status) {
      query.status = filters.status;
    }

    const projects = await Project.find(query)
      .populate('createdBy', 'name email avatar')
      .populate('members.user', 'name email avatar')
      .sort({ createdAt: -1 });

    return projects;
  } catch (error) {
    throw error;
  }
};

/**
 * Get a single project by ID
 */
export const getProjectById = async (projectId, userId) => {
  try {
    const project = await Project.findById(projectId)
      .populate('createdBy', 'name email avatar')
      .populate('members.user', 'name email avatar');

    if (!project) {
      throw new Error('Project not found');
    }

    // Check if user has access to this project
    const hasAccess = 
      project.createdBy._id.toString() === userId.toString() ||
      project.isMember(userId);

    if (!hasAccess) {
      throw new Error('Access denied to this project');
    }

    return project;
  } catch (error) {
    throw error;
  }
};

/**
 * Update a project
 */
export const updateProject = async (projectId, updateData, userId) => {
  try {
    const project = await Project.findById(projectId);

    if (!project) {
      throw new Error('Project not found');
    }

    // Check if user is creator or admin
    const userRole = project.getMemberRole(userId);
    const isCreator = project.createdBy.toString() === userId.toString();

    if (!isCreator && userRole !== 'admin' && userRole !== 'owner') {
      throw new Error('Only project owner or admin can update the project');
    }

    // Update fields
    Object.keys(updateData).forEach((key) => {
      project[key] = updateData[key];
    });

    await project.save();

    // Populate and return
    await project.populate('createdBy', 'name email avatar');
    await project.populate('members.user', 'name email avatar');

    return project;
  } catch (error) {
    throw error;
  }
};

/**
 * Delete a project
 */
export const deleteProject = async (projectId, userId) => {
  try {
    const project = await Project.findById(projectId);

    if (!project) {
      throw new Error('Project not found');
    }

    // Only creator can delete
    if (project.createdBy.toString() !== userId.toString()) {
      throw new Error('Only project creator can delete the project');
    }

    await Project.findByIdAndDelete(projectId);

    return { message: 'Project deleted successfully' };
  } catch (error) {
    throw error;
  }
};

/**
 * Add members to a project
 */
export const addMembers = async (projectId, members, userId) => {
  try {
    const project = await Project.findById(projectId);

    if (!project) {
      throw new Error('Project not found');
    }

    // Check if user is creator or admin
    const userRole = project.getMemberRole(userId);
    const isCreator = project.createdBy.toString() === userId.toString();

    if (!isCreator && userRole !== 'admin' && userRole !== 'owner') {
      throw new Error('Only project owner or admin can add members');
    }

    // Verify all users exist
    const userIds = members.map((m) => m.user);
    const users = await User.find({ _id: { $in: userIds } });

    if (users.length !== userIds.length) {
      throw new Error('One or more users do not exist');
    }

    // Add new members (avoid duplicates)
    members.forEach((newMember) => {
      const exists = project.members.some(
        (m) => m.user.toString() === newMember.user.toString()
      );

      if (!exists) {
        project.members.push(newMember);
      }
    });

    await project.save();
    await project.populate('members.user', 'name email avatar');

    return project;
  } catch (error) {
    throw error;
  }
};

/**
 * Remove a member from a project
 */
export const removeMember = async (projectId, memberUserId, userId) => {
  try {
    const project = await Project.findById(projectId);

    if (!project) {
      throw new Error('Project not found');
    }

    // Check if user is creator or admin
    const userRole = project.getMemberRole(userId);
    const isCreator = project.createdBy.toString() === userId.toString();

    if (!isCreator && userRole !== 'admin' && userRole !== 'owner') {
      throw new Error('Only project owner or admin can remove members');
    }

    // Cannot remove the creator
    if (project.createdBy.toString() === memberUserId.toString()) {
      throw new Error('Cannot remove project creator');
    }

    // Remove member
    project.members = project.members.filter(
      (m) => m.user.toString() !== memberUserId.toString()
    );

    await project.save();
    await project.populate('members.user', 'name email avatar');

    return project;
  } catch (error) {
    throw error;
  }
};

/**
 * Update member role
 */
export const updateMemberRole = async (projectId, memberUserId, newRole, userId) => {
  try {
    const project = await Project.findById(projectId);

    if (!project) {
      throw new Error('Project not found');
    }

    // Only creator can update roles
    if (project.createdBy.toString() !== userId.toString()) {
      throw new Error('Only project creator can update member roles');
    }

    // Cannot change creator's role
    if (project.createdBy.toString() === memberUserId.toString()) {
      throw new Error('Cannot change creator role');
    }

    // Find and update member role
    const member = project.members.find(
      (m) => m.user.toString() === memberUserId.toString()
    );

    if (!member) {
      throw new Error('Member not found in project');
    }

    member.role = newRole;
    await project.save();
    await project.populate('members.user', 'name email avatar');

    return project;
  } catch (error) {
    throw error;
  }
};

/**
 * Get project statistics
 */
export const getProjectStats = async (projectId, userId) => {
  try {
    const project = await Project.findById(projectId);

    if (!project) {
      throw new Error('Project not found');
    }

    // Check access
    const hasAccess = 
      project.createdBy.toString() === userId.toString() ||
      project.isMember(userId);

    if (!hasAccess) {
      throw new Error('Access denied to this project');
    }

    // Import Task model here to avoid circular dependency
    const Task = (await import('../models/task.model.js')).default;

    const [totalTasks, todoTasks, inProgressTasks, doneTasks, overdueTasks] = 
      await Promise.all([
        Task.countDocuments({ projectId }),
        Task.countDocuments({ projectId, status: 'todo' }),
        Task.countDocuments({ projectId, status: 'in-progress' }),
        Task.countDocuments({ projectId, status: 'done' }),
        Task.countDocuments({
          projectId,
          status: { $ne: 'done' },
          dueDate: { $lt: new Date() },
        }),
      ]);

    return {
      totalTasks,
      todoTasks,
      inProgressTasks,
      doneTasks,
      overdueTasks,
      completionRate: totalTasks > 0 ? ((doneTasks / totalTasks) * 100).toFixed(2) : 0,
      memberCount: project.members.length,
    };
  } catch (error) {
    throw error;
  }
};

export default {
  createProject,
  getUserProjects,
  getProjectById,
  updateProject,
  deleteProject,
  addMembers,
  removeMember,
  updateMemberRole,
  getProjectStats,
};

// Made with Bob
