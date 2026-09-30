import express from "express";
import { subirImagen } from "../controllers/uploads.controller.js";

const router = express.Router();

router.post("/", subirImagen);

export default router;