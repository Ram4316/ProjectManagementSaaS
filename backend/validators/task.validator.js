import Joi from 'joi';

/**
 * Validation schema for creating a task
 */
export const createTaskSchema = Joi.object({
  title: Joi.string()
    .min(3)
    .max(200)
    .required()
    .trim()
    .messages({
      'string.empty': 'Task title is required',
      'string.min': 'Task title must be at least 3 characters',
      'string.max': 'Task title cannot exceed 200 characters',
      'any.required': 'Task title is required',
    }),

  description: Joi.string()
    .max(2000)
    .trim()
    .optional()
    .allow('')
    .messages({
      'string.max': 'Task description cannot exceed 2000 characters',
    }),

  status: Joi.string()
    .valid('todo', 'in-progress', 'done')
    .optional()
    .messages({
      'any.only': 'Status must be todo, in-progress, or done',
    }),

  priority: Joi.string()
    .valid('low', 'medium', 'high', 'urgent')
    .optional()
    .messages({
      'any.only': 'Priority must be low, medium, high, or urgent',
    }),

  dueDate: Joi.date()
    .min('now')
    .optional()
    .allow(null)
    .messages({
      'date.base': 'Due date must be a valid date',
      'date.min': 'Due date must be in the future',
    }),

  assignedTo: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .optional()
    .allow(null)
    .messages({
      'string.pattern.base': 'Invalid user ID format for assignedTo',
    }),

  projectId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      'string.pattern.base': 'Invalid project ID format',
      'any.required': 'Project ID is required',
    }),

  tags: Joi.array()
    .items(
      Joi.string()
        .max(30)
        .trim()
        .messages({
          'string.max': 'Each tag cannot exceed 30 characters',
        })
    )
    .optional()
    .messages({
      'array.base': 'Tags must be an array',
    }),
});

/**
 * Validation schema for updating a task
 */
export const updateTaskSchema = Joi.object({
  title: Joi.string()
    .min(3)
    .max(200)
    .trim()
    .optional()
    .messages({
      'string.min': 'Task title must be at least 3 characters',
      'string.max': 'Task title cannot exceed 200 characters',
    }),

  description: Joi.string()
    .max(2000)
    .trim()
    .optional()
    .allow('')
    .messages({
      'string.max': 'Task description cannot exceed 2000 characters',
    }),

  status: Joi.string()
    .valid('todo', 'in-progress', 'done')
    .optional()
    .messages({
      'any.only': 'Status must be todo, in-progress, or done',
    }),

  priority: Joi.string()
    .valid('low', 'medium', 'high', 'urgent')
    .optional()
    .messages({
      'any.only': 'Priority must be low, medium, high, or urgent',
    }),

  dueDate: Joi.date()
    .optional()
    .allow(null)
    .messages({
      'date.base': 'Due date must be a valid date',
    }),

  assignedTo: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .optional()
    .allow(null)
    .messages({
      'string.pattern.base': 'Invalid user ID format for assignedTo',
    }),

  tags: Joi.array()
    .items(
      Joi.string()
        .max(30)
        .trim()
        .messages({
          'string.max': 'Each tag cannot exceed 30 characters',
        })
    )
    .optional()
    .messages({
      'array.base': 'Tags must be an array',
    }),
}).min(1).messages({
  'object.min': 'At least one field must be provided for update',
});

/**
 * Validation schema for moving a task (updating status)
 */
export const moveTaskSchema = Joi.object({
  status: Joi.string()
    .valid('todo', 'in-progress', 'done')
    .required()
    .messages({
      'any.only': 'Status must be todo, in-progress, or done',
      'any.required': 'Status is required',
    }),
});

/**
 * Validation schema for assigning a task
 */
export const assignTaskSchema = Joi.object({
  assignedTo: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      'string.pattern.base': 'Invalid user ID format',
      'any.required': 'User ID is required',
    }),
});

/**
 * Validation schema for adding time tracking
 */
export const addTimeTrackingSchema = Joi.object({
  minutes: Joi.number()
    .integer()
    .min(1)
    .required()
    .messages({
      'number.base': 'Minutes must be a number',
      'number.integer': 'Minutes must be an integer',
      'number.min': 'Minutes must be at least 1',
      'any.required': 'Minutes is required',
    }),
});

/**
 * Validation schema for adding an attachment
 */
export const addAttachmentSchema = Joi.object({
  filename: Joi.string()
    .required()
    .messages({
      'any.required': 'Filename is required',
    }),

  originalName: Joi.string()
    .required()
    .messages({
      'any.required': 'Original filename is required',
    }),

  mimetype: Joi.string()
    .required()
    .messages({
      'any.required': 'MIME type is required',
    }),

  size: Joi.number()
    .integer()
    .min(1)
    .required()
    .messages({
      'number.base': 'File size must be a number',
      'number.integer': 'File size must be an integer',
      'number.min': 'File size must be at least 1 byte',
      'any.required': 'File size is required',
    }),

  url: Joi.string()
    .uri()
    .required()
    .messages({
      'string.uri': 'URL must be a valid URI',
      'any.required': 'File URL is required',
    }),
});

/**
 * Validation schema for query parameters (filtering tasks)
 */
export const taskQuerySchema = Joi.object({
  status: Joi.string()
    .valid('todo', 'in-progress', 'done')
    .optional()
    .messages({
      'any.only': 'Status must be todo, in-progress, or done',
    }),

  priority: Joi.string()
    .valid('low', 'medium', 'high', 'urgent')
    .optional()
    .messages({
      'any.only': 'Priority must be low, medium, high, or urgent',
    }),

  assignedTo: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .optional()
    .messages({
      'string.pattern.base': 'Invalid user ID format for assignedTo',
    }),

  projectId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .optional()
    .messages({
      'string.pattern.base': 'Invalid project ID format',
    }),

  overdue: Joi.boolean()
    .optional()
    .messages({
      'boolean.base': 'Overdue must be a boolean',
    }),
});

/**
 * Middleware to validate request body against a schema
 */
export const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false, // Return all errors, not just the first one
      stripUnknown: true, // Remove unknown fields
    });

    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message,
      }));

      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors,
      });
    }

    // Replace req.body with validated and sanitized value
    req.body = value;
    next();
  };
};

/**
 * Middleware to validate query parameters against a schema
 */
export const validateQuery = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.query, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message,
      }));

      return res.status(400).json({
        success: false,
        message: 'Query validation error',
        errors,
      });
    }

    req.query = value;
    next();
  };
};

export default {
  createTaskSchema,
  updateTaskSchema,
  moveTaskSchema,
  assignTaskSchema,
  addTimeTrackingSchema,
  addAttachmentSchema,
  taskQuerySchema,
  validate,
  validateQuery,
};

// Made with Bob
