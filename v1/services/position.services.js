import Position from '../models/position.model.js';
import Instrument from '../models/instrument.model.js';
import { getPositionValue, round } from '../utils/math.js';
import { paginate } from '../utils/pagination.js';
import { addCondition, equalsIgnoreCase } from '../utils/filters.js';
import { nextDay } from '../utils/date.js';

// A position has no type of its own: it takes its instrument's, so type filters by those instruments.
// to covers its whole day, so the range stops before the next one
const buildPositionFilter = async (filter, { type, clientId, instrumentId, currency, from, to }) => {
  if (clientId) addCondition(filter, 'clientId', { $eq: clientId });
  if (instrumentId) addCondition(filter, 'instrumentId', { $eq: instrumentId });
  if (type) addCondition(filter, 'instrumentId', { $in: await Instrument.distinct('_id', { type }) });
  if (currency) filter.currency = equalsIgnoreCase(currency);
  if (from) addCondition(filter, 'dateOfReport', { $gte: from });
  if (to) addCondition(filter, 'dateOfReport', { $lt: nextDay(to) });
  return filter;
};

// scope limits an advisor to its own clients; filters come from the query string
export const getPositionsService = async (scope, filters, pagination) =>
  paginate(Position, await buildPositionFilter({ ...scope, isDeleted: false }, filters), pagination);

export const getPositionByIdService = async (id) => {
  const position = await Position.findOne({ _id: id, isDeleted: false });
  return position;
};

// Bank imports report the market value; a manually entered position gets it from quantity and price
export const createPositionService = async (positionData) => {
  const position = new Position({
    ...positionData,
    marketValue: positionData.marketValue ?? round(getPositionValue(positionData)),
  });
  await position.save();
  return position;
};

export const createPositionsService = async (positionsData) => {
  const positions = [];
  for (const positionData of positionsData) {
    positions.push(await createPositionService(positionData));
  }
  return positions;
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
