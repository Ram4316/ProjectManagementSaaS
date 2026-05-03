import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { CssBaseline, Box, CircularProgress } from '@mui/material'
import { ThemeContextProvider } from '@contexts/ThemeContext'
import useAuthStore from '@store/authStore'

// Lazy load components for better performance
const MainLayout = lazy(() => import('@layouts/MainLayout'))
const Dashboard = lazy(() => import('@pages/Dashboard'))
const Login = lazy(() => import('@pages/Login'))
const Register = lazy(() => import('@pages/Register'))
const Projects = lazy(() => import('@pages/Projects'))
const Tasks = lazy(() => import('@pages/Tasks'))
const Kanban = lazy(() => import('@pages/Kanban'))
const PrivateRoute = lazy(() => import('@components/PrivateRoute'))

// Loading fallback component
const LoadingFallback = () => (
  <Box
    sx={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      backgroundColor: 'background.default',
    }}
  >
    <CircularProgress size={60} />
  </Box>
)

function App() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  return (
    <ThemeContextProvider>
      <CssBaseline />
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          {/* Public routes */}
          <Route
            path="/login"
            element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login />}
          />
          <Route
            path="/register"
            element={isAuthenticated ? <Navigate to="/dashboard" /> : <Register />}
          />

          {/* Private routes */}
          <Route
            path="/"
            element={
              <PrivateRoute>
                <MainLayout />
              </PrivateRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="projects" element={<Projects />} />
            <Route path="tasks" element={<Tasks />} />
            <Route path="kanban" element={<Kanban />} />
          </Route>

          {/* 404 */}
          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
      </Suspense>
    </ThemeContextProvider>
  )
}

export default App

// Made with Bob
