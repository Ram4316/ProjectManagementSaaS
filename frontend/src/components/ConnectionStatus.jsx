import { Box, Chip, Tooltip } from '@mui/material'
import {
  Wifi as ConnectedIcon,
  WifiOff as DisconnectedIcon,
  Sync as ReconnectingIcon,
} from '@mui/icons-material'
import { useSocketContext } from '@contexts/SocketContext'

const ConnectionStatus = () => {
  const { isConnected } = useSocketContext()

  if (isConnected) {
    return (
      <Tooltip title="Connected to real-time updates">
        <Chip
          icon={<ConnectedIcon />}
          label="Connected"
          size="small"
          color="success"
          variant="outlined"
          sx={{ cursor: 'pointer' }}
        />
      </Tooltip>
    )
  }

  return (
    <Tooltip title="Disconnected from real-time updates">
      <Chip
        icon={<DisconnectedIcon />}
        label="Offline"
        size="small"
        color="error"
        variant="outlined"
        sx={{ cursor: 'pointer' }}
      />
    </Tooltip>
  )
}

export default ConnectionStatus

// Made with Bob
