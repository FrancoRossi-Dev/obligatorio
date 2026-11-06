import {
  createAdvisorService,
  deleteAdvisorService,
  getAdvisorsService,
  getMeService,
  getPlanUsageService,
  updateAdvisorService,
  upgradePlanService,
} from '../services/user.services.js';

const USER_MESSAGES = {
  planUpgraded: 'Your advisor account has been upgraded to the premium plan.',
  advisorCreated: 'Advisor account has been created successfully.',
  advisorUpdated: 'Advisor account has been updated successfully.',
  advisorDeleted: 'Advisor account has been removed successfully.',
};

export const createAdvisor = async (req, res, next) => {
  try {
    const advisor = await createAdvisorService(req.validatedBody);
    res.status(201).json({ advisorID: advisor.id, message: USER_MESSAGES.advisorCreated });
  } catch (error) {
    next(error);
  }
};

export const updateAdvisor = async (req, res, next) => {
  try {
    const advisor = await updateAdvisorService(req.validatedParams.id, req.validatedBody);
    res.status(200).json({ advisor, message: USER_MESSAGES.advisorUpdated });
  } catch (error) {
    next(error);
  }
};

export const deleteAdvisor = async (req, res, next) => {
  try {
    await deleteAdvisorService(req.validatedParams.id);
    res.status(200).json({ message: USER_MESSAGES.advisorDeleted });
  } catch (error) {
    next(error);
  }
};

export const me = async (req, res, next) => {
  try {
    const user = await getMeService(req.decoded.id);
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

export const getAdvisors = async (req, res, next) => {
  try {
    const advisors = await getAdvisorsService(req.validatedQuery);
    res.status(200).json(advisors);
  } catch (error) {
    next(error);
  }
};

export const myPlan = async (req, res, next) => {
  try {
    const usage = await getPlanUsageService(req.decoded.id);
    res.status(200).json(usage);
  } catch (error) {
    next(error);
  }
};

export const upgradePlan = async (req, res, next) => {
  try {
    const advisor = await upgradePlanService(req.decoded.id);
    res.status(200).json({ message: USER_MESSAGES.planUpgraded, planTier: advisor.planTier });
  } catch (error) {
    next(error);
  }
};
