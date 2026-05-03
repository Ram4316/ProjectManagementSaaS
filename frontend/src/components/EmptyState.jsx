import { Box, Typography, Button } from '@mui/material'
import {
  Inbox as InboxIcon,
  FolderOpen as FolderIcon,
  Assignment as TaskIcon,
  Search as SearchIcon,
} from '@mui/icons-material'

const icons = {
  inbox: InboxIcon,
  folder: FolderIcon,
  task: TaskIcon,
  search: SearchIcon,
}

const EmptyState = ({
  icon = 'inbox',
  title = 'No items found',
  description = 'Get started by creating your first item',
  actionLabel,
  onAction,
  CustomIcon,
}) => {
  const Icon = CustomIcon || icons[icon] || InboxIcon

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        py: 8,
        px: 3,
        textAlign: 'center',
      }}
    >
      <Icon
        sx={{
          fontSize: 80,
          color: 'text.secondary',
          opacity: 0.5,
          mb: 2,
        }}
      />
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        {title}
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: 400 }}>
        {description}
      </Typography>
      {actionLabel && onAction && (
        <Button variant="contained" onClick={onAction} size="large">
          {actionLabel}
        </Button>
      )}
    </Box>
  )
}

export default EmptyState

// Made with Bob
