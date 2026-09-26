import { getMeService, getPlanUsageService, upgradePlanService } from '../services/user.services.js';

const USER_MESSAGES = {
  planUpgraded: 'Your advisor account has been upgraded to the premium plan.',
};

export const me = async (req, res, next) => {
  try {
    const user = await getMeService(req.decoded.id);
    res.status(200).json(user);
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
