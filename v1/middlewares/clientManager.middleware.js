import { getManagerByIdService } from '../services/manager.services.js';
import { ERRORS, httpError } from '../utils/http-error.js';

const MANAGER_NOT_IN_TEAM = [
  { field: 'managerId', message: "The manager must be an active member of the client's advisor team." },
];

// Must run after the advisor is settled (assignAdvisorMiddleware or lockAdvisorMiddleware).
// A client is handled by a manager of its own advisor; this is checked again when an admin moves
// the client to another advisor, even if the manager stays the same. On updates it needs req.client
export const clientManagerMiddleware = async (req, res, next) => {
  const { managerId, advisorId } = req.validatedBody;
  if (!managerId && !advisorId) return next();

  const manager = await getManagerByIdService(managerId ?? req.client.managerId);
  const clientAdvisorId = advisorId ?? req.client.advisorId;
  if (!manager || !manager.advisorId.equals(clientAdvisorId)) {
    throw httpError(ERRORS.managerNotInTeam, MANAGER_NOT_IN_TEAM);
  }
  next();
};
