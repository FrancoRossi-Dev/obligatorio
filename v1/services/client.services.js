import Bank from '../models/bank.model.js';
import Client from '../models/client.model.js';
import Position from '../models/position.model.js';
import { ERRORS, httpError } from '../utils/http-error.js';
import { paginate } from '../utils/pagination.js';

export const getClientsService = async (filter, pagination) =>
  paginate(Client, { ...filter, isDeleted: false }, pagination);

export const getClientIdsByAdvisorService = async (advisorId) => {
  const ids = await Client.distinct('_id', { advisorId, isDeleted: false });
  return ids;
};

export const getClientByIdService = async (id) => {
  const client = await Client.findOne({ _id: id, isDeleted: false });
  return client;
};

// Advisors can only reach their own clients; other roles reach every client
export const canAccessClient = (client, { id, role }) => role !== 'advisor' || client.advisorId.equals(id);

export const getClientsByIdsService = async (ids) => {
  const clients = await Client.find({ _id: { $in: ids }, isDeleted: false });
  return clients;
};

export const createClientService = async (clientData) => {
  const client = new Client(clientData);
  await client.save();
  return client;
};

// clientDetails is sent partially, so each field is set on its own path ('clientDetails.country');
// setting the whole object would replace the subdocument and drop the fields that were not sent.
// bankAccounts, by contrast, is replaced as a whole on purpose (see planLimit.middleware.js).
const toClientUpdate = ({ clientDetails, ...clientData }) => {
  if (!clientDetails) return clientData;
  const detailPaths = Object.entries(clientDetails).map(([field, value]) => [`clientDetails.${field}`, value]);
  return { ...clientData, ...Object.fromEntries(detailPaths) };
};

export const updateClientService = async (id, clientData) => {
  const client = await Client.findOneAndUpdate({ _id: id, isDeleted: false }, toClientUpdate(clientData), {
    returnDocument: 'after',
    runValidators: true,
  });
  return client;
};

export const countActiveClientsService = async (advisorId) => {
  const count = await Client.countDocuments({ advisorId, isDeleted: false });
  return count;
};

// Joi accepts uppercase hex ids, while ObjectId#toString() is lowercase
const normalizeId = (id) => String(id).toLowerCase();
const accountKey = ({ bankId, number }) => `${normalizeId(bankId)}:${number}`;

// Positions reference accounts by _id, so an update must send every stored account back with it:
// accounts are never dropped, only marked isDeleted, and their bank and number never change
const assertStoredAccountsKept = (client, incomingById) => {
  const storedIds = new Set(client.bankAccounts.map((account) => account.id));
  const unknownId = [...incomingById.keys()].find((id) => !storedIds.has(id));
  if (unknownId) throw httpError(ERRORS.bankAccountNotFound, { bankAccountId: unknownId });

  const missing = client.bankAccounts.find((account) => !incomingById.has(account.id));
  if (missing) throw httpError(ERRORS.bankAccountMissing, { bankAccountId: missing.id });

  const changed = client.bankAccounts.find(
    (account) => accountKey(account) !== accountKey(incomingById.get(account.id)),
  );
  if (changed) throw httpError(ERRORS.bankAccountImmutable, { bankAccountId: changed.id });
};

// Every active account must point to an active bank
const assertBanksActive = async (activeAccounts) => {
  const bankIds = [...new Set(activeAccounts.map(({ bankId }) => normalizeId(bankId)))];
  const found = await Bank.distinct('_id', { _id: { $in: bankIds }, isDeleted: false });
  const foundIds = new Set(found.map(normalizeId));
  const missingBankId = bankIds.find((id) => !foundIds.has(id));
  if (missingBankId) throw httpError(ERRORS.bankNotFound, { bankId: missingBankId });
};

// A bank and number identify one active account across every active client. The incoming list
// is the client's full list, so its own stored accounts are checked against the list, not the database
const assertAccountsUnique = async (activeAccounts, clientId) => {
  const keys = activeAccounts.map(accountKey);
  const repeated = activeAccounts.find((account, index) => keys.indexOf(accountKey(account)) !== index);
  if (repeated) throw httpError(ERRORS.bankAccountTaken, { number: repeated.number });

  const holder = await Client.findOne({
    ...(clientId && { _id: { $ne: clientId } }),
    isDeleted: false,
    $or: activeAccounts.map(({ bankId, number }) => ({
      bankAccounts: { $elemMatch: { bankId, number, isDeleted: false } },
    })),
  });
  if (!holder) return;
  const taken = holder.bankAccounts.find((account) => !account.isDeleted && keys.includes(accountKey(account)));
  throw httpError(ERRORS.bankAccountTaken, { number: taken?.number });
};

// An account can't be marked isDeleted while it still holds active positions
const assertDeactivatedAccountsUnused = async (client, incomingById) => {
  const deactivatedIds = client.bankAccounts
    .filter((account) => !account.isDeleted && incomingById.get(account.id).isDeleted)
    .map((account) => account._id);
  if (deactivatedIds.length === 0) return;

  const inUse = await Position.findOne({
    clientId: client._id,
    bankAccountId: { $in: deactivatedIds },
    isDeleted: false,
  });
  if (inUse) throw httpError(ERRORS.bankAccountInUse, { bankAccountId: inUse.bankAccountId });
};

// Checks the full incoming account list of a new client, or of an existing one when client is given
export const assertBankAccountsService = async (incomingAccounts, client = null) => {
  const incomingById = new Map(
    incomingAccounts.filter((account) => account._id).map((account) => [normalizeId(account._id), account]),
  );
  if (client) assertStoredAccountsKept(client, incomingById);

  const activeAccounts = incomingAccounts.filter((account) => !account.isDeleted);
  if (activeAccounts.length > 0) {
    await assertBanksActive(activeAccounts);
    await assertAccountsUnique(activeAccounts, client?._id);
  }

  if (client) await assertDeactivatedAccountsUnused(client, incomingById);
};

// A client can't be removed while it still has active bank accounts
export const deleteClientService = async (id) => {
  const client = await Client.findOne({ _id: id, isDeleted: false });
  if (!client) return null;
  if (client.bankAccounts.some((account) => !account.isDeleted)) throw httpError(ERRORS.clientHasAccounts);

  client.isDeleted = true;
  await client.save();
  return client;
};
