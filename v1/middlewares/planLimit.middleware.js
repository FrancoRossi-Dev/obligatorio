import { assertPlanLimitService } from '../services/user.services.js';

const countActiveAccounts = (bankAccounts = []) =>
  bankAccounts.filter((account) => !account.isDeleted).length;

// Must run after body validation. The limit belongs to the advisor who will own the client,
// so an admin's request is checked against that advisor's plan
export const createClientPlanLimitMiddleware = async (req, res, next) => {
  try {
    const { advisorId, bankAccounts } = req.validatedBody;
    await assertPlanLimitService(advisorId, {
      addedClients: 1,
      addedAccounts: countActiveAccounts(bankAccounts),
    });
    next();
  } catch (error) {
    next(error);
  }
};

// bankAccounts replaces the stored array on update, so only the difference counts;
// moving the client to another advisor adds the client and all its accounts to that advisor.
// Must run after ownedClientMiddleware, which loads req.client
export const updateClientPlanLimitMiddleware = async (req, res, next) => {
  try {
    const { advisorId, bankAccounts } = req.validatedBody;
    const { client } = req;

    const storedAccounts = countActiveAccounts(client.bankAccounts);
    const incomingAccounts = bankAccounts ? countActiveAccounts(bankAccounts) : storedAccounts;
    const changesOwner = advisorId !== undefined && !client.advisorId.equals(advisorId);

    await assertPlanLimitService(advisorId ?? client.advisorId, {
      addedClients: changesOwner ? 1 : 0,
      addedAccounts: changesOwner ? incomingAccounts : incomingAccounts - storedAccounts,
    });
    next();
  } catch (error) {
    next(error);
  }
};
