import Joi from 'joi';

export const createManagerSchema = Joi.object({
  fullName: Joi.string().trim().max(100).required().messages({
    'string.base': 'Full name must be text.',
    'string.empty': 'Full name is required.',
    'string.max': 'Full name must be at most {#limit} characters long.',
    'any.required': 'Full name is required.',
  }),

  email: Joi.string().email().trim().max(100).required().messages({
    'string.base': 'Email must be text.',
    'string.empty': 'Email is required.',
    'string.email': 'Email must be a valid email address.',
    'string.max': 'Email must be at most {#limit} characters long.',
    'any.required': 'Email is required.',
  }),

  advisorId: Joi.string().required().messages({
    'string.empty': 'Advisor is required.',
    'any.required': 'Advisor is required.',
  }),
});

export const updateManagerSchema = Joi.object({
  fullName: Joi.string().trim().max(100).messages({
    'string.base': 'Full name must be text.',
    'string.empty': 'Full name cannot be empty.',
    'string.max': 'Full name must be at most {#limit} characters long.',
  }),

  email: Joi.string().email().trim().max(100).messages({
    'string.base': 'Email must be text.',
    'string.empty': 'Email cannot be empty.',
    'string.email': 'Email must be a valid email address.',
    'string.max': 'Email must be at most {#limit} characters long.',
  }),

  advisorId: Joi.string().messages({
    'string.empty': 'Advisor cannot be empty.',
  }),
})
  .min(1)
  .messages({
    'object.min': 'At least one field must be provided for update.',
  });
