import express from 'express';
import { validateBodyMiddleware } from '../middlewares/validatedBody.middleware.js';

const router = express.Router({ mergeParams: true });

// @TODO
// write joi
let createClientSchema = null,
  updateClientSchema = null;

// write services
let createClient = null,
  updateClient = null,
  getAllClients = null,
  getClientByID = null,
  deleteClient = null;

// login
router
  .get('/', getAllClients)
  .post('/', validateBodyMiddleware(createClientSchema), createClient)
  .get('/:id', getClientByID)
  .patch('/:id', validateBodyMiddleware(updateClientSchema), updateClient)
  .delete('/:id', deleteClient);

export default router;
