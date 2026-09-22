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

  manager: Joi.object({
    fullName: Joi.string().trim().max(100).required().messages({
      "string.base": "Full name must be text.",
      "string.empty": "Full name is required.",
      "string.max": "Full name must be at most {#limit} characters long.",
      "any.required": "Full name is required.",
    }),

    email: Joi.string().email().trim().max(100).required().messages({
      "string.base": "Email must be text.",
      "string.empty": "Email is required.",
      "string.email": "Email must be a valid email address.",
      "string.max": "Email must be at most {#limit} characters long.",
      "any.required": "Email is required.",
    }),
  }).required(),

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
