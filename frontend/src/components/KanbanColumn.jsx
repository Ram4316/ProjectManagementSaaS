import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Paper, Box, Typography, Chip, IconButton } from '@mui/material'
import { Add as AddIcon } from '@mui/icons-material'
import TaskCard from './TaskCard'

const KanbanColumn = ({
  column,
  tasks,
  onAddTask,
  onEditTask,
  onDeleteTask,
  onViewTask,
}) => {
  const { setNodeRef } = useDroppable({
    id: column.id,
  })

  const columnColors = {
    todo: { bg: '#e3f2fd', border: '#1976d2', text: '#1976d2' },
    'in-progress': { bg: '#fff3e0', border: '#f57c00', text: '#f57c00' },
    done: { bg: '#e8f5e9', border: '#388e3c', text: '#388e3c' },
  }

  const colors = columnColors[column.id] || columnColors.todo

  return (
    <Paper
      elevation={2}
      sx={{
        minWidth: 320,
        maxWidth: 380,
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#fafafa',
        borderTop: `3px solid ${colors.border}`,
      }}
    >
      {/* Column Header */}
      <Box
        sx={{
          p: 2,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid #e0e0e0',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="h6" fontWeight="bold" color={colors.text}>
            {column.title}
          </Typography>
          <Chip
            label={tasks.length}
            size="small"
            sx={{
              backgroundColor: colors.bg,
              color: colors.text,
              fontWeight: 'bold',
              minWidth: 32,
            }}
          />
        </Box>
        <IconButton
          size="small"
          onClick={() => onAddTask(column.id)}
          sx={{
            color: colors.text,
            '&:hover': {
              backgroundColor: colors.bg,
            },
          }}
        >
          <AddIcon />
        </IconButton>
      </Box>

      {/* Column Content */}
      <Box
        ref={setNodeRef}
        sx={{
          p: 2,
          flexGrow: 1,
          overflowY: 'auto',
          minHeight: 400,
          maxHeight: 'calc(100vh - 280px)',
          '&::-webkit-scrollbar': {
            width: '8px',
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
        <SortableContext
          items={tasks.map((task) => task.id)}
          strategy={verticalListSortingStrategy}
        >
          {tasks.length === 0 ? (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                py: 4,
                color: 'text.secondary',
              }}
            >
              <Typography variant="body2" color="text.secondary">
                No tasks yet
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Drag tasks here or click + to add
              </Typography>
            </Box>
          ) : (
            tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onEdit={onEditTask}
                onDelete={onDeleteTask}
                onView={onViewTask}
              />
            ))
          )}
        </SortableContext>
      </Box>
    </Paper>
  )
}

export default KanbanColumn

// Made with Bob
