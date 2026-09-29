import express from 'express';
import { validateBodyMiddleware } from '../middlewares/validatedBody.middleware.js';
import { validateQueryMiddleware } from '../middlewares/validatedQuery.middleware.js';
import {
  createInstrument,
  getInstruments,
  getInstrumentById,
  updateInstrument,
  deleteInstrument,
} from '../controllers/instrument.controller.js';
import {
  createInstrumentSchema,
  updateInstrumentSchema,
} from '../validators/instrument.validators.js';
import { paginationQuerySchema } from '../validators/pagination.validators.js';

const router = express.Router({ mergeParams: true });

const paginated = validateQueryMiddleware(paginationQuerySchema);

router
  .get('/', paginated, getInstruments)
  .post('/', validateBodyMiddleware(createInstrumentSchema), createInstrument);

router
  .get('/:id', getInstrumentById)
  .patch('/:id', validateBodyMiddleware(updateInstrumentSchema), updateInstrument)
  .delete('/:id', deleteInstrument);

export default router;
