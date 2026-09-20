import express from 'express';
import { validateBodyMiddleware } from '../middlewares/validatedBody.middleware.js';
import { loginSchema, registerSchema } from '../validators/auth.validators.js';
import { authenticateMiddleware } from '../middlewares/authenticate.middleware.js';
import { loginUser, logoutUser, registerUser } from '../controllers/auth.controller.js';

const router = express.Router({ mergeParams: true });

// login
router.post('/login', validateBodyMiddleware(loginSchema), loginUser);
// register
router.post('/register', validateBodyMiddleware(registerSchema), registerUser);
// logout (the only protected route in this router)
router.post('/logout', authenticateMiddleware, logoutUser);

export default router;
