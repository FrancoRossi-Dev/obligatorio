import express from "express";
import routes from "./v1/v1.routes.js";
import notFoundMiddleware from "./v1/middlewares/notFound.middleware.js";
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from "./v1/config/db.config.js";
import { errorMiddleware } from "./v1/middlewares/error.middleware.js";

dotenv.config();

connectDB();
const app = express();
app.use(cors());
// app.use(cors({ origin: "http://localhost:5500",
//     allowedHeaders:["Content-Type", "Authorization"],
//     methods: ["GET", "POST", "PUT", "DELETE"]
// }));

//app.use(express.json()) es un middleware que nos permite parsear el body de la peticion 
// y convertirlo en un objeto JSON, para ello utilizamos express.json()
app.use(express.json());
//esto nos permite recibir la informacion de un formulario HTML, para ello utilizamos express.urlencoded()
app.use(express.urlencoded({ extended: true }));


app.use("/v1", routes);

app.use(notFoundMiddleware);
app.use(errorMiddleware);
 
export default app;