import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';

/**
 * Socket.IO Authentication Middleware
 * Verifies JWT token and attaches user to socket
 */
export const socketAuth = async (socket, next) => {
  try {
    // Get token from handshake auth or query
    const token = 
      socket.handshake.auth.token || 
      socket.handshake.headers.authorization?.split(' ')[1] ||
      socket.handshake.query.token;

    if (!token) {
      return next(new Error('Authentication error: No token provided'));
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from database
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return next(new Error('Authentication error: User not found'));
    }

    // Attach user to socket
    socket.user = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
    };

    next();
  } catch (error) {
    console.error('Socket authentication error:', error.message);
    
    if (error.name === 'JsonWebTokenError') {
      return next(new Error('Authentication error: Invalid token'));
    }
    
    if (error.name === 'TokenExpiredError') {
      return next(new Error('Authentication error: Token expired'));
    }

    next(new Error('Authentication error'));
  }
};

/**
 * Verify user has access to project
 */
export const verifyProjectAccess = async (socket, projectId, Project) => {
  try {
    const project = await Project.findById(projectId);

    if (!project) {
      return { hasAccess: false, error: 'Project not found' };
    }

    const hasAccess = 
      project.createdBy.toString() === socket.user.id ||
      project.isMember(socket.user.id);

    if (!hasAccess) {
      return { hasAccess: false, error: 'Access denied to this project' };
    }

    return { hasAccess: true, project };
  } catch (error) {
    return { hasAccess: false, error: error.message };
  }
};

/**
 * Verify user has access to task
 */
export const verifyTaskAccess = async (socket, taskId, Task, Project) => {
  try {
    const task = await Task.findById(taskId);

    if (!task) {
      return { hasAccess: false, error: 'Task not found' };
    }

    const project = await Project.findById(task.projectId);

    if (!project) {
      return { hasAccess: false, error: 'Project not found' };
    }

    const hasAccess = 
      project.createdBy.toString() === socket.user.id ||
      project.isMember(socket.user.id);

    if (!hasAccess) {
      return { hasAccess: false, error: 'Access denied to this task' };
    }

    return { hasAccess: true, task, project };
  } catch (error) {
    return { hasAccess: false, error: error.message };
  }
};

export default {
  socketAuth,
  verifyProjectAccess,
  verifyTaskAccess,
};

// Made with Bob
