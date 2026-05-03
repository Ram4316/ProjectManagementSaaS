import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { io } from 'socket.io-client'
import { useAuthStore } from '@store/authStore'
import { useQueryClient } from '@tanstack/react-query'
import { projectKeys } from '@hooks/useProjects'
import { taskKeys } from '@hooks/useTasks'
import toast from 'react-hot-toast'

const SocketContext = createContext(null)

// Remove /api from the URL for Socket.IO connection
const SOCKET_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace('/api', '')

export const SocketProvider = ({ children }) => {
  const socketRef = useRef(null)
  const [isConnected, setIsConnected] = useState(false)
  const [onlineUsers, setOnlineUsers] = useState([])
  const { accessToken, user } = useAuthStore()
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!accessToken || !user) {
      // Disconnect if not authenticated
      if (socketRef.current) {
        socketRef.current.disconnect()
        socketRef.current = null
        setIsConnected(false)
      }
      return
    }

    // Initialize socket connection
    socketRef.current = io(SOCKET_URL, {
      auth: {
        token: accessToken,
        userId: user.id,
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    })

    // Connection events
    socketRef.current.on('connect', () => {
      console.log('✅ Socket connected:', socketRef.current.id)
      setIsConnected(true)
    })

    socketRef.current.on('disconnect', (reason) => {
      console.log('❌ Socket disconnected:', reason)
      setIsConnected(false)
      if (reason === 'io server disconnect') {
        socketRef.current.connect()
      }
    })

    socketRef.current.on('connect_error', (error) => {
      console.error('Socket connection error:', error)
      setIsConnected(false)
    })

    // Online users
    socketRef.current.on('users:online', (users) => {
      setOnlineUsers(users)
    })

    socketRef.current.on('user:joined', (userData) => {
      setOnlineUsers((prev) => [...prev, userData])
      if (userData.id !== user.id) {
        toast.success(`${userData.name} is now online`)
      }
    })

    socketRef.current.on('user:left', (userData) => {
      setOnlineUsers((prev) => prev.filter((u) => u.id !== userData.id))
    })

    // Project events
    socketRef.current.on('project:created', (data) => {
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() })
      toast.success(`New project created: ${data.title}`)
    })

    socketRef.current.on('project:updated', (data) => {
      queryClient.invalidateQueries({ queryKey: projectKeys.detail(data.id) })
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() })
      toast.info(`Project updated: ${data.title}`)
    })

    socketRef.current.on('project:deleted', (data) => {
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() })
      toast.info(`Project deleted: ${data.title}`)
    })

    socketRef.current.on('project:member-added', (data) => {
      queryClient.invalidateQueries({ queryKey: projectKeys.members(data.projectId) })
      if (data.userId === user.id) {
        toast.success(`You were added to ${data.projectTitle}`)
      }
    })

    // Task events
    socketRef.current.on('task:created', (data) => {
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() })
      if (data.assignedTo === user.id) {
        toast.info(`New task assigned: ${data.title}`)
      }
    })

    socketRef.current.on('task:updated', (data) => {
      queryClient.invalidateQueries({ queryKey: taskKeys.detail(data.id) })
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() })
    })

    socketRef.current.on('task:status-changed', (data) => {
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() })
      if (data.assignedTo === user.id && data.updatedBy !== user.id) {
        toast.info(`Task "${data.title}" moved to ${data.status}`)
      }
    })

    socketRef.current.on('task:deleted', (data) => {
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() })
    })

    socketRef.current.on('task:assigned', (data) => {
      queryClient.invalidateQueries({ queryKey: taskKeys.detail(data.taskId) })
      if (data.userId === user.id) {
        toast.success(`Task assigned to you: ${data.taskTitle}`)
      }
    })

    socketRef.current.on('task:comment-added', (data) => {
      queryClient.invalidateQueries({ queryKey: taskKeys.comments(data.taskId) })
      if (data.userId !== user.id) {
        toast.info(`${data.userName} commented on "${data.taskTitle}"`)
      }
    })

    socketRef.current.on('task:attachment-added', (data) => {
      queryClient.invalidateQueries({ queryKey: taskKeys.detail(data.taskId) })
    })

    // Cleanup
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect()
        socketRef.current = null
        setIsConnected(false)
      }
    }
  }, [accessToken, user, queryClient])

  // Join room
  const joinRoom = (roomId) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('join-room', roomId)
      console.log('📥 Joined room:', roomId)
    }
  }

  // Leave room
  const leaveRoom = (roomId) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('leave-room', roomId)
      console.log('📤 Left room:', roomId)
    }
  }

  // Emit event
  const emit = (event, data) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit(event, data)
    } else {
      console.warn('Socket not connected')
    }
  }

  // Listen to event
  const on = (event, callback) => {
    if (socketRef.current) {
      socketRef.current.on(event, callback)
    }
  }

  // Remove listener
  const off = (event, callback) => {
    if (socketRef.current) {
      socketRef.current.off(event, callback)
    }
  }

  // Typing indicator
  const startTyping = (roomId) => {
    emit('typing:start', { roomId, userId: user?.id, userName: user?.name })
  }

  const stopTyping = (roomId) => {
    emit('typing:stop', { roomId, userId: user?.id })
  }

  const value = {
    socket: socketRef.current,
    isConnected,
    onlineUsers,
    joinRoom,
    leaveRoom,
    emit,
    on,
    off,
    startTyping,
    stopTyping,
  }

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  )
}

export const useSocketContext = () => {
  const context = useContext(SocketContext)
  if (!context) {
    throw new Error('useSocketContext must be used within SocketProvider')
  }
  return context
}

// Made with Bob
