import { useAuthStore } from '@store/authStore'
import { authService } from '@services/authService'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

export const useAuth = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { user, accessToken, setAuth, logout: logoutStore } = useAuthStore()

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: authService.login,
    onSuccess: (data) => {
      setAuth(data.user, data.accessToken, data.refreshToken)
      queryClient.invalidateQueries()
      toast.success('Login successful!')
      navigate('/dashboard')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Login failed')
    },
  })

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: authService.register,
    onSuccess: (data) => {
      setAuth(data.user, data.accessToken, data.refreshToken)
      queryClient.invalidateQueries()
      toast.success('Registration successful!')
      navigate('/dashboard')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Registration failed')
    },
  })

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: authService.logout,
    onSuccess: () => {
      logoutStore()
      queryClient.clear()
      toast.success('Logged out successfully')
      navigate('/login')
    },
    onError: (error) => {
      // Even if logout fails on server, clear local state
      logoutStore()
      queryClient.clear()
      toast.error(error.response?.data?.message || 'Logout failed')
      navigate('/login')
    },
  })

  // Login function
  const login = async (credentials) => {
    return loginMutation.mutateAsync(credentials)
  }

  // Register function
  const register = async (userData) => {
    return registerMutation.mutateAsync(userData)
  }

  // Logout function
  const logout = async () => {
    return logoutMutation.mutateAsync()
  }

  // Check if user is authenticated
  const isAuthenticated = !!accessToken && !!user

  // Check if user has a specific role
  const hasRole = (role) => {
    return user?.role === role
  }

  // Check if user is admin
  const isAdmin = hasRole('admin')

  return {
    user,
    accessToken,
    isAuthenticated,
    isAdmin,
    hasRole,
    login,
    register,
    logout,
    isLoggingIn: loginMutation.isPending,
    isRegistering: registerMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
  }
}

// Made with Bob
