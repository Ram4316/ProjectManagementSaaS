# Project Management SaaS - Frontend

Modern React frontend application built with Vite, Material-UI, and real-time collaboration features.

## 🚀 Tech Stack

- **React 18** - UI library
- **Vite** - Build tool and dev server
- **Material-UI (MUI)** - Component library
- **React Router DOM v6** - Routing
- **Zustand** - State management
- **TanStack React Query** - Server state management
- **Axios** - HTTP client
- **Socket.IO Client** - Real-time communication
- **React Hot Toast** - Notifications
- **@dnd-kit** - Drag-and-drop functionality

## 📁 Project Structure

```
frontend/
├── public/              # Static assets
├── src/
│   ├── components/      # Reusable components
│   │   ├── Navbar.jsx
│   │   ├── Sidebar.jsx
│   │   ├── PrivateRoute.jsx
│   │   ├── KanbanBoard.jsx
│   │   ├── KanbanColumn.jsx
│   │   └── TaskCard.jsx
│   ├── pages/          # Page components
│   │   ├── Dashboard.jsx
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── Projects.jsx
│   │   ├── Tasks.jsx
│   │   └── Kanban.jsx
│   ├── layouts/        # Layout components
│   │   └── MainLayout.jsx
│   ├── hooks/          # Custom React hooks
│   │   ├── useAuth.js
│   │   └── useSocket.js
│   ├── store/          # Zustand stores
│   │   └── authStore.js
│   ├── services/       # API services
│   │   ├── api.js
│   │   └── authService.js
│   ├── App.jsx         # Main app component
│   ├── main.jsx        # Entry point
│   └── index.css       # Global styles
├── .env.example        # Environment variables template
├── .gitignore
├── package.json
├── vite.config.js      # Vite configuration
└── README.md
```

## 🛠️ Setup Instructions

### Prerequisites

- Node.js 18+ and npm/yarn
- Backend server running on http://localhost:5000

### Installation

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   ```bash
   cp .env.example .env
   ```
   
   Update `.env` with your configuration:
   ```env
   VITE_API_URL=http://localhost:5000
   ```

4. **Start development server:**
   ```bash
   npm run dev
   ```

   The app will be available at http://localhost:5173

## 📦 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint (if configured)
## 🎯 Kanban Board Feature

The application includes a fully-featured drag-and-drop Kanban board for visual task management.

### Features
- ✅ Drag-and-drop tasks between columns (To Do, In Progress, Done)
- ✅ Reorder tasks within columns
- ✅ Smooth animations and transitions
- ✅ Optimistic UI updates for instant feedback
- ✅ Real-time status persistence via API
- ✅ Search and filter tasks
- ✅ Priority color coding
- ✅ Quick actions (view, edit, delete)

### Usage
Navigate to `/kanban` to access the Kanban board. Drag tasks between columns to update their status. Changes are automatically saved to the backend.

For detailed documentation, see [KANBAN_DOCUMENTATION.md](./KANBAN_DOCUMENTATION.md)


## 🔑 Key Features

### Authentication
- JWT-based authentication with access and refresh tokens
- Automatic token refresh on expiration
- Protected routes with authentication checks
- Persistent login state using localStorage

### State Management
- **Zustand** for global state (auth, user data)
- **React Query** for server state (caching, refetching)
- Automatic cache invalidation on mutations

### Real-time Features
- Socket.IO integration for live updates
- Project and task real-time synchronization
- Notification system for events
- Automatic reconnection handling

### UI/UX
- Material-UI components for consistent design
- Responsive layout (mobile, tablet, desktop)
- Dark/light theme support (configurable)
- Toast notifications for user feedback
- Loading states and error handling

## 🎨 Component Overview

### Layout Components

#### MainLayout
Main application layout with sidebar and navbar.
```jsx
import MainLayout from '@layouts/MainLayout'
```

#### Navbar
Top navigation bar with user menu and notifications.
```jsx
import Navbar from '@components/Navbar'
```

#### Sidebar
Side navigation menu with route links.
```jsx
import Sidebar from '@components/Sidebar'
```

### Page Components

#### Dashboard
Overview page with stats, recent projects, and tasks.
```jsx
import Dashboard from '@pages/Dashboard'
```

#### Projects
Project management page with grid view and filters.
```jsx
import Projects from '@pages/Projects'
```

#### Tasks
Task management page with table view and status filters.
```jsx
import Tasks from '@pages/Tasks'
```

