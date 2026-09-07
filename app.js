import express from "express";
import routes from "./v1/v1.routes.js";
import notFoundMiddleware from "./v1/middlewares/notFound.middleware.js";

const app = express();

// Middlewares para parsear el body de las peticiones
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas de la version 1 de la API
app.use("/v1", routes);

// Middleware para endpoints no encontrados
app.use(notFoundMiddleware);

export default app;
