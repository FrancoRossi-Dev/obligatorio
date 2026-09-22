import mongoose from 'mongoose';

const PositionSchema = new mongoose.Schema(
  {
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Client',
      required: true,
    },
    bankAccountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BankAccount',
      required: true,
    }, // review
    issuerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Issuer',
      required() {
        return this.type === 'stock' || this.type === 'bond';
      },
    },
    InstrumentId: {
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
      defaut: new Date(),
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
