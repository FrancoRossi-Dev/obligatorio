import express from 'express';
import { validateParamsMiddleware } from '../middlewares/validatedParams.middleware.js';
import { validateQueryMiddleware } from '../middlewares/validatedQuery.middleware.js';
import { ownedClientMiddleware } from '../middlewares/ownedClient.middleware.js';
import {
  clientCompositionReport,
  clientHistoricReport,
  clientInstrumentReport,
  clientIssuerReport,
  clientNewsReport,
  fullClientReport,
} from '../controllers/report.controller.js';
import {
  clientInstrumentReportParamsSchema,
  clientIssuerReportParamsSchema,
  clientNewsReportQuerySchema,
  clientReportParamsSchema,
} from '../validators/report.validators.js';

const router = express.Router({ mergeParams: true });

const validateClient = validateParamsMiddleware(clientReportParamsSchema);

router
  .get('/client/:clientId', validateClient, ownedClientMiddleware, fullClientReport)
  .get('/client/:clientId/composition', validateClient, ownedClientMiddleware, clientCompositionReport)
  .get('/client/:clientId/historic', validateClient, ownedClientMiddleware, clientHistoricReport)
  // ?lang=es returns the analysis in Spanish
  .get(
    '/client/:clientId/news',
    validateClient,
    validateQueryMiddleware(clientNewsReportQuerySchema),
    ownedClientMiddleware,
    clientNewsReport,
  )
  .get(
    '/client/:clientId/instrument/:instrumentId',
    validateParamsMiddleware(clientInstrumentReportParamsSchema),
    ownedClientMiddleware,
    clientInstrumentReport,
  )
  .get(
    '/client/:clientId/issuer/:issuerId',
    validateParamsMiddleware(clientIssuerReportParamsSchema),
    ownedClientMiddleware,
    clientIssuerReport,
  );

export default router;
