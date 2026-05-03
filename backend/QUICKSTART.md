# 🚀 Quick Start Guide

Get your backend up and running in minutes!

## Prerequisites

Before you begin, ensure you have:
- ✅ Node.js (v18 or higher) installed
- ✅ MongoDB installed locally OR MongoDB Atlas account
- ✅ npm or yarn package manager

## Installation Steps

### 1. Install Dependencies

```bash
cd backend
npm install
```

This will install all required packages:
- express
- mongoose
- dotenv
- cors
- jsonwebtoken
- bcryptjs
- multer
- socket.io

### 2. Configure Environment

Copy the example environment file:
```bash
cp .env.example .env
```

Edit `.env` and update these critical values:

```env
# Server
PORT=5000
NODE_ENV=development

# Database - IMPORTANT: Update this!
MONGODB_URI=mongodb://localhost:27017/your_database_name

# JWT - IMPORTANT: Change in production!
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d

# CORS
CORS_ORIGIN=http://localhost:3000
```

### 3. Start MongoDB

**Local MongoDB:**
```bash
# Windows
net start MongoDB

# macOS/Linux
sudo systemctl start mongod
```

**MongoDB Atlas:**
- Use your Atlas connection string in `MONGODB_URI`

### 4. Start the Server

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

You should see:
```
✅ MongoDB Connected: localhost
╔════════════════════════════════════════╗
║   🚀 Server running on port 5000      ║
║   📝 Environment: development         ║
║   🌐 Health check: http://localhost:5000/api/health
╚════════════════════════════════════════╝
```

### 5. Test the API

Open your browser or use curl:
```bash
curl http://localhost:5000/api/health
```

Expected response:
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2026-05-03T09:43:00.000Z",
  "uptime": 5.123,
  "environment": "development"
}
```

## 🎯 Next Steps

### Create Your First API Endpoint

1. **Create a model** (`models/user.model.js`):
```javascript
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true }
}, { timestamps: true });

export default mongoose.model('User', userSchema);
```

2. **Create a controller** (`controllers/user.controller.js`):
```javascript
import User from '../models/user.model.js';

export const getUsers = async (req, res, next) => {
  try {
    const users = await User.find();
    res.json({ success: true, data: users });
  } catch (error) {
    next(error);
  }
};
```

3. **Create a route** (`routes/user.routes.js`):
```javascript
import express from 'express';
import { getUsers } from '../controllers/user.controller.js';

const router = express.Router();
router.get('/', getUsers);

export default router;
```

4. **Register route in server.js**:
```javascript
import userRoutes from './routes/user.routes.js';
app.use('/api/users', userRoutes);
```

### Test Socket.IO

Create a simple HTML file to test WebSocket:
```html
<!DOCTYPE html>
<html>
<head>
  <script src="https://cdn.socket.io/4.6.0/socket.io.min.js"></script>
</head>
<body>
  <script>
    const socket = io('http://localhost:5000');
    
    socket.on('connect', () => {
      console.log('Connected:', socket.id);
      socket.emit('message', 'Hello Server!');
    });
    
    socket.on('message', (data) => {
      console.log('Received:', data);
    });
  </script>
</body>
</html>
```

## 🔧 Common Issues & Solutions

### Issue: MongoDB Connection Failed
**Solution:**
- Ensure MongoDB is running
- Check connection string in `.env`
- Verify network access (for Atlas)

### Issue: Port Already in Use
**Solution:**
```bash
# Change PORT in .env file
PORT=5001
```

### Issue: npm not found
**Solution:**
- Install Node.js from https://nodejs.org/
- Restart terminal after installation

### Issue: Module not found errors
**Solution:**
```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

## 📚 Learn More

- **API Documentation**: See `README.md`
- **Project Structure**: See `PROJECT_STRUCTURE.md`
- **Example Code**: Check files in `controllers/`, `models/`, etc.

## 🛠️ Development Tools

### Recommended VS Code Extensions
- ESLint
- Prettier
- REST Client
- MongoDB for VS Code

### Useful npm packages to add
```bash
npm install --save-dev nodemon    # Auto-restart server
npm install helmet                # Security headers
npm install express-rate-limit    # Rate limiting
npm install joi                   # Validation
npm install morgan                # HTTP logging
```

## 🎉 You're Ready!

Your backend is now set up and ready for development. Start building your API endpoints and enjoy coding!

---

**Need help?** Check the README.md or PROJECT_STRUCTURE.md for detailed documentation.