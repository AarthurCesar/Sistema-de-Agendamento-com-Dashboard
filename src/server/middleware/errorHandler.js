// Middleware central de tratamento de erros.
// Captura erros lançados nos controllers (via next(err) ou throw em async).
export function errorHandler(err, _req, res, _next) {
  const status = err.status || 500;
  const message = err.message || 'Erro interno do servidor';

  // Loga apenas erros de servidor (5xx). Erros 4xx são esperados (validação,
  // autenticação) e não poluem o log.
  if (status >= 500) {
    console.error(err);
  }

  res.status(status).json({ error: message });
}

// Helper para criar erros com status HTTP.
export function createError(status, message) {
  const err = new Error(message);
  err.status = status;
  return err;
}
