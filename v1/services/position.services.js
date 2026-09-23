import Position from '../models/Position.model.js';

export const getPositionsService = async () => {
  const positions = await Position.find({ isDeleted: false });
  return positions;
};

export const getPositionByIdService = async (id) => {
  const position = await Position.findById(id);
  return position;
};

export const createPositionService = async (positionData) => {
  const position = new Position(positionData);
  await position.save();
  return position;
};

export const updatePositionService = async (id, positionData) => {
  const position = await Position.findByIdAndUpdate(id, positionData, {
    returnDocument: 'after',
  });
  return position;
};

export const deletePositionService = async (id) => {
  const position = await Position.findById(id);
  if (!position) return null;
  position.isDeleted = true;
  await position.save();
  return position;
};
