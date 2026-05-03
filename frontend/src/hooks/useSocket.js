import { useEffect, useRef, useState } from 'react'
import { io } from 'socket.io-client'
import { useAuthStore } from '@store/authStore'
import toast from 'react-hot-toast'

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export const useSocket = () => {
  const socketRef = useRef(null)
  const [isConnected, setIsConnected] = useState(false)
  const { accessToken } = useAuthStore()

  useEffect(() => {
    if (!accessToken) {
      // Don't connect if not authenticated
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
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    })

    // Connection event handlers
    socketRef.current.on('connect', () => {
      console.log('Socket connected:', socketRef.current.id)
      setIsConnected(true)
      toast.success('Connected to real-time updates')
    })

    socketRef.current.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason)
      setIsConnected(false)
      if (reason === 'io server disconnect') {
        // Server disconnected, try to reconnect
        socketRef.current.connect()
      }
    })

    socketRef.current.on('connect_error', (error) => {
      console.error('Socket connection error:', error)
      setIsConnected(false)
      toast.error('Failed to connect to real-time updates')
    })

    socketRef.current.on('error', (error) => {
      console.error('Socket error:', error)
      toast.error('Real-time connection error')
    })

    // Cleanup on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect()
        socketRef.current = null
        setIsConnected(false)
      }
    }
  }, [accessToken])

  // Join a room
  const joinRoom = (roomId) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('join-room', roomId)
      console.log('Joined room:', roomId)
    }
  }

  // Leave a room
  const leaveRoom = (roomId) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('leave-room', roomId)
      console.log('Left room:', roomId)
    }
  }

  // Send a message
  const sendMessage = (event, data) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit(event, data)
    } else {
      console.warn('Socket not connected, cannot send message')
    }
  }

  // Listen to an event
  const on = (event, callback) => {
    if (socketRef.current) {
      socketRef.current.on(event, callback)
    }
  }

  // Remove event listener
  const off = (event, callback) => {
    if (socketRef.current) {
      socketRef.current.off(event, callback)
    }
  }

  return {
    socket: socketRef.current,
    isConnected,
    joinRoom,
    leaveRoom,
    sendMessage,
    on,
    off,
  }
}

// Hook for project-specific socket events
export const useProjectSocket = (projectId) => {
  const { socket, isConnected, joinRoom, leaveRoom, on, off } = useSocket()
  const [projectUpdates, setProjectUpdates] = useState([])

  useEffect(() => {
    if (projectId && isConnected) {
      // Join project room
      joinRoom(`project:${projectId}`)

      // Listen for project updates
      const handleProjectUpdate = (data) => {
        console.log('Project update:', data)
        setProjectUpdates((prev) => [...prev, data])
        toast.info(`Project updated: ${data.message}`)
      }

      const handleTaskUpdate = (data) => {
        console.log('Task update:', data)
        setProjectUpdates((prev) => [...prev, data])
        toast.info(`Task updated: ${data.message}`)
      }

      const handleMemberJoined = (data) => {
        console.log('Member joined:', data)
        toast.success(`${data.userName} joined the project`)
      }

      on('project-update', handleProjectUpdate)
      on('task-update', handleTaskUpdate)
      on('member-joined', handleMemberJoined)

      // Cleanup
      return () => {
        off('project-update', handleProjectUpdate)
        off('task-update', handleTaskUpdate)
        off('member-joined', handleMemberJoined)
        leaveRoom(`project:${projectId}`)
      }
    }
  }, [projectId, isConnected])

  return {
    socket,
    isConnected,
    projectUpdates,
  }
}

// Hook for task-specific socket events
export const useTaskSocket = (taskId) => {
  const { socket, isConnected, joinRoom, leaveRoom, on, off } = useSocket()
  const [taskUpdates, setTaskUpdates] = useState([])

  useEffect(() => {
    if (taskId && isConnected) {
      // Join task room
      joinRoom(`task:${taskId}`)

      // Listen for task updates
      const handleTaskUpdate = (data) => {
        console.log('Task update:', data)
        setTaskUpdates((prev) => [...prev, data])
      }

      const handleCommentAdded = (data) => {
        console.log('Comment added:', data)
        toast.info(`New comment from ${data.userName}`)
      }

      on('task-update', handleTaskUpdate)
      on('comment-added', handleCommentAdded)

      // Cleanup
      return () => {
        off('task-update', handleTaskUpdate)
        off('comment-added', handleCommentAdded)
        leaveRoom(`task:${taskId}`)
      }
    }
  }, [taskId, isConnected])

  return {
    socket,
    isConnected,
    taskUpdates,
  }
}

// Made with Bob
