// Debounce function for search inputs
export const debounce = (func, delay = 300) => {
  let timeoutId
  return (...args) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func(...args), delay)
  }
}

// Throttle function for scroll events
export const throttle = (func, limit = 100) => {
  let inThrottle
  return (...args) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

// Lazy load images
export const lazyLoadImage = (src, placeholder = '/placeholder.png') => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.src = src
    img.onload = () => resolve(src)
    img.onerror = () => resolve(placeholder)
  })
}

// Check if element is in viewport
export const isInViewport = (element) => {
  const rect = element.getBoundingClientRect()
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  )
}

// Format file size
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

// Truncate text
export const truncateText = (text, maxLength = 100) => {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

// Generate random color
export const generateColor = (seed) => {
  const colors = [
    '#1976d2', '#dc004e', '#388e3c', '#f57c00',
    '#7b1fa2', '#0097a7', '#c62828', '#5d4037'
  ]
  const index = seed ? seed.charCodeAt(0) % colors.length : Math.floor(Math.random() * colors.length)
  return colors[index]
}

// Get initials from name
export const getInitials = (name) => {
  if (!name) return '?'
  const parts = name.split(' ')
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
}

// Format date relative (e.g., "2 hours ago")
export const formatRelativeTime = (date) => {
  const now = new Date()
  const diff = now - new Date(date)
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 7) return new Date(date).toLocaleDateString()
  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`
  return 'Just now'
}

// Memoize expensive computations
export const memoize = (fn) => {
  const cache = new Map()
  return (...args) => {
    const key = JSON.stringify(args)
    if (cache.has(key)) return cache.get(key)
    const result = fn(...args)
    cache.set(key, result)
    return result
  }
}

// Performance monitoring
export const measurePerformance = (name, fn) => {
  const start = performance.now()
  const result = fn()
  const end = performance.now()
  console.log(`${name} took ${(end - start).toFixed(2)}ms`)
  return result
}

// Batch updates
export const batchUpdates = (updates, batchSize = 10) => {
  return new Promise((resolve) => {
    let index = 0
    const processBatch = () => {
      const batch = updates.slice(index, index + batchSize)
      batch.forEach(update => update())
      index += batchSize
      if (index < updates.length) {
        requestAnimationFrame(processBatch)
      } else {
        resolve()
      }
    }
    processBatch()
  })
}

export default {
  debounce,
  throttle,
  lazyLoadImage,
  isInViewport,
  formatFileSize,
  truncateText,
  generateColor,
  getInitials,
  formatRelativeTime,
  memoize,
  measurePerformance,
  batchUpdates,
}

// Made with Bob
