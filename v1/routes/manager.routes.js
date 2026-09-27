import express from 'express';
import { validateBodyMiddleware } from '../middlewares/validatedBody.middleware.js';
import { validateParamsMiddleware } from '../middlewares/validatedParams.middleware.js';
import { ownedManagerMiddleware } from '../middlewares/ownedManager.middleware.js';
import { assignAdvisorMiddleware, lockAdvisorMiddleware } from '../middlewares/advisor.middleware.js';
import {
  createManager,
  getManagers,
  getManagerById,
  updateManager,
  deleteManager,
} from '../controllers/manager.controller.js';
import {
  createManagerSchema,
  managerParamsSchema,
  updateManagerSchema,
} from '../validators/manager.validators.js';

const router = express.Router({ mergeParams: true });

const ownedManager = [validateParamsMiddleware(managerParamsSchema), ownedManagerMiddleware];

router
  .get('/', getManagers)
  .post('/', validateBodyMiddleware(createManagerSchema), assignAdvisorMiddleware, createManager);

router
  .get('/:managerId', ownedManager, getManagerById)
  .patch(
    '/:managerId',
    ownedManager,
    validateBodyMiddleware(updateManagerSchema),
    lockAdvisorMiddleware,
    updateManager,
  )
  .delete('/:managerId', ownedManager, deleteManager);

export default router;
