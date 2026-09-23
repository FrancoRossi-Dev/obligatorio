import {
  createPositionService,
  deletePositionService,
  getPositionByIdService,
  getPositionsService,
  updatePositionService,
} from '../services/position.services.js';

const POSITION_MESSAGES = {
  empty: 'No positions are registered yet.',
  notFound: 'Position not found.',
  created: 'Position has been registered successfully.',
  updated: 'Position has been updated successfully.',
  deleted: 'Position has been removed successfully.',
};

export const getPositions = async (req, res) => {
  const positions = await getPositionsService();
  if (positions.length === 0) return res.status(404).json({ message: POSITION_MESSAGES.empty });
  res.status(200).json(positions);
};

export const createPosition = async (req, res) => {
  const position = await createPositionService(req.validatedBody);
  return res.status(201).json({ positionID: position.id, message: POSITION_MESSAGES.created });
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
