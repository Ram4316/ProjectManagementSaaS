import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  Card,
  CardContent,
  Typography,
  Chip,
  Avatar,
  Box,
  IconButton,
  Menu,
  MenuItem,
} from '@mui/material'
import {
  MoreVert,
  CalendarToday,
  AttachFile,
  Comment,
} from '@mui/icons-material'
import { useState } from 'react'
import { format } from 'date-fns'

const TaskCard = ({ task, onEdit, onDelete, onView }) => {
  const [anchorEl, setAnchorEl] = useState(null)

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const handleMenuOpen = (event) => {
    event.stopPropagation()
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  const handleEdit = () => {
    onEdit(task)
    handleMenuClose()
  }

  const handleDelete = () => {
    onDelete(task)
    handleMenuClose()
  }

  const handleView = () => {
    onView(task)
    handleMenuClose()
  }

  const priorityColors = {
    high: { bg: '#ffebee', text: '#d32f2f', border: '#ef5350' },
    medium: { bg: '#fff3e0', text: '#f57c00', border: '#ff9800' },
    low: { bg: '#e8f5e9', text: '#388e3c', border: '#66bb6a' },
  }

  const priority = task.priority || 'medium'
  const colors = priorityColors[priority]

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      sx={{
        mb: 2,
        cursor: isDragging ? 'grabbing' : 'grab',
        borderLeft: `4px solid ${colors.border}`,
        '&:hover': {
          boxShadow: 3,
        },
        transition: 'box-shadow 0.2s',
      }}
      onClick={handleView}
    >
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Chip
            label={priority}
            size="small"
            sx={{
              backgroundColor: colors.bg,
              color: colors.text,
              fontWeight: 'medium',
              textTransform: 'capitalize',
              height: 24,
            }}
          />
          <IconButton
            size="small"
            onClick={handleMenuOpen}
            sx={{ mt: -0.5, mr: -0.5 }}
          >
            <MoreVert fontSize="small" />
          </IconButton>
        </Box>

        {/* Title */}
        <Typography
          variant="body1"
          fontWeight="medium"
          sx={{
            mb: 1,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
          }}
        >
          {task.title}
        </Typography>

        {/* Description */}
        {task.description && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mb: 1.5,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
            }}
          >
            {task.description}
          </Typography>
        )}

        {/* Footer */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mt: 2,
          }}
        >
          {/* Assigned User */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {task.assignedTo && (
              <Avatar
                alt={task.assignedTo.name}
                src={task.assignedTo.avatar}
                sx={{ width: 28, height: 28 }}
              >
                {task.assignedTo.name?.charAt(0).toUpperCase()}
              </Avatar>
            )}
          </Box>

          {/* Meta Info */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {task.attachments && task.attachments.length > 0 && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <AttachFile sx={{ fontSize: 16, color: 'text.secondary' }} />
                <Typography variant="caption" color="text.secondary">
                  {task.attachments.length}
                </Typography>
              </Box>
            )}
            {task.comments && task.comments.length > 0 && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Comment sx={{ fontSize: 16, color: 'text.secondary' }} />
                <Typography variant="caption" color="text.secondary">
                  {task.comments.length}
                </Typography>
              </Box>
            )}
            {task.dueDate && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <CalendarToday sx={{ fontSize: 16, color: 'text.secondary' }} />
                <Typography variant="caption" color="text.secondary">
                  {format(new Date(task.dueDate), 'MMM dd')}
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
      </CardContent>

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        onClick={(e) => e.stopPropagation()}
      >
        <MenuItem onClick={handleView}>View Details</MenuItem>
        <MenuItem onClick={handleEdit}>Edit</MenuItem>
        <MenuItem onClick={handleDelete}>Delete</MenuItem>
      </Menu>
    </Card>
  )
}

export default TaskCard

// Made with Bob
