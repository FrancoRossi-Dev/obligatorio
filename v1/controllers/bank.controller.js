import {
  createBankService,
  deleteBankService,
  getBankByIDService,
  getBanksService,
  updateBankService,
} from '../services/bank.services.js';
import { uploadImageService } from '../services/upload.services.js';

const BANK_LOGO_FOLDER = 'banks';

const BANK_MESSAGES = {
  notFound: 'Bank not found.',
  created: 'Bank has been registered successfully.',
  updated: 'Bank has been updated successfully.',
  logoUpdated: 'Bank logo has been updated successfully.',
  deleted: 'Bank has been deactivated successfully.',
};

export const getBanks = async (req, res) => {
  const { page, limit, ...filters } = req.validatedQuery;
  const banks = await getBanksService(filters, { page, limit });
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

// req.file is parsed by uploadImageMiddleware; the bank is checked before anything reaches Cloudinary
export const uploadBankLogo = async (req, res) => {
  const { id } = req.validatedParams;
  const stored = await getBankByIDService(id);
  if (!stored || stored.isDeleted) return res.status(404).json({ message: BANK_MESSAGES.notFound });

  const { url } = await uploadImageService(req.file.buffer, BANK_LOGO_FOLDER);
  const bank = await updateBankService(id, { logoURL: url });
  res.status(200).json({ bank, message: BANK_MESSAGES.logoUpdated });
};

export const deleteBank = async (req, res) => {
  const { id } = req.params;
  const bank = await deleteBankService(id);
  if (!bank) return res.status(404).json({ message: BANK_MESSAGES.notFound });
  return res.status(200).json({ message: BANK_MESSAGES.deleted });
};
