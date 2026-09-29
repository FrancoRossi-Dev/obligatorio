import Client from '../models/client.model.js';
import Manager from '../models/manager.model.js';
import { ERRORS, httpError } from '../utils/http-error.js';
import { paginate } from '../utils/pagination.js';

export const getManagersService = async (filter, pagination) =>
  paginate(Manager, { ...filter, isDeleted: false }, pagination);

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

// Soft delete, blocked while an active client is still assigned to the manager
export const deleteManagerService = async (id) => {
  if (await Client.exists({ managerId: id, isDeleted: false })) throw httpError(ERRORS.managerInUse);

  const manager = await Manager.findOneAndUpdate(
    { _id: id, isDeleted: false },
    { isDeleted: true },
    { returnDocument: 'after' },
  );
  return manager;
};
