import api from './api'

/**
 * Auth Service
 * Handles all authentication-related API calls
 */

/**
 * Register a new user
 */
export const register = async (userData) => {
  const response = await api.post('/auth/register', userData)
  return response.data.data
}

/**
 * Login user
 */
export const login = async (credentials) => {
  const response = await api.post('/auth/login', credentials)
  return response.data.data
}

/**
 * Refresh access token
 */
export const refreshToken = async (refreshToken) => {
  const response = await api.post('/auth/refresh', { refreshToken })
  return response.data.data
}

/**
 * Get current user profile
 */
export const getMe = async () => {
  const response = await api.get('/auth/me')
  return response.data.data.user
}

/**
 * Update user profile
 */
export const updateProfile = async (profileData) => {
  const response = await api.put('/auth/profile', profileData)
  return response.data.data.user
}

/**
 * Change password
 */
export const changePassword = async (passwordData) => {
  const response = await api.put('/auth/password', passwordData)
  return response.data
}

export default {
  register,
  login,
  refreshToken,
  getMe,
  updateProfile,
  changePassword,
}

// Made with Bob
