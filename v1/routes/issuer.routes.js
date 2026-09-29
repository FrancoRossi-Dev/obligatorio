import express from 'express';
import { authorizeMiddleware } from '../middlewares/authorize.middleware.js';
import { validateBodyMiddleware } from '../middlewares/validatedBody.middleware.js';
import { validateQueryMiddleware } from '../middlewares/validatedQuery.middleware.js';
import {
  createIssuer,
  getIssuers,
  getIssuerById,
  updateIssuer,
  deleteIssuer,
} from '../controllers/issuer.controller.js';
import { createIssuerSchema, updateIssuerSchema } from '../validators/issuer.validators.js';
import { paginationQuerySchema } from '../validators/pagination.validators.js';

const router = express.Router({ mergeParams: true });

const paginated = validateQueryMiddleware(paginationQuerySchema);

// The catalog is shared by every advisor: anyone can read it, only an admin can change it
const adminOnly = authorizeMiddleware('admin');

router.get('/', paginated, getIssuers).post('/', adminOnly, validateBodyMiddleware(createIssuerSchema), createIssuer);

router
  .get('/:id', getIssuerById)
  .patch('/:id', adminOnly, validateBodyMiddleware(updateIssuerSchema), updateIssuer)
  .delete('/:id', adminOnly, deleteIssuer);

export default router;
