import express from 'express';
import { validateBodyMiddleware } from '../middlewares/validatedBody.middleware.js';
import { validateQueryMiddleware } from '../middlewares/validatedQuery.middleware.js';
import { validateParamsMiddleware } from '../middlewares/validatedParams.middleware.js';
import { ownedClientMiddleware } from '../middlewares/ownedClient.middleware.js';
import { uploadImageMiddleware } from '../middlewares/multer.middleware.js';
import { assignAdvisorMiddleware, lockAdvisorMiddleware } from '../middlewares/advisor.middleware.js';
import { clientManagerMiddleware } from '../middlewares/clientManager.middleware.js';
import {
  createClientBankAccountsMiddleware,
  updateClientBankAccountsMiddleware,
} from '../middlewares/bankAccounts.middleware.js';
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
  uploadClientLogo,
} from '../controllers/client.controller.js';
import {
  clientParamsSchema,
  clientQuerySchema,
  createClientSchema,
  updateClientSchema,
} from '../validators/client.validators.js';

const router = express.Router({ mergeParams: true });

const listQuery = validateQueryMiddleware(clientQuerySchema);

const ownedClient = [validateParamsMiddleware(clientParamsSchema), ownedClientMiddleware];

router
  .get('/', listQuery, getClients)
  .post(
    '/',
    validateBodyMiddleware(createClientSchema),
    assignAdvisorMiddleware,
    createClientBankAccountsMiddleware,
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
    updateClientBankAccountsMiddleware,
    updateClientPlanLimitMiddleware,
    clientManagerMiddleware,
    updateClient,
  )
  .delete('/:clientId', ownedClient, deleteClient);

// multipart/form-data with the logo in the "image" field; ownership is checked before the file is read
router.post('/:clientId/uploadImage', ownedClient, uploadImageMiddleware, uploadClientLogo);

export default router;
