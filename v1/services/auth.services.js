import { randomUUID } from 'node:crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User, { Advisor } from '../models/user.model.js';
import RevokedToken from '../models/revoked-token.model.js';
import { ERRORS, httpError } from '../utils/http-error.js';

// The unique token id (jti) is what logout revokes
const signToken = (user) =>
  jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
    jwtid: randomUUID(),
  });

const toPublicUser = (user) => {
  const { password, ...publicUser } = user.toObject();
  return publicUser;
};

export const loginService = async (username, password) => {
  const user = await User.findOne({ username }).select('+password');

  const validPassword = user && (await bcrypt.compare(password, user.password));
  if (!validPassword) throw httpError(ERRORS.invalidCredentials);

  user.lastConnection = new Date();
  await user.save();

  return { user: toPublicUser(user), token: signToken(user) };
};

export const registerService = async ({ username, password, details }) => {
  if (await User.exists({ username })) {
    throw httpError(ERRORS.usernameTaken, { username });
  }
  if (await Advisor.exists({ 'details.email': details.email.toLowerCase().trim() })) {
    throw httpError(ERRORS.emailTaken, { email: details.email });
  }

  const hashedPassword = await bcrypt.hash(password, Number(process.env.SALT_ROUNDS));

  let advisor;
  try {
    advisor = await Advisor.create({ username, password: hashedPassword, details });
  } catch (err) {
    // Concurrent registrations can slip past the checks above; the unique indexes catch them
    if (err.code === Number(process.env.MONGO_DUPLICATE_KEY)) {
      const isEmail = 'details.email' in (err.keyPattern ?? {});
      throw httpError(isEmail ? ERRORS.emailTaken : ERRORS.usernameTaken);
    }
    throw err;
  }

  return { user: toPublicUser(advisor), token: signToken(advisor) };
};

// Revokes the token until it would have expired anyway; safe to call more than once
export const logoutService = async (jti, exp) => {
  await RevokedToken.updateOne({ jti }, { jti, expiresAt: new Date(exp * 1000) }, { upsert: true });
};
