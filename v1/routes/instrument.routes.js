import express from 'express';
import { validateBodyMiddleware } from '../middlewares/validatedBody.middleware.js';
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

const router = express.Router({ mergeParams: true });

router
  .get('/', getInstruments)
  .post('/', validateBodyMiddleware(createInstrumentSchema), createInstrument);

router
  .get('/:id', getInstrumentById)
  .patch('/:id', validateBodyMiddleware(updateInstrumentSchema), updateInstrument)
  .delete('/:id', deleteInstrument);

export default router;
