import express from 'express';
import { validateBodyMiddleware } from '../middlewares/validatedBody.middleware.js';

const router = express.Router({ mergeParams: true });

// @TODO
// write joi
let createBankSchema = null,
  updateBankSchema = null;

// write services
let createBank = null,
  updateBank = null,
  getAllBanks = null,
  getBankByID = null,
  deleteBank = null;

// login
router.get('/', getAllBanks).post('/', validateBodyMiddleware(createBankSchema), createBank);

router
  .get('/:id', getBankByID)
  .patch('/:id', validateBodyMiddleware(updateBankSchema), updateBank)
  .delete('/:id', deleteBank);

export default router;
