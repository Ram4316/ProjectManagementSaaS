# Database Models Documentation

This directory contains all Mongoose models for the Project Management SaaS application.

## Models Overview

### 1. User Model (`user.model.js`)

Represents users in the system with authentication capabilities.

**Fields:**
- `name` (String, required): User's full name (2-50 characters)
- `email` (String, required, unique): User's email address
- `password` (String, required): Hashed password (min 6 characters)
- `role` (String, enum): User role - 'admin' or 'member' (default: 'member')
- `avatar` (String): URL to user's avatar image
- `createdAt` (Date): Auto-generated timestamp
- `updatedAt` (Date): Auto-generated timestamp

**Methods:**
- `comparePassword(candidatePassword)`: Compare plain password with hashed password
- `toJSON()`: Returns user object without password field

**Features:**
- Automatic password hashing before save using bcrypt
- Email validation with regex
- Password excluded from queries by default (select: false)
- Indexed email field for faster lookups

**Usage Example:**
```javascript
import User from './models/user.model.js';

// Create new user
const user = await User.create({
  name: 'John Doe',
  email: 'john@example.com',
  password: 'securePassword123',
  role: 'member'
});

// Login validation
const isValid = await user.comparePassword('securePassword123');
```

---

### 2. Project Model (`project.model.js`)

Represents projects that contain tasks and team members.

**Fields:**
- `title` (String, required): Project title (3-100 characters)
- `description` (String, required): Project description (max 1000 characters)
- `members` (Array): Array of member objects with:
  - `user` (ObjectId, ref: User): Reference to User
  - `role` (String, enum): 'owner', 'admin', or 'member'
  - `addedAt` (Date): When member was added
- `createdBy` (ObjectId, ref: User, required): Project creator
- `status` (String, enum): 'active', 'archived', or 'completed' (default: 'active')
- `startDate` (Date): Project start date
- `endDate` (Date): Project end date
- `createdAt` (Date): Auto-generated timestamp
- `updatedAt` (Date): Auto-generated timestamp

**Virtuals:**
- `taskCount`: Number of tasks in the project (requires population)

**Methods:**
- `isMember(userId)`: Check if user is a project member
- `getMemberRole(userId)`: Get user's role in the project

**Static Methods:**
- `findByUser(userId)`: Find all projects where user is creator or member

**Features:**
- Multiple indexes for optimized queries
- Text search on title and description
- Virtual field for task count
- Member role management

**Usage Example:**
```javascript
import Project from './models/project.model.js';

// Create new project
const project = await Project.create({
  title: 'Website Redesign',
  description: 'Complete redesign of company website',
  createdBy: userId,
  members: [
    { user: userId, role: 'owner' },
    { user: memberId, role: 'member' }
  ]
});

// Check if user is member
const isMember = project.isMember(userId);

// Find user's projects
const userProjects = await Project.findByUser(userId);
```

---

### 3. Task Model (`task.model.js`)

Represents individual tasks within projects.

**Fields:**
- `title` (String, required): Task title (3-200 characters)
- `description` (String): Task description (max 2000 characters)
- `status` (String, enum): 'todo', 'in-progress', or 'done' (default: 'todo')
- `priority` (String, enum): 'low', 'medium', 'high', or 'urgent' (default: 'medium')
- `dueDate` (Date): Task due date (must be in future for new tasks)
- `assignedTo` (ObjectId, ref: User): Assigned user
- `projectId` (ObjectId, ref: Project, required): Parent project
- `attachments` (Array): Array of attachment objects with:
  - `filename` (String): Stored filename
  - `originalName` (String): Original filename
  - `mimetype` (String): File MIME type
  - `size` (Number): File size in bytes
  - `url` (String): File URL
  - `uploadedBy` (ObjectId, ref: User): Uploader
  - `uploadedAt` (Date): Upload timestamp
