import Issuer from '../models/issuer.model.js';

export const getIssuersService = async () => {
  const issuers = await Issuer.find();
  return issuers;
};

export const getIssuerByIdService = async (id) => {
  const issuer = await Issuer.findById(id);
  return issuer;
};

export const createIssuerService = async (issuerData) => {
  const issuer = new Issuer(issuerData);
  await issuer.save();
  return issuer;
};

export const updateIssuerService = async (id, issuerData) => {
  const issuer = await Issuer.findByIdAndUpdate(id, issuerData, { returnDocument: 'after' });
  return issuer;
};

export const deleteIssuerService = async (id) => {
  const issuer = await Issuer.findByIdAndDelete(id);
  return issuer;
};
