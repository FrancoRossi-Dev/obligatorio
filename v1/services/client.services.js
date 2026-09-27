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

// clientDetails is sent partially, so each field is set on its own path ('clientDetails.country');
// setting the whole object would replace the subdocument and drop the fields that were not sent.
// bankAccounts, by contrast, is replaced as a whole on purpose (see planLimit.middleware.js).
const toClientUpdate = ({ clientDetails, ...clientData }) => {
  if (!clientDetails) return clientData;
  const detailPaths = Object.entries(clientDetails).map(([field, value]) => [`clientDetails.${field}`, value]);
  return { ...clientData, ...Object.fromEntries(detailPaths) };
};

export const updateClientService = async (id, clientData) => {
  const client = await Client.findOneAndUpdate({ _id: id, isDeleted: false }, toClientUpdate(clientData), {
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
