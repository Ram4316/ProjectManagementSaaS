import api from './api'

/**
 * Project Service
 * Handles all project-related API calls
 */

/**
 * Get all projects for the current user
 */
export const getProjects = async (filters = {}) => {
  const params = new URLSearchParams()
  
  if (filters.status) {
    params.append('status', filters.status)
  }
  
  const response = await api.get(`/projects?${params.toString()}`)
  return response.data.data.projects
}

/**
 * Get a single project by ID
 */
export const getProject = async (projectId) => {
  const response = await api.get(`/projects/${projectId}`)
  return response.data.data.project
}

/**
 * Create a new project
 */
export const createProject = async (projectData) => {
  const response = await api.post('/projects', projectData)
  return response.data.data.project
}

/**
 * Update a project
 */
export const updateProject = async (projectId, projectData) => {
  const response = await api.put(`/projects/${projectId}`, projectData)
  return response.data.data.project
}

/**
 * Delete a project
 */
export const deleteProject = async (projectId) => {
  const response = await api.delete(`/projects/${projectId}`)
  return response.data
}

/**
 * Add members to a project
 */
export const addMembers = async (projectId, members) => {
  const response = await api.post(`/projects/${projectId}/members`, { members })
  return response.data.data.project
}

/**
 * Remove a member from a project
 */
export const removeMember = async (projectId, userId) => {
  const response = await api.delete(`/projects/${projectId}/members/${userId}`)
  return response.data.data.project
}

/**
 * Update member role
 */
export const updateMemberRole = async (projectId, userId, role) => {
  const response = await api.put(`/projects/${projectId}/members/${userId}/role`, { role })
  return response.data.data.project
}

/**
 * Get project statistics
 */
export const getProjectStats = async (projectId) => {
  const response = await api.get(`/projects/${projectId}/stats`)
  return response.data.data.stats
}

export default {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  addMembers,
  removeMember,
  updateMemberRole,
  getProjectStats,
}

// Made with Bob
