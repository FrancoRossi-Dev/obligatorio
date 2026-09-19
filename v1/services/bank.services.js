import Bank from '../models/bank.model.js';
import BankAccount from '../models/bank-account.model.js';

export const getBanksService = async () => {
  const banks = await Bank.find();
  return banks;
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
  const bank = await Bank.findByIdAndDelete(id);
  return bank;
};
