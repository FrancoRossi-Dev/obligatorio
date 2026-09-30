import express from "express";
import { crearProducto,
    obtenerProductoPorId,
    obtenerProductos,
    actualizarProducto,
    eliminarProducto,
    obtenerProductosXRangoPrecio } from "../controllers/producto.controller.js";

const router = express.Router();

router.get("/", obtenerProductos);
router.post("/", crearProducto);
// Debe ir antes de "/:id" para que "precio" no sea capturado como id
router.get("/precio", obtenerProductosXRangoPrecio);
router.get("/:id", obtenerProductoPorId);
router.patch("/:id", actualizarProducto);
router.delete("/:id", eliminarProducto);

export default router;