import express from 'express';
import { validateBodyMiddleware } from '../middlewares/validatedBody.middleware.js';
import {
  createIssuer,
  getIssuers,
  getIssuerById,
  updateIssuer,
  deleteIssuer,
} from '../controllers/issuer.controller.js';
import { createIssuerSchema, updateIssuerSchema } from '../validators/issuer.validators.js';

const router = express.Router({ mergeParams: true });

router.get('/', getIssuers).post('/', validateBodyMiddleware(createIssuerSchema), createIssuer);

router
  .get('/:id', getIssuerById)
  .patch('/:id', validateBodyMiddleware(updateIssuerSchema), updateIssuer)
  .delete('/:id', deleteIssuer);

export default router;
