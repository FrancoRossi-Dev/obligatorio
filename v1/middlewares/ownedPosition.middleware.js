import { canAccessClient, getClientByIdService } from '../services/client.services.js';
import { getPositionByIdService } from '../services/position.services.js';
import { ERRORS, httpError } from '../utils/http-error.js';

// Must run after authentication and params validation. A position belongs to whoever owns its
// client; one of another advisor's client, or of a deleted client, is reported as not found
export const ownedPositionMiddleware = async (req, res, next) => {
  const position = await getPositionByIdService(req.validatedParams.positionId);
  const client = position && (await getClientByIdService(position.clientId));
  if (!client || !canAccessClient(client, req.decoded)) throw httpError(ERRORS.positionNotFound);
  req.position = position;
  req.client = client;
  next();
};
