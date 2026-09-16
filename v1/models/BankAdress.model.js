import mongoose from 'mongoose';
import Bank from './Bank.model';

const bankAdressSchema = new mongoose.Schema({
  bankID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bank',
    required: true,
  },
  clientID: {
    type: Number,
    required: true,
  },
  accountNumber: {
    type: String,
    required: true,
  },
  accountName: {
    type: String,
    required: true,
  },
});

const BankAdress = mongoose.model('BankAdress', bankAdressSchema, 'bankAdresses');

export default BankAdress;
