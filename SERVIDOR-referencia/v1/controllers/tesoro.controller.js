import { obtenerTesorosService,
    obtenerTesoroConDragonService,
    obtenerTesorosPorDragonService,
    agregarTesoroADragonService,
    eliminarTesoroService } from "../services/tesoros.services.js";

export const obtenerTesoros = async (req, res) => {
    const { limit , page } = req.query;
    const tesoros = await obtenerTesorosService(limit,page);
    res.json(tesoros);
};

export const obtenerTesoroConDragon = async (req, res) => {
    const { id } = req.validatedParams;
    const tesoro = await obtenerTesoroConDragonService(id);
    res.json(tesoro);
};

export const obtenerTesorosPorDragon = async (req, res) => {
    const { dragonId } = req.validatedParams;
    const tesoros = await obtenerTesorosPorDragonService(dragonId);
    res.json(tesoros);
};

export const agregarTesoroADragon = async (req, res) => {
    const { dragonId } = req.validatedParams;
    const tesoro = await agregarTesoroADragonService(dragonId, req.validatedBody);
    res.status(201).json(tesoro);
};

export const eliminarTesoro = async (req, res) => {
    const { id } = req.validatedParams;
    const tesoro = await eliminarTesoroService(id);
    res.json(tesoro);
};
