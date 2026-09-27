import express from 'express';
import { validateBodyMiddleware } from '../middlewares/validatedBody.middleware.js';
import { validateParamsMiddleware } from '../middlewares/validatedParams.middleware.js';
import { ownedClientMiddleware } from '../middlewares/ownedClient.middleware.js';
import { assignAdvisorMiddleware, lockAdvisorMiddleware } from '../middlewares/advisor.middleware.js';
import { clientManagerMiddleware } from '../middlewares/clientManager.middleware.js';
import {
  createClientPlanLimitMiddleware,
  updateClientPlanLimitMiddleware,
} from '../middlewares/planLimit.middleware.js';
import {
  createClient,
  getClients,
  getClientById,
  updateClient,
  deleteClient,
} from '../controllers/client.controller.js';
import {
  clientParamsSchema,
  createClientSchema,
  updateClientSchema,
} from '../validators/client.validators.js';

const router = express.Router({ mergeParams: true });

const ownedClient = [validateParamsMiddleware(clientParamsSchema), ownedClientMiddleware];

router
  .get('/', getClients)
  .post(
    '/',
    validateBodyMiddleware(createClientSchema),
    assignAdvisorMiddleware,
    createClientPlanLimitMiddleware,
    clientManagerMiddleware,
    createClient,
  );

router
  .get('/:clientId', ownedClient, getClientById)
  .patch(
    '/:clientId',
    ownedClient,
    validateBodyMiddleware(updateClientSchema),
    lockAdvisorMiddleware,
    updateClientPlanLimitMiddleware,
    clientManagerMiddleware,
    updateClient,
  )
  .delete('/:clientId', ownedClient, deleteClient);

export default router;
