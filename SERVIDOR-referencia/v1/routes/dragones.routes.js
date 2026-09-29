import express from "express";
import { obtenerDragones,
    crearDragon,
    obtenerDragonConTesoros,
    actualizarDragon,
    eliminarDragon } from "../controllers/dragon.controller.js";
import { obtenerTesorosPorDragon, agregarTesoroADragon } from "../controllers/tesoro.controller.js";
import { validateBodyMiddleware } from "../middlewares/validateBody.middleware.js";
import { validateParamsMiddleware } from "../middlewares/validateParams.middleware.js";
import { crearDragonSchema, actualizarDragonSchema, dragonIdParamSchema } from "../validators/dragones.validators.js";
import { crearTesoroSchema, dragonIdParamSchema as dragonIdEnTesoroParamSchema } from "../validators/tesoros.validators.js";

const router = express.Router();

router.get("/", obtenerDragones);
router.post("/", validateBodyMiddleware(crearDragonSchema), crearDragon);
router.get("/:id", validateParamsMiddleware(dragonIdParamSchema), obtenerDragonConTesoros);
router.patch("/:id", validateParamsMiddleware(dragonIdParamSchema), validateBodyMiddleware(actualizarDragonSchema), actualizarDragon);
router.delete("/:id", validateParamsMiddleware(dragonIdParamSchema), eliminarDragon);

// Tesoros de un dragón puntual
router.get("/:dragonId/tesoros", validateParamsMiddleware(dragonIdEnTesoroParamSchema), obtenerTesorosPorDragon);
router.post("/:dragonId/tesoros", validateParamsMiddleware(dragonIdEnTesoroParamSchema), validateBodyMiddleware(crearTesoroSchema), agregarTesoroADragon);

export default router;
