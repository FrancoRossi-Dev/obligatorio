import express from 'express';
import { me, myPlan, upgradePlan } from '../controllers/user.controller.js';
import { authorizeMiddleware } from '../middlewares/authorize.middleware.js';
import { validateBodyMiddleware } from '../middlewares/validatedBody.middleware.js';
import { changePlanSchema } from '../validators/user.validators.js';

const router = express.Router({ mergeParams: true });

router.get('/me', me);

// plans (admins don't have one)
router
  .route('/me/plan')
  .get(authorizeMiddleware('advisor'), myPlan)
  .patch(authorizeMiddleware('advisor'), validateBodyMiddleware(changePlanSchema), upgradePlan);

export default router;
