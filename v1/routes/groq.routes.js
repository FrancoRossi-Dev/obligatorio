import express from 'express';
import { validateParamsMiddleware } from '../middlewares/validatedParams.middleware.js';
import { ownedClientMiddleware } from '../middlewares/ownedClient.middleware.js';
import {
  analizarNoticiasPortfolio,
  analizarNoticiasPortfolioES,
} from '../controllers/groq.controller.js';
import { clientReportParamsSchema } from '../validators/report.validators.js';

const router = express.Router({ mergeParams: true });

const validateClient = validateParamsMiddleware(clientReportParamsSchema);

// English by default; /es returns the analysis in Spanish
router
  .get('/portfolio-news/:clientId', validateClient, ownedClientMiddleware, analizarNoticiasPortfolio)
  .get(
    '/portfolio-news/:clientId/es',
    validateClient,
    ownedClientMiddleware,
    analizarNoticiasPortfolioES,
  );

export default router;
