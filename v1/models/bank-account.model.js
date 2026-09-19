import mongoose from 'mongoose';

// A BankAccount belongs to a Company, at a given Bank. Holds Instruments.

const bankAccountSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
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

bankAccountSchema.index({ bankId: 1, number: 1 }, { unique: true });

const BankAccount = mongoose.model('BankAccount', bankAccountSchema, 'bankAccounts');

export default BankAccount;
