import mongoose from "mongoose";

const tesoroSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true,
  },
  tipo: {
    type: String,
  },
  valor: {
    type: Number,
  },
  dragon: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Dragon",
  },
});

const Tesoro = mongoose.model("Tesoro", tesoroSchema, "tesoros");

export default Tesoro;
