import {
  createIssuerService,
  deleteIssuerService,
  getIssuerByIdService,
  getIssuersService,
  updateIssuerService,
} from '../services/issuer.services.js';

const ISSUER_MESSAGES = {
  empty: 'No issuers are registered yet.',
  notFound: 'Issuer not found.',
  created: 'Issuer has been registered successfully.',
  updated: 'Issuer has been updated successfully.',
  deleted: 'Issuer has been removed successfully.',
};

export const getIssuers = async (req, res) => {
  const issuers = await getIssuersService();
  if (issuers.length === 0) return res.status(404).json({ message: ISSUER_MESSAGES.empty });
  res.status(200).json(issuers);
};

export const createIssuer = async (req, res) => {
  const issuer = await createIssuerService(req.validatedBody);
  return res.status(201).json({ issuerID: issuer.id, message: ISSUER_MESSAGES.created });
};

export const getIssuerById = async (req, res) => {
  const { id } = req.params;
  const issuer = await getIssuerByIdService(id);
  if (!issuer) return res.status(404).json({ message: ISSUER_MESSAGES.notFound });
  res.status(200).json(issuer);
};

export const updateIssuer = async (req, res) => {
  const { id } = req.params;
  const issuer = await updateIssuerService(id, req.validatedBody);
  if (!issuer) return res.status(404).json({ message: ISSUER_MESSAGES.notFound });
  res.status(200).json({ issuer, message: ISSUER_MESSAGES.updated });
};

export const deleteIssuer = async (req, res) => {
  const { id } = req.params;
  const issuer = await deleteIssuerService(id);
  if (!issuer) return res.status(404).json({ message: ISSUER_MESSAGES.notFound });
  return res.status(200).json({ message: ISSUER_MESSAGES.deleted });
};
