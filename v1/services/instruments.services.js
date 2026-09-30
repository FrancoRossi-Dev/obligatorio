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

export const createInstrumentService = async ({ isin }) => {
  const { instruments, failures } =
    await resolveInstrumentsByIsinService([isin]);

  if (failures.size > 0) {
    throw httpError(
      {
        status: 422,
        message:
          'The ISIN could not be resolved to a supported instrument.',
      },
      [
        {
          field: 'isin',
          isin,
          reason: failures.get(isin),
        },
      ],
    );
  }

  return instruments.get(isin);
};

export const updateInstrumentService = async (id, instrumentData) => {
  const instrument = await Instrument.findOneAndUpdate(
    { _id: id, isDeleted: false },
    instrumentData,
    { returnDocument: 'after', runValidators: true },
  );
  return instrument;
};

// Upsert keyed on the unique isin, so concurrent imports of the same ISIN can't collide
const createInstrumentFromListing = async ({ isin, listing, type, issuerId }) => {
  const instrumentData = {
    isin,
    type,
    name: listing.name,
    figi: listing.figi,
    ticker: listing.ticker ?? null,
    exchCode: listing.exchCode  ?? null,
    securityType: listing.securityType ?? null,
    securityType2: listing.securityType2 ?? null,
  };
  if (type === 'stock' || type === 'bond') {
    instrumentData.issuerId =
      issuerId ??
      (await findOrCreateIssuerService(listing.name))._id;
  }

  const instrument = await Instrument.findOneAndUpdate(
    { isin },
    { $setOnInsert: instrumentData },
    { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true, runValidators: true, },
  );
  return instrument;
};

// Resolves ISINs to Instruments. Known ISINs come from the database; the rest are looked up
// in OpenFIGI and created, along with their Issuer. Nothing is created unless every ISIN
export const resolveInstrumentsByIsinService = async (isins, issuerIdsByIsin = new Map(),) => {
  const uniqueIsins = [
    ...new Set(
      isins.map((isin) => isin.trim().toUpperCase()),
    ),
  ];
  
  const instruments = new Map();
  const failures = new Map();

  const known = await Instrument.find({ isin: { $in: uniqueIsins  } });
  for (const instrument of known) {
    if (instrument.isDeleted){failures.set(instrument.isin, 'deleted');} 
    else if (
      !['stock', 'bond', 'fund', 'other'].includes(instrument.type)
    ) {
      failures.set(instrument.isin, 'unsupportedType');
    } else {
      instruments.set(instrument.isin, instrument);
    }
  }

  const unknownIsins = uniqueIsins.filter((isin) => !instruments.has(isin) && !failures.has(isin));
  if (unknownIsins.length === 0) return { instruments, failures };

  const listings = await lookupIsinsService(unknownIsins);
  const pending = [];
  for (const isin of unknownIsins) {
    const listing = listings.get(isin);

    if (!listing) {failures.set(isin, 'notFound');
    } else if (!listing.name || !listing.figi) {
    failures.set(isin, 'incompleteData');
    } else {
      pending.push({
        isin,
        listing,
        type :normalizeSecurityType(listing),
        issuerId: issuerIdsByIsin.get(isin),
      });
    }
  }
   if (failures.size > 0) {
    return { instruments, failures };
  }

  for (const instrumentData of pending) {
    const instrument =
      await createInstrumentFromListing(instrumentData);

    if (instrument.isDeleted) {
      failures.set(instrumentData.isin, 'deleted');
    } else {
      instruments.set(instrumentData.isin, instrument);
    }
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
