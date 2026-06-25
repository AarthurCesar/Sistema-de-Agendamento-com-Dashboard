import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../src/server/config/db.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const migrationsDir = join(__dirname, '../src/database/migrations');

// Aplica todas as migrações em ordem (idempotentes — IF NOT EXISTS).
export async function migrate() {
  const files = readdirSync(migrationsDir).filter((f) => f.endsWith('.sql')).sort();
  for (const file of files) {
    await pool.query(readFileSync(join(migrationsDir, file), 'utf-8'));
  }
}

// Limpa todas as tabelas entre os testes.
export async function truncate() {
  await pool.query('TRUNCATE notifications, appointments, services, users RESTART IDENTITY CASCADE');
}

export async function closePool() {
  await pool.end();
}

// Cria um usuário diretamente no banco e devolve { user, token }.
// Útil para criar admin/professional (o endpoint /register só cria client).
export async function createUser({
  name = 'User', email, password = 'senha123', role = 'client', phone = '+5511900000000',
}) {
  const hash = await bcrypt.hash(password, 4); // custo baixo para testes rápidos
  const { rows } = await pool.query(
    `INSERT INTO users (name, email, password_hash, role, phone)
     VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, role`,
    [name, email, hash, role, phone],
  );
  const user = rows[0];
  const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: '1h',
  });
  return { user, token };
}

export async function createService({ name = 'Corte', duration = 30, price = 50 } = {}) {
  const { rows } = await pool.query(
    `INSERT INTO services (name, duration_minutes, price)
     VALUES ($1, $2, $3) RETURNING id, name, duration_minutes, price`,
    [name, duration, price],
  );
  return rows[0];
}

export function auth(token) {
  return `Bearer ${token}`;
}
