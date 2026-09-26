import Joi from "joi";

export const createPositionSchema = Joi.object({
  clientId: Joi.string().hex().length(24).required().messages({
    "string.base": "Client ID must be text.",
    "string.empty": "Client ID is required.",
    "string.hex": "Client ID is not valid.",
    "string.length": "Client ID is not valid.",
    "any.required": "Client ID is required.",
  }),

  bankAccountId: Joi.string().hex().length(24).required().messages({
    "string.base": "Bank account ID must be text.",
    "string.empty": "Bank account ID is required.",
    "string.hex": "Bank account ID is not valid.",
    "string.length": "Bank account ID is not valid.",
    "any.required": "Bank account ID is required.",
  }),

  issuerId: Joi.string().optional().messages({
    "string.base": "Issuer ID must be text.",
  }),

  instrumentId: Joi.string().required().messages({
    "string.base": "Instrument ID must be text.",
    "string.empty": "Instrument ID is required.",
    "any.required": "Instrument ID is required.",
  }),

  quantity: Joi.number().positive().required().messages({
    "number.base": "Quantity must be a number.",
    "number.positive": "Quantity must be a positive number.",
    "any.required": "Quantity is required.",
  }),

  purchasePrice: Joi.number().positive().required().messages({
    "number.base": "Purchase price must be a number.",
    "number.positive": "Purchase price must be a positive number.",
    "any.required": "Purchase price is required.",
  }),

  currentPrice: Joi.number().positive().optional().messages({
    "number.base": "Current price must be a number.",
    "number.positive": "Current price must be a positive number.",
  }),

  currency: Joi.string().trim().required().messages({
    "string.base": "Currency must be text.",
    "string.empty": "Currency is required.",
    "any.required": "Currency is required.",
  }),

  dateOfPurchase: Joi.date().required().messages({
    "date.base": "Date of purchase must be a valid date.",
    "any.required": "Date of purchase is required.",
  }),

  dateOfReport: Joi.date().optional().messages({
    "date.base": "Date of report must be a valid date.",
  }),
});

// Positions are always created in bulk: the body is a list with at least one position
export const createPositionsSchema = Joi.array().items(createPositionSchema).min(1).required().messages({
  "array.base": "Positions must be sent as a list.",
  "array.min": "At least one position is required.",
  "any.required": "At least one position is required.",
});

export const updatePositionSchema = Joi.object({
  clientId: Joi.string().messages({
    "string.base": "Client ID must be text.",
  }),

  bankAccountId: Joi.string().messages({
    "string.base": "Bank account ID must be text.",
  }),

  issuerId: Joi.string().messages({
    "string.base": "Issuer ID must be text.",
  }),

  instrumentId: Joi.string().messages({
    "string.base": "Instrument ID must be text.",
  }),

  quantity: Joi.number().positive().messages({
    "number.base": "Quantity must be a number.",
    "number.positive": "Quantity must be a positive number.",
  }),

  purchasePrice: Joi.number().positive().messages({
    "number.base": "Purchase price must be a number.",
    "number.positive": "Purchase price must be a positive number.",
  }),

  currentPrice: Joi.number().positive().messages({
    "number.base": "Current price must be a number.",
    "number.positive": "Current price must be a positive number.",
  }),

  currency: Joi.string().trim().messages({
    "string.base": "Currency must be text.",
    "string.empty": "Currency cannot be empty.",
  }),

  dateOfPurchase: Joi.date().messages({
    "date.base": "Date of purchase must be a valid date.",
  }),

  dateOfReport: Joi.date().messages({
    "date.base": "Date of report must be a valid date.",
  }),
})
  .min(1)
  .messages({
    "object.min": "At least one field must be provided for update.",
  });
