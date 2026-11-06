import Joi from 'joi';
import { advisorDetailsSchema, password, username } from './auth.validators.js';

// Upgrading is the only plan change allowed, so premium is the only accepted value
export const changePlanSchema = Joi.object({
  planTier: Joi.string().valid('premium').required().messages({
    'string.base': 'Plan tier must be text.',
    'any.only': 'Plan tier can only be changed to premium.',
    'any.required': 'Plan tier is required to change your plan.',
  }),
});

// ---- Admin management of advisor accounts ----

// Lowercased so ids compare equal to the ones Mongoose returns
export const advisorParamsSchema = Joi.object({
  id: Joi.string().hex().length(24).lowercase().required().messages({
    'string.hex': 'Advisor id is not valid.',
    'string.length': 'Advisor id is not valid.',
    'any.required': 'Advisor id is required.',
  }),
});

// Unlike the advisor's own upgrade, an admin can move an account in either direction
const planTier = Joi.string().valid('base', 'premium').messages({
  'string.base': 'Plan tier must be text.',
  'any.only': 'Plan tier must be base or premium.',
});

const DETAIL_KEYS = ['comercialName', 'legalName', 'address', 'country', 'document', 'phone', 'contactEmail'];

export const createAdvisorSchema = Joi.object({
  username,
  password,
  details: advisorDetailsSchema,
  planTier: planTier.default('base'),
});

// Every field optional; details can be partial and only the sent keys change
export const updateAdvisorSchema = Joi.object({
  username: username.optional(),
  password: password.optional(),
  details: advisorDetailsSchema
    .fork(DETAIL_KEYS, (schema) => schema.optional())
    .optional()
    .min(1)
    .messages({ 'object.min': 'Advisor details cannot be empty.' }),
  planTier,
})
  .min(1)
  .messages({
    'object.min': 'At least one field must be provided for update.',
  });
