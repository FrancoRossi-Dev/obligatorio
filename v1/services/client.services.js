import Client from '../models/client.model.js';

export const getClientsService = async (filter = {}) => {
  const clients = await Client.find({ ...filter, isDeleted: false });
  return clients;
};

export const getClientByIdService = async (id) => {
  const client = await Client.findOne({ _id: id, isDeleted: false });
  return client;
};

// Advisors can only reach their own clients; other roles reach every client
export const canAccessClient = (client, { id, role }) => role !== 'advisor' || client.advisorId.equals(id);

export const getClientsByIdsService = async (ids) => {
  const clients = await Client.find({ _id: { $in: ids }, isDeleted: false });
  return clients;
};

export const createClientService = async (clientData) => {
  const client = new Client(clientData);
  await client.save();
  return client;
};

export const updateClientService = async (id, clientData) => {
  const client = await Client.findOneAndUpdate({ _id: id, isDeleted: false }, clientData, {
    returnDocument: 'after',
    runValidators: true,
  });
  return client;
};

export const countActiveClientsService = async (advisorId) => {
  const count = await Client.countDocuments({ advisorId, isDeleted: false });
  return count;
};

export const deleteClientService = async (id) => {
  const client = await Client.findOneAndUpdate(
    { _id: id, isDeleted: false },
    { isDeleted: true },
    { returnDocument: 'after' },
  );
  return client;
};
