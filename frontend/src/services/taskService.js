import api from './api'

/**
 * Task Service
 * Handles all task-related API calls
 */

/**
 * Get tasks with filters
 */
export const getTasks = async (filters = {}) => {
  const params = new URLSearchParams()
  
  if (filters.projectId) {
    params.append('projectId', filters.projectId)
  }
  if (filters.status) {
    params.append('status', filters.status)
  }
  if (filters.priority) {
    params.append('priority', filters.priority)
  }
  if (filters.assignedTo) {
    params.append('assignedTo', filters.assignedTo)
  }
  if (filters.overdue) {
    params.append('overdue', filters.overdue)
  }
  
  const response = await api.get(`/tasks?${params.toString()}`)
  return response.data.data.tasks
}

/**
 * Get a single task by ID
 */
export const getTask = async (taskId) => {
  const response = await api.get(`/tasks/${taskId}`)
  return response.data.data.task
}

/**
 * Create a new task
 */
export const createTask = async (taskData) => {
  const response = await api.post('/tasks', taskData)
  return response.data.data.task
}

/**
 * Update a task
 */
export const updateTask = async (taskId, taskData) => {
  const response = await api.put(`/tasks/${taskId}`, taskData)
  return response.data.data.task
}

/**
 * Delete a task
 */
export const deleteTask = async (taskId) => {
  const response = await api.delete(`/tasks/${taskId}`)
  return response.data
}

/**
 * Move task (update status)
 */
export const moveTask = async (taskId, status) => {
  const response = await api.patch(`/tasks/${taskId}/move`, { status })
  return response.data.data.task
}

/**
 * Assign task to user
 */
export const assignTask = async (taskId, assignedTo) => {
  const response = await api.patch(`/tasks/${taskId}/assign`, { assignedTo })
  return response.data.data.task
}

/**
 * Unassign task
 */
export const unassignTask = async (taskId) => {
  const response = await api.patch(`/tasks/${taskId}/unassign`)
  return response.data.data.task
}

/**
 * Add time tracking to task
 */
export const addTimeTracking = async (taskId, minutes) => {
  const response = await api.post(`/tasks/${taskId}/time`, { minutes })
  return response.data.data.task
}

/**
 * Add attachment to task
 */
export const addAttachment = async (taskId, attachmentData) => {
  const response = await api.post(`/tasks/${taskId}/attachments`, attachmentData)
  return response.data.data.task
}

/**
 * Remove attachment from task
 */
export const removeAttachment = async (taskId, attachmentId) => {
  const response = await api.delete(`/tasks/${taskId}/attachments/${attachmentId}`)
  return response.data.data.task
}

/**
 * Get user's assigned tasks
 */
export const getMyAssignedTasks = async (filters = {}) => {
  const params = new URLSearchParams()
  
  if (filters.status) {
    params.append('status', filters.status)
  }
  if (filters.priority) {
    params.append('priority', filters.priority)
  }
  
  const response = await api.get(`/tasks/my/assigned?${params.toString()}`)
  return response.data.data.tasks
}

/**
 * Get overdue tasks
 */
export const getOverdueTasks = async (projectId = null) => {
  const params = new URLSearchParams()
  
  if (projectId) {
    params.append('projectId', projectId)
  }
  
  const response = await api.get(`/tasks/overdue?${params.toString()}`)
  return response.data.data.tasks
}

export const taskService = {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  moveTask,
  assignTask,
  unassignTask,
  addTimeTracking,
  addAttachment,
  removeAttachment,
  getMyAssignedTasks,
  getOverdueTasks,
}

export default taskService
