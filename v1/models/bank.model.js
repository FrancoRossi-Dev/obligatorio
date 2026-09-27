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
    // Cloudinary URL, set only through POST /v1/bank/:id/uploadImage
    logoURL: {
      type: String,
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
