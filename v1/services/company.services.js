import Company from '../models/company.model.js';

export const getCompaniesService = async () => {
  const companies = await Company.find({ isDeleted: false });
  return companies;
};

export const getCompanyByIdService = async (id) => {
  const company = await Company.findOne({ _id: id, isDeleted: false });
  return company;
};

export const createCompanyService = async (companyData) => {
  const company = new Company(companyData);
  await company.save();
  return company;
};

export const updateCompanyService = async (id, companyData) => {
  const company = await Company.findOneAndUpdate({ _id: id, isDeleted: false }, companyData, {
    returnDocument: 'after',
    runValidators: true,
  });
  return company;
};

// Soft delete: the model carries an isDeleted flag
export const deleteCompanyService = async (id) => {
  const company = await Company.findOneAndUpdate(
    { _id: id, isDeleted: false },
    { isDeleted: true },
    { returnDocument: 'after' },
  );
  return company;
};
