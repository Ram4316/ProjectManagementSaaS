import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Box,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  TextField,
  InputAdornment,
  Select,
  FormControl,
  InputLabel,
  Tabs,
  Tab,
} from '@mui/material'
import {
  Add as AddIcon,
  MoreVert,
  Search as SearchIcon,
  FilterList,
} from '@mui/icons-material'
import api from '@services/api'

// Mock data - will be replaced with real API calls
const fetchTasks = async () => {
  // const response = await api.get('/api/tasks')
  // return response.data
  return [
    {
      id: 1,
      title: 'Update landing page design',
      project: 'Website Redesign',
      status: 'in-progress',
      priority: 'high',
      assignedTo: { name: 'Alice', avatar: '' },
      dueDate: '2026-05-05',
    },
    {
      id: 2,
      title: 'Implement authentication',
      project: 'Mobile App',
      status: 'in-progress',
      priority: 'high',
      assignedTo: { name: 'Bob', avatar: '' },
      dueDate: '2026-05-08',
    },
    {
      id: 3,
      title: 'Create social media content',
      project: 'Marketing Campaign',
      status: 'todo',
      priority: 'medium',
      assignedTo: { name: 'Charlie', avatar: '' },
      dueDate: '2026-05-06',
    },
    {
      id: 4,
      title: 'Fix responsive issues',
      project: 'Website Redesign',
      status: 'todo',
      priority: 'low',
      assignedTo: { name: 'David', avatar: '' },
      dueDate: '2026-05-12',
    },
    {
      id: 5,
      title: 'Database optimization',
      project: 'API Integration',
      status: 'done',
      priority: 'high',
      assignedTo: { name: 'Eve', avatar: '' },
      dueDate: '2026-04-28',
    },
    {
      id: 6,
      title: 'Write unit tests',
      project: 'Mobile App',
      status: 'in-progress',
      priority: 'medium',
      assignedTo: { name: 'Frank', avatar: '' },
      dueDate: '2026-05-10',
    },
    {
      id: 7,
      title: 'Update documentation',
      project: 'API Integration',
      status: 'todo',
      priority: 'low',
      assignedTo: { name: 'Grace', avatar: '' },
      dueDate: '2026-05-15',
    },
    {
      id: 8,
      title: 'Code review',
      project: 'Website Redesign',
      status: 'done',
      priority: 'medium',
      assignedTo: { name: 'Henry', avatar: '' },
      dueDate: '2026-04-30',
    },
  ]
}

const Tasks = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [anchorEl, setAnchorEl] = useState(null)
  const [selectedTask, setSelectedTask] = useState(null)

  const { data: tasks, isLoading } = useQuery({
    queryKey: ['tasks'],
    queryFn: fetchTasks,
  })

  const handleMenuOpen = (event, task) => {
    event.stopPropagation()
    setAnchorEl(event.currentTarget)
    setSelectedTask(task)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
    setSelectedTask(null)
  }

  const handleEdit = () => {
    console.log('Edit task:', selectedTask)
    handleMenuClose()
  }

  const handleDelete = () => {
    console.log('Delete task:', selectedTask)
    handleMenuClose()
  }

  const statusColors = {
    todo: { bg: '#e3f2fd', text: '#1976d2', label: 'To Do' },
    'in-progress': { bg: '#fff3e0', text: '#f57c00', label: 'In Progress' },
    done: { bg: '#e8f5e9', text: '#388e3c', label: 'Done' },
  }

  const priorityColors = {
    high: { bg: '#ffebee', text: '#d32f2f' },
    medium: { bg: '#fff3e0', text: '#f57c00' },
    low: { bg: '#e8f5e9', text: '#388e3c' },
  }

  const filteredTasks = tasks?.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.project.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter
    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter
    return matchesSearch && matchesStatus && matchesPriority
  })

  const tasksByStatus = {
    todo: filteredTasks?.filter((t) => t.status === 'todo').length || 0,
    'in-progress': filteredTasks?.filter((t) => t.status === 'in-progress').length || 0,
    done: filteredTasks?.filter((t) => t.status === 'done').length || 0,
  }

  return (
    <Box>
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Tasks
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage and track all your tasks
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          size="large"
          sx={{ textTransform: 'none' }}
        >
          New Task
        </Button>
      </Box>

      {/* Status Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={statusFilter}
          onChange={(e, newValue) => setStatusFilter(newValue)}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab
            label={`All (${filteredTasks?.length || 0})`}
            value="all"
            sx={{ textTransform: 'none' }}
          />
          <Tab
            label={`To Do (${tasksByStatus.todo})`}
            value="todo"
            sx={{ textTransform: 'none' }}
          />
          <Tab
            label={`In Progress (${tasksByStatus['in-progress']})`}
            value="in-progress"
            sx={{ textTransform: 'none' }}
          />
          <Tab
            label={`Done (${tasksByStatus.done})`}
            value="done"
            sx={{ textTransform: 'none' }}
          />
        </Tabs>
      </Paper>

      {/* Search and Filter */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            size="small"
            sx={{ flexGrow: 1, minWidth: 250 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Priority</InputLabel>
            <Select
              value={priorityFilter}
              label="Priority"
              onChange={(e) => setPriorityFilter(e.target.value)}
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="high">High</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="low">Low</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Paper>

      {/* Tasks Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
              <TableCell sx={{ fontWeight: 'bold' }}>Task</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Project</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Priority</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Assigned To</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Due Date</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }} align="right">
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredTasks?.map((task) => (
              <TableRow
                key={task.id}
                sx={{
                  '&:hover': { backgroundColor: '#f5f5f5' },
                  cursor: 'pointer',
                }}
              >
                <TableCell>
                  <Typography variant="body2" fontWeight="medium">
                    {task.title}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="text.secondary">
                    {task.project}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={statusColors[task.status].label}
                    size="small"
                    sx={{
                      backgroundColor: statusColors[task.status].bg,
                      color: statusColors[task.status].text,
                      fontWeight: 'medium',
                    }}
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={task.priority}
                    size="small"
                    sx={{
                      backgroundColor: priorityColors[task.priority].bg,
                      color: priorityColors[task.priority].text,
                      fontWeight: 'medium',
                      textTransform: 'capitalize',
                    }}
                  />
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar
                      alt={task.assignedTo.name}
                      src={task.assignedTo.avatar}
                      sx={{ width: 32, height: 32 }}
                    >
                      {task.assignedTo.name.charAt(0)}
                    </Avatar>
                    <Typography variant="body2">
                      {task.assignedTo.name}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {new Date(task.dueDate).toLocaleDateString()}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <IconButton
                    size="small"
                    onClick={(e) => handleMenuOpen(e, task)}
                  >
                    <MoreVert />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleEdit}>Edit</MenuItem>
        <MenuItem onClick={handleDelete}>Delete</MenuItem>
      </Menu>

      {/* Empty State */}
      {filteredTasks?.length === 0 && (
        <Paper
          sx={{
            p: 6,
            textAlign: 'center',
            backgroundColor: '#f5f5f5',
            mt: 3,
          }}
        >
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No tasks found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {searchQuery || statusFilter !== 'all' || priorityFilter !== 'all'
              ? 'Try adjusting your filters'
              : 'Get started by creating your first task'}
          </Typography>
          {!searchQuery && statusFilter === 'all' && priorityFilter === 'all' && (
            <Button variant="contained" startIcon={<AddIcon />}>
              Create Task
            </Button>
          )}
        </Paper>
      )}
    </Box>
  )
}

export default Tasks

// Made with Bob