#### Login/Register
Authentication pages with form validation.
```jsx
import Login from '@pages/Login'
import Register from '@pages/Register'
```

## 🔌 Custom Hooks

### useAuth
Authentication hook with login, register, and logout functions.

```jsx
import { useAuth } from '@hooks/useAuth'

function MyComponent() {
  const { user, isAuthenticated, login, logout } = useAuth()
  
  // Use authentication methods
}
```

### useSocket
Socket.IO hook for real-time communication.

```jsx
import { useSocket } from '@hooks/useSocket'

function MyComponent() {
  const { socket, isConnected, joinRoom, sendMessage } = useSocket()
  
  // Use socket methods
}
```

### useProjectSocket
Project-specific socket events.

```jsx
import { useProjectSocket } from '@hooks/useSocket'

function ProjectComponent({ projectId }) {
  const { projectUpdates } = useProjectSocket(projectId)
  
  // Receive real-time project updates
}
```

## 🌐 API Integration

### API Service
Centralized Axios instance with interceptors.

```jsx
import api from '@services/api'

// Make API calls
const response = await api.get('/api/projects')
const data = await api.post('/api/tasks', taskData)
```

### Auth Service
Authentication-specific API methods.

```jsx
import { authService } from '@services/authService'

// Login
const { user, accessToken } = await authService.login(credentials)

// Register
const { user, accessToken } = await authService.register(userData)

// Logout
await authService.logout()
```

## 🔐 Authentication Flow

1. User submits login credentials
2. Frontend sends request to `/api/auth/login`
3. Backend validates and returns access + refresh tokens
4. Tokens stored in Zustand store (persisted to localStorage)
5. Access token included in all API requests via interceptor
6. On 401 error, refresh token used to get new access token
7. If refresh fails, user redirected to login

## 🎯 Routing

Protected routes require authentication:

```jsx
<Route element={<PrivateRoute />}>
  <Route element={<MainLayout />}>
    <Route path="/dashboard" element={<Dashboard />} />
    <Route path="/projects" element={<Projects />} />
    <Route path="/tasks" element={<Tasks />} />
  </Route>
</Route>
```

Public routes:
```jsx
<Route path="/login" element={<Login />} />
<Route path="/register" element={<Register />} />
```

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

This creates an optimized production build in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

### Deploy to Vercel/Netlify

1. Connect your repository
2. Set build command: `npm run build`
3. Set output directory: `dist`
4. Add environment variables

### Environment Variables for Production

```env
VITE_API_URL=https://your-api-domain.com
```

## 🔧 Configuration

### Vite Config
Path aliases and proxy configuration in `vite.config.js`:

```js
export default defineConfig({
  resolve: {
    alias: {
      '@': '/src',
      '@components': '/src/components',
      '@pages': '/src/pages',
      // ... more aliases
    }
  },
  server: {
    proxy: {
      '/api': 'http://localhost:5000'
    }
  }
})
```

### Material-UI Theme
Customize theme in `src/main.jsx`:

```jsx
import { createTheme, ThemeProvider } from '@mui/material/styles'

const theme = createTheme({
  palette: {
    primary: { main: '#1976d2' },
    secondary: { main: '#dc004e' },
  },
})
```

## 📱 Responsive Design

The application is fully responsive with breakpoints:
- **xs**: 0-600px (mobile)
- **sm**: 600-900px (tablet)
- **md**: 900-1200px (small desktop)
- **lg**: 1200-1536px (desktop)
- **xl**: 1536px+ (large desktop)

## 🐛 Troubleshooting

### Common Issues

**Issue: CORS errors**
- Ensure backend CORS is configured correctly
- Check API_URL in .env file

**Issue: Socket connection fails**
- Verify backend Socket.IO server is running
- Check firewall/network settings
- Ensure correct Socket.IO URL

**Issue: Token refresh loop**
- Clear localStorage and login again
- Check backend refresh token endpoint

**Issue: Build fails**
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Check for TypeScript errors if using TS

## 📚 Additional Resources

- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
- [Material-UI Documentation](https://mui.com)
- [React Router Documentation](https://reactrouter.com)
- [Zustand Documentation](https://github.com/pmndrs/zustand)
- [TanStack Query Documentation](https://tanstack.com/query)
- [Socket.IO Client Documentation](https://socket.io/docs/v4/client-api/)

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 👥 Support

For issues and questions:
- Create an issue in the repository
- Contact the development team
- Check documentation

---

Built with ❤️ using React and Material-UI