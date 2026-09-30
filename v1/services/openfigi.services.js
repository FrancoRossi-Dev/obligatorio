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

// OpenFIGI composite exchange code of the home market, keyed by the ISIN's country prefix.
// Not always the ISO code (Canada is CN, Germany GR); only codes confirmed against OpenFIGI
const HOME_COMPOSITE_BY_ISIN_COUNTRY = {
  US: 'US',
  CA: 'CN',
  DE: 'GR',
  CH: 'SW',
  ES: 'SM',
  JP: 'JP',
  BR: 'BZ',
  AR: 'AR',
  MX: 'MM',
};

// An ISIN maps to one listing per exchange and one composite per country; they share issuer
// and asset class, but FIGI, exchange and ticker differ. Keep the home-market composite, else
// the first composite OpenFIGI returns, else any listing
const pickListing = (isin, listings) => {
  const composites = listings.filter((listing) => listing.figi === listing.compositeFIGI);
  const homeExchCode = HOME_COMPOSITE_BY_ISIN_COUNTRY[isin.slice(0, 2)];
  return (
    composites.find((listing) => listing.exchCode === homeExchCode) ?? composites[0] ?? listings[0]
  );
};

const requestMapping = async (jobs, apiKey) => {
  try {
    const { data } = await axios.post(MAPPING_URL, jobs, {
      headers: apiKey ? { 'X-OPENFIGI-APIKEY': apiKey } : {},
      timeout: 15_000,
    });
    return data;
  } catch (error) {
    throw httpError(ERRORS.instrumentLookupUnavailable, { status: error.response?.status ?? null });
  }
};

// Returns Map<isin, listing | null>; null means OpenFIGI has no security for that ISIN
export const lookupIsinsService = async (isins) => {
  const apiKey = process.env.OPEN_FIGI_API_KEY;
  const size = apiKey ? JOBS_PER_REQUEST_WITH_KEY : 10;

  const listings = new Map();
  for (const isinChunk of chunk(isins, size)) {
    const jobs = isinChunk.map((isin) => ({ idType: 'ID_ISIN', idValue: isin }));
    const results = await requestMapping(jobs, apiKey);

    results.forEach((result, index) => {
      const isin = isinChunk[index];
      listings.set(isin, result.data?.length ? pickListing(isin, result.data) : null);
    });
  }
  return listings;
};
