import express from 'express';
import { authorizeMiddleware } from '../middlewares/authorize.middleware.js';
import { validateBodyMiddleware } from '../middlewares/validatedBody.middleware.js';
import {
  createBank,
  getBanks,
  getBankByID,
  updateBank,
  deleteBank,
} from '../controllers/bank.controller.js';
import { createBankSchema, updateBankSchema } from '../validators/bank.validators.js';

const router = express.Router({ mergeParams: true });

// The catalog is shared by every advisor: anyone can read it, only an admin can change it
const adminOnly = authorizeMiddleware('admin');

router.get('/', getBanks).post('/', adminOnly, validateBodyMiddleware(createBankSchema), createBank);

router
  .get('/:id', getBankByID)
  .patch('/:id', adminOnly, validateBodyMiddleware(updateBankSchema), updateBank)
  .delete('/:id', adminOnly, deleteBank);

export default router;
