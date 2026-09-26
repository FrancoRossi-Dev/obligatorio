import Joi from "joi";

export const createClientSchema = Joi.object({
  advisorId: Joi.string().required().messages({
    "string.empty": "Advisor is required.",
    "any.required": "Advisor is required.",
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

  managerId: Joi.string().required().messages({
    "string.empty": "Manager is required.",
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
  advisorId: Joi.string().messages({
    "string.empty": "Advisor cannot be empty.",
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

  managerId: Joi.string().messages({
    "string.empty": "Manager cannot be empty.",
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
