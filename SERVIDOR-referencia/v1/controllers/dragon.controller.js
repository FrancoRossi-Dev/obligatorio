import { crearDragonService,
    obtenerDragonesService,
    obtenerDragonConTesorosService,
    actualizarDragonService,
    eliminarDragonService } from "../services/dragones.services.js";

export const obtenerDragones = async (req, res) => {
    const dragones = await obtenerDragonesService();
    res.json(dragones);
};

export const crearDragon = async (req, res) => {
    const dragon = await crearDragonService(req.validatedBody);
    res.status(201).json(dragon);
};

export const obtenerDragonConTesoros = async (req, res) => {
    const { id } = req.validatedParams;
    const dragon = await obtenerDragonConTesorosService(id);
    res.json(dragon);
};

export const actualizarDragon = async (req, res) => {
    const { id } = req.validatedParams;
    const dragon = await actualizarDragonService(id, req.validatedBody);
    res.json(dragon);
};

export const eliminarDragon = async (req, res) => {
    const { id } = req.validatedParams;
    const dragon = await eliminarDragonService(id);
    res.json(dragon);
};
