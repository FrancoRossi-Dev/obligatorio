import express from 'express';
import {
  createAdvisor,
  deleteAdvisor,
  getAdvisors,
  me,
  myPlan,
  updateAdvisor,
  upgradePlan,
} from '../controllers/user.controller.js';
import { authorizeMiddleware } from '../middlewares/authorize.middleware.js';
import { validateBodyMiddleware } from '../middlewares/validatedBody.middleware.js';
import { validateQueryMiddleware } from '../middlewares/validatedQuery.middleware.js';
import { validateParamsMiddleware } from '../middlewares/validatedParams.middleware.js';
import {
  advisorParamsSchema,
  changePlanSchema,
  createAdvisorSchema,
  updateAdvisorSchema,
} from '../validators/user.validators.js';
import { paginationQuerySchema } from '../validators/pagination.validators.js';

const router = express.Router({ mergeParams: true });

const adminOnly = authorizeMiddleware('admin');
const advisorParams = validateParamsMiddleware(advisorParamsSchema);

router.get('/me', me);

// plans (admins don't have one)
router
  .route('/me/plan')
  .get(authorizeMiddleware('advisor'), myPlan)
  .patch(authorizeMiddleware('advisor'), validateBodyMiddleware(changePlanSchema), upgradePlan);

// Advisor accounts, managed by an admin
router
  .route('/advisors')
  .get(adminOnly, validateQueryMiddleware(paginationQuerySchema), getAdvisors)
  .post(adminOnly, validateBodyMiddleware(createAdvisorSchema), createAdvisor);

router
  .route('/advisors/:id')
  .patch(adminOnly, advisorParams, validateBodyMiddleware(updateAdvisorSchema), updateAdvisor)
  .delete(adminOnly, advisorParams, deleteAdvisor);

export default router;
