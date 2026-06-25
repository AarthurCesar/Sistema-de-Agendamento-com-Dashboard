import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { pool, query } from '../server/config/db.js';

// Popula o banco com dados de exemplo para visualizar o dashboard.
// Reexecutável: limpa as tabelas antes de inserir.
async function seed() {
  console.log('🌱 Iniciando seed...');

  // Limpa em ordem por causa das FKs
  await query('TRUNCATE appointments, services, users RESTART IDENTITY CASCADE');

  const passwordHash = await bcrypt.hash('senha123', 10);

  // --- Usuários ---
  const admin = await insertUser('Arthur Admin', 'admin@demo.com', passwordHash, 'admin', '+5511999990000');

  const profs = [];
  for (const [name, email, phone] of [
    ['Ana Profissional', 'ana@demo.com', '+5511999990001'],
    ['Bruno Profissional', 'bruno@demo.com', '+5511999990002'],
  ]) {
    profs.push(await insertUser(name, email, passwordHash, 'professional', phone));
  }

  const clients = [];
  for (const [name, email, phone] of [
    ['Carla Cliente', 'carla@demo.com', '+5511988880001'],
    ['Diego Cliente', 'diego@demo.com', '+5511988880002'],
    ['Eva Cliente', 'eva@demo.com', '+5511988880003'],
  ]) {
    clients.push(await insertUser(name, email, passwordHash, 'client', phone));
  }

  // --- Serviços ---
  const services = [];
  for (const [name, duration, price] of [
    ['Corte de Cabelo', 30, 50],
    ['Barba', 20, 35],
    ['Coloração', 90, 150],
    ['Manicure', 45, 40],
    ['Massagem Relaxante', 60, 120],
  ]) {
    services.push(await insertService(name, duration, price));
  }

  // --- Agendamentos espalhados pelos últimos 6 meses ---
  const statuses = ['completed', 'completed', 'completed', 'confirmed', 'pending', 'cancelled'];
  let count = 0;

  for (let monthsAgo = 5; monthsAgo >= 0; monthsAgo--) {
    // Mais agendamentos nos meses recentes
    const qty = 8 + (5 - monthsAgo) * 2;
    for (let i = 0; i < qty; i++) {
      const date = new Date();
      date.setMonth(date.getMonth() - monthsAgo);
      date.setDate(1 + Math.floor(Math.random() * 26));
      date.setHours(9 + Math.floor(Math.random() * 8), 0, 0, 0);

      // Mês atual tende a ter agendamentos futuros/pendentes
      const status =
        monthsAgo === 0
          ? statuses[Math.floor(Math.random() * statuses.length)]
          : Math.random() < 0.85
            ? 'completed'
            : 'cancelled';

      await query(
        `INSERT INTO appointments (client_id, professional_id, service_id, scheduled_at, status)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          pick(clients).id,
          pick(profs).id,
          pick(services).id,
          date.toISOString(),
          status,
        ],
      );
      count++;
    }
  }

  console.log(`✔ ${clients.length + profs.length + 1} usuários`);
  console.log(`✔ ${services.length} serviços`);
  console.log(`✔ ${count} agendamentos`);
  console.log('\n✅ Seed concluído!');
  console.log('   Login admin → admin@demo.com / senha123');

  await pool.end();
}

async function insertUser(name, email, passwordHash, role, phone = null) {
  const { rows } = await query(
    `INSERT INTO users (name, email, password_hash, role, phone)
     VALUES ($1, $2, $3, $4, $5) RETURNING id`,
    [name, email, passwordHash, role, phone],
  );
  return rows[0];
}

async function insertService(name, duration, price) {
  const { rows } = await query(
    `INSERT INTO services (name, duration_minutes, price)
     VALUES ($1, $2, $3) RETURNING id`,
    [name, duration, price],
  );
  return rows[0];
}

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

seed().catch((err) => {
  console.error('❌ Erro no seed:', err);
  process.exit(1);
});
