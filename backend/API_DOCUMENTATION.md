# Project & Task Management API Documentation

Complete REST API documentation for project and task management features.

## Table of Contents

1. [Project APIs](#project-apis)
2. [Task APIs](#task-apis)
3. [Error Handling](#error-handling)
4. [Authentication](#authentication)
5. [Testing Examples](#testing-examples)

---

## Project APIs

All project endpoints require authentication. Include the access token in the Authorization header:
```
Authorization: Bearer <accessToken>
```

### 1. Create Project

**Endpoint:** `POST /api/projects`

**Access:** Private (Authenticated users)

**Request Body:**
```json
{
  "title": "Website Redesign",
  "description": "Complete redesign of company website with modern UI/UX",
  "members": [
    {
      "user": "507f1f77bcf86cd799439011",
      "role": "admin"
    },
    {
      "user": "507f1f77bcf86cd799439012",
      "role": "member"
    }
  ],
  "status": "active",
  "startDate": "2026-05-01T00:00:00.000Z",
  "endDate": "2026-08-01T00:00:00.000Z"
}
```

**Validation Rules:**
- `title`: Required, 3-100 characters
- `description`: Required, max 1000 characters
- `members`: Optional array of user objects
- `status`: Optional, one of: active, archived, completed
- `startDate`: Optional date
- `endDate`: Optional date, must be after startDate

**Success Response (201):**
```json
{
  "success": true,
  "message": "Project created successfully",
  "data": {
    "project": {
      "_id": "507f1f77bcf86cd799439013",
      "title": "Website Redesign",
      "description": "Complete redesign of company website with modern UI/UX",
      "members": [
        {
          "user": {
            "_id": "507f1f77bcf86cd799439010",
            "name": "John Doe",
            "email": "john@example.com",
            "avatar": null
          },
          "role": "owner",
          "addedAt": "2026-05-03T10:00:00.000Z"
        }
      ],
      "createdBy": {
        "_id": "507f1f77bcf86cd799439010",
        "name": "John Doe",
        "email": "john@example.com",
        "avatar": null
      },
      "status": "active",
      "startDate": "2026-05-01T00:00:00.000Z",
      "endDate": "2026-08-01T00:00:00.000Z",
      "createdAt": "2026-05-03T10:00:00.000Z",
      "updatedAt": "2026-05-03T10:00:00.000Z"
    }
  }
}
```

---

### 2. Get All Projects

**Endpoint:** `GET /api/projects`

**Access:** Private

**Query Parameters:**
- `status` (optional): Filter by status (active, archived, completed)

**Success Response (200):**
```json
{
  "success": true,
  "count": 2,
  "data": {
    "projects": [
      {
        "_id": "507f1f77bcf86cd799439013",
        "title": "Website Redesign",
        "description": "Complete redesign of company website",
        "members": [...],
        "createdBy": {...},
        "status": "active",
        "createdAt": "2026-05-03T10:00:00.000Z"
      }
    ]
  }
}
```

---

### 3. Get Single Project

**Endpoint:** `GET /api/projects/:id`

**Access:** Private (Must be project member or creator)

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "project": {
      "_id": "507f1f77bcf86cd799439013",
      "title": "Website Redesign",
      "description": "Complete redesign of company website",
      "members": [...],
      "createdBy": {...},
      "status": "active",
      "createdAt": "2026-05-03T10:00:00.000Z",
      "updatedAt": "2026-05-03T10:00:00.000Z"
    }
  }
}
```

---

### 4. Update Project

**Endpoint:** `PUT /api/projects/:id`

**Access:** Private (Owner or Admin only)

**Request Body:**
```json
{
  "title": "Updated Project Title",
  "description": "Updated description",
  "status": "completed"
}
```

**Validation Rules:**
- At least one field must be provided
- `title`: 3-100 characters
- `description`: Max 1000 characters
- `status`: One of: active, archived, completed

**Success Response (200):**
```json
{
  "success": true,
  "message": "Project updated successfully",
  "data": {
    "project": {...}
  }
}
```

---

### 5. Delete Project

**Endpoint:** `DELETE /api/projects/:id`

**Access:** Private (Owner only)

**Success Response (200):**
```json
{
  "success": true,
  "message": "Project deleted successfully"
}
```

---

### 6. Get Project Statistics

**Endpoint:** `GET /api/projects/:id/stats`

**Access:** Private (Must be project member)

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "stats": {
      "totalTasks": 25,
      "todoTasks": 10,
      "inProgressTasks": 8,
      "doneTasks": 7,
      "overdueTasks": 3,
      "completionRate": "28.00",
      "memberCount": 5
    }
  }
}
```

---

### 7. Add Members to Project

**Endpoint:** `POST /api/projects/:id/members`

**Access:** Private (Owner or Admin only)

**Request Body:**
```json
{
  "members": [
    {
      "user": "507f1f77bcf86cd799439014",
      "role": "member"
    },
    {
      "user": "507f1f77bcf86cd799439015",
      "role": "admin"
    }
  ]
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Members added successfully",
  "data": {
    "project": {...}
  }
}
```

---

### 8. Remove Member from Project

**Endpoint:** `DELETE /api/projects/:id/members/:userId`

**Access:** Private (Owner or Admin only)

**Success Response (200):**
```json
{
  "success": true,
  "message": "Member removed successfully",
  "data": {
    "project": {...}
  }
}
```

---

### 9. Update Member Role

**Endpoint:** `PUT /api/projects/:id/members/:userId/role`

**Access:** Private (Owner only)

**Request Body:**
```json
{
  "role": "admin"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Member role updated successfully",
  "data": {
    "project": {...}
  }
}
```

---

## Task APIs

All task endpoints require authentication.

### 1. Create Task

**Endpoint:** `POST /api/tasks`

**Access:** Private (Must be project member)

**Request Body:**
```json
{
  "title": "Design homepage mockup",
  "description": "Create initial design mockup for homepage with modern UI",
  "status": "todo",
  "priority": "high",
  "dueDate": "2026-05-15T00:00:00.000Z",
  "assignedTo": "507f1f77bcf86cd799439011",
  "projectId": "507f1f77bcf86cd799439013",
  "tags": ["design", "ui", "homepage"]
}
```

**Validation Rules:**
- `title`: Required, 3-200 characters
- `description`: Optional, max 2000 characters
- `status`: Optional, one of: todo, in-progress, done
- `priority`: Optional, one of: low, medium, high, urgent
- `dueDate`: Optional, must be in future for new tasks
- `assignedTo`: Optional, must be project member
- `projectId`: Required, valid MongoDB ObjectId
- `tags`: Optional array of strings (max 30 chars each)

**Success Response (201):**
```json
{
  "success": true,
  "message": "Task created successfully",
  "data": {
    "task": {
      "_id": "507f1f77bcf86cd799439020",
      "title": "Design homepage mockup",
      "description": "Create initial design mockup for homepage",
      "status": "todo",
      "priority": "high",
      "dueDate": "2026-05-15T00:00:00.000Z",
      "assignedTo": {
        "_id": "507f1f77bcf86cd799439011",
        "name": "Jane Smith",
        "email": "jane@example.com",
        "avatar": null
      },
      "projectId": {
        "_id": "507f1f77bcf86cd799439013",
        "title": "Website Redesign"
      },
      "createdBy": {...},
      "timeTracked": 0,
      "tags": ["design", "ui", "homepage"],
      "attachments": [],
      "createdAt": "2026-05-03T10:00:00.000Z",
      "updatedAt": "2026-05-03T10:00:00.000Z"
    }
  }
}
```

---

### 2. Get Tasks

**Endpoint:** `GET /api/tasks`

**Access:** Private

**Query Parameters:**
- `projectId`: Filter by project ID
- `status`: Filter by status (todo, in-progress, done)
- `priority`: Filter by priority (low, medium, high, urgent)
- `assignedTo`: Filter by assigned user ID
- `overdue`: Filter overdue tasks (true/false)

**Success Response (200):**
```json
{
  "success": true,
  "count": 15,
  "data": {
    "tasks": [...]
  }
}
```

---

### 3. Get Single Task

**Endpoint:** `GET /api/tasks/:id`

**Access:** Private (Must have access to project)

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "task": {
      "_id": "507f1f77bcf86cd799439020",
      "title": "Design homepage mockup",
      "description": "Create initial design mockup",
      "status": "in-progress",
      "priority": "high",
      "dueDate": "2026-05-15T00:00:00.000Z",
      "assignedTo": {...},
      "projectId": {...},
      "createdBy": {...},
      "timeTracked": 120,
      "timeTrackedHours": "2.00",
      "isOverdue": false,
      "tags": ["design", "ui"],
      "attachments": [...],
      "createdAt": "2026-05-03T10:00:00.000Z",
      "updatedAt": "2026-05-03T11:00:00.000Z"
    }
  }
}
```

---

### 4. Update Task

**Endpoint:** `PUT /api/tasks/:id`

**Access:** Private (Must have access to project)

**Request Body:**
```json
{
  "title": "Updated task title",
  "status": "in-progress",
  "priority": "urgent",
  "dueDate": "2026-05-20T00:00:00.000Z"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Task updated successfully",
  "data": {
    "task": {...}
  }
}
```

---

### 5. Delete Task

**Endpoint:** `DELETE /api/tasks/:id`

**Access:** Private (Creator, Project Owner, or Admin only)

**Success Response (200):**
```json
{
  "success": true,
  "message": "Task deleted successfully"
}
```

---

### 6. Move Task (Update Status)

**Endpoint:** `PATCH /api/tasks/:id/move`

**Access:** Private

**Request Body:**
```json
{
  "status": "done"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Task status updated successfully",
  "data": {
    "task": {...}
  }
}
```

---

### 7. Assign Task to User

**Endpoint:** `PATCH /api/tasks/:id/assign`

**Access:** Private

**Request Body:**
```json
{
  "assignedTo": "507f1f77bcf86cd799439011"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Task assigned successfully",
  "data": {
    "task": {...}
  }
}
```

---

### 8. Unassign Task

**Endpoint:** `PATCH /api/tasks/:id/unassign`

**Access:** Private

**Success Response (200):**
```json
{
  "success": true,
  "message": "Task unassigned successfully",
  "data": {
    "task": {...}
  }
}
```

---

### 9. Add Time Tracking

**Endpoint:** `POST /api/tasks/:id/time`

**Access:** Private

**Request Body:**
```json
{
  "minutes": 120
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Time tracking added successfully",
  "data": {
    "task": {
      ...
      "timeTracked": 240,
      "timeTrackedHours": "4.00"
    }
  }
}
```

---

### 10. Add Attachment

**Endpoint:** `POST /api/tasks/:id/attachments`

**Access:** Private

**Request Body:**
```json
{
  "filename": "mockup-v1.png",
  "originalName": "homepage-mockup.png",
  "mimetype": "image/png",
  "size": 1024000,
  "url": "/uploads/mockup-v1.png"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Attachment added successfully",
  "data": {
    "task": {
      ...
      "attachments": [
        {
          "_id": "507f1f77bcf86cd799439030",
          "filename": "mockup-v1.png",
          "originalName": "homepage-mockup.png",
          "mimetype": "image/png",
          "size": 1024000,
          "url": "/uploads/mockup-v1.png",
          "uploadedBy": {...},
          "uploadedAt": "2026-05-03T10:00:00.000Z"
        }
      ]
    }
  }
}
```

---

### 11. Remove Attachment

**Endpoint:** `DELETE /api/tasks/:id/attachments/:attachmentId`

**Access:** Private

**Success Response (200):**
```json
{
  "success": true,
  "message": "Attachment removed successfully",
  "data": {
    "task": {...}
  }
}
```

---

### 12. Get My Assigned Tasks

**Endpoint:** `GET /api/tasks/my/assigned`

**Access:** Private

**Query Parameters:**
- `status`: Filter by status
- `priority`: Filter by priority

**Success Response (200):**
```json
{
  "success": true,
  "count": 8,
  "data": {
    "tasks": [...]
  }
}
```

---

### 13. Get Overdue Tasks

**Endpoint:** `GET /api/tasks/overdue`

**Access:** Private

**Query Parameters:**
- `projectId`: Filter by project ID (optional)

**Success Response (200):**
```json
{
  "success": true,
  "count": 3,
  "data": {
    "tasks": [...]
  }
}
```

---

## Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Error description"
}
```

### Common HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (missing or invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

### Validation Errors

Validation errors include detailed field-level information:

```json
{
  "success": false,
  "message": "Validation error",
  "errors": [
    {
      "field": "title",
      "message": "Task title must be at least 3 characters"
    },
    {
      "field": "projectId",
      "message": "Project ID is required"
    }
  ]
}
```

---

## Authentication

All project and task endpoints require authentication. Include the access token in the Authorization header:

```
Authorization: Bearer <accessToken>
```

If the token is missing or invalid:

```json
{
  "success": false,
  "message": "Not authorized to access this route. Please provide a valid token."
}
```

If the token is expired:

```json
{
  "success": false,
  "message": "Access token expired. Please refresh your token.",
  "code": "TOKEN_EXPIRED"
}
```

---

## Testing Examples

### Using cURL

**Create Project:**
```bash
curl -X POST http://localhost:5000/api/projects \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "New Project",
    "description": "Project description"
  }'
```

**Get All Projects:**
```bash
curl -X GET http://localhost:5000/api/projects \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Create Task:**
```bash
curl -X POST http://localhost:5000/api/tasks \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "New Task",
    "description": "Task description",
    "projectId": "507f1f77bcf86cd799439013",
    "priority": "high"
  }'
```

**Move Task:**
```bash
curl -X PATCH http://localhost:5000/api/tasks/507f1f77bcf86cd799439020/move \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "done"
  }'
```

**Assign Task:**
```bash
curl -X PATCH http://localhost:5000/api/tasks/507f1f77bcf86cd799439020/assign \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "assignedTo": "507f1f77bcf86cd799439011"
  }'
```

---

## Best Practices

1. **Always validate input** - Use the provided validation schemas
2. **Check permissions** - Verify user has access to resources
3. **Handle errors gracefully** - Return meaningful error messages
4. **Use proper HTTP methods** - POST for create, PUT for full update, PATCH for partial update
5. **Filter sensitive data** - Don't expose passwords or tokens
6. **Implement pagination** - For large datasets (future enhancement)
7. **Rate limiting** - Prevent abuse (future enhancement)
8. **Logging** - Log important operations for audit trail

---

## Architecture

```
Request → Routes → Validation → Controller → Service → Model → Database
                                     ↓
                                  Response
```

**Separation of Concerns:**
- **Routes**: Define endpoints and apply middleware
- **Validators**: Validate request data using Joi
- **Controllers**: Handle HTTP requests/responses
- **Services**: Contain business logic
- **Models**: Define data structure and database operations