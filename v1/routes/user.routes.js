import express from 'express';
import { logoutUser } from '../controllers/auth.controller';
const router = express.Router({ mergeParams: true });

router.post('/logout', logoutUser);

export default router;
