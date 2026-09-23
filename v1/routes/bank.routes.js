import express from 'express';
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

router.get('/', getBanks).post('/', validateBodyMiddleware(createBankSchema), createBank);

router
  .get('/:id', getBankByID)
  .patch('/:id', validateBodyMiddleware(updateBankSchema), updateBank)
  .delete('/:id', deleteBank);

export default router;
