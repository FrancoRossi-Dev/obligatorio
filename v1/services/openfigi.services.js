import axios from 'axios';
import { ERRORS, httpError } from '../utils/http-error.js';

// OpenFIGI maps market identifiers (ISIN here) to reference data: issuer name, ticker,
const MAPPING_URL = 'https://api.openfigi.com/v3/mapping';

// Jobs allowed per mapping request: 100 with an API key
const JOBS_PER_REQUEST_WITH_KEY = 100;

const chunk = (items, size) => {
  const chunks = [];
  for (let i = 0; i < items.length; i += size) chunks.push(items.slice(i, i + size));
  return chunks;
};

// An ISIN maps to one listing per exchange; they share issuer and asset class, so keep the
// country-level composite listing when there is one
const pickListing = (listings) =>
  listings.find((listing) => listing.figi === listing.compositeFIGI) ?? listings[0];

// Maps an OpenFIGI listing to an Instrument type; null when Abakus doesn't support that asset
export const toInstrumentType = ({ marketSector, securityType2 }) => {
  if (securityType2 === 'Common Stock' || securityType2 === 'Depositary Receipt') return 'stock';
  if (securityType2 === 'Mutual Fund') return 'fund';
  if (['Corp', 'Govt', 'Muni'].includes(marketSector)) return 'bond';
  return null;
};

const requestMapping = async (jobs, apiKey) => {
  try {
    const { data } = await axios.post(MAPPING_URL, jobs, {
      headers: apiKey ? { 'X-OPENFIGI-APIKEY': apiKey } : {},
    });
    return data;
  } catch (error) {
    throw httpError(ERRORS.instrumentLookupUnavailable, { status: error.response?.status ?? null });
  }
};

// Returns Map<isin, listing | null>; null means OpenFIGI has no security for that ISIN
export const lookupIsinsService = async (isins) => {
  const apiKey = process.env.OPEN_FIGI_API_KEY;
  const size = JOBS_PER_REQUEST_WITH_KEY;

  const listings = new Map();
  for (const isinChunk of chunk(isins, size)) {
    const jobs = isinChunk.map((isin) => ({ idType: 'ID_ISIN', idValue: isin }));
    const results = await requestMapping(jobs, apiKey);

    results.forEach((result, index) => {
      listings.set(isinChunk[index], result.data?.length ? pickListing(result.data) : null);
    });
  }
  return listings;
};
