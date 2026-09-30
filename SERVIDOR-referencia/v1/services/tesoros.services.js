import Tesoro from "../models/tesoro.model.js";
import Dragon from "../models/dragon.model.js";

export const obtenerTesorosService = async (limit, page) => {
    limit = Number(limit) || 3;
    page = Number(page) || 1;
    const skip = (page - 1) * limit;
    const totalPages = Math.ceil(await Tesoro.countDocuments() / limit);
    const tesoros = await Tesoro.find().skip(skip).limit(limit).populate("dragon");
    return {tesoros, limit, page, totalPages};
};

// Trae el tesoro junto con el documento completo del dragón dueño
export const obtenerTesoroConDragonService = async (id) => {
    const tesoro = await Tesoro.findById(id).populate("dragon");
    return tesoro;
};

// Filtra directamente en la colección de tesoros por el ObjectId del dragón
export const obtenerTesorosPorDragonService = async (dragonId) => {
    const tesoros = await Tesoro.find({ dragon: dragonId });
    return tesoros;
};

// Crea el tesoro y actualiza ambas colecciones (tesoro.dragon y dragon.tesoros)
export const agregarTesoroADragonService = async (dragonId, tesoroData) => {
    const dragon = await Dragon.findById(dragonId);
    if (!dragon) {
        const error = new Error("El dragón no existe");
        error.status = 404;
        error.details = { dragonId };
        throw error;
    }

    const tesoro = new Tesoro({ ...tesoroData, dragon: dragonId });
    await tesoro.save();

    dragon.tesoros.push(tesoro._id);
    await dragon.save();

    return tesoro;
};

// Elimina el tesoro y lo saca del array de tesoros del dragón dueño
export const eliminarTesoroService = async (tesoroId) => {
    const tesoro = await Tesoro.findByIdAndDelete(tesoroId);
    if (!tesoro) {
        const error = new Error("El tesoro no existe");
        error.status = 404;
        error.details = { tesoroId };
        throw error;
    }

    if (tesoro.dragon) {
        await Dragon.findByIdAndUpdate(tesoro.dragon, { $pull: { tesoros: tesoro._id } });
    }

    return tesoro;
};
