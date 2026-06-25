import express from 'express';
import cors from 'cors';
import { router } from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.js';

export const app = express();

// Middlewares globais
app.use(cors());
app.use(express.json());

// Healthcheck
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Rotas da API
app.use('/api', router);

// Rota não encontrada
app.use((_req, res) => {
  res.status(404).json({ error: 'Rota não encontrada' });
});

// Tratamento de erros (sempre por último)
app.use(errorHandler);
