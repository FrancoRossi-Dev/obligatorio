import {
  createClientService,
  deleteClientService,
  getClientByIdService,
  getClientsService,
  updateClientService,
} from '../services/client.services.js';

const CLIENT_MESSAGES = {
  empty: 'No clients are registered yet.',
  notFound: 'Client not found.',
  created: 'Client has been registered successfully.',
  updated: 'Client has been updated successfully.',
  deleted: 'Client has been removed successfully.',
};

export const getClients = async (req, res) => {
  const clients = await getClientsService();
  if (clients.length === 0) return res.status(404).json({ message: CLIENT_MESSAGES.empty });
  res.status(200).json(clients);
};

export const createClient = async (req, res) => {
  const client = await createClientService(req.validatedBody);
  return res.status(201).json({ clientID: client.id, message: CLIENT_MESSAGES.created });
};

export const getClientById = async (req, res) => {
  const { id } = req.params;
  const client = await getClientByIdService(id);
  if (!client) return res.status(404).json({ message: CLIENT_MESSAGES.notFound });
  res.status(200).json(client);
};

export const updateClient = async (req, res) => {
  const { id } = req.params;
  const client = await updateClientService(id, req.validatedBody);
  if (!client) return res.status(404).json({ message: CLIENT_MESSAGES.notFound });
  res.status(200).json({ client, message: CLIENT_MESSAGES.updated });
};

export const deleteClient = async (req, res) => {
  const { id } = req.params;
  const client = await deleteClientService(id);
  if (!client) return res.status(404).json({ message: CLIENT_MESSAGES.notFound });
  return res.status(200).json({ message: CLIENT_MESSAGES.deleted });
};
