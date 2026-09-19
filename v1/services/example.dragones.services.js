import Dragon from "../models/dragon.model.js";

export const obtenerDragonesService = async () => {
    const dragones = await Dragon.find();
    return dragones;
};

export const crearDragonService = async (dragonData) => {
    const dragon = new Dragon(dragonData);
    await dragon.save();
    return dragon;
};

// Trae el dragón junto con los documentos completos de sus tesoros
export const obtenerDragonConTesorosService = async (id) => {
    const dragon = await Dragon.findById(id).populate("tesoros");
    return dragon;
};

export const actualizarDragonService = async (id, dragonData) => {
    const dragon = await Dragon.findByIdAndUpdate(id, dragonData, { returnDocument: "after" });
    return dragon;
};

export const eliminarDragonService = async (id) => {
    const dragon = await Dragon.findByIdAndDelete(id);
    return dragon;
};
