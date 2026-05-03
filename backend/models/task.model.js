import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters'],
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
      default: '',
    },
    status: {
      type: String,
      enum: {
        values: ['todo', 'in-progress', 'done'],
        message: 'Status must be todo, in-progress, or done',
      },
      default: 'todo',
    },
    priority: {
      type: String,
      enum: {
        values: ['low', 'medium', 'high', 'urgent'],
        message: 'Priority must be low, medium, high, or urgent',
      },
      default: 'medium',
    },
    dueDate: {
      type: Date,
      default: null,
      validate: {
        validator: function (value) {
          // Due date should be in the future (only for new tasks)
          if (this.isNew && value) {
            return value >= new Date();
          }
          return true;
        },
        message: 'Due date must be in the future',
      },
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'Project ID is required'],
    },
    attachments: [
      {
        filename: {
          type: String,
          required: true,
        },
        originalName: {
          type: String,
          required: true,
        },
        mimetype: {
          type: String,
          required: true,
        },
        size: {
          type: Number,
          required: true,
        },
        url: {
          type: String,
          required: true,
        },
        uploadedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    timeTracked: {
      type: Number, // Time in minutes
      default: 0,
      min: [0, 'Time tracked cannot be negative'],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Task creator is required'],
    },
    completedAt: {
      type: Date,
      default: null,
    },
    tags: [
      {
        type: String,
        trim: true,
        maxlength: [30, 'Tag cannot exceed 30 characters'],
      },
    ],
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
  }
);

// Indexes for better query performance
taskSchema.index({ projectId: 1 });
taskSchema.index({ assignedTo: 1 });
taskSchema.index({ status: 1 });
taskSchema.index({ priority: 1 });
taskSchema.index({ dueDate: 1 });
taskSchema.index({ createdBy: 1 });
taskSchema.index({ title: 'text', description: 'text' }); // Text search

// Compound indexes for common queries
taskSchema.index({ projectId: 1, status: 1 });
taskSchema.index({ assignedTo: 1, status: 1 });

// Pre-save middleware to set completedAt when status changes to 'done'
taskSchema.pre('save', function (next) {
  if (this.isModified('status')) {
    if (this.status === 'done' && !this.completedAt) {
      this.completedAt = new Date();
    } else if (this.status !== 'done') {
      this.completedAt = null;
    }
  }
  next();
});

// Virtual for checking if task is overdue
taskSchema.virtual('isOverdue').get(function () {
  if (!this.dueDate || this.status === 'done') {
    return false;
  }
  return new Date() > this.dueDate;
});

// Virtual for time tracked in hours
taskSchema.virtual('timeTrackedHours').get(function () {
  return (this.timeTracked / 60).toFixed(2);
});

// Ensure virtuals are included when converting to JSON
taskSchema.set('toJSON', { virtuals: true });
taskSchema.set('toObject', { virtuals: true });

// Method to add time tracking
taskSchema.methods.addTimeTracked = function (minutes) {
  if (minutes > 0) {
    this.timeTracked += minutes;
    return this.save();
  }
  throw new Error('Minutes must be a positive number');
};

// Method to add attachment
taskSchema.methods.addAttachment = function (attachmentData) {
  this.attachments.push(attachmentData);
  return this.save();
};

// Method to remove attachment
taskSchema.methods.removeAttachment = function (attachmentId) {
  this.attachments = this.attachments.filter(
    (att) => att._id.toString() !== attachmentId.toString()
  );
  return this.save();
};

// Static method to find tasks by project
taskSchema.statics.findByProject = function (projectId, filters = {}) {
  const query = { projectId, ...filters };
  return this.find(query)
    .populate('assignedTo', 'name email avatar')
    .populate('createdBy', 'name email avatar')
    .sort({ createdAt: -1 });
};

// Static method to find tasks by user
taskSchema.statics.findByUser = function (userId, filters = {}) {
  const query = { assignedTo: userId, ...filters };
  return this.find(query)
    .populate('projectId', 'title')
    .populate('createdBy', 'name email avatar')
    .sort({ dueDate: 1 });
};

// Static method to get overdue tasks
taskSchema.statics.findOverdue = function (projectId = null) {
  const query = {
    dueDate: { $lt: new Date() },
    status: { $ne: 'done' },
  };
  if (projectId) {
    query.projectId = projectId;
  }
  return this.find(query)
    .populate('assignedTo', 'name email avatar')
    .populate('projectId', 'title')
    .sort({ dueDate: 1 });
};

const Task = mongoose.model('Task', taskSchema);

export default Task;

// Made with Bob
