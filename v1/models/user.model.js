import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// Base user: shared by every role. Role-specific fields live on discriminators.

const baseOptions = {
  discriminatorKey: 'role',
  collection: 'users',
  timestamps: true,
};

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    lastConnection: {
      type: Date,
    },
  },
  baseOptions,
);

const User = mongoose.model('User', userSchema);

const Admin = User.discriminator('admin', new mongoose.Schema({}, baseOptions));

const advisorDetailsSchema = new mongoose.Schema(
  {
    comercialName: {
      type: String,
      required: true,
    },
    legalName: {
      type: String,
      required: true,
    },
    address: {
      type: String,
    },
    country: {
      type: String,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
  },
  { _id: false },
);

const Advisor = User.discriminator(
  'advisor',
  new mongoose.Schema(
    {
      details: {
        type: advisorDetailsSchema,
        required: true,
      },
      planTier: {
        type: String,
        enum: ['base', 'premium'],
        default: 'base',
      },
    },
    baseOptions,
  ),
);

export default User;
export { Admin, Advisor };
