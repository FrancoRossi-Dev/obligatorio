import Instrument from '../models/instrument.model.js';
import { findOrCreateIssuerService } from './issuer.services.js';
import { lookupIsinsService, toInstrumentType } from './openfigi.services.js';

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

// OpenFIGI's name is the issuer's; a bond also needs its coupon and maturity to tell it apart
const instrumentName = (listing, type) =>
  type === 'bond' && listing.securityDescription
    ? `${listing.name} ${listing.securityDescription}`
    : listing.name;

// Upsert keyed on the unique isin, so concurrent imports of the same ISIN can't collide
const createInstrumentFromListing = async ({ isin, listing, type, composition }) => {
  const instrumentData = {
    isin,
    type,
    name: instrumentName(listing, type),
    figi: listing.compositeFIGI ?? listing.figi,
    ticker: listing.ticker,
  };
  if (type === 'fund') {
    instrumentData.fundDetail = { composition };
  } else {
    instrumentData.issuerId = (await findOrCreateIssuerService(listing.name))._id;
  }

  const instrument = await Instrument.findOneAndUpdate(
    { isin },
    { $setOnInsert: instrumentData },
    { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true },
  );
  return instrument;
};

// Resolves ISINs to Instruments. Known ISINs come from the database; the rest are looked up
// in OpenFIGI and created, along with their Issuer. Nothing is created unless every ISIN
// resolves. Failure reasons: 'notFound', 'unsupported', 'fundCompositionMissing', 'deleted'.
// fundCompositions (Map<isin, composition>) is only needed for funds seen for the first time.
export const resolveInstrumentsByIsinService = async (isins, fundCompositions) => {
  const instruments = new Map();
  const failures = new Map();

  const known = await Instrument.find({ isin: { $in: isins } });
  for (const instrument of known) {
    if (instrument.isDeleted) failures.set(instrument.isin, 'deleted');
    else instruments.set(instrument.isin, instrument);
  }

  const unknownIsins = isins.filter((isin) => !instruments.has(isin) && !failures.has(isin));
  if (unknownIsins.length === 0) return { instruments, failures };

  const listings = await lookupIsinsService(unknownIsins);
  const pending = [];
  for (const isin of unknownIsins) {
    const listing = listings.get(isin);
    const type = listing && toInstrumentType(listing);
    const composition = fundCompositions.get(isin);

    if (!listing) failures.set(isin, 'notFound');
    else if (!type) failures.set(isin, 'unsupported');
    else if (type === 'fund' && !composition) failures.set(isin, 'fundCompositionMissing');
    else pending.push({ isin, listing, type, composition });
  }
  if (failures.size > 0) return { instruments, failures };

  for (const instrumentData of pending) {
    instruments.set(instrumentData.isin, await createInstrumentFromListing(instrumentData));
  }
  return { instruments, failures };
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
