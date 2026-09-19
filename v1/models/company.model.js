import mongoose from 'mongoose';

// A Company is a client managed by an Advisor. It has no login of its own.

const companyDetailsSchema = new mongoose.Schema(
  {
    commercialName: {
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
  },
  { _id: false },
);

const companySchema = new mongoose.Schema(
  {
    advisorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    companyDetails: {
      type: companyDetailsSchema,
      required: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

const Company = mongoose.model('Company', companySchema, 'companies');

export default Company;
