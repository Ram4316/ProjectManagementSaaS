# Backend API - Production Ready Node.js with Express

A scalable and production-ready Node.js backend built with Express, featuring modular architecture, Socket.IO support, and comprehensive middleware.

## 🚀 Features

- ✅ ES Modules support
- ✅ Express.js server
- ✅ MongoDB with Mongoose
- ✅ JWT Authentication ready
- ✅ Socket.IO for real-time communication
- ✅ CORS enabled
- ✅ File upload support with Multer
- ✅ Error handling middleware
- ✅ Environment configuration
- ✅ Modular folder structure

## 📁 Project Structure

```
backend/
├── controllers/      # Request handlers
├── models/          # Database models
├── routes/          # API routes
├── middlewares/     # Custom middleware
├── services/        # Business logic
├── utils/           # Utility functions
├── sockets/         # Socket.IO handlers
├── .env             # Environment variables
├── .env.example     # Environment template
├── server.js        # Entry point
└── package.json     # Dependencies
```

## 🛠️ Installation

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or cloud)
- npm or yarn

### Steps

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   - Copy `.env.example` to `.env`
   - Update the values according to your setup

3. **Start the server:**
   ```bash
   # Development mode
   npm run dev

   # Production mode
   npm start

## 🚀 Deployment

For production deployment instructions, see:
- **[DEPLOYMENT_GUIDE.md](../DEPLOYMENT_GUIDE.md)** - Complete deployment guide for Render + Vercel
- **[render.yaml](../render.yaml)** - Render configuration file

Quick deployment checklist:
1. ✅ Set up MongoDB Atlas
2. ✅ Deploy backend to Render
3. ✅ Deploy frontend to Vercel
4. ✅ Configure environment variables
5. ✅ Test all endpoints
   ```

## 🔧 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 5000 |
| `NODE_ENV` | Environment | development |
| `MONGODB_URI` | MongoDB connection string | - |
| `JWT_SECRET` | JWT secret key | - |
| `JWT_EXPIRE` | JWT expiration time | 7d |
| `CORS_ORIGIN` | Allowed CORS origin | http://localhost:3000 |
| `MAX_FILE_SIZE` | Max upload size (bytes) | 5242880 |
| `UPLOAD_PATH` | Upload directory | ./uploads |

## 📡 API Endpoints

### Health Check
```
GET /api/health
```
Returns server status and uptime.

**Response:**
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2026-05-03T09:40:00.000Z",
  "uptime": 123.456,
  "environment": "development"
}
```

## 🔌 Socket.IO

Socket.IO is configured and ready to use. Connection endpoint:
```
ws://localhost:5000
```

### Events
- `connection` - Client connected
- `disconnect` - Client disconnected
- `message` - Echo message example

## 📦 Dependencies

- **express** - Web framework
- **mongoose** - MongoDB ODM
- **dotenv** - Environment configuration
- **cors** - CORS middleware
- **jsonwebtoken** - JWT authentication
- **bcryptjs** - Password hashing
- **multer** - File upload handling
- **socket.io** - Real-time communication

## 🏗️ Development

### Adding New Routes
1. Create route file in `routes/`
2. Import and use in `server.js`

### Adding Middleware
1. Create middleware in `middlewares/`
2. Apply globally or to specific routes

### Database Models
1. Create model in `models/`
2. Use Mongoose schema

## 🔒 Security Best Practices

- Change `JWT_SECRET` in production
- Use strong MongoDB credentials
- Enable rate limiting (add express-rate-limit)
- Implement input validation
- Use helmet for security headers
- Keep dependencies updated

## 📝 Scripts

```bash
npm start       # Start production server
npm run dev     # Start development server with watch mode
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a pull request

## 📄 License

ISC

---

**Built with ❤️ using Node.js and Express**