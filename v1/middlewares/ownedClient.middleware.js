import { canAccessClient, getClientByIdService } from '../services/client.services.js';
import { ERRORS, httpError } from '../utils/http-error.js';

// Must run after authentication and params validation; another advisor's client is reported as not found
export const ownedClientMiddleware = async (req, res, next) => {
  const client = await getClientByIdService(req.validatedParams.clientId);
  if (!client || !canAccessClient(client, req.decoded)) throw httpError(ERRORS.clientNotFound);
  req.client = client;
  next();
};
