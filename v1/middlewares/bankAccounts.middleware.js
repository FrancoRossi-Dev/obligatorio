import { assertBankAccountsService } from '../services/client.services.js';

// Must run after body validation. req.client can't tell a create from an update:
// Node's IncomingMessage already exposes it as a deprecated alias of req.socket
export const createClientBankAccountsMiddleware = async (req, res, next) => {
  try {
    await assertBankAccountsService(req.validatedBody.bankAccounts ?? []);
    next();
  } catch (error) {
    next(error);
  }
};

// Must run after body validation and ownedClientMiddleware, which loads req.client
export const updateClientBankAccountsMiddleware = async (req, res, next) => {
  try {
    const { bankAccounts } = req.validatedBody;
    if (bankAccounts) await assertBankAccountsService(bankAccounts, req.client);
    next();
  } catch (error) {
    next(error);
  }
};
