import mongoose from "mongoose";

const dragonSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true,
  },
  especie: {
    type: String,
  },
  edad: {
    type: Number,
  },
  tesoros: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Tesoro",
  }],
});

const Dragon = mongoose.model("Dragon", dragonSchema, "dragones");

export default Dragon;
