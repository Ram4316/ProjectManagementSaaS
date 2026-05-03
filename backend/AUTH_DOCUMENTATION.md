# Authentication System Documentation

Complete JWT-based authentication system with access and refresh tokens.

## Overview

The authentication system provides:
- User registration with password hashing
- User login with JWT tokens
- Access token (short-lived) and refresh token (long-lived)
- Protected routes with middleware
- Role-based authorization
- Profile management
- Password change functionality

## Architecture

```
┌─────────────┐
│   Client    │
└──────┬──────┘
       │
       ├─── POST /api/auth/register
       ├─── POST /api/auth/login
       ├─── POST /api/auth/refresh
       ├─── GET  /api/auth/me (Protected)
       ├─── PUT  /api/auth/profile (Protected)
       └─── PUT  /api/auth/password (Protected)
       │
┌──────▼──────┐
│   Routes    │
└──────┬──────┘
       │
┌──────▼──────────┐
│  Middleware     │
│  - protect      │
│  - authorize    │
└──────┬──────────┘
       │
┌──────▼──────────┐
│  Controllers    │
└──────┬──────────┘
       │
┌──────▼──────────┐
│  JWT Utils      │
│  - Generate     │
│  - Verify       │
└──────┬──────────┘
       │
┌──────▼──────────┐
│  User Model     │
│  - bcrypt hash  │
│  - compare pwd  │
└─────────────────┘
```

## Environment Variables

Add these to your `.env` file:

```env
# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here_change_in_production
JWT_EXPIRE=7d
JWT_REFRESH_SECRET=your_jwt_refresh_secret_key_here_change_in_production
JWT_REFRESH_EXPIRE=30d
```

**Important:** Change these secrets in production to strong, random values.

## API Endpoints

### 1. Register User

**Endpoint:** `POST /api/auth/register`

**Access:** Public

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "member"  // Optional: "admin" or "member" (default: "member")
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "member",
      "avatar": null,
      "createdAt": "2026-05-03T09:00:00.000Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Responses:**
- `400` - Validation error (missing fields, invalid email, password too short)
- `400` - User already exists
- `500` - Server error

---

### 2. Login User

**Endpoint:** `POST /api/auth/login`

**Access:** Public

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "member",
      "avatar": null,
      "createdAt": "2026-05-03T09:00:00.000Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Responses:**
- `400` - Missing email or password
- `401` - Invalid credentials
- `500` - Server error

---

### 3. Refresh Access Token

**Endpoint:** `POST /api/auth/refresh`

**Access:** Public

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Responses:**
- `400` - Refresh token required
- `401` - Invalid or expired refresh token
- `401` - User not found
- `500` - Server error

---

### 4. Get Current User

**Endpoint:** `GET /api/auth/me`

