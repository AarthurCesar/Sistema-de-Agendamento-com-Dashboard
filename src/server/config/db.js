import pg from 'pg';
import 'dotenv/config';

const { Pool } = pg;

// Pool de conexões com o PostgreSQL.
// A string de conexão vem da variável DATABASE_URL (.env).
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

pool.on('error', (err) => {
  console.error('Erro inesperado no pool do PostgreSQL:', err);
  process.exit(-1);
});

// Helper para executar queries de forma simples.
export const query = (text, params) => pool.query(text, params);
