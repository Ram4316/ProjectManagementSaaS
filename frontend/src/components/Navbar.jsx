import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Box,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  ListItemIcon,
  Badge,
  Tooltip,
} from '@mui/material'
import {
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  AccountCircle,
  Settings,
  Logout,
  Brightness4,
  Brightness7,
} from '@mui/icons-material'
import { useAuthStore } from '@store/authStore'
import { useThemeContext } from '@contexts/ThemeContext'
import ConnectionStatus from '@components/ConnectionStatus'
import OnlineUsers from '@components/OnlineUsers'
import toast from 'react-hot-toast'

const Navbar = ({ drawerWidth, handleDrawerToggle }) => {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const { mode, toggleTheme } = useThemeContext()
  const [anchorEl, setAnchorEl] = useState(null)
  const [notificationAnchor, setNotificationAnchor] = useState(null)

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const handleProfileMenuClose = () => {
    setAnchorEl(null)
  }

  const handleNotificationOpen = (event) => {
    setNotificationAnchor(event.currentTarget)
  }

  const handleNotificationClose = () => {
    setNotificationAnchor(null)
  }

  const handleLogout = () => {
    logout()
    toast.success('Logged out successfully')
    navigate('/login')
    handleProfileMenuClose()
  }

  const handleProfile = () => {
    navigate('/profile')
    handleProfileMenuClose()
  }

  const handleSettings = () => {
    navigate('/settings')
    handleProfileMenuClose()
  }

  return (
    <AppBar
      position="fixed"
      sx={{
        width: { sm: `calc(100% - ${drawerWidth}px)` },
        ml: { sm: `${drawerWidth}px` },
        boxShadow: 1,
      }}
    >
      <Toolbar>
        {/* Mobile Menu Button */}
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={handleDrawerToggle}
          sx={{ mr: 2, display: { sm: 'none' } }}
        >
          <MenuIcon />
        </IconButton>

        {/* Title */}
        <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
          Project Management
        </Typography>

        {/* Right Side Icons */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* Online Users */}
          <OnlineUsers maxDisplay={3} />
          
          {/* Connection Status */}
          <ConnectionStatus />
          
          {/* Theme Toggle */}
          <Tooltip title={`Switch to ${mode === 'light' ? 'dark' : 'light'} mode`}>
            <IconButton
              color="inherit"
              onClick={toggleTheme}
              aria-label="toggle theme"
            >
              {mode === 'light' ? <Brightness4 /> : <Brightness7 />}
            </IconButton>
          </Tooltip>
          
          {/* Notifications */}
          <IconButton
            color="inherit"
            onClick={handleNotificationOpen}
            aria-label="show notifications"
          >
            <Badge badgeContent={3} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>

          {/* Profile */}
          <IconButton
            onClick={handleProfileMenuOpen}
            size="small"
            aria-label="account of current user"
            aria-controls="profile-menu"
            aria-haspopup="true"
          >
            <Avatar
              alt={user?.name || 'User'}
              src={user?.avatar}
              sx={{ width: 32, height: 32 }}
            >
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </Avatar>
          </IconButton>
        </Box>

        {/* Profile Menu */}
        <Menu
          id="profile-menu"
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleProfileMenuClose}
          onClick={handleProfileMenuClose}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          PaperProps={{
            elevation: 3,
            sx: {
              mt: 1.5,
              minWidth: 200,
            },
          }}
        >
          <Box sx={{ px: 2, py: 1 }}>
            <Typography variant="subtitle1" fontWeight="bold">
              {user?.name || 'User'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {user?.email || 'user@example.com'}
            </Typography>
          </Box>
          <Divider />
          <MenuItem onClick={handleProfile}>
            <ListItemIcon>
              <AccountCircle fontSize="small" />
            </ListItemIcon>
            Profile
          </MenuItem>
          <MenuItem onClick={handleSettings}>
            <ListItemIcon>
              <Settings fontSize="small" />
            </ListItemIcon>
            Settings
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleLogout}>
            <ListItemIcon>
              <Logout fontSize="small" />
            </ListItemIcon>
            Logout
          </MenuItem>
        </Menu>

        {/* Notification Menu */}
        <Menu
          id="notification-menu"
          anchorEl={notificationAnchor}
          open={Boolean(notificationAnchor)}
          onClose={handleNotificationClose}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          PaperProps={{
            elevation: 3,
            sx: {
              mt: 1.5,
              minWidth: 300,
              maxHeight: 400,
            },
          }}
        >
          <Box sx={{ px: 2, py: 1 }}>
            <Typography variant="subtitle1" fontWeight="bold">
              Notifications
            </Typography>
          </Box>
          <Divider />
          <MenuItem onClick={handleNotificationClose}>
            <Typography variant="body2">
              New task assigned: "Update Dashboard UI"
            </Typography>
          </MenuItem>
          <MenuItem onClick={handleNotificationClose}>
            <Typography variant="body2">
              Project "Website Redesign" deadline approaching
            </Typography>
          </MenuItem>
          <MenuItem onClick={handleNotificationClose}>
            <Typography variant="body2">
              Comment on task "Fix login bug"
            </Typography>
          </MenuItem>
          <Divider />
          <MenuItem
            onClick={handleNotificationClose}
            sx={{ justifyContent: 'center' }}
          >
            <Typography variant="body2" color="primary">
              View All Notifications
            </Typography>
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  )
}

export default Navbar

// Made with Bob
