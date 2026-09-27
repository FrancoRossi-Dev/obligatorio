import express from 'express';
import {analizarNoticiasPortfolio,} from '../controllers/groq.controller.js';

const router = express.Router({mergeParams: true});

router.get('/portfolio-news/:clientId',analizarNoticiasPortfolio,);

export default router;