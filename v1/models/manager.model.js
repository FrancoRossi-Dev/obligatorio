import mongoose from 'mongoose';

// Multiple managers share an advisor account,
// they are employees of the advisor company and one can manage multiple clients

const managerSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    advisorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

const Manager = mongoose.model('Manager', managerSchema, 'managers');

export default Manager;
