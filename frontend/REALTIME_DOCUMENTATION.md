# Real-Time Features Documentation

Complete guide for Socket.IO integration and real-time features in the frontend.

## 📋 Overview

The application uses Socket.IO for real-time bidirectional communication between clients and server. Features include:
- Real-time task updates
- Live project synchronization
- Typing indicators
- Online user presence
- Instant notifications
- Automatic reconnection

## 🏗️ Architecture

```
SocketProvider (Context)
    ↓
Components (useSocketContext)
    ↓
Socket.IO Client
    ↓
Backend Socket.IO Server
```

## 🔧 Setup

### Socket Context Provider

**File:** `src/contexts/SocketContext.jsx`

The SocketProvider wraps the entire application and manages the Socket.IO connection:

```jsx
<SocketProvider>
  <App />
</SocketProvider>
```

**Features:**
- Automatic connection/disconnection based on auth state
- Global event listeners for all real-time events
- Automatic React Query cache invalidation
- Online users tracking
- Typing indicator support

### Configuration

Socket connection is configured with:
- **URL**: `VITE_API_URL` from environment variables
- **Auth**: JWT token passed in connection
- **Transports**: WebSocket (primary), Polling (fallback)
- **Reconnection**: Automatic with exponential backoff

## 🎯 Core Features

### 1. Connection Management

#### useSocketContext Hook

```javascript
import { useSocketContext } from '@contexts/SocketContext'

function MyComponent() {
  const { isConnected, socket } = useSocketContext()
  
  return (
    <div>
      Status: {isConnected ? 'Connected' : 'Disconnected'}
    </div>
  )
}
```

#### Connection Status Indicator

```jsx
import ConnectionStatus from '@components/ConnectionStatus'

<ConnectionStatus />
```

Shows a chip with connection state:
- ✅ Green "Connected" when online
- ❌ Red "Offline" when disconnected

### 2. Online Users

#### OnlineUsers Component

```jsx
import OnlineUsers from '@components/OnlineUsers'

<OnlineUsers maxDisplay={5} />
```

**Features:**
- Shows avatars of online users
- Green pulsing badge for online status
- Tooltip with user names
- Configurable max display count

**Events:**
- `users:online` - Initial list of online users
- `user:joined` - User comes online
- `user:left` - User goes offline

### 3. Typing Indicators

#### TypingIndicator Component

```jsx
import TypingIndicator from '@components/TypingIndicator'

<TypingIndicator roomId="task:123" />
```

**Features:**
- Shows who is typing in real-time
- Animated dots
- Multiple users support
- Auto-cleanup when typing stops

**Usage:**
```javascript
const { startTyping, stopTyping } = useSocketContext()

// Start typing
const handleInputFocus = () => {
  startTyping('task:123')
}

// Stop typing
const handleInputBlur = () => {
  stopTyping('task:123')
}

// Stop typing after delay
const handleInputChange = () => {
  startTyping('task:123')
  clearTimeout(typingTimeout)
  typingTimeout = setTimeout(() => {
    stopTyping('task:123')
  }, 1000)
}
```

### 4. Room Management

#### Joining Rooms

```javascript
const { joinRoom, leaveRoom } = useSocketContext()

useEffect(() => {
  if (projectId) {
    joinRoom(`project:${projectId}`)
    
    return () => {
      leaveRoom(`project:${projectId}`)
    }
  }
}, [projectId])
```

**Room Naming Convention:**
- `project:{id}` - Project-specific updates
- `task:{id}` - Task-specific updates
- `user:{id}` - User-specific notifications

### 5. Emitting Events

```javascript
const { emit } = useSocketContext()

// Send custom event
emit('custom-event', { data: 'value' })

// Send typing indicator
emit('typing:start', { roomId: 'task:123', userId: user.id })
```

### 6. Listening to Events

```javascript
const { on, off } = useSocketContext()

useEffect(() => {
  const handleCustomEvent = (data) => {
    console.log('Received:', data)
  }
  
  on('custom-event', handleCustomEvent)
  
  return () => {
    off('custom-event', handleCustomEvent)
  }
}, [])
```

## 📡 Real-Time Events

### Project Events

#### project:created
Emitted when a new project is created.

```javascript
{
  id: '123',
  title: 'New Project',
  createdBy: 'user-id',
  createdAt: '2026-05-03T10:00:00Z'
}
```

**Action:** Invalidates project list queries

#### project:updated
Emitted when a project is updated.

```javascript
{
  id: '123',
  title: 'Updated Title',
  updatedBy: 'user-id',
  updatedAt: '2026-05-03T10:00:00Z'
}
```

**Action:** Invalidates project detail and list queries

#### project:deleted
Emitted when a project is deleted.

```javascript
{
  id: '123',
  title: 'Deleted Project',
  deletedBy: 'user-id'
}
```

**Action:** Invalidates project list queries

