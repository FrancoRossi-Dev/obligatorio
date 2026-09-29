import express from 'express';
import { obtenerClima } from '../controllers/clima.controller.js';
const router = express.Router({mergeParams: true});

// Definir las rutas del clima aquí
router.get('/', obtenerClima);


export default router;