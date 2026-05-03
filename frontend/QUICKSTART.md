# Frontend Quick Start Guide

Get the React frontend up and running in minutes!

## 🚀 Quick Setup (3 Steps)

### Step 1: Install Dependencies

```bash
cd frontend
npm install
```

This will install all required packages:
- React 18
- Material-UI
- React Router DOM
- Zustand
- TanStack React Query
- Axios
- Socket.IO Client
- React Hot Toast

### Step 2: Configure Environment

```bash
cp .env.example .env
```

Edit `.env` and set your backend URL:
```env
VITE_API_URL=http://localhost:5000
```

### Step 3: Start Development Server

```bash
npm run dev
```

The app will be available at: **http://localhost:5173**

## ✅ Verify Setup

1. Open http://localhost:5173 in your browser
2. You should see the Login page
3. Try registering a new account or logging in

## 🔗 Backend Connection

**Important:** Make sure your backend server is running on http://localhost:5000 before starting the frontend.

To start the backend:
```bash
cd backend
npm run dev
```

## 📱 Test the Application

### 1. Register a New User
- Navigate to http://localhost:5173/register
- Fill in the registration form
- Submit to create an account

### 2. Login
- Navigate to http://localhost:5173/login
- Enter your credentials
- You'll be redirected to the Dashboard

### 3. Explore Features
- **Dashboard**: View stats and recent activity
- **Projects**: Manage projects with grid view
- **Tasks**: Track tasks with table view
- **Real-time**: Socket.IO connection status in console

## 🛠️ Development Commands

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🎨 Project Structure Overview

```
frontend/src/
├── components/       # Reusable UI components
│   ├── Navbar.jsx
│   ├── Sidebar.jsx
│   └── PrivateRoute.jsx
├── pages/           # Page components
│   ├── Dashboard.jsx
│   ├── Login.jsx
│   ├── Register.jsx
│   ├── Projects.jsx
│   └── Tasks.jsx
├── layouts/         # Layout wrappers
│   └── MainLayout.jsx
├── hooks/           # Custom React hooks
│   ├── useAuth.js
│   └── useSocket.js
├── store/           # Zustand state stores
│   └── authStore.js
├── services/        # API services
│   ├── api.js
│   └── authService.js
├── App.jsx          # Main app with routing
└── main.jsx         # Entry point
```

## 🔑 Key Features

### Authentication
- JWT-based auth with automatic token refresh
- Protected routes
- Persistent login state

### State Management
- **Zustand**: Global state (auth, user)
- **React Query**: Server state (caching, refetching)

### Real-time
- Socket.IO integration
- Live project/task updates
- Automatic reconnection

### UI/UX
- Material-UI components
- Responsive design
- Toast notifications
- Loading states

## 🐛 Common Issues

### Port Already in Use
If port 5173 is busy:
```bash
# Kill the process using port 5173
npx kill-port 5173

# Or specify a different port
npm run dev -- --port 3000
```

### CORS Errors
Ensure backend CORS is configured:
```js
// backend/server.js
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}))
```

### Module Not Found
Clear cache and reinstall:
```bash
rm -rf node_modules package-lock.json
npm install
```

### Socket Connection Failed
1. Check backend is running
2. Verify VITE_API_URL in .env
3. Check browser console for errors

## 📚 Next Steps

1. **Customize Theme**: Edit Material-UI theme in `src/main.jsx`
2. **Add Pages**: Create new pages in `src/pages/`
3. **Add Components**: Create reusable components in `src/components/`
4. **API Integration**: Connect to real backend endpoints
5. **Add Features**: Implement additional functionality

## 🔗 Useful Links

- [Full Documentation](./README.md)
- [Backend Setup](../backend/QUICKSTART.md)
- [React Docs](https://react.dev)
- [Material-UI Docs](https://mui.com)
- [Vite Docs](https://vitejs.dev)

## 💡 Tips

- Use React DevTools browser extension for debugging
- Check browser console for errors and logs
- Use Network tab to inspect API calls
- Socket.IO connection status logged in console

## 🎯 Default Credentials (Development)

After backend seeding (if implemented):
```
Email: admin@example.com
Password: admin123
```

## 📞 Need Help?

- Check the [README.md](./README.md) for detailed documentation
- Review backend API documentation
- Check browser console for errors
- Verify backend is running and accessible

---

Happy coding! 🚀