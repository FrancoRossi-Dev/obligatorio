import { ERRORS, httpError } from '../utils/http-error.js';

const ADVISOR_REQUIRED = [{ field: 'advisorId', message: 'Advisor is required.' }];

// Clients and managers belong to an advisor. Must run after body validation.
// An advisor always owns what they create, whatever the body says; only an admin picks the
// advisor, and has to
export const assignAdvisorMiddleware = (req, res, next) => {
  const { id, role } = req.decoded;
  if (role === 'advisor') req.validatedBody.advisorId = id;
  else if (!req.validatedBody.advisorId) throw httpError(ERRORS.invalidData, ADVISOR_REQUIRED);
  next();
};

// An advisor can't hand a client or a manager over to another advisor; only an admin can reassign it
export const lockAdvisorMiddleware = (req, res, next) => {
  if (req.decoded.role === 'advisor') delete req.validatedBody.advisorId;
  next();
};
