import mongoose from 'mongoose';

// The entity that issues a stock or bond (e.g. a corporation or a
// government) — distinct from Client, which is an advisor's client.

const issuerSchema = new mongoose.Schema(
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
    }, // maybe-payment-type
  },
  { timestamps: true },
);

const Issuer = mongoose.model('Issuer', issuerSchema, 'issuers');

export default Issuer;
