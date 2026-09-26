import { ERRORS, httpError } from '../utils/http-error.js';

// Runs after authenticateMiddleware; lets the request through only for the given roles
export const authorizeMiddleware = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.decoded?.role)) throw httpError(ERRORS.forbidden);
    next();
  };
};
