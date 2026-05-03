/**
 * Socket Service
 * Helper functions to emit Socket.IO events from controllers
 */

let io = null;

/**
 * Initialize socket service with io instance
 */
export const initSocketService = (ioInstance) => {
  io = ioInstance;
};

/**
 * Get io instance
 */
export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};

/**
 * Emit task updated event
 */
export const emitTaskUpdated = (projectId, taskId, updates, updatedBy) => {
  if (!io) return;

  io.to(`project:${projectId}`).emit('task-updated', {
    taskId,
    projectId,
    updates,
    updatedBy: {
      id: updatedBy.id || updatedBy._id,
      name: updatedBy.name,
      email: updatedBy.email,
    },
    timestamp: new Date(),
  });
};

/**
 * Emit task created event
 */
export const emitTaskCreated = (projectId, task, createdBy) => {
  if (!io) return;

  io.to(`project:${projectId}`).emit('task-created', {
    task,
    projectId,
    createdBy: {
      id: createdBy.id || createdBy._id,
      name: createdBy.name,
      email: createdBy.email,
    },
    timestamp: new Date(),
  });
};

/**
 * Emit task deleted event
 */
export const emitTaskDeleted = (projectId, taskId, deletedBy) => {
  if (!io) return;

  io.to(`project:${projectId}`).emit('task-deleted', {
    taskId,
    projectId,
    deletedBy: {
      id: deletedBy.id || deletedBy._id,
      name: deletedBy.name,
      email: deletedBy.email,
    },
    timestamp: new Date(),
  });
};

/**
 * Emit task status changed event
 */
export const emitTaskStatusChanged = (projectId, taskId, oldStatus, newStatus, changedBy) => {
  if (!io) return;

  io.to(`project:${projectId}`).emit('task-status-changed', {
    taskId,
    projectId,
    oldStatus,
    newStatus,
    changedBy: {
      id: changedBy.id || changedBy._id,
      name: changedBy.name,
      email: changedBy.email,
    },
    timestamp: new Date(),
  });
};

/**
 * Emit new comment event
 */
export const emitNewComment = (projectId, taskId, comment, author) => {
  if (!io) return;

  io.to(`project:${projectId}`).emit('new-comment', {
    taskId,
    projectId,
    comment: {
      ...comment,
      author: {
        id: author.id || author._id,
        name: author.name,
        email: author.email,
      },
    },
    timestamp: new Date(),
  });
};

/**
 * Emit comment updated event
 */
export const emitCommentUpdated = (projectId, taskId, commentId, content, updatedBy) => {
  if (!io) return;

  io.to(`project:${projectId}`).emit('comment-updated', {
    taskId,
    projectId,
    commentId,
    content,
    updatedBy: {
      id: updatedBy.id || updatedBy._id,
      name: updatedBy.name,
      email: updatedBy.email,
    },
    timestamp: new Date(),
  });
};

/**
 * Emit comment deleted event
 */
export const emitCommentDeleted = (projectId, taskId, commentId, deletedBy) => {
  if (!io) return;

  io.to(`project:${projectId}`).emit('comment-deleted', {
    taskId,
    projectId,
    commentId,
    deletedBy: {
      id: deletedBy.id || deletedBy._id,
      name: deletedBy.name,
      email: deletedBy.email,
    },
    timestamp: new Date(),
  });
};

/**
 * Emit project updated event
 */
export const emitProjectUpdated = (projectId, updates, updatedBy) => {
  if (!io) return;

  io.to(`project:${projectId}`).emit('project-updated', {
    projectId,
    updates,
    updatedBy: {
      id: updatedBy.id || updatedBy._id,
      name: updatedBy.name,
      email: updatedBy.email,
    },
    timestamp: new Date(),
  });
};

/**
 * Emit member added event
 */
export const emitMemberAdded = (projectId, member, addedBy) => {
  if (!io) return;

  io.to(`project:${projectId}`).emit('member-added', {
    projectId,
    member,
    addedBy: {
      id: addedBy.id || addedBy._id,
      name: addedBy.name,
      email: addedBy.email,
    },
    timestamp: new Date(),
  });
};

/**
 * Emit member removed event
 */
export const emitMemberRemoved = (projectId, memberId, removedBy) => {
  if (!io) return;

  io.to(`project:${projectId}`).emit('member-removed', {
    projectId,
    memberId,
    removedBy: {
      id: removedBy.id || removedBy._id,
      name: removedBy.name,
      email: removedBy.email,
    },
    timestamp: new Date(),
  });
};

/**
 * Emit notification to specific user
 */
export const emitNotification = (userId, notification) => {
  if (!io) return;

  // Emit to all sockets of the user (they might be connected from multiple devices)
  io.emit('notification', {
    userId,
    notification,
    timestamp: new Date(),
  });
};

/**
 * Emit to specific project room
 */
export const emitToProject = (projectId, event, data) => {
  if (!io) return;

  io.to(`project:${projectId}`).emit(event, {
    ...data,
    timestamp: new Date(),
  });
};

/**
 * Emit to all connected clients
 */
export const emitToAll = (event, data) => {
  if (!io) return;

  io.emit(event, {
    ...data,
    timestamp: new Date(),
  });
};

/**
 * Get active connections count
 */
export const getActiveConnectionsCount = () => {
  if (!io) return 0;
  return io.engine.clientsCount;
};

/**
 * Get rooms
 */
export const getRooms = () => {
  if (!io) return [];
  return Array.from(io.sockets.adapter.rooms.keys());
};

/**
 * Get sockets in room
 */
export const getSocketsInRoom = async (room) => {
  if (!io) return [];
  const sockets = await io.in(room).fetchSockets();
  return sockets.map(s => ({
    id: s.id,
    user: s.user,
  }));
};

export default {
  initSocketService,
  getIO,
  emitTaskUpdated,
  emitTaskCreated,
  emitTaskDeleted,
  emitTaskStatusChanged,
  emitNewComment,
  emitCommentUpdated,
  emitCommentDeleted,
  emitProjectUpdated,
  emitMemberAdded,
  emitMemberRemoved,
  emitNotification,
  emitToProject,
  emitToAll,
  getActiveConnectionsCount,
  getRooms,
  getSocketsInRoom,
};

// Made with Bob
