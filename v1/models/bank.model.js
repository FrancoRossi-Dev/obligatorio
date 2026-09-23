import mongoose from 'mongoose';

const bankSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    region: {
      type: String,
      required: true,
    },
    country: {
      type: String,
      required: true,
    },
    logoURL: {
      type: String,
      required: true,
    },
    isDeleted: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  { timestamps: true },
);

const Bank = mongoose.model('Bank', bankSchema, 'banks');

export default Bank;
