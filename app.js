import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import routes from "./v1/v1.routes.js";
import notFoundMiddleware from "./v1/middlewares/notFound.middleware.js";
import { errorMiddleware } from "./v1/middlewares/error.middleware.js";
import connectDB from "./v1/config/db.config.js";
import { requestLoggerMiddleware } from "./v1/middlewares/requestLogger.middleware.js";

dotenv.config();

connectDB();

const app = express();

// Primero de todo: registra cada peticion al terminar la respuesta
app.use(requestLoggerMiddleware);

app.use(cors());

// Middlewares para parsear el body de las peticiones
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas de la version 1 de la API
app.use("/v1", routes);

// Middlewares de manejo de errores (deben ir al final)
app.use(notFoundMiddleware);
app.use(errorMiddleware);

export default app;
