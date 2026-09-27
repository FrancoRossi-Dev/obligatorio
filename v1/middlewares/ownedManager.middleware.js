import { canAccessManager, getManagerByIdService } from '../services/manager.services.js';
import { ERRORS, httpError } from '../utils/http-error.js';

// Must run after authentication and params validation; another advisor's manager is reported as not found
export const ownedManagerMiddleware = async (req, res, next) => {
  const manager = await getManagerByIdService(req.validatedParams.managerId);
  if (!manager || !canAccessManager(manager, req.decoded)) throw httpError(ERRORS.managerNotFound);
  req.manager = manager;
  next();
};
