import express from 'express';
import { validateParamsMiddleware } from '../middlewares/validatedParams.middleware.js';
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
  .get('/client/:clientId', validateClient, fullClientReport)
  .get('/client/:clientId/composition', validateClient, clientCompositionReport)
  .get('/client/:clientId/historic', validateClient, clientHistoricReport)
  .get(
    '/client/:clientId/instrument/:instrumentId',
    validateParamsMiddleware(clientInstrumentReportParamsSchema),
    clientInstrumentReport,
  )
  .get(
    '/client/:clientId/issuer/:issuerId',
    validateParamsMiddleware(clientIssuerReportParamsSchema),
    clientIssuerReport,
  );

export default router;
