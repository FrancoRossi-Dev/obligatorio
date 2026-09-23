import Joi from "joi";

export const createInstrumentSchema = Joi.object({
  name: Joi.string().trim().max(100).required().messages({
    "string.base": "Instrument name must be text.",
    "string.empty": "Instrument name is required.",
    "string.max": "Instrument name must be at most {#limit} characters long.",
    "any.required": "Instrument name is required.",
    }),
    type: Joi.string().valid("stock", "bond", "fund", "cash").required().messages({
    "any.only": "Instrument type must be one of 'stock', 'bond', 'fund', or 'cash'.",
    "any.required": "Instrument type is required.",
    }),
    issuerId: Joi.string().when("type", {
    is: Joi.valid("stock", "bond"),
    then: Joi.string().required().messages({
        "string.empty": "Issuer ID is required for stock and bond instruments.",
        "any.required": "Issuer ID is required for stock and bond instruments.",
    }),
    otherwise: Joi.string().optional(), 
}),
    fundDetail: Joi.object({
    composition: Joi.string().valid("equity", "bond", "balanced", "alternative").required().messages({
        "any.only": "Fund composition must be one of 'equity', 'bond', 'balanced', or 'alternative'.",
        "any.required": "Fund composition is required for fund instruments.",
    }),
    }).when("type", {
    is: "fund",
    then: Joi.object({
        composition: Joi.string().valid("equity", "bond", "balanced", "alternative").required().messages({
            "any.only": "Fund composition must be one of 'equity', 'bond', 'balanced', or 'alternative'.",
            "any.required": "Fund composition is required for fund instruments.",
        }),
    }),
    otherwise: Joi.forbidden().messages({
        "any.unknown": "Fund detail is only allowed for fund instruments.",
    }),
}),
});

export const updateInstrumentSchema = Joi.object({
  name: Joi.string().trim().max(100).messages({
    "string.base": "Instrument name must be text.",
    "string.empty": "Instrument name cannot be empty.",
    "string.max": "Instrument name must be at most {#limit} characters long.",
    }),
    type: Joi.string().valid("stock", "bond", "fund", "cash").messages({
    "any.only": "Instrument type must be one of 'stock', 'bond', 'fund', or 'cash'.",
    }),
    issuerId: Joi.string().when("type", {
    is: Joi.valid("stock", "bond"),
    then: Joi.string().required().messages({
        "string.empty": "Issuer ID is required for stock and bond instruments.",
        "any.required": "Issuer ID is required for stock and bond instruments.",
    }),
    otherwise: Joi.string().optional(),
}),
    fundDetail: Joi.object({
    composition: Joi.string().valid("equity", "bond", "balanced", "alternative").required().messages({
        "any.only": "Fund composition must be one of 'equity', 'bond', 'balanced', or 'alternative'.",
        "any.required": "Fund composition is required for fund instruments.",
    }),
    }).when("type", {
    is: "fund",
    then: Joi.object({
        composition: Joi.string().valid("equity", "bond", "balanced", "alternative").required().messages({
            "any.only": "Fund composition must be one of 'equity', 'bond', 'balanced', or 'alternative'.",
            "any.required": "Fund composition is required for fund instruments.",
        }),
    }),
    otherwise: Joi.forbidden().messages({
        "any.unknown": "Fund detail is only allowed for fund instruments.",
    }),
}),
})
  .min(1)
  .messages({
    "object.min": "At least one field must be provided for update.",
  });