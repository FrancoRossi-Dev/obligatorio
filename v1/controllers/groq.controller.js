import { analizarNoticiasPortfolioService } from '../services/groq.services.js';

// req.client is loaded and access-checked by ownedClientMiddleware; errors reach errorMiddleware
export const analizarNoticiasPortfolio = async (req, res) => {
  const result = await analizarNoticiasPortfolioService(req.client);
  res.status(200).json(result);
};

export const analizarNoticiasPortfolioES = async (req, res) => {
  const result = await analizarNoticiasPortfolioService(req.client, 'es');
  res.status(200).json(result);
};
