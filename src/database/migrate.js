import 'dotenv/config';
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { pool } from '../server/config/db.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const migrationsDir = join(__dirname, 'migrations');

// Executa, em ordem alfabética, todos os arquivos .sql da pasta migrations.
async function run() {
  const files = readdirSync(migrationsDir)
    .filter((f) => f.endsWith('.sql'))
    .sort();

  console.log(`Encontradas ${files.length} migração(ões).`);

  for (const file of files) {
    const sql = readFileSync(join(migrationsDir, file), 'utf-8');
    console.log(`▶ Aplicando ${file}...`);
    await pool.query(sql);
    console.log(`✔ ${file} aplicada.`);
  }

  console.log('✅ Migrações concluídas.');
  await pool.end();
}

run().catch((err) => {
  console.error('❌ Erro nas migrações:', err);
  process.exit(1);
});
