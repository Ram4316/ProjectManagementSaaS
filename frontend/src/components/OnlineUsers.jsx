import { Box, Typography, Avatar, AvatarGroup, Tooltip, Badge } from '@mui/material'
import { useSocketContext } from '@contexts/SocketContext'

const OnlineUsers = ({ maxDisplay = 5 }) => {
  const { onlineUsers } = useSocketContext()

  if (onlineUsers.length === 0) {
    return null
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Typography variant="body2" color="text.secondary">
        Online:
      </Typography>
      <AvatarGroup
        max={maxDisplay}
        sx={{
          '& .MuiAvatar-root': {
            width: 32,
            height: 32,
            fontSize: 14,
            border: '2px solid #fff',
          },
        }}
      >
        {onlineUsers.map((user) => (
          <Tooltip key={user.id} title={user.name}>
            <Badge
              overlap="circular"
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              variant="dot"
              sx={{
                '& .MuiBadge-badge': {
                  backgroundColor: '#44b700',
                  color: '#44b700',
                  boxShadow: '0 0 0 2px #fff',
                  '&::after': {
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    borderRadius: '50%',
                    animation: 'ripple 1.2s infinite ease-in-out',
                    border: '1px solid currentColor',
                    content: '""',
                  },
                },
                '@keyframes ripple': {
                  '0%': {
                    transform: 'scale(.8)',
                    opacity: 1,
                  },
                  '100%': {
                    transform: 'scale(2.4)',
                    opacity: 0,
                  },
                },
              }}
            >
              <Avatar alt={user.name} src={user.avatar}>
                {user.name.charAt(0).toUpperCase()}
              </Avatar>
            </Badge>
          </Tooltip>
        ))}
      </AvatarGroup>
      <Typography variant="caption" color="text.secondary">
        ({onlineUsers.length})
      </Typography>
    </Box>
  )
}

export default OnlineUsers

// Made with Bob
