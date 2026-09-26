import {
  createPositionsService,
  deletePositionService,
  getPositionByIdService,
  getPositionsService,
  updatePositionService,
} from '../services/position.services.js';
import { canAccessClient, getClientsByIdsService } from '../services/client.services.js';
import { resolveInstrumentsByIsinService } from '../services/instruments.services.js';

const POSITION_MESSAGES = {
  invalidReferences: 'One or more positions reference a client or bank account that was not found.',
  unresolvedIsins: 'One or more positions reference an ISIN that could not be resolved to an instrument.',
  clientNotFound: 'Client not found.',
  bankAccountNotFound: 'Bank account not found for this client.',
  empty: 'No positions are registered yet.',
  notFound: 'Position not found.',
  created: 'Positions have been registered successfully.',
  updated: 'Position has been updated successfully.',
  deleted: 'Position has been removed successfully.',
};

export const getPositions = async (req, res) => {
  const positions = await getPositionsService();
  if (positions.length === 0) return res.status(404).json({ message: POSITION_MESSAGES.empty });
  res.status(200).json(positions);
};

// Returns one error per position whose client isn't the requester's, or whose bank account
// isn't an active account of that client; another advisor's client is reported as not found
const findReferenceErrors = (positionsData, clients, user) => {
  const ownClients = new Map(
    clients.filter((client) => canAccessClient(client, user)).map((client) => [client.id, client]),
  );

  const errors = [];
  positionsData.forEach((position, index) => {
    const client = ownClients.get(position.clientId.toLowerCase());
    const bankAccount = client?.bankAccounts.id(position.bankAccountId);
    if (!client) {
      errors.push({ field: `${index}.clientId`, message: POSITION_MESSAGES.clientNotFound });
    } else if (!bankAccount || bankAccount.isDeleted) {
      errors.push({ field: `${index}.bankAccountId`, message: POSITION_MESSAGES.bankAccountNotFound });
    }
  });
  return errors;
};

// Keyed by the failure reasons resolveInstrumentsByIsinService reports
const ISIN_MESSAGES = {
  notFound: 'No security is registered under this ISIN.',
  unsupported: 'This ISIN identifies an asset class Abakus does not support.',
  fundCompositionMissing: 'Fund composition is required the first time a fund is imported.',
  deleted: 'The instrument for this ISIN has been removed from Abakus.',
};

// Swaps each position's ISIN for the matching instrumentId and issuerId. Returns the
// positions ready to store, or one error per position whose ISIN couldn't be resolved.
const resolveIsins = async (positionsData) => {
  const importedPositions = positionsData.filter((position) => position.isin);
  if (importedPositions.length === 0) return { positions: positionsData, errors: [] };

  const isins = [...new Set(importedPositions.map((position) => position.isin))];
  const fundCompositions = new Map(
    importedPositions
      .filter((position) => position.fundComposition)
      .map((position) => [position.isin, position.fundComposition]),
  );
  const { instruments, failures } = await resolveInstrumentsByIsinService(isins, fundCompositions);

  const errors = [];
  positionsData.forEach((position, index) => {
    if (failures.has(position.isin)) {
      errors.push({ field: `${index}.isin`, message: ISIN_MESSAGES[failures.get(position.isin)] });
    }
  });
  if (errors.length > 0) return { positions: null, errors };

  const positions = positionsData.map((position) => {
    if (!position.isin) return position;
    const { isin, ...stored } = position;
    delete stored.fundComposition;
    const instrument = instruments.get(isin);
    return { ...stored, instrumentId: instrument._id, issuerId: instrument.issuerId };
  });
  return { positions, errors };
};

export const createPositions = async (req, res) => {
  const positionsData = req.validatedBody;

  const clientIds = [...new Set(positionsData.map((position) => position.clientId))];
  const clients = await getClientsByIdsService(clientIds);

  const errors = findReferenceErrors(positionsData, clients, req.decoded);
  if (errors.length > 0) {
    return res.status(404).json({ message: POSITION_MESSAGES.invalidReferences, details: errors });
  }

  const resolved = await resolveIsins(positionsData);
  if (resolved.errors.length > 0) {
    return res.status(422).json({ message: POSITION_MESSAGES.unresolvedIsins, details: resolved.errors });
  }

  const positions = await createPositionsService(resolved.positions);
  return res.status(201).json({
    positionIDs: positions.map((position) => position.id),
    message: POSITION_MESSAGES.created,
  });
};

export const getPositionById = async (req, res) => {
  const { id } = req.params;
  const position = await getPositionByIdService(id);
  if (!position || position.isDeleted) {
    return res.status(404).json({ message: POSITION_MESSAGES.notFound });
  }
  res.status(200).json(position);
};

export const updatePosition = async (req, res) => {
  const { id } = req.params;
  const position = await updatePositionService(id, req.validatedBody);
  if (!position) return res.status(404).json({ message: POSITION_MESSAGES.notFound });
  res.status(200).json({ position, message: POSITION_MESSAGES.updated });
};

export const deletePosition = async (req, res) => {
  const { id } = req.params;
  const position = await deletePositionService(id);
  if (!position) return res.status(404).json({ message: POSITION_MESSAGES.notFound });
  return res.status(200).json({ message: POSITION_MESSAGES.deleted });
};
