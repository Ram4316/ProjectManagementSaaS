import Joi from 'joi';

/**
 * Validation schema for creating a project
 */
export const createProjectSchema = Joi.object({
  title: Joi.string()
    .min(3)
    .max(100)
    .required()
    .trim()
    .messages({
      'string.empty': 'Project title is required',
      'string.min': 'Project title must be at least 3 characters',
      'string.max': 'Project title cannot exceed 100 characters',
      'any.required': 'Project title is required',
    }),

  description: Joi.string()
    .max(1000)
    .required()
    .trim()
    .messages({
      'string.empty': 'Project description is required',
      'string.max': 'Project description cannot exceed 1000 characters',
      'any.required': 'Project description is required',
    }),

  members: Joi.array()
    .items(
      Joi.object({
        user: Joi.string()
          .pattern(/^[0-9a-fA-F]{24}$/)
          .required()
          .messages({
            'string.pattern.base': 'Invalid user ID format',
            'any.required': 'User ID is required for each member',
          }),
        role: Joi.string()
          .valid('owner', 'admin', 'member')
          .default('member')
          .messages({
            'any.only': 'Member role must be owner, admin, or member',
          }),
      })
    )
    .optional()
    .messages({
      'array.base': 'Members must be an array',
    }),

  status: Joi.string()
    .valid('active', 'archived', 'completed')
    .optional()
    .messages({
      'any.only': 'Status must be active, archived, or completed',
    }),

  startDate: Joi.date()
    .optional()
    .messages({
      'date.base': 'Start date must be a valid date',
    }),

  endDate: Joi.date()
    .greater(Joi.ref('startDate'))
    .optional()
    .messages({
      'date.base': 'End date must be a valid date',
      'date.greater': 'End date must be after start date',
    }),
});

/**
 * Validation schema for updating a project
 */
export const updateProjectSchema = Joi.object({
  title: Joi.string()
    .min(3)
    .max(100)
    .trim()
    .optional()
    .messages({
      'string.min': 'Project title must be at least 3 characters',
      'string.max': 'Project title cannot exceed 100 characters',
    }),

  description: Joi.string()
    .max(1000)
    .trim()
    .optional()
    .messages({
      'string.max': 'Project description cannot exceed 1000 characters',
    }),

  status: Joi.string()
    .valid('active', 'archived', 'completed')
    .optional()
    .messages({
      'any.only': 'Status must be active, archived, or completed',
    }),

  startDate: Joi.date()
    .optional()
    .messages({
      'date.base': 'Start date must be a valid date',
    }),

  endDate: Joi.date()
    .optional()
    .messages({
      'date.base': 'End date must be a valid date',
    }),
}).min(1).messages({
  'object.min': 'At least one field must be provided for update',
});

/**
 * Validation schema for adding/updating project members
 */
export const updateMembersSchema = Joi.object({
  members: Joi.array()
    .items(
      Joi.object({
        user: Joi.string()
          .pattern(/^[0-9a-fA-F]{24}$/)
          .required()
          .messages({
            'string.pattern.base': 'Invalid user ID format',
            'any.required': 'User ID is required for each member',
          }),
        role: Joi.string()
          .valid('owner', 'admin', 'member')
          .default('member')
          .messages({
            'any.only': 'Member role must be owner, admin, or member',
          }),
      })
    )
    .min(1)
    .required()
    .messages({
      'array.base': 'Members must be an array',
      'array.min': 'At least one member is required',
      'any.required': 'Members array is required',
    }),
});

/**
 * Validation schema for removing a member
 */
export const removeMemberSchema = Joi.object({
  userId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      'string.pattern.base': 'Invalid user ID format',
      'any.required': 'User ID is required',
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

export default {
  createProjectSchema,
  updateProjectSchema,
  updateMembersSchema,
  removeMemberSchema,
  validate,
};

// Made with Bob
