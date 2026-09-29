import Issuer from '../models/issuer.model.js';
import Instrument from '../models/instrument.model.js';
import { ERRORS, httpError } from '../utils/http-error.js';
import { paginate } from '../utils/pagination.js';

export const getIssuersService = async (pagination) => paginate(Issuer, { isDeleted: false }, pagination);

export const getIssuerByIdService = async (id) => {
  const issuer = await Issuer.findOne({ _id: id, isDeleted: false });
  return issuer;
};

export const createIssuerService = async (issuerData) => {
  const issuer = new Issuer(issuerData);
  await issuer.save();
  return issuer;
};

// Upsert keyed on the unique legalName, so concurrent imports of the same issuer can't collide.
// An imported instrument needs its issuer, so a removed one is restored
export const findOrCreateIssuerService = async (legalName) => {
  const issuer = await Issuer.findOneAndUpdate(
    { legalName },
    { $set: { isDeleted: false }, $setOnInsert: { legalName, commercialName: legalName } },
    { upsert: true, returnDocument: 'after' },
  );
  return issuer;
};

export const updateIssuerService = async (id, issuerData) => {
  const issuer = await Issuer.findOneAndUpdate({ _id: id, isDeleted: false }, issuerData, {
    returnDocument: 'after',
  });
  return issuer;
};

// Soft delete, blocked while an active instrument still references the issuer
export const deleteIssuerService = async (id) => {
  const issuer = await Issuer.findOne({ _id: id, isDeleted: false });
  if (!issuer) return null;
  if (await Instrument.exists({ issuerId: issuer._id, isDeleted: false })) throw httpError(ERRORS.issuerInUse);

  issuer.isDeleted = true;
  await issuer.save();
  return issuer;
};
