import express from 'express';
import { validateBodyMiddleware } from '../middlewares/validatedBody.middleware.js';
import { validateQueryMiddleware } from '../middlewares/validatedQuery.middleware.js';
import { validateParamsMiddleware } from '../middlewares/validatedParams.middleware.js';
import { ownedPositionMiddleware } from '../middlewares/ownedPosition.middleware.js';
import {
  createPositions,
  getPositions,
  getPositionById,
  updatePosition,
  deletePosition,
} from '../controllers/position.controller.js';
import {
  createPositionsSchema,
  positionParamsSchema,
  updatePositionSchema,
} from '../validators/positions.validators.js';
import { paginationQuerySchema } from '../validators/pagination.validators.js';

const router = express.Router({ mergeParams: true });

const paginated = validateQueryMiddleware(paginationQuerySchema);

const ownedPosition = [validateParamsMiddleware(positionParamsSchema), ownedPositionMiddleware];

router.get('/', paginated, getPositions).post('/', validateBodyMiddleware(createPositionsSchema), createPositions);

router
  .get('/:positionId', ownedPosition, getPositionById)
  .patch('/:positionId', ownedPosition, validateBodyMiddleware(updatePositionSchema), updatePosition)
  .delete('/:positionId', ownedPosition, deletePosition);

export default router;
