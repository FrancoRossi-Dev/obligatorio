import { getClientByIdService } from '../services/client.services.js';
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
  clientNotFound: 'Client not found.',
  instrumentNotFound: 'Instrument not found.',
  issuerNotFound: 'Issuer not found.',
};

// Another advisor's client is treated as not found so client ids can't be probed across accounts
const getOwnedClient = async (clientId, { id, role }) => {
  const client = await getClientByIdService(clientId);
  if (!client) return null;
  if (role === 'advisor' && !client.advisorId.equals(id)) return null;
  return client;
};

export const fullClientReport = async (req, res) => {
  const { clientId } = req.validatedParams;
  const { id, role } = req.decoded;

  const client = await getOwnedClient(clientId, req.decoded);
  if (!client) return res.status(404).json({ message: REPORT_MESSAGES.clientNotFound });

  const report = await ClientFullReport(client, { id, role });
  res.status(200).json(report);
};

export const clientInstrumentReport = async (req, res) => {
  const { clientId, instrumentId } = req.validatedParams;
  const { id, role } = req.decoded;

  const client = await getOwnedClient(clientId, req.decoded);
  if (!client) return res.status(404).json({ message: REPORT_MESSAGES.clientNotFound });

  const instrument = await getInstrumentByIdService(instrumentId);
  if (!instrument) return res.status(404).json({ message: REPORT_MESSAGES.instrumentNotFound });

  const report = await ClientInstrumentReport(client, instrument, { id, role });
  res.status(200).json(report);
};

export const clientIssuerReport = async (req, res) => {
  const { clientId, issuerId } = req.validatedParams;
  const { id, role } = req.decoded;

  const client = await getOwnedClient(clientId, req.decoded);
  if (!client) return res.status(404).json({ message: REPORT_MESSAGES.clientNotFound });

  const issuer = await getIssuerByIdService(issuerId);
  if (!issuer) return res.status(404).json({ message: REPORT_MESSAGES.issuerNotFound });

  const report = await ClientIssuerReport(client, issuer, { id, role });
  res.status(200).json(report);
};

export const clientCompositionReport = async (req, res) => {
  const { clientId } = req.validatedParams;
  const { id, role } = req.decoded;

  const client = await getOwnedClient(clientId, req.decoded);
  if (!client) return res.status(404).json({ message: REPORT_MESSAGES.clientNotFound });

  const report = await ClientCompositionReport(client, { id, role });
  res.status(200).json(report);
};

export const clientHistoricReport = async (req, res) => {
  const { clientId } = req.validatedParams;
  const { id, role } = req.decoded;

  const client = await getOwnedClient(clientId, req.decoded);
  if (!client) return res.status(404).json({ message: REPORT_MESSAGES.clientNotFound });

  const report = await ClientHistoricReport(client, { id, role });
  res.status(200).json(report);
};
