import Client from '../models/client.model.js';

export const getClientsService = async () => {
  const clients = await Client.find({ isDeleted: false });
  return clients;
};

export const getClientByIdService = async (id) => {
  const client = await Client.findOne({ _id: id, isDeleted: false });
  return client;
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

// Soft delete: the model carries an isDeleted flag
export const deleteClientService = async (id) => {
  const client = await Client.findOneAndUpdate(
    { _id: id, isDeleted: false },
    { isDeleted: true },
    { returnDocument: 'after' },
  );
  return client;
};
