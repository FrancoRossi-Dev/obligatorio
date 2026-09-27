import Manager from '../models/manager.model.js';

export const getManagersService = async (filter = {}) => {
  const managers = await Manager.find({ ...filter, isDeleted: false });
  return managers;
};

export const getManagerByIdService = async (id) => {
  const manager = await Manager.findOne({ _id: id, isDeleted: false });
  return manager;
};

// Advisors can only reach their own team; admins reach every manager
export const canAccessManager = (manager, { id, role }) => role !== 'advisor' || manager.advisorId.equals(id);

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
