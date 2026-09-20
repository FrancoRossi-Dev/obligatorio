import express from 'express';
import { validateBodyMiddleware } from '../middlewares/validatedBody.middleware';
const router = express.Router({ mergeParams: true });

// @TODO
// write joi
let createInstrumentSchema = null,
  updateInstrumentSchema = null;

// write services
let createInstrument = null,
  updateInstrument = null,
  getAllInstruments = null,
  getInstrumentByID = null,
  deleteInstrument = null;

// login
router
  .get('/', getAllInstruments)
  .post('/', validateBodyMiddleware(createInstrumentSchema), createInstrument)
  .get('/:id', getInstrumentByID)
  .patch('/:id', validateBodyMiddleware(updateInstrumentSchema), updateInstrument)
  .delete('/:id', deleteInstrument);

export default router;
