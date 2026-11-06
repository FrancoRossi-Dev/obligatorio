import bcrypt from 'bcryptjs';
import User, { Advisor } from '../models/user.model.js';
import Manager from '../models/manager.model.js';
import { countActiveBankAccountsService } from './bank.services.js';
import { countActiveClientsService } from './client.services.js';
import { ERRORS, httpError } from '../utils/http-error.js';
import { BASE_PLAN_LIMIT } from '../constants/plans.js';
import { paginate } from '../utils/pagination.js';

// ---- Advisor accounts (admin management and self-registration) ----

const notDeleted = { isDeleted: { $ne: true } };

const hashPassword = (password) => bcrypt.hash(password, Number(process.env.SALT_ROUNDS));

// Usernames are unique across every role, deleted accounts included (the index covers them)
const assertUsernameFree = async (username, exceptId) => {
  if (await User.exists({ username, _id: { $ne: exceptId } })) {
    throw httpError(ERRORS.usernameTaken, { username });
  }
};

const assertEmailFree = async (contactEmail, exceptId) => {
  const email = contactEmail.toLowerCase().trim();
  if (await Advisor.exists({ 'details.contactEmail': email, _id: { $ne: exceptId } })) {
    throw httpError(ERRORS.emailTaken, { email: contactEmail });
  }
};

// The pre-checks can race with a concurrent write; the unique indexes have the last word
const rethrowDuplicate = (err) => {
  if (err.code === Number(process.env.MONGO_DUPLICATE_KEY)) {
    const isEmail = 'details.contactEmail' in (err.keyPattern ?? {});
    throw httpError(isEmail ? ERRORS.emailTaken : ERRORS.usernameTaken);
  }
  throw err;
};

// The Advisor discriminator already filters by role; password is select: false
export const getAdvisorsService = async (pagination) => paginate(Advisor, notDeleted, pagination);

export const createAdvisorService = async ({ username, password, details, planTier }) => {
  await assertUsernameFree(username);
  await assertEmailFree(details.contactEmail);

  try {
    const advisor = await Advisor.create({
      username,
      password: await hashPassword(password),
      details,
      planTier,
    });
    return advisor;
  } catch (err) {
    return rethrowDuplicate(err);
  }
};

export const updateAdvisorService = async (id, { username, password, details, planTier }) => {
  if (!(await Advisor.exists({ _id: id, ...notDeleted }))) {
    throw httpError(ERRORS.advisorAccountNotFound);
  }

  if (username) await assertUsernameFree(username, id);
  if (details?.contactEmail) await assertEmailFree(details.contactEmail, id);

  // Dotted paths so a partial details object only changes the keys it carries
  const changes = {};
  if (username) changes.username = username;
  if (planTier) changes.planTier = planTier;
  if (password) changes.password = await hashPassword(password);
  Object.entries(details ?? {}).forEach(([key, value]) => {
    changes[`details.${key}`] = value;
  });

  try {
    const advisor = await Advisor.findOneAndUpdate(
      { _id: id, ...notDeleted },
      { $set: changes },
      { returnDocument: 'after', runValidators: true },
    );
    return advisor;
  } catch (err) {
    return rethrowDuplicate(err);
  }
};

// Soft delete, blocked while the advisor still has active clients or managers so nothing is orphaned.
// login already ignores deleted accounts; tokens issued before stay valid until they expire.
export const deleteAdvisorService = async (id) => {
  if (!(await Advisor.exists({ _id: id, ...notDeleted }))) {
    throw httpError(ERRORS.advisorAccountNotFound);
  }

  const [clients, managers] = await Promise.all([
    countActiveClientsService(id),
    Manager.countDocuments({ advisorId: id, ...notDeleted }),
  ]);
  if (clients > 0 || managers > 0) {
    throw httpError(ERRORS.advisorInUse, { clients, managers });
  }

  const advisor = await Advisor.findOneAndUpdate(
    { _id: id, ...notDeleted },
    { isDeleted: true },
    { returnDocument: 'after' },
  );
  return advisor;
};

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
