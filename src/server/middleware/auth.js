import jwt from 'jsonwebtoken';
import { createError } from './errorHandler.js';

// Middleware que valida o token JWT enviado no header Authorization.
// Uso: router.get('/rota', authenticate, controller)
export function authenticate(req, _res, next) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    return next(createError(401, 'Token não fornecido'));
  }

  const token = header.split(' ')[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload; // { id, role }
    next();
  } catch {
    next(createError(401, 'Token inválido ou expirado'));
  }
}

// Middleware que restringe acesso por papel (ex.: 'admin', 'professional').
// Uso: router.get('/rota', authenticate, authorize('admin'), controller)
export function authorize(...roles) {
  return (req, _res, next) => {
    if (!roles.includes(req.user?.role)) {
      return next(createError(403, 'Acesso negado'));
    }
    next();
  };
}
