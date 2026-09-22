import express from 'express';
import authRouter from './routes/auth.routes.js';
import bankRoutes from './routes/bank.routes.js';
import { authenticateMiddleware } from './middlewares/authenticate.middleware.js';

const router = express.Router({ mergeParams: true });

// public routes
router.use('/auth', authRouter);

// auth middleware
router.use(authenticateMiddleware);

// private routes
router.use('/bank', bankRoutes);
// router.use('/client');
// router.use('/issuer');

export default router;
