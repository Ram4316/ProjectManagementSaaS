/**
 * Chat Socket Handler
 * Example Socket.IO event handlers for real-time chat
 */

/**
 * Initialize chat socket handlers
 */
export const initChatSocket = (io) => {
  // Create a namespace for chat
  const chatNamespace = io.of('/chat');

  chatNamespace.on('connection', (socket) => {
    console.log(`💬 Chat socket connected: ${socket.id}`);

    // Join a room
    socket.on('join-room', (roomId) => {
      socket.join(roomId);
      console.log(`User ${socket.id} joined room: ${roomId}`);
      
      // Notify others in the room
      socket.to(roomId).emit('user-joined', {
        userId: socket.id,
        timestamp: new Date()
      });
    });

    // Leave a room
    socket.on('leave-room', (roomId) => {
      socket.leave(roomId);
      console.log(`User ${socket.id} left room: ${roomId}`);
      
      // Notify others in the room
      socket.to(roomId).emit('user-left', {
        userId: socket.id,
        timestamp: new Date()
      });
    });

    // Send message to room
    socket.on('send-message', (data) => {
      const { roomId, message, username } = data;
      
      // Broadcast to all users in the room
      chatNamespace.to(roomId).emit('receive-message', {
        userId: socket.id,
        username,
        message,
        timestamp: new Date()
      });
    });

    // Typing indicator
    socket.on('typing', (data) => {
      const { roomId, username } = data;
      socket.to(roomId).emit('user-typing', {
        userId: socket.id,
        username
      });
    });

    // Stop typing indicator
    socket.on('stop-typing', (data) => {
      const { roomId } = data;
      socket.to(roomId).emit('user-stop-typing', {
        userId: socket.id
      });
    });

    // Private message
    socket.on('private-message', (data) => {
      const { targetSocketId, message } = data;
      
      chatNamespace.to(targetSocketId).emit('receive-private-message', {
        from: socket.id,
        message,
        timestamp: new Date()
      });
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`💬 Chat socket disconnected: ${socket.id}`);
    });

    // Error handling
    socket.on('error', (error) => {
      console.error(`Socket error for ${socket.id}:`, error);
    });
  });

  return chatNamespace;
};

/**
 * Emit event to specific room
 */
export const emitToRoom = (io, roomId, event, data) => {
  io.of('/chat').to(roomId).emit(event, data);
};

/**
 * Emit event to specific user
 */
export const emitToUser = (io, socketId, event, data) => {
  io.of('/chat').to(socketId).emit(event, data);
};

/**
 * Get room information
 */
export const getRoomInfo = async (io, roomId) => {
  const sockets = await io.of('/chat').in(roomId).fetchSockets();
  
  return {
    roomId,
    userCount: sockets.length,
    users: sockets.map(s => s.id)
  };
};

// Made with Bob
