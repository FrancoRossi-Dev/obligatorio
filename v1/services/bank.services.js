import Bank from '../models/bank.model.js';

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
