import { ERRORS } from '../utils/http-error.js';

export const errorMiddleware = (err, req, res, next) => {
  const status = err.status || ERRORS.internal.status;
  const isServerError = status >= 500;

  // Unexpected failures are logged, but their internals are never sent to the client
  if (isServerError) console.error(err);

  const message = isServerError ? ERRORS.internal.message : err.message;
  res.status(status).json({ message, details: err.details ?? null });
};
