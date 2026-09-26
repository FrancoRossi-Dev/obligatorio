import {
  createManagerService,
  deleteManagerService,
  getManagerByIdService,
  getManagersService,
  updateManagerService,
} from '../services/manager.services.js';

const MANAGER_MESSAGES = {
  empty: 'No managers are registered yet.',
  notFound: 'Manager not found.',
  created: 'Manager has been registered successfully.',
  updated: 'Manager has been updated successfully.',
  deleted: 'Manager has been removed successfully.',
};

export const getManagers = async (req, res) => {
  const managers = await getManagersService();
  if (managers.length === 0) return res.status(404).json({ message: MANAGER_MESSAGES.empty });
  res.status(200).json(managers);
};

export const createManager = async (req, res) => {
  const manager = await createManagerService(req.validatedBody);
  return res.status(201).json({ managerID: manager.id, message: MANAGER_MESSAGES.created });
};

export const getManagerById = async (req, res) => {
  const { id } = req.params;
  const manager = await getManagerByIdService(id);
  if (!manager) return res.status(404).json({ message: MANAGER_MESSAGES.notFound });
  res.status(200).json(manager);
};

export const updateManager = async (req, res) => {
  const { id } = req.params;
  const manager = await updateManagerService(id, req.validatedBody);
  if (!manager) return res.status(404).json({ message: MANAGER_MESSAGES.notFound });
  res.status(200).json({ manager, message: MANAGER_MESSAGES.updated });
};

export const deleteManager = async (req, res) => {
  const { id } = req.params;
  const manager = await deleteManagerService(id);
  if (!manager) return res.status(404).json({ message: MANAGER_MESSAGES.notFound });
  return res.status(200).json({ message: MANAGER_MESSAGES.deleted });
};
