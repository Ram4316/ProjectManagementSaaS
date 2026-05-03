# Backend Project Structure

## 📂 Directory Overview

```
backend/
├── controllers/              # Request handlers and business logic routing
│   └── example.controller.js # Example CRUD controller
│
├── models/                   # Database schemas and models
│   └── example.model.js      # Example Mongoose model with validations
│
├── routes/                   # API route definitions
│   └── health.routes.js      # Health check endpoint
│
├── middlewares/              # Custom middleware functions
│   ├── auth.js              # JWT authentication & authorization
│   ├── errorHandler.js      # Global error handling
│   └── notFound.js          # 404 handler
│
├── services/                 # Business logic layer
│   └── example.service.js   # Example service functions
│
├── utils/                    # Utility functions and helpers
│   ├── db.js                # Database connection
│   ├── helpers.js           # Common helper functions
│   └── upload.js            # File upload configuration (Multer)
│
├── sockets/                  # Socket.IO event handlers
│   └── chat.socket.js       # Example chat socket handlers
│
├── .env                      # Environment variables (not in git)
├── .env.example             # Environment template
├── .gitignore               # Git ignore rules
├── package.json             # Dependencies and scripts
├── server.js                # Application entry point
└── README.md                # Project documentation
```

## 🔧 Core Files

### server.js
Main application entry point that:
- Initializes Express app
- Configures middleware (CORS, JSON parsing)
- Sets up Socket.IO
- Connects to database
- Registers routes
- Handles errors
- Starts HTTP server

### package.json
- Configured with `"type": "module"` for ES Modules
- Contains all required dependencies
- Includes npm scripts for development and production

## 📋 Module Descriptions

### Controllers
Handle HTTP requests and responses. They:
- Receive requests from routes
- Call services for business logic
- Return formatted responses
- Handle errors with try-catch

**Example:** `example.controller.js` shows CRUD operations

### Models
Define database schemas using Mongoose:
- Schema definitions with validations
- Indexes for performance
- Virtual fields
- Instance and static methods
- Pre/post hooks

**Example:** `example.model.js` demonstrates a complete model

### Routes
Define API endpoints:
- Map URLs to controller functions
- Apply middleware (auth, validation)
- Group related endpoints

**Example:** `health.routes.js` provides health check endpoint

### Middlewares
Reusable functions that process requests:
- **auth.js**: JWT token verification and role-based access
- **errorHandler.js**: Centralized error handling
- **notFound.js**: 404 error handling

### Services
Business logic layer:
- Complex operations
- Data processing
- External API calls
- Reusable business functions

**Example:** `example.service.js` shows service patterns

### Utils
Helper functions and configurations:
- **db.js**: MongoDB connection with error handling
- **helpers.js**: Common utilities (pagination, validation, etc.)
- **upload.js**: Multer configuration for file uploads

### Sockets
Socket.IO event handlers:
- Real-time communication
- Room management
- Event broadcasting

**Example:** `chat.socket.js` demonstrates chat functionality

## 🚀 Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment:**
   - Copy `.env.example` to `.env`
   - Update values for your environment

3. **Start development server:**
   ```bash
   npm run dev
   ```

4. **Test health endpoint:**
   ```bash
   curl http://localhost:5000/api/health
   ```

## 🔐 Security Features

- JWT authentication ready
- CORS configuration
- Input sanitization helpers
- Error stack traces hidden in production
- File upload restrictions
- Environment variable protection

## 📦 Dependencies

### Core
- **express**: Web framework
- **mongoose**: MongoDB ODM
- **dotenv**: Environment configuration

### Security & Auth
- **jsonwebtoken**: JWT tokens
- **bcryptjs**: Password hashing
- **cors**: CORS middleware

### Features
- **socket.io**: Real-time communication
- **multer**: File upload handling

## 🎯 Best Practices Implemented

1. **Modular Architecture**: Separation of concerns
2. **Error Handling**: Centralized error management
3. **Environment Config**: Secure configuration management
4. **ES Modules**: Modern JavaScript syntax
5. **Async/Await**: Clean asynchronous code
6. **Middleware Pattern**: Reusable request processing
7. **Service Layer**: Business logic separation
8. **Model Validation**: Data integrity at schema level

## 📝 Adding New Features

### Add a new API endpoint:
1. Create controller in `controllers/`
2. Create model in `models/` (if needed)
3. Create route in `routes/`
4. Register route in `server.js`

### Add new middleware:
1. Create file in `middlewares/`
2. Export middleware function
3. Apply in routes or globally in `server.js`

### Add Socket.IO events:
1. Create handler in `sockets/`
2. Initialize in `server.js`
3. Define event listeners

## 🧪 Testing

Add your test files and update package.json scripts:
```json
"scripts": {
  "test": "jest",
  "test:watch": "jest --watch"
}
```

## 📚 Additional Resources

- [Express.js Documentation](https://expressjs.com/)
- [Mongoose Documentation](https://mongoosejs.com/)
- [Socket.IO Documentation](https://socket.io/)
- [JWT Documentation](https://jwt.io/)

---

**Note:** This is a starter template. Customize according to your project needs.