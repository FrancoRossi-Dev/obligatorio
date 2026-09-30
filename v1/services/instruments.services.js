import Instrument from '../models/instrument.model.js';
import Position from '../models/position.model.js';
import { ERRORS, httpError } from '../utils/http-error.js';
import { findOrCreateIssuerService } from './issuer.services.js';
import { lookupIsinsService } from './openfigi.services.js';
import { normalizeSecurityType } from '../utils/instrumentHelper.js';
import { paginate } from '../utils/pagination.js';
import { containsText } from '../utils/filters.js';

const buildInstrumentFilter = (filter, { type, q, isin }) => {
  if (type) filter.type = type;
  if (q) filter.$or = [{ name: containsText(q) }, { ticker: containsText(q) }];
  // ISINs are stored uppercase and the validator uppercases the query, so an exact match works
  if (isin) filter.isin = isin;
  return filter;
};

export const getInstrumentsService = async (filters, pagination) =>
  paginate(Instrument, buildInstrumentFilter({ isDeleted: false }, filters), pagination);

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
  type === 'bond' && listing.securityDescription ?
    `${listing.name} ${listing.securityDescription}`
  : listing.name;

// Upsert keyed on the unique isin, so concurrent imports of the same ISIN can't collide
const createInstrumentFromListing = async ({ isin, listing, type, composition }) => {
  const instrumentData = {
    isin,
    type,
    name: instrumentName(listing, type),
    figi: listing.compositeFIGI ?? listing.figi,
    ticker: listing.ticker,
    exchCode: listing.exchCode,
    securityType: listing.securityType,
    securityType2: listing.securityType2,
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
// resolves. Failure reasons: 'notFound', 'fundCompositionMissing', 'deleted'.
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
    const type = listing && normalizeSecurityType(listing);
    const composition = fundCompositions.get(isin);

    if (!listing) failures.set(isin, 'notFound');
    else if (type === 'fund' && !composition) failures.set(isin, 'fundCompositionMissing');
    else pending.push({ isin, listing, type, composition });
  }
  if (failures.size > 0) return { instruments, failures };

  for (const instrumentData of pending) {
    instruments.set(instrumentData.isin, await createInstrumentFromListing(instrumentData));
  }
  return { instruments, failures };
};

// Soft delete, blocked while an active position still holds the instrument
export const deleteInstrumentService = async (id) => {
  if (await Position.exists({ instrumentId: id, isDeleted: false })) throw httpError(ERRORS.instrumentInUse);

  const instrument = await Instrument.findOneAndUpdate(
    { _id: id, isDeleted: false },
    { isDeleted: true },
    { returnDocument: 'after' },
  );
  return instrument;
};
