import { getInstrumentByIdService } from '../services/instruments.services.js';
import { getIssuerByIdService } from '../services/issuer.services.js';
import {
  ClientCompositionReport,
  ClientFullReport,
  ClientHistoricReport,
  ClientInstrumentReport,
  ClientIssuerReport,
} from '../services/report.services.js';

const REPORT_MESSAGES = {
  instrumentNotFound: 'Instrument not found.',
  issuerNotFound: 'Issuer not found.',
};

// req.client is loaded and access-checked by ownedClientMiddleware
export const fullClientReport = async (req, res) => {
  const { id, role } = req.decoded;
  const report = await ClientFullReport(req.client, { id, role });
  res.status(200).json(report);
};

export const clientInstrumentReport = async (req, res) => {
  const { instrumentId } = req.validatedParams;
  const { id, role } = req.decoded;

  const instrument = await getInstrumentByIdService(instrumentId);
  if (!instrument) return res.status(404).json({ message: REPORT_MESSAGES.instrumentNotFound });

  const report = await ClientInstrumentReport(req.client, instrument, { id, role });
  res.status(200).json(report);
};

export const clientIssuerReport = async (req, res) => {
  const { issuerId } = req.validatedParams;
  const { id, role } = req.decoded;

  const issuer = await getIssuerByIdService(issuerId);
  if (!issuer) return res.status(404).json({ message: REPORT_MESSAGES.issuerNotFound });

  const report = await ClientIssuerReport(req.client, issuer, { id, role });
  res.status(200).json(report);
};

export const clientCompositionReport = async (req, res) => {
  const { id, role } = req.decoded;
  const report = await ClientCompositionReport(req.client, { id, role });
  res.status(200).json(report);
};

export const clientHistoricReport = async (req, res) => {
  const { id, role } = req.decoded;
  const report = await ClientHistoricReport(req.client, { id, role });
  res.status(200).json(report);
};