**Access:** Private (requires authentication)

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "member",
      "avatar": null,
      "createdAt": "2026-05-03T09:00:00.000Z",
      "updatedAt": "2026-05-03T09:00:00.000Z"
    }
  }
}
```

**Error Responses:**
- `401` - Not authorized (missing or invalid token)
- `404` - User not found
- `500` - Server error

---

### 5. Update Profile

**Endpoint:** `PUT /api/auth/profile`

**Access:** Private (requires authentication)

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Request Body:**
```json
{
  "name": "John Smith",
  "avatar": "https://example.com/avatar.jpg"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "name": "John Smith",
      "email": "john@example.com",
      "role": "member",
      "avatar": "https://example.com/avatar.jpg",
      "updatedAt": "2026-05-03T10:00:00.000Z"
    }
  }
}
```

**Error Responses:**
- `400` - Validation error
- `401` - Not authorized
- `404` - User not found
- `500` - Server error

---

### 6. Change Password

**Endpoint:** `PUT /api/auth/password`

**Access:** Private (requires authentication)

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Request Body:**
```json
{
  "currentPassword": "oldPassword123",
  "newPassword": "newPassword456"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

**Error Responses:**
- `400` - Missing required fields or password too short
- `401` - Current password is incorrect
- `401` - Not authorized
- `404` - User not found
- `500` - Server error

---

## Middleware Usage

### Protect Routes

Use the `protect` middleware to require authentication:

```javascript
import { protect } from './middlewares/auth.js';

router.get('/protected-route', protect, controller);
```

### Role-Based Authorization

Use the `authorize` middleware to restrict by role:

```javascript
import { protect, authorize } from './middlewares/auth.js';

// Only admins can access
router.delete('/admin-only', protect, authorize('admin'), controller);

// Admins and specific members
router.put('/resource', protect, authorize('admin', 'member'), controller);
```

### Optional Authentication

Use `optionalAuth` for routes that work differently for authenticated users:

```javascript
import { optionalAuth } from './middlewares/auth.js';

router.get('/public-route', optionalAuth, controller);
// req.user will be set if authenticated, null otherwise
```

### Check Ownership

Use `checkOwnership` to ensure users can only access their own resources:

```javascript
import { protect, checkOwnership } from './middlewares/auth.js';

// Checks if req.params.userId matches req.user.id
router.get('/users/:userId/data', protect, checkOwnership('userId'), controller);
```

---

## Client-Side Implementation

### 1. Registration

```javascript
const register = async (userData) => {
  const response = await fetch('http://localhost:5000/api/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });

  const data = await response.json();

  if (data.success) {
    // Store tokens
    localStorage.setItem('accessToken', data.data.accessToken);
    localStorage.setItem('refreshToken', data.data.refreshToken);
    return data.data.user;
  }

  throw new Error(data.message);
};
```

### 2. Login

```javascript
const login = async (email, password) => {
  const response = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();

  if (data.success) {
    localStorage.setItem('accessToken', data.data.accessToken);
    localStorage.setItem('refreshToken', data.data.refreshToken);
    return data.data.user;
  }

  throw new Error(data.message);
};
```

### 3. Making Authenticated Requests

```javascript
const fetchProtectedData = async () => {
  const accessToken = localStorage.getItem('accessToken');

  const response = await fetch('http://localhost:5000/api/protected-route', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  const data = await response.json();

  // Handle token expiration
  if (response.status === 401 && data.code === 'TOKEN_EXPIRED') {
    // Refresh token and retry
    await refreshAccessToken();
    return fetchProtectedData(); // Retry request
  }

  return data;
};
```

### 4. Refresh Token

```javascript
const refreshAccessToken = async () => {
  const refreshToken = localStorage.getItem('refreshToken');

  const response = await fetch('http://localhost:5000/api/auth/refresh', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ refreshToken }),
  });

  const data = await response.json();

  if (data.success) {
    localStorage.setItem('accessToken', data.data.accessToken);
    localStorage.setItem('refreshToken', data.data.refreshToken);
    return data.data.accessToken;
  }

  // Refresh token expired, logout user
  logout();
  throw new Error('Session expired. Please login again.');
};
```

### 5. Logout

```javascript
const logout = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  // Redirect to login page
  window.location.href = '/login';
};
```

---

## Security Best Practices

### 1. Token Storage

**Client-Side:**
- Store tokens in `localStorage` or `sessionStorage`
- Consider using `httpOnly` cookies for enhanced security (requires backend changes)
- Never expose tokens in URLs or logs

### 2. Token Expiration

- **Access Token:** Short-lived (7 days default) - used for API requests
- **Refresh Token:** Long-lived (30 days default) - used to get new access tokens
- Implement automatic token refresh before expiration

### 3. Password Security

- Minimum 6 characters (enforced)
- Passwords are hashed using bcrypt with 10 salt rounds
- Never log or expose passwords
- Implement password strength requirements on frontend

### 4. Environment Variables

- Use strong, random secrets for JWT_SECRET and JWT_REFRESH_SECRET
- Never commit `.env` file to version control
- Use different secrets for development and production

### 5. HTTPS

- Always use HTTPS in production
- Tokens transmitted over HTTP can be intercepted

### 6. Rate Limiting

Consider implementing rate limiting for auth endpoints:
```javascript
import rateLimit from 'express-rate-limit';

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  message: 'Too many authentication attempts, please try again later',
});

router.post('/login', authLimiter, login);
router.post('/register', authLimiter, register);
```

---

## Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Error description",
  "code": "ERROR_CODE" // Optional
}
```

Common error codes:
- `TOKEN_EXPIRED` - Access token has expired, refresh needed
- `INVALID_TOKEN` - Token is malformed or invalid

---

## Testing

### Using cURL

**Register:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","password":"password123"}'
```

**Login:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}'
```

**Get Current User:**
```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Using Postman

1. Create a new collection for authentication
2. Add environment variables for `accessToken` and `refreshToken`
3. Set up automatic token refresh in pre-request scripts
4. Test all endpoints with valid and invalid data

---

## Troubleshooting

### "Not authorized to access this route"
- Check if Authorization header is present
- Verify token format: `Bearer <token>`
- Ensure token hasn't expired

### "Invalid access token"
- Token may be malformed
- JWT_SECRET may have changed
- Token may be from a different environment

### "Access token expired"
- Use refresh token endpoint to get new access token
- Implement automatic token refresh on client

### "User not found"
- User may have been deleted
- Token may be for a different database

---

## Future Enhancements

Consider implementing:
- [ ] Email verification
- [ ] Password reset via email
- [ ] Two-factor authentication (2FA)
- [ ] OAuth integration (Google, GitHub, etc.)
- [ ] Session management (track active sessions)
- [ ] Token blacklisting for logout
- [ ] Account lockout after failed attempts
- [ ] Password history (prevent reuse)
- [ ] Security audit logs