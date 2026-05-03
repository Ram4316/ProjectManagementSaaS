# API Integration Documentation

Complete guide for integrating frontend with backend APIs using React Query and Axios.

## 📋 Overview

The frontend uses a layered architecture for API integration:
1. **Axios Instance** - HTTP client with interceptors
2. **Service Layer** - API endpoint definitions
3. **React Query Hooks** - Data fetching and caching
4. **Components** - UI that consumes the hooks

## 🔧 Setup

### Axios Configuration

**File:** `src/services/api.js`

```javascript
import axios from 'axios'
import useAuthStore from '@store/authStore'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})
```

### Request Interceptor

Automatically adds authentication token to requests:

```javascript
api.interceptors.request.use(
  (config) => {
    const { accessToken } = useAuthStore.getState()
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`
    }
    return config
  },
  (error) => Promise.reject(error)
)
```

### Response Interceptor

Handles token refresh and error responses:

```javascript
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Handle 401 and refresh token
    if (error.response?.status === 401 && error.response?.data?.code === 'TOKEN_EXPIRED') {
      // Refresh token logic
      const { refreshToken } = useAuthStore.getState()
      const response = await axios.post(`${API_URL}/auth/refresh`, { refreshToken })
      
      // Update tokens and retry request
      useAuthStore.getState().setTokens(newAccessToken, newRefreshToken)
      return api(originalRequest)
    }
    
    // Show error toast
    toast.error(error.response?.data?.message || 'An error occurred')
    return Promise.reject(error)
  }
)
```

## 📦 Service Layer

### Project Service

**File:** `src/services/projectService.js`

```javascript
export const projectService = {
  getProjects: async (params = {}) => {
    const response = await api.get('/projects', { params })
    return response.data
  },
  
  getProject: async (id) => {
    const response = await api.get(`/projects/${id}`)
    return response.data
  },
  
  createProject: async (data) => {
    const response = await api.post('/projects', data)
    return response.data
  },
  
  updateProject: async ({ id, data }) => {
    const response = await api.put(`/projects/${id}`, data)
    return response.data
  },
  
  deleteProject: async (id) => {
    const response = await api.delete(`/projects/${id}`)
    return response.data
  },
}
```

### Task Service

**File:** `src/services/taskService.js`

```javascript
export const taskService = {
  getTasks: async (params = {}) => {
    const response = await api.get('/tasks', { params })
    return response.data
  },
  
  createTask: async (data) => {
    const response = await api.post('/tasks', data)
    return response.data
  },
  
  updateTaskStatus: async ({ id, status }) => {
    const response = await api.patch(`/tasks/${id}/status`, { status })
    return response.data
  },
  
  uploadAttachment: async ({ taskId, file }) => {
    const formData = new FormData()
    formData.append('file', file)
    const response = await api.post(`/tasks/${taskId}/attachments`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response.data
  },
}
```

## 🎣 React Query Hooks

### Query Keys

Organized query keys for cache management:

```javascript
export const projectKeys = {
  all: ['projects'],
  lists: () => [...projectKeys.all, 'list'],
  list: (filters) => [...projectKeys.lists(), { filters }],
  details: () => [...projectKeys.all, 'detail'],
  detail: (id) => [...projectKeys.details(), id],
}
```

### useProjects Hook

**File:** `src/hooks/useProjects.js`

```javascript
export const useProjects = (params = {}) => {
  return useQuery({
    queryKey: projectKeys.list(params),
    queryFn: () => projectService.getProjects(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}
```

**Usage:**
```javascript
const { data: projects, isLoading, error } = useProjects({ status: 'active' })
```

### useCreateProject Hook

```javascript
export const useCreateProject = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: projectService.createProject,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() })
      toast.success('Project created successfully')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create project')
    },
  })
}
```

**Usage:**
```javascript
const createProject = useCreateProject()

