import {
  createClientService,
  deleteClientService,
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

// Advisors only list their own clients; admins list every client
export const getClients = async (req, res) => {
  const { id, role } = req.decoded;
  const clients = await getClientsService(role === 'advisor' ? { advisorId: id } : {});
  if (clients.length === 0) return res.status(404).json({ message: CLIENT_MESSAGES.empty });
  res.status(200).json(clients);
};

// The plan limit is enforced before this runs, by createClientPlanLimitMiddleware
export const createClient = async (req, res) => {
  const client = await createClientService(req.validatedBody);
  return res.status(201).json({ clientID: client.id, message: CLIENT_MESSAGES.created });
};

// req.client is loaded and access-checked by ownedClientMiddleware
export const getClientById = async (req, res) => {
  res.status(200).json(req.client);
};

export const updateClient = async (req, res) => {
  const client = await updateClientService(req.client.id, req.validatedBody);
  if (!client) return res.status(404).json({ message: CLIENT_MESSAGES.notFound });
  res.status(200).json({ client, message: CLIENT_MESSAGES.updated });
};

export const deleteClient = async (req, res) => {
  const client = await deleteClientService(req.client.id);
  if (!client) return res.status(404).json({ message: CLIENT_MESSAGES.notFound });
  return res.status(200).json({ message: CLIENT_MESSAGES.deleted });
};
