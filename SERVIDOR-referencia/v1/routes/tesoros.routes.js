import express from "express";
import { obtenerTesoros, obtenerTesoroConDragon, eliminarTesoro } from "../controllers/tesoro.controller.js";
import { validateParamsMiddleware } from "../middlewares/validateParams.middleware.js";
import { tesoroIdParamSchema } from "../validators/tesoros.validators.js";

const router = express.Router();

router.get("/", obtenerTesoros);
router.get("/:id", validateParamsMiddleware(tesoroIdParamSchema), obtenerTesoroConDragon);
router.delete("/:id", validateParamsMiddleware(tesoroIdParamSchema), eliminarTesoro);

export default router;
