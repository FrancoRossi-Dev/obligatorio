import Producto from "../models/producto.model.js";   
import mongoose from "mongoose";

export const obtenerProductosService = async () => {
  
    const productos = await Producto.find();
    return productos;
   
};

export const crearProductoService = async (productoData) => {
    const productoBuscado = await Producto.findOne({ nombre: productoData.nombre });
    if (productoBuscado) {
        const error = new Error("El producto ya existe");
        error.status = 400;
        error.details = { productoData };
        throw error;
    }
    const producto = new Producto(productoData);
    await producto.save();
    return producto;
}

export const obtenerProductoPorIdService = async (id) => {
    if(!mongoose.isValidObjectId(id)) {
        const errorIdInvalido = new Error('ID de producto no válido');
        errorIdInvalido.status = 400;
        errorIdInvalido.details = {id};
        throw errorIdInvalido;
    }
    const producto = await Producto.findById(id);
    return producto;
}
export const actualizarProductoService = async (id, producto) => {
  
    const productoActualizado = await Producto.findByIdAndUpdate(id, producto, { returnDocument: "after" });
    return productoActualizado;
}

export const eliminarProductoService = async (id) => {
    const producto = await Producto.findByIdAndDelete(id);
    return producto;
}

export const obtenerProductosXRangoPrecioService = async (min, max) => {
    const productos = await Producto.find({ precio: { $gte: min, $lte: max } });
    return productos;
}