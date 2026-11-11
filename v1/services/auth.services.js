import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import { ERRORS, httpError } from '../utils/http-error.js';
import { createAdvisorService } from './user.services.js';

const signToken = (user) =>
  jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

const toPublicUser = (user) => {
  const publicUser = user.toObject();
  delete publicUser.password;
  return publicUser;
};

export const loginService = async (username, password) => {
  const user = await User.findOne({ username, isDeleted: { $ne: true } })
  .collation({ locale: 'en', strength: 2 })
  .select('+password');

  const validPassword = user && (await bcrypt.compare(password, user.password));
  if (!validPassword) throw httpError(ERRORS.invalidCredentials);

  user.lastConnection = new Date();
  await user.save();

  return { user: toPublicUser(user), token: signToken(user) };
};

// Same checks as an admin creating the account; self-registration always starts on the base plan
export const registerService = async ({ username, password, details }) => {
  const advisor = await createAdvisorService({ username, password, details });
  return { user: toPublicUser(advisor), token: signToken(advisor) };
};
