import { Box, Skeleton, Card, CardContent, Grid } from '@mui/material'

// Card skeleton for project/task cards
export const CardSkeleton = () => (
  <Card>
    <CardContent>
      <Skeleton variant="text" width="60%" height={32} />
      <Skeleton variant="text" width="100%" />
      <Skeleton variant="text" width="100%" />
      <Box sx={{ mt: 2 }}>
        <Skeleton variant="rectangular" height={8} />
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
        <Skeleton variant="circular" width={32} height={32} />
        <Skeleton variant="text" width={80} />
      </Box>
    </CardContent>
  </Card>
)

// Table row skeleton
export const TableRowSkeleton = ({ columns = 5 }) => (
  <Box sx={{ display: 'flex', gap: 2, p: 2, alignItems: 'center' }}>
    {[...Array(columns)].map((_, i) => (
      <Skeleton key={i} variant="text" width={`${100 / columns}%`} height={40} />
    ))}
  </Box>
)

// Dashboard stat card skeleton
export const StatCardSkeleton = () => (
  <Card>
    <CardContent>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Box sx={{ flex: 1 }}>
          <Skeleton variant="text" width="60%" />
          <Skeleton variant="text" width="40%" height={48} />
        </Box>
        <Skeleton variant="circular" width={56} height={56} />
      </Box>
      <Skeleton variant="text" width="80%" />
    </CardContent>
  </Card>
)

// List skeleton
export const ListSkeleton = ({ items = 5 }) => (
  <Box>
    {[...Array(items)].map((_, i) => (
      <Box key={i} sx={{ mb: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
        <Skeleton variant="text" width="70%" height={24} />
        <Skeleton variant="text" width="100%" />
        <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
          <Skeleton variant="circular" width={24} height={24} />
          <Skeleton variant="text" width={100} />
        </Box>
      </Box>
    ))}
  </Box>
)

// Kanban column skeleton
export const KanbanColumnSkeleton = () => (
  <Box sx={{ minWidth: 320, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
    <Skeleton variant="text" width="60%" height={32} sx={{ mb: 2 }} />
    {[...Array(3)].map((_, i) => (
      <Card key={i} sx={{ mb: 2 }}>
        <CardContent>
          <Skeleton variant="text" width="80%" />
          <Skeleton variant="text" width="100%" />
          <Skeleton variant="text" width="100%" />
          <Box sx={{ mt: 2 }}>
            <Skeleton variant="rectangular" height={8} />
          </Box>
        </CardContent>
      </Card>
    ))}
  </Box>
)

// Page skeleton
export const PageSkeleton = () => (
  <Box>
    <Skeleton variant="text" width="40%" height={48} sx={{ mb: 3 }} />
    <Grid container spacing={3}>
      {[...Array(6)].map((_, i) => (
        <Grid item xs={12} sm={6} md={4} key={i}>
          <CardSkeleton />
        </Grid>
      ))}
    </Grid>
  </Box>
)

// Profile skeleton
export const ProfileSkeleton = () => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
    <Skeleton variant="circular" width={80} height={80} />
    <Box sx={{ flex: 1 }}>
      <Skeleton variant="text" width="40%" height={32} />
      <Skeleton variant="text" width="60%" />
    </Box>
  </Box>
)

export default {
  CardSkeleton,
  TableRowSkeleton,
  StatCardSkeleton,
  ListSkeleton,
  KanbanColumnSkeleton,
  PageSkeleton,
  ProfileSkeleton,
}

// Made with Bob
