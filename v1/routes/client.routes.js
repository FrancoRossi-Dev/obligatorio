import express from 'express';
import { validateBodyMiddleware } from '../middlewares/validatedBody.middleware.js';
import {
  createClient,
  getClients,
  getClientById,
  updateClient,
  deleteClient,
} from '../controllers/client.controller.js';
import { createClientSchema, updateClientSchema } from '../validators/client.validators.js';

const router = express.Router({ mergeParams: true });

router.get('/', getClients).post('/', validateBodyMiddleware(createClientSchema), createClient);

router
  .get('/:id', getClientById)
  .patch('/:id', validateBodyMiddleware(updateClientSchema), updateClient)
  .delete('/:id', deleteClient);

export default router;
