import { Box, Typography, Button } from '@mui/material'
import { ErrorOutline, Refresh } from '@mui/icons-material'

const ErrorState = ({
  title = 'Something went wrong',
  message = 'An error occurred while loading this content',
  onRetry,
  showRetry = true,
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        py: 8,
        px: 3,
        textAlign: 'center',
      }}
    >
      <ErrorOutline
        sx={{
          fontSize: 80,
          color: 'error.main',
          mb: 2,
        }}
      />
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        {title}
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: 400 }}>
        {message}
      </Typography>
      {showRetry && (
        <Button
          variant="contained"
          startIcon={<Refresh />}
          onClick={onRetry}
          size="large"
        >
          Try Again
        </Button>
      )}
    </Box>
  )
}

export default ErrorState

// Made with Bob
