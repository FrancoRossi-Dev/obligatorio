import mongoose from 'mongoose';
import Bank from '../models/bank.model.js';
import Client from '../models/client.model.js';
import { ERRORS, httpError } from '../utils/http-error.js';
import { paginate } from '../utils/pagination.js';
import { equalsIgnoreCase } from '../utils/filters.js';

const buildBankFilter = (filter, { country, region }) => {
  if (country) filter.country = equalsIgnoreCase(country);
  if (region) filter.region = equalsIgnoreCase(region);
  return filter;
};

export const getBanksService = async (filters, pagination) =>
  paginate(Bank, buildBankFilter({ isDeleted: false }, filters), pagination);

export const getBankByIDService = async (id) => {
  const bank = await Bank.findById(id);
  return bank;
};

export const createBankService = async (bankData) => {
  const bank = new Bank(bankData);
  await bank.save();
  return bank;
};

export const updateBankService = async (id, bankData) => {
  const bank = await Bank.findByIdAndUpdate(id, bankData, { returnDocument: 'after' });
  return bank;
};

// A bank can't be removed while an active client still holds an active account in it
export const deleteBankService = async (id) => {
  const bank = await Bank.findOne({ _id: id, isDeleted: false });
  if (!bank) return null;

  const inUse = await Client.exists({
    isDeleted: false,
    bankAccounts: { $elemMatch: { bankId: bank._id, isDeleted: false } },
  });
  if (inUse) throw httpError(ERRORS.bankInUse);

  bank.isDeleted = true;
  await bank.save();
  return bank;
};

// Bank accounts are embedded in Client, so they're counted across the advisor's active clients
export const countActiveBankAccountsService = async (advisorId) => {
  const [result] = await Client.aggregate([
    { $match: { advisorId: new mongoose.Types.ObjectId(advisorId), isDeleted: false } },
    { $unwind: '$bankAccounts' },
    { $match: { 'bankAccounts.isDeleted': false } },
    { $count: 'used' },
  ]);
  return result?.used ?? 0;
};