const handleSubmit = async (data) => {
  await createProject.mutateAsync(data)
}
```

### useUpdateProject Hook (with Optimistic Updates)

```javascript
export const useUpdateProject = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: projectService.updateProject,
    onMutate: async ({ id, data }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: projectKeys.detail(id) })
      
      // Snapshot previous value
      const previousProject = queryClient.getQueryData(projectKeys.detail(id))
      
      // Optimistically update
      queryClient.setQueryData(projectKeys.detail(id), (old) => ({
        ...old,
        ...data,
      }))
      
      return { previousProject, id }
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousProject) {
        queryClient.setQueryData(
          projectKeys.detail(context.id),
          context.previousProject
        )
      }
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() })
      toast.success('Project updated successfully')
    },
  })
}
```

## 🎯 Usage Examples

### Fetching Data

```javascript
import { useProjects } from '@hooks/useProjects'

function ProjectsList() {
  const { data: projects, isLoading, error } = useProjects()
  
  if (isLoading) return <CircularProgress />
  if (error) return <div>Error: {error.message}</div>
  
  return (
    <div>
      {projects.map(project => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  )
}
```

### Creating Data

```javascript
import { useCreateProject } from '@hooks/useProjects'

function CreateProjectForm() {
  const createProject = useCreateProject()
  
  const handleSubmit = async (formData) => {
    try {
      await createProject.mutateAsync(formData)
      // Success handled by mutation
    } catch (error) {
      // Error handled by mutation
    }
  }
  
  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      <Button 
        type="submit" 
        disabled={createProject.isPending}
      >
        {createProject.isPending ? 'Creating...' : 'Create Project'}
      </Button>
    </form>
  )
}
```

### Updating Data with Optimistic Updates

```javascript
import { useUpdateTaskStatus } from '@hooks/useTasks'

function KanbanBoard() {
  const updateStatus = useUpdateTaskStatus()
  
  const handleTaskMove = (taskId, newStatus) => {
    updateStatus.mutate({ id: taskId, status: newStatus })
    // UI updates immediately, rolls back on error
  }
  
  return <DndContext onDragEnd={handleTaskMove}>...</DndContext>
}
```

### Filtering and Pagination

```javascript
const [filters, setFilters] = useState({ status: 'active', page: 1 })
const { data: projects } = useProjects(filters)

// Update filters
setFilters({ ...filters, status: 'completed' })
// React Query automatically refetches with new filters
```

## 🔄 Cache Management

### Invalidating Queries

```javascript
// Invalidate all project queries
queryClient.invalidateQueries({ queryKey: projectKeys.all })

// Invalidate specific project
queryClient.invalidateQueries({ queryKey: projectKeys.detail(projectId) })

// Invalidate with filters
queryClient.invalidateQueries({ 
  queryKey: projectKeys.lists(),
  exact: false 
})
```

### Prefetching Data

```javascript
// Prefetch project details on hover
const handleMouseEnter = (projectId) => {
  queryClient.prefetchQuery({
    queryKey: projectKeys.detail(projectId),
    queryFn: () => projectService.getProject(projectId),
  })
}
```

### Manual Cache Updates

```javascript
// Update cache after mutation
queryClient.setQueryData(projectKeys.detail(id), (old) => ({
  ...old,
  title: 'New Title',
}))
```

## 🎨 Loading States

### Component-Level Loading

```javascript
function ProjectDetails({ id }) {
  const { data: project, isLoading, isFetching } = useProject(id)
  
  if (isLoading) return <Skeleton />
  if (isFetching) return <LinearProgress />
  
  return <div>{project.title}</div>
}
```

### Global Loading Indicator

```javascript
import { useIsFetching } from '@tanstack/react-query'

function GlobalLoader() {
  const isFetching = useIsFetching()
  
  return isFetching > 0 ? <LinearProgress /> : null
}
```

## ❌ Error Handling

### Query-Level Error Handling

```javascript
const { data, error, isError } = useProjects()

if (isError) {
  return <Alert severity="error">{error.message}</Alert>
}
```

### Global Error Boundary

```javascript
// Already implemented in ErrorBoundary.jsx
<ErrorBoundary>
  <App />
</ErrorBoundary>
```

### Retry Logic

```javascript
const { data } = useQuery({
  queryKey: ['projects'],
  queryFn: fetchProjects,
  retry: 3, // Retry 3 times
  retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
})
```

## 🔐 Authentication Flow

### Login

```javascript
import { useAuth } from '@hooks/useAuth'

function LoginPage() {
  const { login, isLoggingIn } = useAuth()
  
  const handleLogin = async (credentials) => {
    await login(credentials)
    // Redirects to dashboard on success
  }
}
```

### Logout

```javascript
const { logout } = useAuth()

const handleLogout = async () => {
  await logout()
  // Clears cache and redirects to login
}
```

### Token Refresh

Automatic token refresh is handled by the axios interceptor. No manual intervention needed.

## 📊 React Query DevTools

Access DevTools in development:
- Press `Ctrl + Shift + D` (or `Cmd + Shift + D` on Mac)
- Or click the floating React Query icon

Features:
- View all queries and their states
- Inspect query data
- Manually trigger refetches
- View query timelines

## 🎯 Best Practices

### 1. Use Query Keys Consistently

```javascript
// ✅ Good
const projectKeys = {
  all: ['projects'],
  detail: (id) => [...projectKeys.all, id],
}

// ❌ Bad
useQuery({ queryKey: ['project', id] })
useQuery({ queryKey: ['projects', id] })
```

### 2. Implement Optimistic Updates

```javascript
// For better UX, update UI immediately
onMutate: async (newData) => {
  await queryClient.cancelQueries({ queryKey: ['tasks'] })
  const previousTasks = queryClient.getQueryData(['tasks'])
  queryClient.setQueryData(['tasks'], (old) => [...old, newData])
  return { previousTasks }
}
```

### 3. Handle Loading States

```javascript
// Show skeleton loaders
if (isLoading) return <Skeleton />

// Show inline loading for refetches
if (isFetching) return <LinearProgress />
```

### 4. Set Appropriate Stale Times

```javascript
// Frequently changing data
staleTime: 1 * 60 * 1000 // 1 minute

// Rarely changing data
staleTime: 30 * 60 * 1000 // 30 minutes
```

### 5. Use Enabled Option

```javascript
// Only fetch when ID is available
const { data } = useProject(id, { enabled: !!id })
```

## 🐛 Debugging

### Check Network Requests

```javascript
// Log all requests
api.interceptors.request.use((config) => {
  console.log('Request:', config.method, config.url)
  return config
})
```

### Inspect Query Cache

```javascript
// In component
const queryClient = useQueryClient()
console.log(queryClient.getQueryData(projectKeys.all))
```

### Monitor Query States

Use React Query DevTools to see:
- Query status (loading, success, error)
- Data freshness
- Refetch intervals
- Cache size

## 📝 API Endpoints

### Projects

- `GET /api/projects` - List projects
- `GET /api/projects/:id` - Get project
- `POST /api/projects` - Create project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project
- `GET /api/projects/:id/members` - Get members
- `POST /api/projects/:id/members` - Add member

### Tasks

- `GET /api/tasks` - List tasks
- `GET /api/tasks/:id` - Get task
- `POST /api/tasks` - Create task
- `PUT /api/tasks/:id` - Update task
- `PATCH /api/tasks/:id/status` - Update status
- `DELETE /api/tasks/:id` - Delete task
- `POST /api/tasks/:id/comments` - Add comment
- `POST /api/tasks/:id/attachments` - Upload file

### Authentication

- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh token
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile

## 🔗 Related Files

- `src/services/api.js` - Axios configuration
- `src/services/projectService.js` - Project API methods
- `src/services/taskService.js` - Task API methods
- `src/services/authService.js` - Auth API methods
- `src/hooks/useProjects.js` - Project React Query hooks
- `src/hooks/useTasks.js` - Task React Query hooks
- `src/hooks/useAuth.js` - Auth React Query hooks
- `src/components/ErrorBoundary.jsx` - Error boundary

## 📚 Resources

- [React Query Documentation](https://tanstack.com/query/latest)
- [Axios Documentation](https://axios-http.com/)
- [Backend API Documentation](../backend/README.md)

---

Built with ❤️ using React Query and Axios