import { test, before, beforeEach, after } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { app } from '../src/server/app.js';
import {
  migrate, truncate, closePool, createUser, createService, auth,
} from './helpers.js';

before(migrate);
beforeEach(truncate);
after(closePool);

test('dashboard exige papel admin/professional (client recebe 403)', async () => {
  const { token } = await createUser({ email: 'cli@test.com', role: 'client' });
  const res = await request(app)
    .get('/api/dashboard/summary')
    .set('Authorization', auth(token));

  assert.equal(res.status, 403);
});

test('summary calcula totais e taxa de cancelamento', async () => {
  const admin = await createUser({ email: 'admin@test.com', role: 'admin' });
  const client = await createUser({ email: 'c@test.com', role: 'client' });
  const service = await createService({ price: 100 });

  // 3 agendamentos: 2 concluídos + 1 cancelado
  async function book(scheduledAt, status) {
    const created = await request(app)
      .post('/api/appointments')
      .set('Authorization', auth(client.token))
      .send({ service_id: service.id, scheduled_at: scheduledAt });
    await request(app)
      .patch(`/api/appointments/${created.body.id}/status`)
      .set('Authorization', auth(admin.token))
      .send({ status });
  }

  await book('2030-06-01T13:00:00.000Z', 'completed');
  await book('2030-06-02T13:00:00.000Z', 'completed');
  await book('2030-06-03T13:00:00.000Z', 'cancelled');

  const res = await request(app)
    .get('/api/dashboard/summary')
    .set('Authorization', auth(admin.token));

  assert.equal(res.status, 200);
  assert.equal(res.body.totalAppointments, 3);
  assert.equal(res.body.completed, 2);
  assert.equal(res.body.cancelled, 1);
  // 1 de 3 cancelados ≈ 0.3333
  assert.ok(Math.abs(res.body.cancellationRate - 1 / 3) < 0.001);
});

test('relatório CSV de agendamentos retorna cabeçalho correto', async () => {
  const admin = await createUser({ email: 'admin2@test.com', role: 'admin' });
  const client = await createUser({ email: 'c2@test.com', role: 'client' });
  const service = await createService();

  await request(app)
    .post('/api/appointments')
    .set('Authorization', auth(client.token))
    .send({ service_id: service.id, scheduled_at: '2030-07-01T13:00:00.000Z' });

  const res = await request(app)
    .get('/api/reports/appointments.csv')
    .set('Authorization', auth(admin.token));

  assert.equal(res.status, 200);
  assert.match(res.headers['content-type'], /text\/csv/);
  assert.match(res.text, /Data\/Hora;Serviço;Cliente;Profissional;Valor/);
});
