import User from '../models/user.model.js';

export const getUsersService = async () => {
  const users = await User.find();
  return users;
};

export const getUserByIdService = async (id) => {
  const user = await User.findById(id);
  return user;
};

export const createUserService = async (userData) => {
  const user = new User(userData);
  await user.save();
  return user;
};

export const updateUserService = async (id, userData) => {
  const user = await User.findByIdAndUpdate(id, userData, { returnDocument: 'after' });
  return user;
};

export const deleteUserService = async (id) => {
  const user = await User.findByIdAndDelete(id);
  return user;
};
