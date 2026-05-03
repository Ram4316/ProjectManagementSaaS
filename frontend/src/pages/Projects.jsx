import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Box,
  Grid,
  Paper,
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  LinearProgress,
  Chip,
  Avatar,
  AvatarGroup,
  IconButton,
  Menu,
  MenuItem,
  TextField,
  InputAdornment,
} from '@mui/material'
import {
  Add as AddIcon,
  MoreVert,
  Search as SearchIcon,
  FilterList,
} from '@mui/icons-material'
import { CardSkeleton } from '@components/LoadingSkeleton'
import EmptyState from '@components/EmptyState'
import { getProjects, deleteProject } from '@services/projectService'
import toast from 'react-hot-toast'

const calculateProgress = (project) => {
  // Calculate progress from project stats if available
  if (project.stats) {
    const { totalTasks, completedTasks } = project.stats
    return totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
  }
  return 0
}

const getProjectStatus = (project) => {
  if (project.status === 'completed') return 'Completed'
  if (project.status === 'archived') return 'Archived'
  return 'In Progress'
}


const ProjectCard = ({ project, onMenuClick }) => {
  const [anchorEl, setAnchorEl] = useState(null)

  const handleMenuOpen = (event) => {
    event.stopPropagation()
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  const handleEdit = () => {
    onMenuClick('edit', project)
    handleMenuClose()
  }

  const handleDelete = () => {
    onMenuClick('delete', project)
    handleMenuClose()
  }

  const statusColors = {
    'In Progress': 'primary',
    'Completed': 'success',
    'On Hold': 'warning',
  }

  return (
    <Card
      elevation={2}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 4,
          cursor: 'pointer',
        },
      }}
    >
      <CardContent sx={{ flexGrow: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Chip
            label={project.status}
            color={statusColors[project.status]}
            size="small"
          />
          <IconButton size="small" onClick={handleMenuOpen}>
            <MoreVert />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={handleEdit}>Edit</MenuItem>
            <MenuItem onClick={handleDelete}>Delete</MenuItem>
          </Menu>
        </Box>

        <Typography variant="h6" fontWeight="bold" gutterBottom>
          {project.title}
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mb: 2,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
          }}
        >
          {project.description}
        </Typography>

        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="body2" color="text.secondary">
              Progress
            </Typography>
            <Typography variant="body2" fontWeight="medium">
              {project.progress}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={project.progress}
            sx={{ height: 8, borderRadius: 4 }}
          />
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Tasks: {project.completedTasks}/{project.tasksCount}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Due: {new Date(project.dueDate).toLocaleDateString()}
          </Typography>
        </Box>
      </CardContent>

      <CardActions sx={{ px: 2, pb: 2 }}>
        <AvatarGroup max={4} sx={{ '& .MuiAvatar-root': { width: 32, height: 32 } }}>
          {project.members.map((member) => (
            <Avatar key={member.id} alt={member.name} src={member.avatar}>
              {member.name.charAt(0)}
            </Avatar>
          ))}
        </AvatarGroup>
        <Box sx={{ flexGrow: 1 }} />
        <Typography variant="body2" color="text.secondary">
          {project.members.length} members
        </Typography>
      </CardActions>
    </Card>
  )
}

const Projects = () => {
  const queryClient = useQueryClient()
  const [searchQuery, setSearchQuery] = useState('')

  const { data: projects = [], isLoading, error } = useQuery({
    queryKey: ['projects'],
    queryFn: getProjects,
  })

  const deleteProjectMutation = useMutation({
    mutationFn: deleteProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      toast.success('Project deleted successfully')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete project')
    },
  })

  const handleMenuClick = (action, project) => {
    if (action === 'edit') {
      toast.info('Edit project dialog would open here')
      // TODO: Implement edit project dialog
    } else if (action === 'delete') {
      if (window.confirm(`Are you sure you want to delete "${project.title}"?`)) {
        deleteProjectMutation.mutate(project._id)
      }
    }
  }

  const filteredProjects = projects.filter((project) =>
    project.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Enhance projects with calculated data
  const enhancedProjects = filteredProjects.map((project) => ({
    ...project,
    progress: calculateProgress(project),
    status: getProjectStatus(project),
    tasksCount: project.stats?.totalTasks || 0,
    completedTasks: project.stats?.completedTasks || 0,
  }))

  if (isLoading) {
    return (
      <Box>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Projects
          </Typography>
        </Box>
        <Grid container spacing={3}>
          <CardSkeleton count={6} />
        </Grid>
      </Box>
    )
  }

  if (error) {
    return (
      <Box>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Projects
        </Typography>
        <EmptyState
          icon="error"
          title="Failed to load projects"
          description={error.message || 'An error occurred while loading projects'}
          actionLabel="Retry"
          onAction={() => queryClient.invalidateQueries({ queryKey: ['projects'] })}
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
            Projects
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage and track all your projects
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          size="large"
          sx={{ textTransform: 'none' }}
        >
          New Project
        </Button>
      </Box>

      {/* Search and Filter */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField
            placeholder="Search projects..."
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
          <Button
            variant="outlined"
            startIcon={<FilterList />}
            sx={{ textTransform: 'none' }}
          >
            Filter
          </Button>
        </Box>
      </Paper>

      {/* Projects Grid or Empty State */}
      {enhancedProjects.length === 0 ? (
        <EmptyState
          icon="folder"
          title="No projects found"
          description={searchQuery ? 'Try adjusting your search criteria' : 'Get started by creating your first project'}
          actionLabel={!searchQuery ? 'Create Project' : undefined}
          onAction={!searchQuery ? () => toast.info('Create project dialog would open here') : undefined}
        />
      ) : (
        <Grid container spacing={3}>
          {enhancedProjects.map((project) => (
            <Grid item xs={12} sm={6} md={4} key={project._id}>
              <ProjectCard project={project} onMenuClick={handleMenuClick} />
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  )
}

export default Projects

// Made with Bob
