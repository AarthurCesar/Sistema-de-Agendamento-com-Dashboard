import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../config/db.js';
import { createError } from '../middleware/errorHandler.js';

function signToken(user) {
  return jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' },
  );
}

// POST /api/auth/register
export async function register(req, res, next) {
  try {
    const { name, email, password, role, phone } = req.body;

    if (!name || !email || !password) {
      throw createError(400, 'Nome, e-mail e senha são obrigatórios');
    }

    const exists = await query('SELECT id FROM users WHERE email = $1', [email]);
    if (exists.rowCount > 0) {
      throw createError(409, 'E-mail já cadastrado');
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const result = await query(
      `INSERT INTO users (name, email, password_hash, role, phone)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, email, role`,
      [name, email, passwordHash, role === 'admin' ? 'client' : role || 'client', phone || null],
    );

    const user = result.rows[0];
    res.status(201).json({ user, token: signToken(user) });
  } catch (err) {
    next(err);
  }
}

// POST /api/auth/login
export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw createError(400, 'E-mail e senha são obrigatórios');
    }

    const result = await query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];

    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      throw createError(401, 'Credenciais inválidas');
    }

    res.json({
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      token: signToken(user),
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/auth/me
export async function me(req, res, next) {
  try {
    const result = await query(
      'SELECT id, name, email, role FROM users WHERE id = $1',
      [req.user.id],
    );
    if (result.rowCount === 0) throw createError(404, 'Usuário não encontrado');
    res.json({ user: result.rows[0] });
  } catch (err) {
    next(err);
  }
}
