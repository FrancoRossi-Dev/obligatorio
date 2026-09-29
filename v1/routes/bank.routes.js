import express from 'express';
import { authorizeMiddleware } from '../middlewares/authorize.middleware.js';
import { validateBodyMiddleware } from '../middlewares/validatedBody.middleware.js';
import { validateQueryMiddleware } from '../middlewares/validatedQuery.middleware.js';
import { validateParamsMiddleware } from '../middlewares/validatedParams.middleware.js';
import { uploadImageMiddleware } from '../middlewares/multer.middleware.js';
import {
  createBank,
  getBanks,
  getBankByID,
  updateBank,
  deleteBank,
  uploadBankLogo,
} from '../controllers/bank.controller.js';
import { bankParamsSchema, bankQuerySchema, createBankSchema, updateBankSchema } from '../validators/bank.validators.js';

const router = express.Router({ mergeParams: true });

const listQuery = validateQueryMiddleware(bankQuerySchema);

// The catalog is shared by every advisor: anyone can read it, only an admin can change it
const adminOnly = authorizeMiddleware('admin');

router.get('/', listQuery, getBanks).post('/', adminOnly, validateBodyMiddleware(createBankSchema), createBank);

router
  .get('/:id', getBankByID)
  .patch('/:id', adminOnly, validateBodyMiddleware(updateBankSchema), updateBank)
  .delete('/:id', adminOnly, deleteBank);

// multipart/form-data with the logo in the "image" field
router.post(
  '/:id/uploadImage',
  adminOnly,
  validateParamsMiddleware(bankParamsSchema),
  uploadImageMiddleware,
  uploadBankLogo,
);

export default router;
