import Joi from 'joi';

/**
 * Validation schema for creating a post
 */
export const createPostSchema = Joi.object({
  content: Joi.string()
    .min(1)
    .max(5000)
    .required()
    .messages({
      'string.empty': 'Post content is required',
      'string.min': 'Post content cannot be empty',
      'string.max': 'Post content cannot exceed 5000 characters',
      'any.required': 'Post content is required',
    }),

  hashtags: Joi.array()
    .items(Joi.string().min(1).max(100))
    .optional()
    .messages({
      'array.base': 'Hashtags must be an array of strings',
    }),
});

/**
 * Validation schema for updating a post
 * At least one field must be provided
 */
export const updatePostSchema = Joi.object({
  content: Joi.string()
    .min(1)
    .max(5000)
    .messages({
      'string.min': 'Post content cannot be empty',
      'string.max': 'Post content cannot exceed 5000 characters',
    }),

  hashtags: Joi.array()
    .items(Joi.string().min(1).max(100))
    .messages({
      'array.base': 'Hashtags must be an array of strings',
    }),
})
  .min(1)
  .messages({
    'object.min': 'At least one field must be provided for update',
  });
