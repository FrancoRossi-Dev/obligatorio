import express from 'express';
import { validateBodyMiddleware } from '../middlewares/validatedBody.middleware.js';
import {
  createManager,
  getManagers,
  getManagerById,
  updateManager,
  deleteManager,
} from '../controllers/manager.controller.js';
import { createManagerSchema, updateManagerSchema } from '../validators/manager.validators.js';

const router = express.Router({ mergeParams: true });

router.get('/', getManagers).post('/', validateBodyMiddleware(createManagerSchema), createManager);

router
  .get('/:id', getManagerById)
  .patch('/:id', validateBodyMiddleware(updateManagerSchema), updateManager)
  .delete('/:id', deleteManager);

export default router;
