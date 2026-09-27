import { validationError } from '../utils/http-error.js';

// Express 5 exposes req.query as a read-only getter, so the validated values go to req.validatedQuery
export const validateQueryMiddleware = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.query, { abortEarly: false });
    if (error) throw validationError(error);
    req.validatedQuery = value;
    next();
  };
};
