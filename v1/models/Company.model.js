import mongoose from 'mongoose';

// Empresa cliente. esta entidad refiere a los clientes del sistema,
// que se loguean y gestionan sus propios clientes

const CompanySchema = new mongoose.Schema({
  comercialName: {
    type: String,
    required: true,
  },
  companyName: {
    type: Number,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  adress: {
    type: String,
  },
  country: {
    type: String,
  },
});

const Company = mongoose.model('Company', companySchema, 'companys');

export default Company;
