import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { projectService } from '@services/projectService'
import toast from 'react-hot-toast'

// Query keys
export const projectKeys = {
  all: ['projects'],
  lists: () => [...projectKeys.all, 'list'],
  list: (filters) => [...projectKeys.lists(), { filters }],
  details: () => [...projectKeys.all, 'detail'],
  detail: (id) => [...projectKeys.details(), id],
  members: (id) => [...projectKeys.detail(id), 'members'],
  stats: (id) => [...projectKeys.detail(id), 'stats'],
}

// Get all projects
export const useProjects = (params = {}) => {
  return useQuery({
    queryKey: projectKeys.list(params),
    queryFn: () => projectService.getProjects(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Get single project
export const useProject = (id, options = {}) => {
  return useQuery({
    queryKey: projectKeys.detail(id),
    queryFn: () => projectService.getProject(id),
    enabled: !!id,
    ...options,
  })
}

// Get project members
export const useProjectMembers = (projectId) => {
  return useQuery({
    queryKey: projectKeys.members(projectId),
    queryFn: () => projectService.getMembers(projectId),
    enabled: !!projectId,
  })
}

// Get project stats
export const useProjectStats = (projectId) => {
  return useQuery({
    queryKey: projectKeys.stats(projectId),
    queryFn: () => projectService.getProjectStats(projectId),
    enabled: !!projectId,
  })
}

// Create project mutation
export const useCreateProject = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: projectService.createProject,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() })
      toast.success('Project created successfully')
      return data
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create project')
    },
  })
}

// Update project mutation
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
      toast.error(err.response?.data?.message || 'Failed to update project')
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() })
      queryClient.invalidateQueries({ queryKey: projectKeys.detail(variables.id) })
      toast.success('Project updated successfully')
    },
  })
}

// Delete project mutation
export const useDeleteProject = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: projectService.deleteProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() })
      toast.success('Project deleted successfully')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete project')
    },
  })
}

// Add member mutation
export const useAddProjectMember = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: projectService.addMember,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: projectKeys.members(variables.projectId),
      })
      toast.success('Member added successfully')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to add member')
    },
  })
}

// Remove member mutation
export const useRemoveProjectMember = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: projectService.removeMember,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: projectKeys.members(variables.projectId),
      })
      toast.success('Member removed successfully')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to remove member')
    },
  })
}

// Made with Bob
