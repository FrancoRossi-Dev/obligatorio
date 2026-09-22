import express from 'express';
import { validateBodyMiddleware } from '../middlewares/validatedBody.middleware.js';
import { loginSchema, registerSchema } from '../validators/auth.validators.js';
import { loginUser, registerUser } from '../controllers/auth.controller.js';

const router = express.Router({ mergeParams: true });

// login
router.post('/login', validateBodyMiddleware(loginSchema), loginUser);

// register
router.post('/register', validateBodyMiddleware(registerSchema), registerUser);

export default router;
