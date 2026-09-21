import mongoose from 'mongoose';

// Single collection for every instrument type, discriminated by type.
// fundDetail only applies (and is only required) when type === 'fund'.
// issuerId only applies (and is only required) when type is 'stock' or 'bond'.

const INSTRUMENT_TYPES = ['stock', 'bond', 'fund', 'cash'];
const FUND_COMPOSITIONS = ['equity', 'bond', 'balanced', 'alternative'];

const fundDetailSchema = new mongoose.Schema(
  {
    composition: {
      type: String,
      enum: FUND_COMPOSITIONS,
      required: true,
    },
  },
  { _id: false },
);

const instrumentSchema = new mongoose.Schema(
  {
    issuerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Issuer',
      required() {
        return this.type === 'stock' || this.type === 'bond';
      },
    },
    type: {
      type: String,
      enum: INSTRUMENT_TYPES,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    fundDetail: {
      type: fundDetailSchema,
      required() {
        return this.type === 'fund';
      },
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

const Instrument = mongoose.model('Instrument', instrumentSchema, 'instruments');

export default Instrument;