#### project:member-added
Emitted when a member is added to a project.

```javascript
{
  projectId: '123',
  projectTitle: 'Project Name',
  userId: 'user-id',
  userName: 'John Doe',
  role: 'member'
}
```

**Action:** Invalidates project members query, shows toast if current user

### Task Events

#### task:created
Emitted when a new task is created.

```javascript
{
  id: '456',
  title: 'New Task',
  projectId: '123',
  assignedTo: 'user-id',
  createdBy: 'user-id',
  createdAt: '2026-05-03T10:00:00Z'
}
```

**Action:** Invalidates task list queries, shows toast if assigned to current user

#### task:updated
Emitted when a task is updated.

```javascript
{
  id: '456',
  title: 'Updated Task',
  updatedBy: 'user-id',
  updatedAt: '2026-05-03T10:00:00Z'
}
```

**Action:** Invalidates task detail and list queries

#### task:status-changed
Emitted when a task status changes (Kanban drag-and-drop).

```javascript
{
  id: '456',
  title: 'Task Title',
  status: 'in-progress',
  previousStatus: 'todo',
  assignedTo: 'user-id',
  updatedBy: 'user-id'
}
```

**Action:** Invalidates task list queries, shows toast if assigned to current user

#### task:deleted
Emitted when a task is deleted.

```javascript
{
  id: '456',
  title: 'Deleted Task',
  deletedBy: 'user-id'
}
```

**Action:** Invalidates task list queries

#### task:assigned
Emitted when a task is assigned to a user.

```javascript
{
  taskId: '456',
  taskTitle: 'Task Title',
  userId: 'user-id',
  userName: 'John Doe',
  assignedBy: 'user-id'
}
```

**Action:** Invalidates task detail query, shows toast if assigned to current user

#### task:comment-added
Emitted when a comment is added to a task.

```javascript
{
  taskId: '456',
  taskTitle: 'Task Title',
  commentId: '789',
  comment: 'Comment text',
  userId: 'user-id',
  userName: 'John Doe'
}
```

**Action:** Invalidates task comments query, shows toast

#### task:attachment-added
Emitted when an attachment is uploaded to a task.

```javascript
{
  taskId: '456',
  attachmentId: '789',
  fileName: 'document.pdf',
  userId: 'user-id'
}
```

**Action:** Invalidates task detail query

### User Events

#### users:online
Emitted on connection with list of currently online users.

```javascript
[
  { id: 'user-1', name: 'John Doe', avatar: 'url' },
  { id: 'user-2', name: 'Jane Smith', avatar: 'url' }
]
```

**Action:** Updates online users state

#### user:joined
Emitted when a user comes online.

```javascript
{
  id: 'user-id',
  name: 'John Doe',
  avatar: 'url'
}
```

**Action:** Adds user to online users list, shows toast

#### user:left
Emitted when a user goes offline.

```javascript
{
  id: 'user-id',
  name: 'John Doe'
}
```

**Action:** Removes user from online users list

### Typing Events

#### typing:start
Emitted when a user starts typing.

```javascript
{
  roomId: 'task:123',
  userId: 'user-id',
  userName: 'John Doe'
}
```

**Action:** Shows typing indicator

#### typing:stop
Emitted when a user stops typing.

```javascript
{
  roomId: 'task:123',
  userId: 'user-id'
}
```

**Action:** Hides typing indicator for that user

## 🎨 Integration Examples

### Kanban Board with Real-Time Updates

```jsx
import { useEffect } from 'react'
import { useSocketContext } from '@contexts/SocketContext'
import { useQueryClient } from '@tanstack/react-query'
import { taskKeys } from '@hooks/useTasks'

function KanbanBoard({ projectId }) {
  const { joinRoom, leaveRoom, on, off } = useSocketContext()
  const queryClient = useQueryClient()
  
  useEffect(() => {
    // Join project room
    joinRoom(`project:${projectId}`)
    
    // Listen for task status changes
    const handleStatusChange = (data) => {
      // Optimistically update UI
      queryClient.setQueryData(taskKeys.lists(), (old) =>
        old.map(task =>
          task.id === data.id ? { ...task, status: data.status } : task
        )
      )
    }
    
    on('task:status-changed', handleStatusChange)
    
    return () => {
      off('task:status-changed', handleStatusChange)
      leaveRoom(`project:${projectId}`)
    }
  }, [projectId])
  
  return <div>Kanban Board</div>
}
```

### Task Comments with Typing Indicator

