import {
  analizarNoticiasPortfolioService,
} from '../services/groq.services.js';

export const analizarNoticiasPortfolio = async (
  req,
  res,
) => {
  try {
    const { clientId } = req.params;

    const result =
      await analizarNoticiasPortfolioService(clientId);

    return res.status(200).json(result);
 } catch (error) {
  console.error(error);

  //Too Many Requests
  if (error.status === 429) {
    return res.status(429).json({
      message:
        'Se alcanzó temporalmente el límite de consultas de IA. Intente nuevamente más tarde.',
    });
  }

  return res.status(500).json({
    message: 'Ocurrió un error al analizar la cartera.',
  });
}
};
