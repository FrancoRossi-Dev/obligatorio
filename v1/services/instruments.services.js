import Instrument from '../models/instrument.model.js';

export const getInstrumentsService = async () => {
  const instruments = await Instrument.find({ isDeleted: false });
  return instruments;
};

export const getInstrumentByIdService = async (id) => {
  const instrument = await Instrument.findOne({ _id: id, isDeleted: false });
  return instrument;
};

export const createInstrumentService = async (instrumentData) => {
  const instrument = new Instrument(instrumentData);
  await instrument.save();
  return instrument;
};

export const updateInstrumentService = async (id, instrumentData) => {
  const instrument = await Instrument.findOneAndUpdate(
    { _id: id, isDeleted: false },
    instrumentData,
    { returnDocument: 'after', runValidators: true },
  );
  return instrument;
};

// Soft delete: the model carries an isDeleted flag
export const deleteInstrumentService = async (id) => {
  const instrument = await Instrument.findOneAndUpdate(
    { _id: id, isDeleted: false },
    { isDeleted: true },
    { returnDocument: 'after' },
  );
  return instrument;
};