- `timeTracked` (Number): Time tracked in minutes (default: 0)
- `createdBy` (ObjectId, ref: User, required): Task creator
- `completedAt` (Date): When task was completed
- `tags` (Array): Array of tag strings (max 30 characters each)
- `createdAt` (Date): Auto-generated timestamp
- `updatedAt` (Date): Auto-generated timestamp

**Virtuals:**
- `isOverdue`: Boolean indicating if task is overdue
- `timeTrackedHours`: Time tracked converted to hours

**Methods:**
- `addTimeTracked(minutes)`: Add time tracking in minutes
- `addAttachment(attachmentData)`: Add new attachment
- `removeAttachment(attachmentId)`: Remove attachment by ID

**Static Methods:**
- `findByProject(projectId, filters)`: Find tasks by project with optional filters
- `findByUser(userId, filters)`: Find tasks assigned to user
- `findOverdue(projectId)`: Find overdue tasks (optionally filtered by project)

**Features:**
- Multiple indexes for optimized queries
- Compound indexes for common query patterns
- Text search on title and description
- Automatic completedAt timestamp when status changes to 'done'
- Due date validation (must be in future for new tasks)
- Time tracking in minutes with hours conversion

**Usage Example:**
```javascript
import Task from './models/task.model.js';

// Create new task
const task = await Task.create({
  title: 'Design homepage mockup',
  description: 'Create initial design mockup for homepage',
  status: 'todo',
  priority: 'high',
  dueDate: new Date('2026-05-10'),
  assignedTo: userId,
  projectId: projectId,
  createdBy: userId,
  tags: ['design', 'ui']
});

// Add time tracking
await task.addTimeTracked(120); // 2 hours

// Add attachment
await task.addAttachment({
  filename: 'mockup-v1.png',
  originalName: 'homepage-mockup.png',
  mimetype: 'image/png',
  size: 1024000,
  url: '/uploads/mockup-v1.png',
  uploadedBy: userId
});

// Find project tasks
const projectTasks = await Task.findByProject(projectId, { status: 'todo' });

// Find overdue tasks
const overdueTasks = await Task.findOverdue(projectId);
```

---

## Model Relationships

```
User
  ├── Created Projects (1:N)
  ├── Member of Projects (N:N)
  ├── Created Tasks (1:N)
  └── Assigned Tasks (1:N)

Project
  ├── Created by User (N:1)
  ├── Members (N:N with User)
  └── Tasks (1:N)

Task
  ├── Belongs to Project (N:1)
  ├── Created by User (N:1)
  ├── Assigned to User (N:1)
  └── Attachments (embedded)
```

## Indexes

All models include strategic indexes for optimal query performance:

- **User**: Email (unique)
- **Project**: createdBy, members.user, status, text search
- **Task**: projectId, assignedTo, status, priority, dueDate, createdBy, text search, compound indexes

## Best Practices

1. **Always populate references** when you need related data:
   ```javascript
   const task = await Task.findById(taskId)
     .populate('assignedTo', 'name email avatar')
     .populate('projectId', 'title');
   ```

2. **Use static methods** for common queries:
   ```javascript
   const userTasks = await Task.findByUser(userId);
   ```

3. **Leverage virtuals** for computed properties:
   ```javascript
   const task = await Task.findById(taskId);
   console.log(task.isOverdue); // Boolean
   console.log(task.timeTrackedHours); // Formatted hours
   ```

4. **Handle errors properly**:
   ```javascript
   try {
     const user = await User.create(userData);
   } catch (error) {
     if (error.code === 11000) {
       // Duplicate email
     }
   }
   ```

## Import Models

Use the index file for convenient imports:

```javascript
// Import all models
import { User, Project, Task } from './models/index.js';

// Or import individually
import User from './models/user.model.js';
```

## Environment Variables

Ensure `MONGO_URI` is set in your `.env` file:

```env
MONGO_URI=mongodb://localhost:27017/project_management_saas
```

## Database Connection

The database connection is handled in `utils/db.js`:

```javascript
import connectDB from './utils/db.js';

// Connect to database
await connectDB();