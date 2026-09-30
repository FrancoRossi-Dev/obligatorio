import express from 'express';
import { ingresarUsuario, registrarUsuario } from '../controllers/auth.controller.js';
import { loginSchema, registerSchema } from '../validators/auth.validators.js';
import { validateBodyMiddleware } from '../middlewares/validateBody.middleware.js';
const router = express.Router({ mergeParams: true });


 router.post('/login',validateBodyMiddleware(loginSchema), ingresarUsuario);
 router.post('/register', validateBodyMiddleware(registerSchema), registrarUsuario);

export default router;