import { socketAuth, verifyProjectAccess, verifyTaskAccess } from '../middlewares/socket.auth.js';
import Project from '../models/project.model.js';
import Task from '../models/task.model.js';

/**
 * Collaboration Socket Handler
 * Handles real-time collaboration features for projects and tasks
 */

// Store active users per project
const activeUsers = new Map(); // projectId -> Set of socket IDs
const userSockets = new Map(); // userId -> socket ID
const typingUsers = new Map(); // taskId -> Set of user IDs

/**
 * Initialize collaboration socket handlers
 */
export const initCollaborationSocket = (io) => {
  // Apply authentication middleware
  io.use(socketAuth);

  io.on('connection', (socket) => {
    console.log(`🔗 User connected: ${socket.user.name} (${socket.id})`);

    // Store user socket mapping
    userSockets.set(socket.user.id, socket.id);

    // Send user info back
    socket.emit('connected', {
      socketId: socket.id,
      user: socket.user,
      timestamp: new Date(),
    });

    /**
     * Join Project Room
     * User joins a project room to receive real-time updates
     */
    socket.on('join-project', async (data) => {
      try {
        const { projectId } = data;

        // Verify access
        const { hasAccess, error, project } = await verifyProjectAccess(
          socket,
          projectId,
          Project
        );

        if (!hasAccess) {
          return socket.emit('error', {
            event: 'join-project',
            message: error,
          });
        }

        // Join room
        socket.join(`project:${projectId}`);

        // Track active user
        if (!activeUsers.has(projectId)) {
          activeUsers.set(projectId, new Set());
        }
        activeUsers.get(projectId).add(socket.id);

        // Get active users count
        const activeCount = activeUsers.get(projectId).size;

        // Notify user
        socket.emit('project-joined', {
          projectId,
          project: {
            id: project._id,
            title: project.title,
          },
          activeUsers: activeCount,
          timestamp: new Date(),
        });

        // Notify others in the project
        socket.to(`project:${projectId}`).emit('user-joined-project', {
          projectId,
          user: socket.user,
          activeUsers: activeCount,
          timestamp: new Date(),
        });

        console.log(`✅ ${socket.user.name} joined project: ${projectId}`);
      } catch (error) {
        console.error('Join project error:', error);
        socket.emit('error', {
          event: 'join-project',
          message: 'Error joining project',
        });
      }
    });

    /**
     * Leave Project Room
     */
    socket.on('leave-project', async (data) => {
      try {
        const { projectId } = data;

        socket.leave(`project:${projectId}`);

        // Remove from active users
        if (activeUsers.has(projectId)) {
          activeUsers.get(projectId).delete(socket.id);
          const activeCount = activeUsers.get(projectId).size;

          // Notify others
          socket.to(`project:${projectId}`).emit('user-left-project', {
            projectId,
            user: socket.user,
            activeUsers: activeCount,
            timestamp: new Date(),
          });
        }

        socket.emit('project-left', { projectId });
        console.log(`👋 ${socket.user.name} left project: ${projectId}`);
      } catch (error) {
        console.error('Leave project error:', error);
      }
    });

    /**
     * Task Updated Event
     * Broadcast when a task is updated
     */
    socket.on('task-updated', async (data) => {
      try {
        const { taskId, projectId, updates } = data;

        // Verify access
        const { hasAccess, error } = await verifyTaskAccess(
          socket,
          taskId,
          Task,
          Project
        );

        if (!hasAccess) {
          return socket.emit('error', {
            event: 'task-updated',
            message: error,
          });
        }

        // Broadcast to project room (except sender)
        socket.to(`project:${projectId}`).emit('task-updated', {
          taskId,
          projectId,
          updates,
          updatedBy: socket.user,
          timestamp: new Date(),
        });

        console.log(`📝 Task ${taskId} updated by ${socket.user.name}`);
      } catch (error) {
        console.error('Task updated error:', error);
        socket.emit('error', {
          event: 'task-updated',
          message: 'Error broadcasting task update',
        });
      }
    });

    /**
     * Task Created Event
     */
    socket.on('task-created', async (data) => {
      try {
        const { task, projectId } = data;

        // Verify project access
        const { hasAccess, error } = await verifyProjectAccess(
          socket,
          projectId,
          Project
        );

        if (!hasAccess) {
          return socket.emit('error', {
            event: 'task-created',
            message: error,
          });
        }

        // Broadcast to project room
        io.to(`project:${projectId}`).emit('task-created', {
          task,
          projectId,
          createdBy: socket.user,
          timestamp: new Date(),
        });

        console.log(`✨ New task created in project ${projectId}`);
      } catch (error) {
        console.error('Task created error:', error);
      }
    });

    /**
     * Task Deleted Event
     */
    socket.on('task-deleted', async (data) => {
      try {
        const { taskId, projectId } = data;

        // Broadcast to project room
        socket.to(`project:${projectId}`).emit('task-deleted', {
          taskId,
          projectId,
          deletedBy: socket.user,
          timestamp: new Date(),
        });

        console.log(`🗑️ Task ${taskId} deleted by ${socket.user.name}`);
      } catch (error) {
        console.error('Task deleted error:', error);
      }
    });

    /**
     * Task Status Changed Event
     */
    socket.on('task-status-changed', async (data) => {
      try {
        const { taskId, projectId, oldStatus, newStatus } = data;

        // Broadcast to project room
        socket.to(`project:${projectId}`).emit('task-status-changed', {
          taskId,
          projectId,
          oldStatus,
          newStatus,
          changedBy: socket.user,
          timestamp: new Date(),
        });

        console.log(`🔄 Task ${taskId} status: ${oldStatus} → ${newStatus}`);
      } catch (error) {
        console.error('Task status changed error:', error);
      }
    });

    /**
     * New Comment Event
     */
    socket.on('new-comment', async (data) => {
      try {
        const { taskId, projectId, comment } = data;

        // Verify access
        const { hasAccess, error } = await verifyTaskAccess(
          socket,
          taskId,
          Task,
          Project
        );

        if (!hasAccess) {
          return socket.emit('error', {
            event: 'new-comment',
            message: error,
          });
        }

        // Broadcast to project room
        io.to(`project:${projectId}`).emit('new-comment', {
          taskId,
          projectId,
          comment: {
            ...comment,
            author: socket.user,
            timestamp: new Date(),
          },
        });

        console.log(`💬 New comment on task ${taskId} by ${socket.user.name}`);
      } catch (error) {
        console.error('New comment error:', error);
        socket.emit('error', {
          event: 'new-comment',
          message: 'Error broadcasting comment',
        });
      }
    });

    /**
     * Comment Updated Event
     */
    socket.on('comment-updated', async (data) => {
      try {
        const { taskId, projectId, commentId, content } = data;

        // Broadcast to project room
        socket.to(`project:${projectId}`).emit('comment-updated', {
          taskId,
          projectId,
          commentId,
          content,
          updatedBy: socket.user,
          timestamp: new Date(),
        });
      } catch (error) {
        console.error('Comment updated error:', error);
      }
    });

    /**
     * Comment Deleted Event
     */
    socket.on('comment-deleted', async (data) => {
      try {
        const { taskId, projectId, commentId } = data;

        // Broadcast to project room
        socket.to(`project:${projectId}`).emit('comment-deleted', {
          taskId,
          projectId,
          commentId,
          deletedBy: socket.user,
          timestamp: new Date(),
        });
      } catch (error) {
        console.error('Comment deleted error:', error);
      }
    });

    /**
     * User Typing Indicator
     */
    socket.on('user-typing', async (data) => {
      try {
        const { taskId, projectId } = data;

        // Track typing user
        if (!typingUsers.has(taskId)) {
          typingUsers.set(taskId, new Set());
        }
        typingUsers.get(taskId).add(socket.user.id);

        // Broadcast to project room (except sender)
        socket.to(`project:${projectId}`).emit('user-typing', {
          taskId,
          projectId,
          user: socket.user,
          timestamp: new Date(),
        });
      } catch (error) {
        console.error('User typing error:', error);
      }
    });

    /**
     * User Stopped Typing
     */
    socket.on('user-stopped-typing', async (data) => {
      try {
        const { taskId, projectId } = data;

        // Remove from typing users
        if (typingUsers.has(taskId)) {
          typingUsers.get(taskId).delete(socket.user.id);
        }

        // Broadcast to project room (except sender)
        socket.to(`project:${projectId}`).emit('user-stopped-typing', {
          taskId,
          projectId,
          user: socket.user,
          timestamp: new Date(),
        });
      } catch (error) {
        console.error('User stopped typing error:', error);
      }
    });

    /**
     * User Activity (viewing task)
     */
    socket.on('viewing-task', async (data) => {
      try {
        const { taskId, projectId } = data;

        // Broadcast to project room (except sender)
        socket.to(`project:${projectId}`).emit('user-viewing-task', {
          taskId,
          projectId,
          user: socket.user,
          timestamp: new Date(),
        });
      } catch (error) {
        console.error('Viewing task error:', error);
      }
    });

    /**
     * Project Updated Event
     */
    socket.on('project-updated', async (data) => {
      try {
        const { projectId, updates } = data;

        // Broadcast to project room (except sender)
        socket.to(`project:${projectId}`).emit('project-updated', {
          projectId,
          updates,
          updatedBy: socket.user,
          timestamp: new Date(),
        });

        console.log(`📋 Project ${projectId} updated by ${socket.user.name}`);
      } catch (error) {
        console.error('Project updated error:', error);
      }
    });

    /**
     * Member Added to Project
     */
    socket.on('member-added', async (data) => {
      try {
        const { projectId, member } = data;

        // Broadcast to project room
        io.to(`project:${projectId}`).emit('member-added', {
          projectId,
          member,
          addedBy: socket.user,
          timestamp: new Date(),
        });

        // Notify the new member if they're online
        const memberSocketId = userSockets.get(member.userId);
        if (memberSocketId) {
          io.to(memberSocketId).emit('added-to-project', {
            projectId,
            addedBy: socket.user,
            timestamp: new Date(),
          });
        }
      } catch (error) {
        console.error('Member added error:', error);
      }
    });

    /**
     * Get Active Users in Project
     */
    socket.on('get-active-users', async (data) => {
      try {
        const { projectId } = data;

        const activeCount = activeUsers.get(projectId)?.size || 0;

        socket.emit('active-users', {
          projectId,
          count: activeCount,
          timestamp: new Date(),
        });
      } catch (error) {
        console.error('Get active users error:', error);
      }
    });

    /**
     * Handle Disconnection
     */
    socket.on('disconnect', () => {
      console.log(`🔌 User disconnected: ${socket.user.name} (${socket.id})`);

      // Remove from all active users
      activeUsers.forEach((users, projectId) => {
        if (users.has(socket.id)) {
          users.delete(socket.id);
          const activeCount = users.size;

          // Notify project members
          io.to(`project:${projectId}`).emit('user-left-project', {
            projectId,
            user: socket.user,
            activeUsers: activeCount,
            timestamp: new Date(),
          });
        }
      });

      // Remove from typing users
      typingUsers.forEach((users, taskId) => {
        users.delete(socket.user.id);
      });

      // Remove user socket mapping
      userSockets.delete(socket.user.id);
    });

    /**
     * Error Handling
     */
    socket.on('error', (error) => {
      console.error(`Socket error for ${socket.user.name}:`, error);
    });
  });

  return io;
};

/**
 * Emit event to specific project
 */
export const emitToProject = (io, projectId, event, data) => {
  io.to(`project:${projectId}`).emit(event, data);
};

/**
 * Emit event to specific user
 */
export const emitToUser = (io, userId, event, data) => {
  const socketId = userSockets.get(userId);
  if (socketId) {
    io.to(socketId).emit(event, data);
  }
};

/**
 * Get active users in project
 */
export const getActiveUsers = (projectId) => {
  return activeUsers.get(projectId)?.size || 0;
};

/**
 * Get typing users for task
 */
export const getTypingUsers = (taskId) => {
  return Array.from(typingUsers.get(taskId) || []);
};

export default {
  initCollaborationSocket,
  emitToProject,
  emitToUser,
  getActiveUsers,
  getTypingUsers,
};

// Made with Bob
