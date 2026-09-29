

import { obtenerClimaService } from '../services/clima.services.js';

export const obtenerClima = async (req, res) => {
    const clima = await obtenerClimaService();
    res.json(clima);
};