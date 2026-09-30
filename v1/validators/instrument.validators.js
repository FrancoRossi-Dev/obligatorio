import Joi from "joi";
import { paginationQuerySchema } from "./pagination.validators.js";
import { filterText } from "./filter.validators.js";
import { INSTRUMENT_TYPES } from "../models/instrument.model.js";

const INVALID_TYPE_MESSAGE = `Instrument type must be one of: ${INSTRUMENT_TYPES.join(", ")}.`;

const marketText = (label, max) =>
  Joi.string().trim().max(max).messages({
    "string.base": `${label} must be text.`,
    "string.empty": `${label} cannot be empty.`,
    "string.max": `${label} must be at most {#limit} characters long.`,
  });

// OpenFIGI reference data; optional on both create and update, since manual instruments may have none
const marketDataKeys = {
  figi: Joi.string().trim().uppercase().pattern(/^[A-Z0-9]{12}$/).messages({
    "string.base": "FIGI must be text.",
    "string.empty": "FIGI cannot be empty.",
    "string.pattern.base": "FIGI must be a 12-character alphanumeric identifier.",
  }),
  ticker: marketText("Ticker", 20),
  exchCode: marketText("Exchange code", 10).uppercase(),
  securityType: marketText("Security type", 50),
  securityType2: marketText("Security type 2", 50),
};

export const createInstrumentSchema = Joi.object({
  name: Joi.string().trim().max(100).required().messages({
    "string.base": "Instrument name must be text.",
    "string.empty": "Instrument name is required.",
    "string.max": "Instrument name must be at most {#limit} characters long.",
    "any.required": "Instrument name is required.",
    }),
    type: Joi.string().valid(...INSTRUMENT_TYPES).required().messages({
    "any.only": INVALID_TYPE_MESSAGE,
    "any.required": "Instrument type is required.",
    }),
    issuerId: Joi.string().when("type", {
    // required(): without it the condition also matches when type is not sent (e.g. on updates)
    is: Joi.valid("stock", "bond").required(),
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
    ...marketDataKeys,
});

export const updateInstrumentSchema = Joi.object({
  name: Joi.string().trim().max(100).messages({
    "string.base": "Instrument name must be text.",
    "string.empty": "Instrument name cannot be empty.",
    "string.max": "Instrument name must be at most {#limit} characters long.",
    }),
    type: Joi.string().valid(...INSTRUMENT_TYPES).messages({
    "any.only": INVALID_TYPE_MESSAGE,
    }),
    issuerId: Joi.string().when("type", {
    // required(): without it the condition also matches when type is not sent (e.g. on updates)
    is: Joi.valid("stock", "bond").required(),
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
    ...marketDataKeys,
})
  .min(1)
  .messages({
    "object.min": "At least one field must be provided for update.",
  });

// GET /v1/instrument filters; q searches the name and the ticker
export const instrumentQuerySchema = paginationQuerySchema.keys({
  type: Joi.string().valid(...INSTRUMENT_TYPES).messages({
    "any.only": INVALID_TYPE_MESSAGE,
  }),
  q: filterText("Name"),
  isin: filterText("ISIN").uppercase(),
});
