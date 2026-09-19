import mongoose from 'mongoose';

// The entity that issues a stock or bond (e.g. a corporation or a
// government) — distinct from Company, which is an advisor's client.
// A domain expert will refine these details later.

const issuerDetailsSchema = new mongoose.Schema(
  {
    commercialName: {
      type: String,
      required: true,
    },
    legalName: {
      type: String,
      required: true,
      unique: true,
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

const issuerSchema = new mongoose.Schema(
  {
    issuerDetails: {
      type: issuerDetailsSchema,
      required: true,
    },
    sector: {
      type: String,
    },
  },
  { timestamps: true },
);

const Issuer = mongoose.model('Issuer', issuerSchema, 'issuers');

export default Issuer;
