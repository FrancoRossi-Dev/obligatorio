import BankAccount from '../models/bank-account.model.js';

export const getBankAccountsService = async () => {
  const bankAccounts = await BankAccount.find({ isDeleted: false });
  return bankAccounts;
};

export const getBankAccountByIdService = async (id) => {
  const bankAccount = await BankAccount.findOne({ _id: id, isDeleted: false });
  return bankAccount;
};

export const createBankAccountService = async (bankAccountData) => {
  const bankAccount = new BankAccount(bankAccountData);
  await bankAccount.save();
  return bankAccount;
};

export const updateBankAccountService = async (id, bankAccountData) => {
  const bankAccount = await BankAccount.findOneAndUpdate(
    { _id: id, isDeleted: false },
    bankAccountData,
    { returnDocument: 'after', runValidators: true },
  );
  return bankAccount;
};

export const deleteBankAccountService = async (id) => {
  const bankAccount = await BankAccount.findOneAndUpdate(
    { _id: id, isDeleted: false },
    { isDeleted: true },
    { returnDocument: 'after' },
  );
  return bankAccount;
};
