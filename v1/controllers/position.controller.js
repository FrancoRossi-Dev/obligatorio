import {
  createPositionsService,
  deletePositionService,
  getPositionByIdService,
  getPositionsService,
  updatePositionService,
} from '../services/position.services.js';
import { getClientsByIdsService } from '../services/client.services.js';

const POSITION_MESSAGES = {
  invalidReferences: 'One or more positions reference a client or bank account that was not found.',
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
const findReferenceErrors = (positionsData, clients, { id, role }) => {
  const ownClients = new Map(
    clients
      .filter((client) => role !== 'advisor' || client.advisorId.equals(id))
      .map((client) => [client.id, client]),
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

export const createPositions = async (req, res) => {
  const positionsData = req.validatedBody;

  const clientIds = [...new Set(positionsData.map((position) => position.clientId))];
  const clients = await getClientsByIdsService(clientIds);

  const errors = findReferenceErrors(positionsData, clients, req.decoded);
  if (errors.length > 0) {
    return res.status(404).json({ message: POSITION_MESSAGES.invalidReferences, details: errors });
  }

  const positions = await createPositionsService(positionsData);
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
