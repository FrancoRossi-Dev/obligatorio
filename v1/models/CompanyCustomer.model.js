import mongoose from 'mongoose';
import BankAdress from './BankAdress.model';

// these companys are the clients of our users, they manage their actives between banks

const CompanySchema = new mongoose.Schema({
  comercialName: {
    type: String,
    required: true,
  },
  companyName: {
    type: Number,
    required: true,
  },
  manager: {
    type: String,
  },
  country: {
    type: String,
  },
  banks: [BankAdress],
  adressBook: {
    type: Array,
  },
});

const Company = mongoose.model('Company', companySchema, 'companys');

export default Company;
