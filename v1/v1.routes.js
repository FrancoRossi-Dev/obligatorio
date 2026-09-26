import express from 'express';
import authRouter from './routes/auth.routes.js';
import bankRoutes from './routes/bank.routes.js';
import clientRoutes from './routes/client.routes.js';
import instrumentRoutes from './routes/instrument.routes.js';
import issuerRoutes from './routes/issuer.routes.js';
import managerRoutes from './routes/manager.routes.js';
import positionRoutes from './routes/position.routes.js';
import reportRoutes from './routes/reports.routes.js';
import { authenticateMiddleware } from './middlewares/authenticate.middleware.js';
import uploadsRouter from './routes/uploads.routes.js';

const router = express.Router({ mergeParams: true });

// public routes
router.use('/auth', authRouter);

// auth middleware
router.use(authenticateMiddleware);

// private routes
router.use('/bank', bankRoutes);
router.use('/client', clientRoutes);
router.use('/instrument', instrumentRoutes);
router.use('/issuer', issuerRoutes);
router.use('/manager', managerRoutes);
router.use('/position', positionRoutes);
router.use('/report', reportRoutes);
router.use("/uploads", uploadsRouter);

export default router;
