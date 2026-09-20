import express from 'express';
import { validateBodyMiddleware } from '../middlewares/validatedBody.middleware.js';

const router = express.Router({ mergeParams: true });

// @TODO
// write joi
let createCompanySchema = null,
  updateCompanySchema = null;

// write services
let createCompany = null,
  updateCompany = null,
  getAllCompanies = null,
  getCompanyByID = null,
  deleteCompany = null;

// login
router
  .get('/', getAllCompanies)
  .post('/', validateBodyMiddleware(createCompanySchema), createCompany)
  .get('/:id', getCompanyByID)
  .patch('/:id', validateBodyMiddleware(updateCompanySchema), updateCompany)
  .delete('/:id', deleteCompany);

export default router;
