import {
  createInstrumentService,
  deleteInstrumentService,
  getInstrumentByIdService,
  getInstrumentsService,
  updateInstrumentService,
} from '../services/instruments.services.js';

const INSTRUMENT_MESSAGES = {
  empty: 'No instruments are registered yet.',
  notFound: 'Instrument not found.',
  created: 'Instrument has been registered successfully.',
  updated: 'Instrument has been updated successfully.',
  deleted: 'Instrument has been removed successfully.',
};

export const getInstruments = async (req, res) => {
  const instruments = await getInstrumentsService();
  if (instruments.length === 0) {
    return res.status(404).json({ message: INSTRUMENT_MESSAGES.empty });
  }
  res.status(200).json(instruments);
};

export const createInstrument = async (req, res) => {
  const instrument = await createInstrumentService(req.validatedBody);
  return res
    .status(201)
    .json({ instrumentID: instrument.id, message: INSTRUMENT_MESSAGES.created });
};

export const getInstrumentById = async (req, res) => {
  const { id } = req.params;
  const instrument = await getInstrumentByIdService(id);
  if (!instrument) return res.status(404).json({ message: INSTRUMENT_MESSAGES.notFound });
  res.status(200).json(instrument);
};

export const updateInstrument = async (req, res) => {
  const { id } = req.params;
  const instrument = await updateInstrumentService(id, req.validatedBody);
  if (!instrument) return res.status(404).json({ message: INSTRUMENT_MESSAGES.notFound });
  res.status(200).json({ instrument, message: INSTRUMENT_MESSAGES.updated });
};

export const deleteInstrument = async (req, res) => {
  const { id } = req.params;
  const instrument = await deleteInstrumentService(id);
  if (!instrument) return res.status(404).json({ message: INSTRUMENT_MESSAGES.notFound });
  return res.status(200).json({ message: INSTRUMENT_MESSAGES.deleted });
};
