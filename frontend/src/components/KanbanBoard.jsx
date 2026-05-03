import { useState } from 'react'
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import { Box } from '@mui/material'
import KanbanColumn from './KanbanColumn'
import TaskCard from './TaskCard'

const KanbanBoard = ({
  tasks,
  onTaskMove,
  onAddTask,
  onEditTask,
  onDeleteTask,
  onViewTask,
}) => {
  const [activeTask, setActiveTask] = useState(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const columns = [
    { id: 'todo', title: 'To Do' },
    { id: 'in-progress', title: 'In Progress' },
    { id: 'done', title: 'Done' },
  ]

  // Group tasks by status
  const tasksByStatus = {
    todo: tasks.filter((task) => task.status === 'todo'),
    'in-progress': tasks.filter((task) => task.status === 'in-progress'),
    done: tasks.filter((task) => task.status === 'done'),
  }

  const handleDragStart = (event) => {
    const { active } = event
    const task = tasks.find((t) => t.id === active.id)
    setActiveTask(task)
  }

  const handleDragOver = (event) => {
    const { active, over } = event

    if (!over) return

    const activeId = active.id
    const overId = over.id

    // Find the task being dragged
    const activeTask = tasks.find((t) => t.id === activeId)
    if (!activeTask) return

    // Check if we're over a column
    const overColumn = columns.find((col) => col.id === overId)
    if (overColumn) {
      // Moving to a different column
      if (activeTask.status !== overColumn.id) {
        onTaskMove(activeId, overColumn.id, 0)
      }
      return
    }

    // Check if we're over another task
    const overTask = tasks.find((t) => t.id === overId)
    if (!overTask) return

    // If tasks are in different columns
    if (activeTask.status !== overTask.status) {
      onTaskMove(activeId, overTask.status, 0)
    } else {
      // Reordering within the same column
      const columnTasks = tasksByStatus[activeTask.status]
      const oldIndex = columnTasks.findIndex((t) => t.id === activeId)
      const newIndex = columnTasks.findIndex((t) => t.id === overId)

      if (oldIndex !== newIndex) {
        const newOrder = arrayMove(columnTasks, oldIndex, newIndex)
        // You can implement position tracking here if needed
        onTaskMove(activeId, activeTask.status, newIndex)
      }
    }
  }

  const handleDragEnd = (event) => {
    const { active, over } = event

    setActiveTask(null)

    if (!over) return

    const activeId = active.id
    const overId = over.id

    if (activeId === overId) return

    // Find the task being dragged
    const activeTask = tasks.find((t) => t.id === activeId)
    if (!activeTask) return

    // Check if we're over a column
    const overColumn = columns.find((col) => col.id === overId)
    if (overColumn) {
      if (activeTask.status !== overColumn.id) {
        onTaskMove(activeId, overColumn.id, 0)
      }
      return
    }

    // Check if we're over another task
    const overTask = tasks.find((t) => t.id === overId)
    if (!overTask) return

    // If tasks are in different columns
    if (activeTask.status !== overTask.status) {
      onTaskMove(activeId, overTask.status, 0)
    } else {
      // Reordering within the same column
      const columnTasks = tasksByStatus[activeTask.status]
      const oldIndex = columnTasks.findIndex((t) => t.id === activeId)
      const newIndex = columnTasks.findIndex((t) => t.id === overId)

      if (oldIndex !== newIndex) {
        onTaskMove(activeId, activeTask.status, newIndex)
      }
    }
  }

  const handleDragCancel = () => {
    setActiveTask(null)
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <Box
        sx={{
          display: 'flex',
          gap: 3,
          overflowX: 'auto',
          pb: 2,
          '&::-webkit-scrollbar': {
            height: '8px',
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: '#f1f1f1',
            borderRadius: '4px',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: '#888',
            borderRadius: '4px',
            '&:hover': {
              backgroundColor: '#555',
            },
          },
        }}
      >
        {columns.map((column) => (
          <KanbanColumn
            key={column.id}
            column={column}
            tasks={tasksByStatus[column.id]}
            onAddTask={onAddTask}
            onEditTask={onEditTask}
            onDeleteTask={onDeleteTask}
            onViewTask={onViewTask}
          />
        ))}
      </Box>

      <DragOverlay>
        {activeTask ? (
          <Box sx={{ cursor: 'grabbing', transform: 'rotate(5deg)' }}>
            <TaskCard
              task={activeTask}
              onEdit={() => {}}
              onDelete={() => {}}
              onView={() => {}}
            />
          </Box>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}

export default KanbanBoard

// Made with Bob
