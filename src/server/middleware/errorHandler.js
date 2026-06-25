// Middleware central de tratamento de erros.
// Captura erros lançados nos controllers (via next(err) ou throw em async).
export function errorHandler(err, _req, res, _next) {
  console.error(err);

  const status = err.status || 500;
  const message = err.message || 'Erro interno do servidor';

  res.status(status).json({ error: message });
}

// Helper para criar erros com status HTTP.
export function createError(status, message) {
  const err = new Error(message);
  err.status = status;
  return err;
}
