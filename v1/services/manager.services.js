import Manager from '../models/manager.model.js';

export const getManagersService = async () => {
  const managers = await Manager.find({ isDeleted: false });
  return managers;
};

export const getManagerByIdService = async (id) => {
  const manager = await Manager.findOne({ _id: id, isDeleted: false });
  return manager;
};

export const createManagerService = async (managerData) => {
  const manager = new Manager(managerData);
  await manager.save();
  return manager;
};

export const updateManagerService = async (id, managerData) => {
  const manager = await Manager.findOneAndUpdate({ _id: id, isDeleted: false }, managerData, {
    returnDocument: 'after',
    runValidators: true,
  });
  return manager;
};

// Soft delete: the model carries an isDeleted flag
export const deleteManagerService = async (id) => {
  const manager = await Manager.findOneAndUpdate(
    { _id: id, isDeleted: false },
    { isDeleted: true },
    { returnDocument: 'after' },
  );
  return manager;
};
