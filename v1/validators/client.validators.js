import Joi from "joi";

// Lowercased so ids compare equal to the ones Mongoose returns
export const clientParamsSchema = Joi.object({
  clientId: Joi.string().hex().length(24).lowercase().required().messages({
    "string.hex": "Client id is not valid.",
    "string.length": "Client id is not valid.",
    "any.required": "Client id is required.",
  }),
});

export const createClientSchema = Joi.object({
  // Taken from the token for advisors; only an admin sends it (see advisor.middleware.js)
  advisorId: Joi.string().hex().length(24).messages({
    "string.empty": "Advisor cannot be empty.",
    "string.hex": "Advisor id is not valid.",
    "string.length": "Advisor id is not valid.",
  }),

  clientDetails: Joi.object({
    commercialName: Joi.string().trim().max(100).required().messages({
      "string.base": "Commercial name must be text.",
      "string.empty": "Commercial name is required.",
      "string.max": "Commercial name must be at most {#limit} characters long.",
      "any.required": "Commercial name is required.",
    }),

    legalName: Joi.string().trim().max(100).required().messages({
      "string.base": "Legal name must be text.",
      "string.empty": "Legal name is required.",
      "string.max": "Legal name must be at most {#limit} characters long.",
      "any.required": "Legal name is required.",
    }),

    address: Joi.string().trim().max(200).optional(),

    country: Joi.string().trim().max(100).optional(),
  }).required(),

  managerId: Joi.string().hex().length(24).required().messages({
    "string.empty": "Manager is required.",
    "string.hex": "Manager id is not valid.",
    "string.length": "Manager id is not valid.",
    "any.required": "Manager is required.",
  }),

  bankAccounts: Joi.array()
    .items(
      Joi.object({
        bankId: Joi.string().required().messages({
          "string.empty": "Bank ID is required.",
          "any.required": "Bank ID is required.",
        }),
        number: Joi.string().trim().required().messages({
          "string.empty": "Bank account number is required.",
          "any.required": "Bank account number is required.",
        }),
        accountName: Joi.string().trim().required().messages({
          "string.empty": "Bank account name is required.",
          "any.required": "Bank account name is required.",
        }),
        currency: Joi.string().trim().required().messages({
          "string.empty": "Currency is required.",
          "any.required": "Currency is required.",
        }),
        isDeleted: Joi.boolean().default(false)
      }),
    )
    .default([]),
});

export const updateClientSchema = Joi.object({
  advisorId: Joi.string().hex().length(24).messages({
    "string.empty": "Advisor cannot be empty.",
    "string.hex": "Advisor id is not valid.",
    "string.length": "Advisor id is not valid.",
  }),

  clientDetails: Joi.object({
    commercialName: Joi.string().trim().max(100).messages({
      "string.base": "Commercial name must be text.",
      "string.empty": "Commercial name cannot be empty.",
      "string.max": "Commercial name must be at most {#limit} characters long.",
    }),

    legalName: Joi.string().trim().max(100).messages({
      "string.base": "Legal name must be text.",
      "string.empty": "Legal name cannot be empty.",
      "string.max": "Legal name must be at most {#limit} characters long.",
    }),

    address: Joi.string().trim().max(200).optional(),

    country: Joi.string().trim().max(100).optional(),
  }),

  managerId: Joi.string().hex().length(24).messages({
    "string.empty": "Manager cannot be empty.",
    "string.hex": "Manager id is not valid.",
    "string.length": "Manager id is not valid.",
  }),

  bankAccounts: Joi.array().items(
    Joi.object({
      bankId: Joi.string().required().messages({
        "string.empty": "Bank ID is required.",
        "any.required": "Bank ID is required.",
      }),
      number: Joi.string().trim().required().messages({
        "string.empty": "Bank account number is required.",
        "any.required": "Bank account number is required.",
      }),
      accountName: Joi.string().trim().required().messages({
        "string.empty": "Bank account name is required.",
        "any.required": "Bank account name is required.",
      }),
      currency: Joi.string().trim().required().messages({
        "string.empty": "Currency is required.",
        "any.required": "Currency is required.",
      }),
      isDeleted: Joi.boolean().default(false)
    }),
  ),
})
  .min(1)
  .messages({
    "object.min": "At least one field must be provided for update.",
  });
