import { validationError } from '../utils/http-error.js';

export const validateParamsMiddleware = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.params, { abortEarly: false });
    if (error) throw validationError(error);
    req.validatedParams = value;
    next();
  };
};
