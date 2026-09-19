import mongoose from 'mongoose';

const ManagerSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },

});

const Manager = mongoose.model('Manager', managerSchema, 'managers');

export default Manager;
