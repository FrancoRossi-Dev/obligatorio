import { obtenerConsultaGroqService } from '../services/groq.service.js';
export const obtenerConsultaGroq = async (req, res) => {
    const messages = req.body.messages;
    const chatCompletion = await obtenerConsultaGroqService(messages);
    res.json(chatCompletion);

};
