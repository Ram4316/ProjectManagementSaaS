import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { taskService } from '@services/taskService'
import toast from 'react-hot-toast'

// Query keys
export const taskKeys = {
  all: ['tasks'],
  lists: () => [...taskKeys.all, 'list'],
  list: (filters) => [...taskKeys.lists(), { filters }],
  details: () => [...taskKeys.all, 'detail'],
  detail: (id) => [...taskKeys.details(), id],
  comments: (id) => [...taskKeys.detail(id), 'comments'],
  timeEntries: (id) => [...taskKeys.detail(id), 'time'],
}

// Get all tasks
export const useTasks = (params = {}) => {
  return useQuery({
    queryKey: taskKeys.list(params),
    queryFn: () => taskService.getTasks(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

// Get single task
export const useTask = (id, options = {}) => {
  return useQuery({
    queryKey: taskKeys.detail(id),
    queryFn: () => taskService.getTask(id),
    enabled: !!id,
    ...options,
  })
}

// Get task comments
export const useTaskComments = (taskId) => {
  return useQuery({
    queryKey: taskKeys.comments(taskId),
    queryFn: () => taskService.getComments(taskId),
    enabled: !!taskId,
  })
}

// Get task time entries
export const useTaskTimeEntries = (taskId) => {
  return useQuery({
    queryKey: taskKeys.timeEntries(taskId),
    queryFn: () => taskService.getTimeEntries(taskId),
    enabled: !!taskId,
  })
}

// Create task mutation
export const useCreateTask = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: taskService.createTask,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() })
      toast.success('Task created successfully')
      return data
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create task')
    },
  })
}

// Update task mutation
export const useUpdateTask = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: taskService.updateTask,
    onMutate: async ({ id, data }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: taskKeys.detail(id) })

      // Snapshot previous value
      const previousTask = queryClient.getQueryData(taskKeys.detail(id))

      // Optimistically update
      queryClient.setQueryData(taskKeys.detail(id), (old) => ({
        ...old,
        ...data,
      }))

      return { previousTask, id }
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousTask) {
        queryClient.setQueryData(
          taskKeys.detail(context.id),
          context.previousTask
        )
      }
      toast.error(err.response?.data?.message || 'Failed to update task')
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() })
      queryClient.invalidateQueries({ queryKey: taskKeys.detail(variables.id) })
      toast.success('Task updated successfully')
    },
  })
}

// Update task status mutation (for Kanban)
export const useUpdateTaskStatus = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: taskService.updateTaskStatus,
    onMutate: async ({ id, status }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: taskKeys.lists() })

      // Snapshot previous value
      const previousTasks = queryClient.getQueriesData({ queryKey: taskKeys.lists() })

      // Optimistically update all task lists
      queryClient.setQueriesData({ queryKey: taskKeys.lists() }, (old) => {
        if (!old) return old
        return old.map((task) =>
          task.id === id ? { ...task, status } : task
        )
      })

      return { previousTasks, id, status }
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousTasks) {
        context.previousTasks.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data)
        })
      }
      toast.error(err.response?.data?.message || 'Failed to update task status')
    },
    onSettled: () => {
      // Refetch after error or success
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() })
    },
  })
}

// Delete task mutation
export const useDeleteTask = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: taskService.deleteTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() })
      toast.success('Task deleted successfully')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete task')
    },
  })
}

// Assign task mutation
export const useAssignTask = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: taskService.assignTask,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: taskKeys.detail(variables.taskId) })
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() })
      toast.success('Task assigned successfully')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to assign task')
    },
  })
}

// Add comment mutation
export const useAddComment = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: taskService.addComment,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: taskKeys.comments(variables.taskId),
      })
      toast.success('Comment added successfully')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to add comment')
    },
  })
}

// Upload attachment mutation
export const useUploadAttachment = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: taskService.uploadAttachment,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: taskKeys.detail(variables.taskId) })
      toast.success('Attachment uploaded successfully')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to upload attachment')
    },
  })
}

// Delete attachment mutation
export const useDeleteAttachment = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: taskService.deleteAttachment,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: taskKeys.detail(variables.taskId) })
      toast.success('Attachment deleted successfully')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete attachment')
    },
  })
}

// Track time mutation
export const useTrackTime = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: taskService.trackTime,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: taskKeys.timeEntries(variables.taskId),
      })
      toast.success('Time tracked successfully')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to track time')
    },
  })
}

// Made with Bob
