import { useQuery } from '@tanstack/react-query'
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  LinearProgress,
  Chip,
  Avatar,
  AvatarGroup,
  IconButton,
} from '@mui/material'
import {
  TrendingUp,
  Assignment,
  FolderOpen,
  People,
  MoreVert,
} from '@mui/icons-material'
import { useAuthStore } from '@store/authStore'
import api from '@services/api'

// Mock data - will be replaced with real API calls
const fetchDashboardStats = async () => {
  // const response = await api.get('/api/dashboard/stats')
  // return response.data
  return {
    totalProjects: 12,
    activeProjects: 8,
    totalTasks: 45,
    completedTasks: 28,
    teamMembers: 15,
    projectsChange: '+12%',
    tasksChange: '+8%',
  }
}

const fetchRecentProjects = async () => {
  // const response = await api.get('/api/projects?limit=5')
  // return response.data
  return [
    {
      id: 1,
      title: 'Website Redesign',
      progress: 75,
      members: 4,
      dueDate: '2026-05-15',
      status: 'In Progress',
    },
    {
      id: 2,
      title: 'Mobile App Development',
      progress: 45,
      members: 6,
      dueDate: '2026-06-20',
      status: 'In Progress',
    },
    {
      id: 3,
      title: 'Marketing Campaign',
      progress: 90,
      members: 3,
      dueDate: '2026-05-10',
      status: 'In Progress',
    },
  ]
}

const fetchRecentTasks = async () => {
  // const response = await api.get('/api/tasks?limit=5')
  // return response.data
  return [
    {
      id: 1,
      title: 'Update landing page design',
      project: 'Website Redesign',
      priority: 'high',
      dueDate: '2026-05-05',
    },
    {
      id: 2,
      title: 'Implement authentication',
      project: 'Mobile App',
      priority: 'high',
      dueDate: '2026-05-08',
    },
    {
      id: 3,
      title: 'Create social media content',
      project: 'Marketing Campaign',
      priority: 'medium',
      dueDate: '2026-05-06',
    },
    {
      id: 4,
      title: 'Fix responsive issues',
      project: 'Website Redesign',
      priority: 'low',
      dueDate: '2026-05-12',
    },
  ]
}

const StatCard = ({ title, value, change, icon: Icon, color }) => (
  <Card elevation={2}>
    <CardContent>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Box>
          <Typography color="text.secondary" variant="body2" gutterBottom>
            {title}
          </Typography>
          <Typography variant="h4" fontWeight="bold">
            {value}
          </Typography>
        </Box>
        <Box
          sx={{
            backgroundColor: `${color}20`,
            borderRadius: 2,
            p: 1.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon sx={{ color, fontSize: 32 }} />
        </Box>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <TrendingUp sx={{ color: '#4caf50', fontSize: 16 }} />
        <Typography variant="body2" color="#4caf50" fontWeight="medium">
          {change}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          from last month
        </Typography>
      </Box>
    </CardContent>
  </Card>
)

const ProjectCard = ({ project }) => (
  <Paper sx={{ p: 2, mb: 2 }}>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
      <Typography variant="h6" fontWeight="medium">
        {project.title}
      </Typography>
      <IconButton size="small">
        <MoreVert />
      </IconButton>
    </Box>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
      <Chip
        label={project.status}
        size="small"
        color="primary"
        variant="outlined"
      />
      <Typography variant="body2" color="text.secondary">
        Due: {new Date(project.dueDate).toLocaleDateString()}
      </Typography>
    </Box>
    <Box sx={{ mb: 1 }}>
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
    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
      <AvatarGroup max={4} sx={{ '& .MuiAvatar-root': { width: 28, height: 28 } }}>
        {[...Array(project.members)].map((_, i) => (
          <Avatar key={i} sx={{ fontSize: 12 }}>
            {String.fromCharCode(65 + i)}
          </Avatar>
        ))}
      </AvatarGroup>
      <Typography variant="body2" color="text.secondary">
        {project.members} members
      </Typography>
    </Box>
  </Paper>
)

const TaskItem = ({ task }) => {
  const priorityColors = {
    high: '#f44336',
    medium: '#ff9800',
    low: '#4caf50',
  }

  return (
    <Paper sx={{ p: 2, mb: 1.5 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
        <Typography variant="body1" fontWeight="medium">
          {task.title}
        </Typography>
        <Chip
          label={task.priority}
          size="small"
          sx={{
            backgroundColor: `${priorityColors[task.priority]}20`,
            color: priorityColors[task.priority],
            fontWeight: 'medium',
          }}
        />
      </Box>
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Typography variant="body2" color="text.secondary">
          {task.project}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Due: {new Date(task.dueDate).toLocaleDateString()}
        </Typography>
      </Box>
    </Paper>
  )
}

const Dashboard = () => {
  const { user } = useAuthStore()

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: fetchDashboardStats,
  })

  const { data: recentProjects, isLoading: projectsLoading } = useQuery({
    queryKey: ['recentProjects'],
    queryFn: fetchRecentProjects,
  })

  const { data: recentTasks, isLoading: tasksLoading } = useQuery({
    queryKey: ['recentTasks'],
    queryFn: fetchRecentTasks,
  })

  if (statsLoading || projectsLoading || tasksLoading) {
    return (
      <Box sx={{ width: '100%', mt: 2 }}>
        <LinearProgress />
      </Box>
    )
  }

  return (
    <Box>
      {/* Welcome Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Welcome back, {user?.name || 'User'}! 👋
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Here's what's happening with your projects today.
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Projects"
            value={stats?.totalProjects || 0}
            change={stats?.projectsChange || '0%'}
            icon={FolderOpen}
            color="#1976d2"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Active Projects"
            value={stats?.activeProjects || 0}
            change={stats?.projectsChange || '0%'}
            icon={TrendingUp}
            color="#4caf50"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Tasks"
            value={stats?.totalTasks || 0}
            change={stats?.tasksChange || '0%'}
            icon={Assignment}
            color="#ff9800"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Team Members"
            value={stats?.teamMembers || 0}
            change="+5%"
            icon={People}
            color="#9c27b0"
          />
        </Grid>
      </Grid>

      {/* Recent Projects and Tasks */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Recent Projects
            </Typography>
            <Box sx={{ mt: 2 }}>
              {recentProjects?.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Recent Tasks
            </Typography>
            <Box sx={{ mt: 2 }}>
              {recentTasks?.map((task) => (
                <TaskItem key={task.id} task={task} />
              ))}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  )
}

export default Dashboard

// Made with Bob
