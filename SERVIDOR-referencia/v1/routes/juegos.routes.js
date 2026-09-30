import express from 'express';
import { validateBodyMiddleware } from '../middlewares/validateBody.middleware.js';
import { validateParamsMiddleware } from '../middlewares/validateParams.middleware.js';
import {
  obtenerJuegos,
  crearJuego,
  obtenerJuegoPorNombre,
} from '../controllers/juegos.controller.js';
import { crearJuesgosSchema, obtenerJuegoPorNombreSchema } from '../validators/juegos.validators.js';
const router = express.Router({ mergeParams: true });

router.get('/', obtenerJuegos);
router.post('/',validateBodyMiddleware(crearJuesgosSchema), crearJuego);
router.get('/:nombre', validateParamsMiddleware(obtenerJuegoPorNombreSchema), obtenerJuegoPorNombre);

export default router;