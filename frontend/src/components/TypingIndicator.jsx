import { useEffect, useState } from 'react'
import { Box, Typography, Avatar, AvatarGroup } from '@mui/material'
import { useSocketContext } from '@contexts/SocketContext'

const TypingIndicator = ({ roomId }) => {
  const { on, off } = useSocketContext()
  const [typingUsers, setTypingUsers] = useState([])

  useEffect(() => {
    const handleTypingStart = (data) => {
      if (data.roomId === roomId) {
        setTypingUsers((prev) => {
          // Avoid duplicates
          if (prev.find((u) => u.userId === data.userId)) {
            return prev
          }
          return [...prev, { userId: data.userId, userName: data.userName }]
        })
      }
    }

    const handleTypingStop = (data) => {
      if (data.roomId === roomId) {
        setTypingUsers((prev) => prev.filter((u) => u.userId !== data.userId))
      }
    }

    on('typing:start', handleTypingStart)
    on('typing:stop', handleTypingStop)

    return () => {
      off('typing:start', handleTypingStart)
      off('typing:stop', handleTypingStop)
    }
  }, [roomId, on, off])

  if (typingUsers.length === 0) {
    return null
  }

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        py: 1,
        px: 2,
        backgroundColor: '#f5f5f5',
        borderRadius: 1,
      }}
    >
      <AvatarGroup max={3} sx={{ '& .MuiAvatar-root': { width: 24, height: 24 } }}>
        {typingUsers.map((user) => (
          <Avatar key={user.userId} sx={{ fontSize: 12 }}>
            {user.userName.charAt(0).toUpperCase()}
          </Avatar>
        ))}
      </AvatarGroup>
      <Typography variant="body2" color="text.secondary">
        {typingUsers.length === 1
          ? `${typingUsers[0].userName} is typing...`
          : typingUsers.length === 2
          ? `${typingUsers[0].userName} and ${typingUsers[1].userName} are typing...`
          : `${typingUsers.length} people are typing...`}
      </Typography>
      <Box
        sx={{
          display: 'flex',
          gap: 0.5,
          ml: 1,
        }}
      >
        <Box
          className="typing-dot"
          sx={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            backgroundColor: '#666',
            animation: 'typing 1.4s infinite',
            animationDelay: '0s',
            '@keyframes typing': {
              '0%, 60%, 100%': { opacity: 0.3 },
              '30%': { opacity: 1 },
            },
          }}
        />
        <Box
          className="typing-dot"
          sx={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            backgroundColor: '#666',
            animation: 'typing 1.4s infinite',
            animationDelay: '0.2s',
            '@keyframes typing': {
              '0%, 60%, 100%': { opacity: 0.3 },
              '30%': { opacity: 1 },
            },
          }}
        />
        <Box
          className="typing-dot"
          sx={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            backgroundColor: '#666',
            animation: 'typing 1.4s infinite',
            animationDelay: '0.4s',
            '@keyframes typing': {
              '0%, 60%, 100%': { opacity: 0.3 },
              '30%': { opacity: 1 },
            },
          }}
        />
      </Box>
    </Box>
  )
}

export default TypingIndicator

// Made with Bob
