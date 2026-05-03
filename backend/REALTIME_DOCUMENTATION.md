# Real-Time Collaboration System Documentation

Complete documentation for Socket.IO-based real-time collaboration features.

## Overview

The real-time system provides:
- Live task updates across all connected users
- Real-time comments with typing indicators
- User presence tracking (who's online)
- Project-based room management
- Instant notifications for changes
- Scalable event handling

## Architecture

```
Client → Socket.IO → Authentication → Room Management → Event Handlers → Broadcast
                                                              ↓
                                                         Database
```

## Connection & Authentication

### Client Connection

```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000', {
  auth: {
    token: accessToken  // JWT access token
  }
});

// Or pass token in query
const socket = io('http://localhost:5000', {
  query: {
    token: accessToken
  }
});
```

### Authentication

All Socket.IO connections require JWT authentication. The token is verified on connection, and user information is attached to the socket.

**Success:**
```javascript
socket.on('connected', (data) => {
  console.log('Connected:', data);
  // {
  //   socketId: 'abc123',
  //   user: { id, name, email, role, avatar },
  //   timestamp: '2026-05-03T10:00:00.000Z'
  // }
});
```

**Error:**
```javascript
socket.on('connect_error', (error) => {
  console.error('Connection error:', error.message);
  // 'Authentication error: No token provided'
  // 'Authentication error: Invalid token'
  // 'Authentication error: Token expired'
});
```

---

## Room Management

### Join Project Room

Join a project room to receive real-time updates for that project.

**Emit:**
```javascript
socket.emit('join-project', {
  projectId: '507f1f77bcf86cd799439013'
});
```

**Response:**
```javascript
socket.on('project-joined', (data) => {
  console.log('Joined project:', data);
  // {
  //   projectId: '507f1f77bcf86cd799439013',
  //   project: { id, title },
  //   activeUsers: 5,
  //   timestamp: '2026-05-03T10:00:00.000Z'
  // }
});
```

**Broadcast to Others:**
```javascript
socket.on('user-joined-project', (data) => {
  console.log('User joined:', data);
  // {
  //   projectId: '507f1f77bcf86cd799439013',
  //   user: { id, name, email, avatar },
  //   activeUsers: 5,
  //   timestamp: '2026-05-03T10:00:00.000Z'
  // }
});
```

### Leave Project Room

**Emit:**
```javascript
socket.emit('leave-project', {
  projectId: '507f1f77bcf86cd799439013'
});
```

**Response:**
```javascript
socket.on('project-left', (data) => {
  console.log('Left project:', data);
  // { projectId: '507f1f77bcf86cd799439013' }
});
```

**Broadcast to Others:**
```javascript
socket.on('user-left-project', (data) => {
  console.log('User left:', data);
  // {
  //   projectId: '507f1f77bcf86cd799439013',
  //   user: { id, name, email, avatar },
  //   activeUsers: 4,
  //   timestamp: '2026-05-03T10:00:00.000Z'
  // }
});
```

---

## Task Events

### Task Updated

Broadcast when a task is updated.

**Emit:**
```javascript
socket.emit('task-updated', {
  taskId: '507f1f77bcf86cd799439020',
  projectId: '507f1f77bcf86cd799439013',
  updates: {
    title: 'Updated task title',
    status: 'in-progress',
    priority: 'high'
  }
});
```

**Receive:**
```javascript
socket.on('task-updated', (data) => {
  console.log('Task updated:', data);
  // {
  //   taskId: '507f1f77bcf86cd799439020',
  //   projectId: '507f1f77bcf86cd799439013',
  //   updates: { title, status, priority },
  //   updatedBy: { id, name, email },
  //   timestamp: '2026-05-03T10:00:00.000Z'
  // }
  
  // Update UI with new task data
  updateTaskInUI(data.taskId, data.updates);
});
```

### Task Created

**Emit:**
```javascript
socket.emit('task-created', {
  task: {
    _id: '507f1f77bcf86cd799439020',
    title: 'New task',
    description: 'Task description',
    status: 'todo',
    priority: 'medium'
  },
  projectId: '507f1f77bcf86cd799439013'
});
```

**Receive:**
```javascript
socket.on('task-created', (data) => {
  console.log('New task created:', data);
  // {
  //   task: { _id, title, description, ... },
  //   projectId: '507f1f77bcf86cd799439013',
  //   createdBy: { id, name, email },
  //   timestamp: '2026-05-03T10:00:00.000Z'
  // }
  
  // Add task to UI
  addTaskToUI(data.task);
});
```

### Task Deleted

**Emit:**
```javascript
socket.emit('task-deleted', {
  taskId: '507f1f77bcf86cd799439020',
  projectId: '507f1f77bcf86cd799439013'
});
```

**Receive:**
```javascript
socket.on('task-deleted', (data) => {
  console.log('Task deleted:', data);
  // {
  //   taskId: '507f1f77bcf86cd799439020',
  //   projectId: '507f1f77bcf86cd799439013',
  //   deletedBy: { id, name, email },
  //   timestamp: '2026-05-03T10:00:00.000Z'
  // }
  
  // Remove task from UI
  removeTaskFromUI(data.taskId);
});
```

### Task Status Changed

**Emit:**
```javascript
socket.emit('task-status-changed', {
  taskId: '507f1f77bcf86cd799439020',
  projectId: '507f1f77bcf86cd799439013',
  oldStatus: 'todo',
  newStatus: 'in-progress'
});
```

**Receive:**
```javascript
socket.on('task-status-changed', (data) => {
  console.log('Task status changed:', data);
  // {
  //   taskId: '507f1f77bcf86cd799439020',
  //   projectId: '507f1f77bcf86cd799439013',
  //   oldStatus: 'todo',
  //   newStatus: 'in-progress',
  //   changedBy: { id, name, email },
  //   timestamp: '2026-05-03T10:00:00.000Z'
  // }
  
  // Update task status in UI
  updateTaskStatus(data.taskId, data.newStatus);
});
```

---

## Comment Events

### New Comment

**Emit:**
```javascript
socket.emit('new-comment', {
  taskId: '507f1f77bcf86cd799439020',
  projectId: '507f1f77bcf86cd799439013',
  comment: {
    id: '507f1f77bcf86cd799439030',
    content: 'This is a comment',
    mentions: ['507f1f77bcf86cd799439011']
  }
});
```

**Receive:**
```javascript
socket.on('new-comment', (data) => {
  console.log('New comment:', data);
  // {
  //   taskId: '507f1f77bcf86cd799439020',
  //   projectId: '507f1f77bcf86cd799439013',
  //   comment: {
  //     id: '507f1f77bcf86cd799439030',
  //     content: 'This is a comment',
  //     author: { id, name, email, avatar },
  //     timestamp: '2026-05-03T10:00:00.000Z'
  //   }
  // }
  
  // Add comment to UI
  addCommentToUI(data.taskId, data.comment);
});
```

### Comment Updated

**Emit:**
```javascript
socket.emit('comment-updated', {
  taskId: '507f1f77bcf86cd799439020',
  projectId: '507f1f77bcf86cd799439013',
  commentId: '507f1f77bcf86cd799439030',
  content: 'Updated comment content'
});
```

**Receive:**
```javascript
socket.on('comment-updated', (data) => {
  console.log('Comment updated:', data);
  // Update comment in UI
  updateCommentInUI(data.commentId, data.content);
});
```

### Comment Deleted

**Emit:**
```javascript
socket.emit('comment-deleted', {
  taskId: '507f1f77bcf86cd799439020',
  projectId: '507f1f77bcf86cd799439013',
  commentId: '507f1f77bcf86cd799439030'
});
```

**Receive:**
```javascript
socket.on('comment-deleted', (data) => {
  console.log('Comment deleted:', data);
  // Remove comment from UI
  removeCommentFromUI(data.commentId);
});
```

---

## Typing Indicators

### User Typing

**Emit:**
```javascript
// User starts typing
socket.emit('user-typing', {
  taskId: '507f1f77bcf86cd799439020',
  projectId: '507f1f77bcf86cd799439013'
});
```

**Receive:**
```javascript
socket.on('user-typing', (data) => {
  console.log('User is typing:', data);
  // {
  //   taskId: '507f1f77bcf86cd799439020',
  //   projectId: '507f1f77bcf86cd799439013',
  //   user: { id, name, email, avatar },
  //   timestamp: '2026-05-03T10:00:00.000Z'
  // }
  
  // Show typing indicator
  showTypingIndicator(data.user.name);
});
```

### User Stopped Typing

**Emit:**
```javascript
// User stops typing
socket.emit('user-stopped-typing', {
  taskId: '507f1f77bcf86cd799439020',
  projectId: '507f1f77bcf86cd799439013'
});
```

**Receive:**
```javascript
socket.on('user-stopped-typing', (data) => {
  console.log('User stopped typing:', data);
  // Hide typing indicator
  hideTypingIndicator(data.user.id);
});
```

**Implementation Example:**
```javascript
let typingTimeout;
const commentInput = document.getElementById('comment-input');

commentInput.addEventListener('input', () => {
  // Emit typing event
  socket.emit('user-typing', {
    taskId: currentTaskId,
    projectId: currentProjectId
  });

  // Clear previous timeout
  clearTimeout(typingTimeout);

  // Set timeout to emit stopped typing
  typingTimeout = setTimeout(() => {
    socket.emit('user-stopped-typing', {
      taskId: currentTaskId,
      projectId: currentProjectId
    });
  }, 2000); // 2 seconds of inactivity
});
```

---

## User Activity

### Viewing Task

Broadcast when a user is viewing a task.

**Emit:**
```javascript
socket.emit('viewing-task', {
  taskId: '507f1f77bcf86cd799439020',
  projectId: '507f1f77bcf86cd799439013'
});
```

**Receive:**
```javascript
socket.on('user-viewing-task', (data) => {
  console.log('User viewing task:', data);
  // {
  //   taskId: '507f1f77bcf86cd799439020',
  //   projectId: '507f1f77bcf86cd799439013',
  //   user: { id, name, email, avatar },
  //   timestamp: '2026-05-03T10:00:00.000Z'
  // }
  
  // Show who's viewing the task
  showViewingUsers(data.user);
});
```

---

## Project Events

### Project Updated

**Emit:**
```javascript
socket.emit('project-updated', {
  projectId: '507f1f77bcf86cd799439013',
  updates: {
    title: 'Updated project title',
    description: 'Updated description',
    status: 'active'
  }
});
```

**Receive:**
```javascript
socket.on('project-updated', (data) => {
  console.log('Project updated:', data);
  // Update project in UI
  updateProjectInUI(data.projectId, data.updates);
});
```

### Member Added

**Emit:**
```javascript
socket.emit('member-added', {
  projectId: '507f1f77bcf86cd799439013',
  member: {
    userId: '507f1f77bcf86cd799439011',
    name: 'Jane Doe',
    email: 'jane@example.com',
    role: 'member'
  }
});
```

**Receive:**
```javascript
socket.on('member-added', (data) => {
  console.log('Member added:', data);
  // Add member to UI
  addMemberToUI(data.member);
});

// If you're the new member
socket.on('added-to-project', (data) => {
  console.log('You were added to project:', data);
  // Show notification
  showNotification(`You were added to a project by ${data.addedBy.name}`);
});
```

---

## Active Users

### Get Active Users

**Emit:**
```javascript
socket.emit('get-active-users', {
  projectId: '507f1f77bcf86cd799439013'
});
```

**Receive:**
```javascript
socket.on('active-users', (data) => {
  console.log('Active users:', data);
  // {
  //   projectId: '507f1f77bcf86cd799439013',
  //   count: 5,
  //   timestamp: '2026-05-03T10:00:00.000Z'
  // }
  
  // Update active users count in UI
  updateActiveUsersCount(data.count);
});
```

---

## Error Handling

### Socket Errors

```javascript
socket.on('error', (data) => {
  console.error('Socket error:', data);
  // {
  //   event: 'join-project',
  //   message: 'Project not found'
  // }
  
  // Show error to user
  showError(data.message);
});
```

### Connection Errors

```javascript
socket.on('connect_error', (error) => {
  console.error('Connection error:', error.message);
  
  if (error.message.includes('Token expired')) {
    // Refresh token and reconnect
    refreshTokenAndReconnect();
  }
});
```

### Disconnection

```javascript
socket.on('disconnect', (reason) => {
  console.log('Disconnected:', reason);
  
  if (reason === 'io server disconnect') {
    // Server disconnected the socket, reconnect manually
    socket.connect();
  }
  // else the socket will automatically try to reconnect
});
```

---

## React Integration Example

```javascript
import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const useSocket = (projectId, accessToken) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [activeUsers, setActiveUsers] = useState(0);

  useEffect(() => {
    // Initialize socket
    const newSocket = io('http://localhost:5000', {
      auth: { token: accessToken }
    });

    // Connection events
    newSocket.on('connected', (data) => {
      console.log('Connected:', data);
      setConnected(true);
      
      // Join project room
      newSocket.emit('join-project', { projectId });
    });

    newSocket.on('project-joined', (data) => {
      setActiveUsers(data.activeUsers);
    });

    newSocket.on('user-joined-project', (data) => {
      setActiveUsers(data.activeUsers);
      showNotification(`${data.user.name} joined the project`);
    });

    newSocket.on('user-left-project', (data) => {
      setActiveUsers(data.activeUsers);
    });

    // Task events
    newSocket.on('task-updated', (data) => {
      // Update task in state
      updateTask(data.taskId, data.updates);
      showNotification(`Task updated by ${data.updatedBy.name}`);
    });

    newSocket.on('task-created', (data) => {
      // Add task to state
      addTask(data.task);
      showNotification(`New task created by ${data.createdBy.name}`);
    });

    newSocket.on('task-deleted', (data) => {
      // Remove task from state
      removeTask(data.taskId);
      showNotification(`Task deleted by ${data.deletedBy.name}`);
    });

    // Comment events
    newSocket.on('new-comment', (data) => {
      // Add comment to task
      addComment(data.taskId, data.comment);
      showNotification(`New comment by ${data.comment.author.name}`);
    });

    // Typing indicators
    newSocket.on('user-typing', (data) => {
      showTypingIndicator(data.taskId, data.user.name);
    });

    newSocket.on('user-stopped-typing', (data) => {
      hideTypingIndicator(data.taskId, data.user.id);
    });

    // Error handling
    newSocket.on('error', (data) => {
      console.error('Socket error:', data);
      showError(data.message);
    });

    newSocket.on('disconnect', () => {
      setConnected(false);
    });

    setSocket(newSocket);

    // Cleanup
    return () => {
      if (newSocket) {
        newSocket.emit('leave-project', { projectId });
        newSocket.disconnect();
      }
    };
  }, [projectId, accessToken]);

  return { socket, connected, activeUsers };
};

export default useSocket;
```

---

## Server-Side Integration

### Emit from Controllers

```javascript
import * as socketService from '../services/socket.service.js';

// In task controller after updating task
export const updateTask = async (req, res) => {
  try {
    const task = await taskService.updateTask(
      req.params.id,
      req.body,
      req.user.id
    );

    // Emit real-time event
    socketService.emitTaskUpdated(
      task.projectId,
      task._id,
      req.body,
      req.user
    );

    res.status(200).json({
      success: true,
      message: 'Task updated successfully',
      data: { task },
    });
  } catch (error) {
    // Handle error
  }
};
```

---

## Best Practices

1. **Always join project rooms** before emitting events
2. **Leave rooms** when navigating away
3. **Handle disconnections** gracefully
4. **Debounce typing indicators** (2-3 seconds)
5. **Show notifications** for important events
6. **Update UI optimistically** then sync with server
7. **Implement reconnection logic** with exponential backoff
8. **Clean up listeners** in useEffect cleanup
9. **Validate events** on server-side
10. **Rate limit** event emissions

---

## Performance Considerations

- **Room-based broadcasting** reduces unnecessary traffic
- **Authentication** prevents unauthorized access
- **Event validation** ensures data integrity
- **Scalable architecture** supports multiple servers with Redis adapter
- **Efficient data structures** (Maps, Sets) for tracking users

---

## Security

- ✅ JWT authentication required
- ✅ Project access verification
- ✅ Task access verification
- ✅ User identity attached to all events
- ✅ No sensitive data in broadcasts
- ✅ Rate limiting (future enhancement)

---

## Troubleshooting

**Connection fails:**
- Check token validity
- Verify CORS settings
- Check server is running

**Events not received:**
- Ensure joined project room
- Check event names match
- Verify user has access

**Multiple connections:**
- Disconnect old socket before creating new one
- Use socket ID to track connections

---

## Future Enhancements

- [ ] Redis adapter for horizontal scaling
- [ ] Presence system (online/offline/away)
- [ ] Read receipts for comments
- [ ] Voice/video call integration
- [ ] Screen sharing
- [ ] Collaborative editing
- [ ] Activity feed
- [ ] Push notifications