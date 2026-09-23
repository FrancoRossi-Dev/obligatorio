import express from 'express';
import { validateBodyMiddleware } from '../middlewares/validatedBody.middleware.js';
import {
  createPosition,
  getPositions,
  getPositionById,
  updatePosition,
  deletePosition,
} from '../controllers/position.controller.js';
import { createPositionSchema, updatePositionSchema } from '../validators/positions.validators.js';

const router = express.Router({ mergeParams: true });

router
  .get('/', getPositions)
  .post('/', validateBodyMiddleware(createPositionSchema), createPosition)
  .post('/createMultiple', validateMultipleInstruments(), createMultiplePositions);

router
  .get('/:id', getPositionById)
  .patch('/:id', validateBodyMiddleware(updatePositionSchema), updatePosition)
  .delete('/:id', deletePosition);

export default router;
