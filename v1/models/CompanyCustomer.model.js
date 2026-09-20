import mongoose from 'mongoose';
import BankAccount from './BankAccount.model';

// these companys are the clients of our users, they manage their actives between banks

//seria  CompanyCustomer
const CompanySchema = new mongoose.Schema({
  comercialName: {
    type: String,
    required: true,
  },
  companyName: {
    type: String,
    required: true,
  },
  manager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Manager',
  },
  country: {
    type: String,
  },
  accounts: [BankAccount], // seria mejor account? // creo que mejor banks por especificidad
  bankAccounts: {
    type: Array,
  },
});

const Company = mongoose.model('Company', CompanySchema, 'companies');

export default Company;
