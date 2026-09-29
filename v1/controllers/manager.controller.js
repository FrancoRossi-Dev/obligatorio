import {
  createManagerService,
  deleteManagerService,
  getManagersService,
  updateManagerService,
} from '../services/manager.services.js';

const MANAGER_MESSAGES = {
  notFound: 'Manager not found.',
  created: 'Manager has been registered successfully.',
  updated: 'Manager has been updated successfully.',
  deleted: 'Manager has been removed successfully.',
};

// Advisors only list their own team; admins list every manager
export const getManagers = async (req, res) => {
  const { id, role } = req.decoded;
  const managers = await getManagersService(role === 'advisor' ? { advisorId: id } : {}, req.validatedQuery);
  res.status(200).json(managers);
};

// advisorId is set by assignAdvisorMiddleware
export const createManager = async (req, res) => {
  const manager = await createManagerService(req.validatedBody);
  return res.status(201).json({ managerID: manager.id, message: MANAGER_MESSAGES.created });
};

// req.manager is loaded and access-checked by ownedManagerMiddleware
export const getManagerById = async (req, res) => {
  res.status(200).json(req.manager);
};

export const updateManager = async (req, res) => {
  const manager = await updateManagerService(req.manager.id, req.validatedBody);
  if (!manager) return res.status(404).json({ message: MANAGER_MESSAGES.notFound });
  res.status(200).json({ manager, message: MANAGER_MESSAGES.updated });
};

export const deleteManager = async (req, res) => {
  const manager = await deleteManagerService(req.manager.id);
  if (!manager) return res.status(404).json({ message: MANAGER_MESSAGES.notFound });
  return res.status(200).json({ message: MANAGER_MESSAGES.deleted });
};
