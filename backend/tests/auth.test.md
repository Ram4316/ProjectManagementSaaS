# Authentication System Test Guide

This guide provides manual testing steps for the authentication system.

## Prerequisites

1. Ensure MongoDB is running
2. Start the server: `npm run dev`
3. Server should be running on `http://localhost:5000`

## Test Cases

### 1. User Registration

**Test Case 1.1: Successful Registration**

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "role": "member"
  }'
```

**Expected Result:**
- Status: 201
- Response contains user data, accessToken, and refreshToken
- Password is not included in response

**Test Case 1.2: Registration with Existing Email**

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Another User",
    "email": "test@example.com",
    "password": "password123"
  }'
```

**Expected Result:**
- Status: 400
- Error message: "User with this email already exists"

**Test Case 1.3: Registration with Missing Fields**

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test2@example.com"
  }'
```

**Expected Result:**
- Status: 400
- Error message about missing required fields

**Test Case 1.4: Registration with Short Password**

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test3@example.com",
    "password": "12345"
  }'
```

**Expected Result:**
- Status: 400
- Error message: "Password must be at least 6 characters long"

**Test Case 1.5: Registration with Invalid Email**

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "invalid-email",
    "password": "password123"
  }'
```

**Expected Result:**
- Status: 400
- Error message about invalid email format

---

### 2. User Login

**Test Case 2.1: Successful Login**

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

**Expected Result:**
- Status: 200
- Response contains user data, accessToken, and refreshToken
- Password is not included in response

**Test Case 2.2: Login with Wrong Password**

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "wrongpassword"
  }'
```

**Expected Result:**
- Status: 401
- Error message: "Invalid email or password"

**Test Case 2.3: Login with Non-existent Email**

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "nonexistent@example.com",
    "password": "password123"
  }'
```

**Expected Result:**
- Status: 401
- Error message: "Invalid email or password"

**Test Case 2.4: Login with Missing Fields**

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com"
  }'
```

**Expected Result:**
- Status: 400
- Error message: "Please provide email and password"

---

### 3. Get Current User (Protected Route)

**Test Case 3.1: Get User with Valid Token**

First, login to get a token:
```bash
# Save the accessToken from login response
TOKEN="your_access_token_here"

curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Result:**
- Status: 200
- Response contains current user data

**Test Case 3.2: Get User without Token**

```bash
curl -X GET http://localhost:5000/api/auth/me
```

**Expected Result:**
- Status: 401
- Error message: "Not authorized to access this route"

**Test Case 3.3: Get User with Invalid Token**

```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer invalid_token"
```

**Expected Result:**
- Status: 401
- Error message about invalid token

---

### 4. Refresh Access Token

**Test Case 4.1: Refresh with Valid Refresh Token**

```bash
# Use refreshToken from login/register response
REFRESH_TOKEN="your_refresh_token_here"

curl -X POST http://localhost:5000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d "{
    \"refreshToken\": \"$REFRESH_TOKEN\"
  }"
```

**Expected Result:**
- Status: 200
- Response contains new accessToken and refreshToken

**Test Case 4.2: Refresh with Invalid Token**

```bash
curl -X POST http://localhost:5000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "invalid_token"
  }'
```

**Expected Result:**
- Status: 401
- Error message about invalid refresh token

**Test Case 4.3: Refresh without Token**

```bash
curl -X POST http://localhost:5000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{}'
```

**Expected Result:**
- Status: 400
- Error message: "Refresh token is required"

---

### 5. Update Profile

**Test Case 5.1: Update Name and Avatar**

```bash
TOKEN="your_access_token_here"

curl -X PUT http://localhost:5000/api/auth/profile \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Name",
    "avatar": "https://example.com/avatar.jpg"
  }'
```

**Expected Result:**
- Status: 200
- Response contains updated user data

**Test Case 5.2: Update without Token**

```bash
curl -X PUT http://localhost:5000/api/auth/profile \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Name"
  }'
```

**Expected Result:**
- Status: 401
- Error message about missing authorization

**Test Case 5.3: Update with Invalid Name**

```bash
TOKEN="your_access_token_here"

curl -X PUT http://localhost:5000/api/auth/profile \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "A"
  }'
```

**Expected Result:**
- Status: 400
- Validation error about name length

---

### 6. Change Password

**Test Case 6.1: Successful Password Change**

```bash
TOKEN="your_access_token_here"

