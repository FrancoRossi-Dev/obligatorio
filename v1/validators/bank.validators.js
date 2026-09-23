import Joi from 'joi';

export const createBankSchema = Joi.object({
  name: Joi.string().trim().max(100).required().messages({
    'string.base': 'Bank name must be text.', 
    'string.empty': 'Bank name is required.',
    'string.max': 'Bank name must be at most {#limit} characters long.',
    'any.required': 'Bank name is required.',
    }),
    country: Joi.string().trim().max(60).required().messages({
    'string.base': 'Country must be text.',
    'string.empty': 'Country is required.',
    'string.max': 'Country must be at most {#limit} characters long.',
    'any.required': 'Country is required.',
    }), 
    region: Joi.string().trim().max(60).required().messages({
    'string.base': 'Region must be text.',
    'string.empty': 'Region is required.', 
    'string.max': 'Region must be at most {#limit} characters long.',
    'any.required': 'Region is required.',
    }),
    logoURL: Joi.string().uri({ scheme: ['http', 'https'] }).required().messages({
    'string.base': 'Logo URL must be text.',
    'string.empty': 'Logo URL is required.',
    'string.uriCustomScheme': 'Logo URL must use http or https.',  
    'any.required': 'Logo URL is required.',
    }),
})

export const updateBankSchema = Joi.object({
  name: Joi.string().trim().max(100).messages({
    'string.base': 'Bank name must be text.',
    'string.empty': 'Bank name cannot be empty.',
    'string.max': 'Bank name must be at most {#limit} characters long.',
  }),
    country: Joi.string().trim().max(60).messages({
    'string.base': 'Country must be text.',
    'string.empty': 'Country cannot be empty.',
    'string.max': 'Country must be at most {#limit} characters long.',
    }),
    region: Joi.string().trim().max(60).messages({
    'string.base': 'Region must be text.',
    'string.empty': 'Region cannot be empty.',
    'string.max': 'Region must be at most {#limit} characters long.',
    }),
    logoURL: Joi.string().uri({ scheme: ['http', 'https'] }).messages({
    'string.base': 'Logo URL must be text.',
    'string.empty': 'Logo URL cannot be empty.',
    'string.uriCustomScheme': 'Logo URL must use http or https.',
  }),
})
  .min(1)
  .messages({
    'object.min': 'At least one field must be provided for update.',
  });