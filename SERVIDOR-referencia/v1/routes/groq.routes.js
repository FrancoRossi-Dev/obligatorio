import express from 'express';
import { obtenerConsultaGroqService } from '../services/groq.service.js';

const router = express.Router({mergeParams: true});

router.post('/', async (req, res) => {
    const messages = req.body.messages;
    const chatCompletion = await obtenerConsultaGroqService(messages);
    res.json({mensaje : chatCompletion.choices[0]?.message?.content ?? ''});
});

export default router;