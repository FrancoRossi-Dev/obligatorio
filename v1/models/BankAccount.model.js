import mongoose from 'mongoose';
import Bank from './Bank.model'; 

//capaz seria mejor llamarle BankAccount
const bankAccountSchema = new mongoose.Schema({
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
  position: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Position',
  },
});

const BankAccount = mongoose.model('BankAccount', bankAccountSchema, 'bankAccounts');

export default BankAccount;
