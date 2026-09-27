import User, { Advisor } from '../models/user.model.js';
import { countActiveBankAccountsService } from './bank.services.js';
import { countActiveClientsService } from './client.services.js';
import { ERRORS, httpError } from '../utils/http-error.js';
import { BASE_PLAN_LIMIT } from '../constants/plans.js';

export const getUsersService = async () => {
  const users = await User.find({ isDeleted: { $ne: true } });
  return users;
};

export const getUserByIdService = async (id) => {
  const user = await User.findOne({ _id: id, isDeleted: { $ne: true } });
  return user;
};

export const createUserService = async (userData) => {
  const user = new User(userData);
  await user.save();
  return user;
};

export const updateUserService = async (id, userData) => {
  const user = await User.findOneAndUpdate({ _id: id, isDeleted: { $ne: true } }, userData, {
    returnDocument: 'after',
  });
  return user;
};

export const deleteUserService = async (id) => {
  const user = await User.findOneAndUpdate(
    { _id: id, isDeleted: { $ne: true } },
    { isDeleted: true },
    { returnDocument: 'after' },
  );
  return user;
};

export const getMeService = async (id) => {
  const user = await getUserByIdService(id);
  if (!user) throw httpError(ERRORS.userNotFound);
  return user;
};

// On base, active clients and active bank accounts share the same limit; premium has none (null)
const getAdvisorPlanUsage = async (advisorId) => {
  const advisor = await Advisor.findOne({ _id: advisorId, isDeleted: { $ne: true } });
  if (!advisor) return null;

  const [used, clientsRegistered] = await Promise.all([
    countActiveBankAccountsService(advisorId),
    countActiveClientsService(advisorId),
  ]);
  const limit = advisor.planTier === 'premium' ? null : BASE_PLAN_LIMIT;
  return { planTier: advisor.planTier, used, limit, clientsRegistered };
};

export const getPlanUsageService = async (advisorId) => {
  const usage = await getAdvisorPlanUsage(advisorId);
  if (!usage) throw httpError(ERRORS.userNotFound);
  return usage;
};

// Each count is only checked when the request adds to it, so data already over the limit stays editable
export const assertPlanLimitService = async (advisorId, { addedClients = 0, addedAccounts = 0 }) => {
  if (addedClients <= 0 && addedAccounts <= 0) return;

  const usage = await getAdvisorPlanUsage(advisorId);
  if (!usage) throw httpError(ERRORS.advisorNotFound, { advisorId });

  const { limit, clientsRegistered, used } = usage;
  if (limit === null) return;

  if (addedClients > 0 && clientsRegistered + addedClients > limit) {
    throw httpError(ERRORS.clientLimitReached, { limit, current: clientsRegistered });
  }
  if (addedAccounts > 0 && used + addedAccounts > limit) {
    throw httpError(ERRORS.accountLimitReached, { limit, current: used });
  }
};

export const upgradePlanService = async (advisorId) => {
  const advisor = await Advisor.findOneAndUpdate(
    { _id: advisorId, planTier: 'base', isDeleted: { $ne: true } },
    { planTier: 'premium' },
    { returnDocument: 'after' },
  );
  if (advisor) return advisor;

  if (await Advisor.exists({ _id: advisorId, isDeleted: { $ne: true } })) {
    throw httpError(ERRORS.alreadyPremium);
  }
  throw httpError(ERRORS.userNotFound);
};
