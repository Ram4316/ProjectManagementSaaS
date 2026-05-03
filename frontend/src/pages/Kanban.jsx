import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Box,
  Typography,
  Button,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material'
import {
  Add as AddIcon,
  Search as SearchIcon,
} from '@mui/icons-material'
import KanbanBoard from '@components/KanbanBoard'
import { KanbanColumnSkeleton } from '@components/LoadingSkeleton'
import EmptyState from '@components/EmptyState'
import { getTasks, moveTask } from '@services/taskService'
import { getProjects } from '@services/projectService'
import toast from 'react-hot-toast'

const Kanban = () => {
  const queryClient = useQueryClient()
  const [searchQuery, setSearchQuery] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [selectedProject, setSelectedProject] = useState('all')
  const [viewTaskDialog, setViewTaskDialog] = useState(false)
  const [selectedTask, setSelectedTask] = useState(null)

  // Fetch projects
  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: () => getProjects(),
  })

  // Fetch tasks
  const { data: tasks = [], isLoading, error } = useQuery({
    queryKey: ['kanban-tasks', selectedProject, priorityFilter],
    queryFn: () => getTasks({
      projectId: selectedProject !== 'all' ? selectedProject : undefined,
      priority: priorityFilter !== 'all' ? priorityFilter : undefined,
    }),
  })

  // Update task status mutation with optimistic updates
  const updateTaskMutation = useMutation({
    mutationFn: ({ taskId, status }) => moveTask(taskId, status),
    onMutate: async ({ taskId, status }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['kanban-tasks'] })

      // Snapshot previous value
      const previousTasks = queryClient.getQueryData(['kanban-tasks', selectedProject, priorityFilter])

      // Optimistically update to the new value
      queryClient.setQueryData(['kanban-tasks', selectedProject, priorityFilter], (old) =>
        old?.map((task) =>
          task._id === taskId ? { ...task, status } : task
        )
      )

      // Return context with previous value
      return { previousTasks }
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousTasks) {
        queryClient.setQueryData(
          ['kanban-tasks', selectedProject, priorityFilter],
          context.previousTasks
        )
      }
      toast.error('Failed to update task status')
    },
    onSuccess: () => {
      toast.success('Task moved successfully')
    },
    onSettled: () => {
      // Refetch after error or success
      queryClient.invalidateQueries({ queryKey: ['kanban-tasks'] })
    },
  })

  // Handle task move
  const handleTaskMove = (taskId, newStatus) => {
    updateTaskMutation.mutate({ taskId, status: newStatus })
  }

  // Handle add task
  const handleAddTask = (columnId) => {
    console.log('Add task to column:', columnId)
    toast.info('Add task dialog would open here')
    // Implement add task dialog
  }

  // Handle edit task
  const handleEditTask = (task) => {
    console.log('Edit task:', task)
    toast.info('Edit task dialog would open here')
    // Implement edit task dialog
  }

  // Handle delete task
  const handleDeleteTask = (task) => {
    console.log('Delete task:', task)
    toast.info('Delete task confirmation would show here')
    // Implement delete confirmation
  }

  // Handle view task
  const handleViewTask = (task) => {
    setSelectedTask(task)
    setViewTaskDialog(true)
  }

  const handleCloseViewDialog = () => {
    setViewTaskDialog(false)
    setSelectedTask(null)
  }

  // Filter tasks by search
  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesSearch
  })

  if (isLoading) {
    return (
      <Box>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Kanban Board
          </Typography>
        </Box>
        <KanbanColumnSkeleton columns={3} cardsPerColumn={4} />
      </Box>
    )
  }

  if (error) {
    return (
      <Box>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Kanban Board
        </Typography>
        <EmptyState
          icon="error"
          title="Failed to load tasks"
          description={error.message || 'An error occurred while loading tasks'}
          actionLabel="Retry"
          onAction={() => queryClient.invalidateQueries({ queryKey: ['kanban-tasks'] })}
        />
      </Box>
    )
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
            Kanban Board
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Drag and drop tasks to update their status
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          size="large"
          onClick={() => handleAddTask('todo')}
          sx={{ textTransform: 'none' }}
        >
          New Task
        </Button>
      </Box>

      {/* Filters */}
      <Box
        sx={{
          display: 'flex',
          gap: 2,
          mb: 3,
          flexWrap: 'wrap',
          backgroundColor: '#fff',
          p: 2,
          borderRadius: 1,
          boxShadow: 1,
        }}
      >
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
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Project</InputLabel>
          <Select
            value={selectedProject}
            label="Project"
            onChange={(e) => setSelectedProject(e.target.value)}
          >
            <MenuItem value="all">All Projects</MenuItem>
            {projects.map((project) => (
              <MenuItem key={project._id} value={project._id}>
                {project.title}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Kanban Board or Empty State */}
      {filteredTasks.length === 0 ? (
        <EmptyState
          icon="task"
          title="No tasks found"
          description={searchQuery ? 'Try adjusting your search criteria' : 'Create your first task to get started'}
          actionLabel={!searchQuery ? 'Create Task' : undefined}
          onAction={!searchQuery ? () => handleAddTask('todo') : undefined}
        />
      ) : (
        <KanbanBoard
          tasks={filteredTasks}
          onTaskMove={handleTaskMove}
          onAddTask={handleAddTask}
          onEditTask={handleEditTask}
          onDeleteTask={handleDeleteTask}
          onViewTask={handleViewTask}
        />
      )}

      {/* View Task Dialog */}
      <Dialog
        open={viewTaskDialog}
        onClose={handleCloseViewDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h6" fontWeight="bold">
            {selectedTask?.title}
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ py: 2 }}>
            <Typography variant="body1" paragraph>
              {selectedTask?.description}
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mt: 2 }}>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Status
                </Typography>
                <Typography variant="body2" fontWeight="medium">
                  {selectedTask?.status}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Priority
                </Typography>
                <Typography variant="body2" fontWeight="medium">
                  {selectedTask?.priority}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Assigned To
                </Typography>
                <Typography variant="body2" fontWeight="medium">
                  {selectedTask?.assignedTo?.name}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Due Date
                </Typography>
                <Typography variant="body2" fontWeight="medium">
                  {selectedTask?.dueDate}
                </Typography>
              </Box>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseViewDialog}>Close</Button>
          <Button
            variant="contained"
            onClick={() => {
              handleEditTask(selectedTask)
              handleCloseViewDialog()
            }}
          >
            Edit
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default Kanban

// Made with Bob
