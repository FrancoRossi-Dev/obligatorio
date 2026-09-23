import {
  createBankService,
  deleteBankService,
  getBankByIDService,
  getBanksService,
  updateBankService,
} from '../services/bank.services.js';

const BANK_MESSAGES = {
  empty: 'No banks are registered yet.',
  notFound: 'Bank not found.',
  created: 'Bank has been registered successfully.',
  updated: 'Bank has been updated successfully.',
  deleted: 'Bank has been deactivated successfully.',
};

export const getBanks = async (req, res) => {
  const banks = await getBanksService();
  if (banks.length === 0) return res.status(404).json({ message: BANK_MESSAGES.empty });
  res.status(200).json(banks);
};

export const createBank = async (req, res) => {
  const bank = await createBankService(req.validatedBody);
  return res.status(201).json({ bankID: bank.id, message: BANK_MESSAGES.created });
};

export const getBankByID = async (req, res) => {
  const { id } = req.params;
  const bank = await getBankByIDService(id);
  if (!bank || bank.isDeleted) return res.status(404).json({ message: BANK_MESSAGES.notFound });
  res.status(200).json(bank);
};

export const updateBank = async (req, res) => {
  const { id } = req.params;
  const bank = await updateBankService(id, req.validatedBody);
  if (!bank) return res.status(404).json({ message: BANK_MESSAGES.notFound });
  res.status(200).json({ bank, message: BANK_MESSAGES.updated });
};

export const deleteBank = async (req, res) => {
  const { id } = req.params;
  const bank = await deleteBankService(id);
  if (!bank) return res.status(404).json({ message: BANK_MESSAGES.notFound });
  return res.status(200).json({ message: BANK_MESSAGES.deleted });
};
