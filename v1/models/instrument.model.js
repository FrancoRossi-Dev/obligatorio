import mongoose from 'mongoose';

// Single collection for every instrument type, discriminated by type.
// fundDetail only applies (and is only required) when type === 'fund'.
// issuerId only applies (and is only required) when type is 'stock' or 'bond'.

export const INSTRUMENT_TYPES = ['stock', 'bond', 'fund'];
const SECURITY_TYPE = [];

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
    // Market identifiers; bank imports resolve instruments by ISIN through OpenFIGI.
    // Cash and manually created instruments may have none, hence sparse.
    isin: {
      type: String,
      unique: true,
      sparse: true,
    },
    ticker: {
      type: String,
    },
    exchCode: {
      type: String,
    },
    securityType: {
      type: String,
      enum: SECURITY_TYPE,
    },
    securityType2: {
      type: String,
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
