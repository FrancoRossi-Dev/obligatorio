import mongoose from 'mongoose';
import Bank from '../models/bank.model.js';
import Client from '../models/client.model.js';

export const getBanksService = async () => {
  const banks = await Bank.find({ isDeleted: false });
  return banks;
};

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

export const deleteBankService = async (id) => {
  const bank = await Bank.findById(id);
  if (!bank) return null;
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
