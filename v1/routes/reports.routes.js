import express from 'express';
import { validateParamsMiddleware } from '../middlewares/validatedParams.middleware.js';
import { ownedClientMiddleware } from '../middlewares/ownedClient.middleware.js';
import {
  clientCompositionReport,
  clientHistoricReport,
  clientInstrumentReport,
  clientIssuerReport,
  fullClientReport,
} from '../controllers/report.controller.js';
import {
  clientInstrumentReportParamsSchema,
  clientIssuerReportParamsSchema,
  clientReportParamsSchema,
} from '../validators/report.validators.js';

const router = express.Router({ mergeParams: true });

const validateClient = validateParamsMiddleware(clientReportParamsSchema);

router
  .get('/client/:clientId', validateClient, ownedClientMiddleware, fullClientReport)
  .get('/client/:clientId/composition', validateClient, ownedClientMiddleware, clientCompositionReport)
  .get('/client/:clientId/historic', validateClient, ownedClientMiddleware, clientHistoricReport)
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
