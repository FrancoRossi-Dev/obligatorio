import { loginService, registerService } from '../services/auth.services.js';

const AUTH_MESSAGES = {
  login: 'Signed in successfully.',
  register: 'Your advisor account has been created.',
  logout: 'Signed out successfully.',
};

export const loginUser = async (req, res) => {
  const { username, password } = req.validatedBody;
  const { user, token } = await loginService(username, password);
  res.status(200).json({ message: AUTH_MESSAGES.login, user, token });
};

export const registerUser = async (req, res) => {
  const { user, token } = await registerService(req.validatedBody);
  res.status(201).json({ message: AUTH_MESSAGES.register, user, token });
};

// Tokens are stateless, so signing out is up to the client discarding its token
export const logoutUser = async (req, res) => {
  res.status(200).json({ message: AUTH_MESSAGES.logout });
};