```jsx
import { useState, useEffect } from 'react'
import { useSocketContext } from '@contexts/SocketContext'
import TypingIndicator from '@components/TypingIndicator'

function TaskComments({ taskId }) {
  const { startTyping, stopTyping, joinRoom, leaveRoom } = useSocketContext()
  const [comment, setComment] = useState('')
  const [typingTimeout, setTypingTimeout] = useState(null)
  
  useEffect(() => {
    joinRoom(`task:${taskId}`)
    return () => leaveRoom(`task:${taskId}`)
  }, [taskId])
  
  const handleCommentChange = (e) => {
    setComment(e.target.value)
    
    // Start typing
    startTyping(`task:${taskId}`)
    
    // Stop typing after 1 second of inactivity
    if (typingTimeout) clearTimeout(typingTimeout)
    setTypingTimeout(setTimeout(() => {
      stopTyping(`task:${taskId}`)
    }, 1000))
  }
  
  return (
    <div>
      <textarea value={comment} onChange={handleCommentChange} />
      <TypingIndicator roomId={`task:${taskId}`} />
    </div>
  )
}
```

### Dashboard with Live Updates

```jsx
import { useEffect } from 'react'
import { useSocketContext } from '@contexts/SocketContext'
import { useQueryClient } from '@tanstack/react-query'

function Dashboard() {
  const { on, off } = useSocketContext()
  const queryClient = useQueryClient()
  
  useEffect(() => {
    // Listen for all project and task events
    const handleProjectCreated = () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
    }
    
    const handleTaskCreated = () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
    }
    
    on('project:created', handleProjectCreated)
    on('task:created', handleTaskCreated)
    
    return () => {
      off('project:created', handleProjectCreated)
      off('task:created', handleTaskCreated)
    }
  }, [])
  
  return <div>Dashboard</div>
}
```

## 🔒 Security

### Authentication

Socket connections are authenticated using JWT tokens:

```javascript
socketRef.current = io(SOCKET_URL, {
  auth: {
    token: accessToken,
    userId: user.id,
  }
})
```

### Authorization

Backend validates:
- User has access to rooms they join
- User can only emit events they're authorized for
- User receives only events they should see

## 🐛 Debugging

### Enable Socket.IO Debug Logs

```javascript
localStorage.debug = 'socket.io-client:*'
```

### Check Connection State

```javascript
const { socket, isConnected } = useSocketContext()

console.log('Socket ID:', socket?.id)
console.log('Connected:', isConnected)
console.log('Transport:', socket?.io?.engine?.transport?.name)
```

### Monitor Events

```javascript
const { on } = useSocketContext()

// Log all events
on('*', (eventName, ...args) => {
  console.log('Event:', eventName, args)
})
```

## ⚡ Performance

### Automatic Cleanup

All event listeners are automatically cleaned up when components unmount:

```javascript
useEffect(() => {
  const handler = (data) => console.log(data)
  on('event', handler)
  
  return () => {
    off('event', handler) // Automatic cleanup
  }
}, [])
```

### Efficient Updates

- Uses React Query cache invalidation
- Optimistic UI updates
- Debounced typing indicators
- Room-based event filtering

### Connection Pooling

- Single socket connection per user
- Shared across all components
- Automatic reconnection on disconnect

## 🎯 Best Practices

### 1. Always Clean Up Listeners

```javascript
useEffect(() => {
  const handler = (data) => {}
  on('event', handler)
  return () => off('event', handler)
}, [])
```

### 2. Use Rooms for Scoped Events

```javascript
// Join specific room
joinRoom(`project:${projectId}`)

// Leave when done
return () => leaveRoom(`project:${projectId}`)
```

### 3. Debounce Typing Indicators

```javascript
const handleTyping = () => {
  startTyping(roomId)
  clearTimeout(timeout)
  timeout = setTimeout(() => stopTyping(roomId), 1000)
}
```

### 4. Handle Disconnections Gracefully

```javascript
const { isConnected } = useSocketContext()

if (!isConnected) {
  return <div>Reconnecting...</div>
}
```

### 5. Invalidate Queries on Events

```javascript
on('task:updated', (data) => {
  queryClient.invalidateQueries({ queryKey: taskKeys.detail(data.id) })
})
```

## 📊 Event Flow Diagram

```
User Action (Frontend)
    ↓
API Call (REST)
    ↓
Backend Processing
    ↓
Socket.IO Emit (Backend)
    ↓
Socket.IO Receive (Frontend)
    ↓
React Query Cache Update
    ↓
UI Re-render
```

## 🔗 Related Files

- `src/contexts/SocketContext.jsx` - Socket provider
- `src/hooks/useSocket.js` - Legacy socket hooks
- `src/components/ConnectionStatus.jsx` - Connection indicator
- `src/components/TypingIndicator.jsx` - Typing indicator
- `src/components/OnlineUsers.jsx` - Online users list

## 📚 Resources

- [Socket.IO Client Documentation](https://socket.io/docs/v4/client-api/)
- [React Query Documentation](https://tanstack.com/query/latest)
- [Backend Socket Documentation](../backend/SOCKET_DOCUMENTATION.md)

---

Built with ❤️ using Socket.IO and React