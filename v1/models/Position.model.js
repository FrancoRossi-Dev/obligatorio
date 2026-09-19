import mongoose from 'mongoose';
//esto viene de los excels
const PositionSchema = new mongoose.Schema({

  isin: {
    type: String,
  },

  name: {
    type: String,
    required: true,
  },

  instrumentType: {
    type: String,
    required: true,
  }, //otra opcion seria hacer un enum con los tipos de instrumentos, pero hay qe controlar como viene de los excels

  currency: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },

  quantity: {
    type: Number,
    required: true,
  },

  marketValue: {
    type: Number,
    required: true,
  },

  cost: {
    type: Number,
  },

});

const Position = mongoose.model('Position', PositionSchema, 'positions');

export default Position;