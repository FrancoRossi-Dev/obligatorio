import jwt from 'jsonwebtoken';
import { ERRORS, httpError } from '../utils/http-error.js';

// The token is expected in the Authorization header as "Bearer <token>"
export const authenticateMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) throw httpError(ERRORS.tokenMissing);

  const token = authHeader.split(' ')[1];
  if (!token) throw httpError(ERRORS.tokenInvalid);

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    throw httpError(ERRORS.tokenInvalid);
  }

  // A valid token attaches the user's identity to the request
  req.decoded = decoded;
  next();
};
