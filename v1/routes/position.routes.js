import express from 'express';
import { validateBodyMiddleware } from '../middlewares/validatedBody.middleware.js';
import {
  createPositions,
  getPositions,
  getPositionById,
  updatePosition,
  deletePosition,
} from '../controllers/position.controller.js';
import { createPositionsSchema, updatePositionSchema } from '../validators/positions.validators.js';

const router = express.Router({ mergeParams: true });

router.get('/', getPositions).post('/', validateBodyMiddleware(createPositionsSchema), createPositions);

router
  .get('/:id', getPositionById)
  .patch('/:id', validateBodyMiddleware(updatePositionSchema), updatePosition)
  .delete('/:id', deletePosition);

export default router;
