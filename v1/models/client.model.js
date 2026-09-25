import mongoose from 'mongoose';

// A Client belongs to an Advisor and is day-to-day handled by one of the
// Advisor's Managers. A Client has no login of its own.
// Its bank accounts are embedded subdocuments (see bankAccountSchema below).

const clientDetailsSchema = new mongoose.Schema(
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

const bankAccountSchema = new mongoose.Schema(
  {
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Client',
      required: true,
    },
    bankId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Bank',
      required: true,
    },
    number: {
      type: String,
      required: true,
    },
    accountName: {
      type: String,
      required: true,
    },
    currency: {
      type: String,
      required: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

const clientSchema = new mongoose.Schema(
  {
    advisorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    clientDetails: {
      type: clientDetailsSchema,
      required: true,
    },
    managerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Manager',
      required: true,
    },
    bankAccounts: {
      type: [bankAccountSchema],
      default: [],
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

const Client = mongoose.model('Client', clientSchema, 'clients');

export default Client;