curl -X PUT http://localhost:5000/api/auth/password \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "currentPassword": "password123",
    "newPassword": "newpassword123"
  }'
```

**Expected Result:**
- Status: 200
- Success message

**Test Case 6.2: Change Password with Wrong Current Password**

```bash
TOKEN="your_access_token_here"

curl -X PUT http://localhost:5000/api/auth/password \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "currentPassword": "wrongpassword",
    "newPassword": "newpassword123"
  }'
```

**Expected Result:**
- Status: 401
- Error message: "Current password is incorrect"

**Test Case 6.3: Change Password with Short New Password**

```bash
TOKEN="your_access_token_here"

curl -X PUT http://localhost:5000/api/auth/password \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "currentPassword": "password123",
    "newPassword": "12345"
  }'
```

**Expected Result:**
- Status: 400
- Error message: "New password must be at least 6 characters long"

**Test Case 6.4: Verify New Password Works**

After changing password, try logging in with new password:

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "newpassword123"
  }'
```

**Expected Result:**
- Status: 200
- Successful login with new password

---

## Integration Test Flow

Complete flow testing all features together:

### Step 1: Register a New User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Integration Test User",
    "email": "integration@example.com",
    "password": "password123"
  }'
```
Save the `accessToken` and `refreshToken` from response.

### Step 2: Get Current User
```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Step 3: Update Profile
```bash
curl -X PUT http://localhost:5000/api/auth/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Integration User",
    "avatar": "https://example.com/avatar.jpg"
  }'
```

### Step 4: Change Password
```bash
curl -X PUT http://localhost:5000/api/auth/password \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "currentPassword": "password123",
    "newPassword": "newpassword456"
  }'
```

### Step 5: Login with New Password
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "integration@example.com",
    "password": "newpassword456"
  }'
```

### Step 6: Refresh Token
```bash
curl -X POST http://localhost:5000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "YOUR_REFRESH_TOKEN"
  }'
```

---

## Postman Collection

Import this JSON into Postman for easier testing:

```json
{
  "info": {
    "name": "Auth API Tests",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Register",
      "request": {
        "method": "POST",
        "header": [{"key": "Content-Type", "value": "application/json"}],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"name\": \"Test User\",\n  \"email\": \"test@example.com\",\n  \"password\": \"password123\"\n}"
        },
        "url": "{{baseUrl}}/api/auth/register"
      }
    },
    {
      "name": "Login",
      "request": {
        "method": "POST",
        "header": [{"key": "Content-Type", "value": "application/json"}],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"email\": \"test@example.com\",\n  \"password\": \"password123\"\n}"
        },
        "url": "{{baseUrl}}/api/auth/login"
      }
    },
    {
      "name": "Get Me",
      "request": {
        "method": "GET",
        "header": [{"key": "Authorization", "value": "Bearer {{accessToken}}"}],
        "url": "{{baseUrl}}/api/auth/me"
      }
    },
    {
      "name": "Refresh Token",
      "request": {
        "method": "POST",
        "header": [{"key": "Content-Type", "value": "application/json"}],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"refreshToken\": \"{{refreshToken}}\"\n}"
        },
        "url": "{{baseUrl}}/api/auth/refresh"
      }
    }
  ],
  "variable": [
    {"key": "baseUrl", "value": "http://localhost:5000"}
  ]
}
```

---

## Checklist

- [ ] User can register with valid data
- [ ] Registration fails with duplicate email
- [ ] Registration validates password length
- [ ] User can login with correct credentials
- [ ] Login fails with wrong password
- [ ] Access token is generated on login/register
- [ ] Refresh token is generated on login/register
- [ ] Protected routes require valid token
- [ ] Protected routes reject invalid tokens
- [ ] Refresh token generates new access token
- [ ] User can update profile
- [ ] User can change password
- [ ] Old password is required to change password
- [ ] New password is validated
- [ ] Passwords are hashed in database
- [ ] Tokens expire as configured
- [ ] Role-based authorization works

---

## Notes

- All passwords are hashed using bcrypt before storage
- Tokens are signed with JWT_SECRET and JWT_REFRESH_SECRET
- Access tokens expire in 7 days (configurable)
- Refresh tokens expire in 30 days (configurable)
- All responses follow consistent format with `success` field
- Error messages are descriptive and helpful