import mongoose from 'mongoose';

const PositionSchema = new mongoose.Schema(
  {
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Client',
      required: true,
    },
    // References a subdocument in Client.bankAccounts[], not a top-level collection,
    // so it can't carry a `ref` for populate().
    bankAccountId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    issuerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Issuer',
      required() {
        return this.type === 'stock' || this.type === 'bond';
      },
    },
    instrumentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Instrument',
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    purchasePrice: {
      type: Number,
      required: true,
    },
    currentPrice: {
      type: Number,
    },
    currency: {
      type: String,
      required: true,
    },
    dateOfPurchase: {
      type: Date,
      required: true,
    },
    dateOfReport: {
      type: Date,
      required: true,
      default: Date.now,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

const Position = mongoose.model('Position', PositionSchema, 'positions');

export default Position;
