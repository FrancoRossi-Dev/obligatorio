import jwt from 'jsonwebtoken';
import RevokedToken from '../models/revoked-token.model.js';
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

  // Tokens without a jti predate logout support and can't be revoked, so they are not accepted
  if (!decoded.jti) throw httpError(ERRORS.tokenInvalid);
  if (await RevokedToken.exists({ jti: decoded.jti })) throw httpError(ERRORS.tokenRevoked);

  // A valid token attaches the user's identity to the request
  req.decoded = decoded;
  next();
};
