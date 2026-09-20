import { validationError } from '../utils/http-error.js';

export const validateBodyMiddleware = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, { abortEarly: false });
    if (error) throw validationError(error);
    req.validatedBody = value;
    next();
  };
};
