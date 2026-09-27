import Joi from 'joi';

// Upgrading is the only plan change allowed, so premium is the only accepted value
export const changePlanSchema = Joi.object({
  planTier: Joi.string().valid('premium').required().messages({
    'string.base': 'Plan tier must be text.',
    'any.only': 'Plan tier can only be changed to premium.',
    'any.required': 'Plan tier is required to change your plan.',
  }),
});
