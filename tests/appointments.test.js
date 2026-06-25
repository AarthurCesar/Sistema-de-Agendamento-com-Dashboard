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

test('cliente cria agendamento (201)', async () => {
  const { token } = await createUser({ email: 'cli@test.com', role: 'client' });
  const service = await createService();

  const res = await request(app)
    .post('/api/appointments')
    .set('Authorization', auth(token))
    .send({ service_id: service.id, scheduled_at: '2030-01-10T13:00:00.000Z' });

  assert.equal(res.status, 201);
  assert.equal(res.body.status, 'pending');
});

test('criar agendamento sem serviço retorna 400', async () => {
  const { token } = await createUser({ email: 'cli2@test.com', role: 'client' });
  const res = await request(app)
    .post('/api/appointments')
    .set('Authorization', auth(token))
    .send({ scheduled_at: '2030-01-10T13:00:00.000Z' });

  assert.equal(res.status, 400);
});

test('conflito de horário do mesmo profissional retorna 409', async () => {
  const { token } = await createUser({ email: 'cli3@test.com', role: 'client' });
  const { user: prof } = await createUser({ email: 'prof@test.com', role: 'professional' });
  const service = await createService();

  const body = {
    service_id: service.id,
    professional_id: prof.id,
    scheduled_at: '2030-02-01T14:00:00.000Z',
  };

  const first = await request(app)
    .post('/api/appointments')
    .set('Authorization', auth(token))
    .send(body);
  assert.equal(first.status, 201);

  const second = await request(app)
    .post('/api/appointments')
    .set('Authorization', auth(token))
    .send(body);
  assert.equal(second.status, 409);
});

test('disponibilidade marca horário ocupado', async () => {
  const { token } = await createUser({ email: 'cli4@test.com', role: 'client' });
  const { user: prof } = await createUser({ email: 'prof2@test.com', role: 'professional' });
  const service = await createService();

  // Cria às 14:00 BRT (= 17:00 UTC).
  await request(app)
    .post('/api/appointments')
    .set('Authorization', auth(token))
    .send({
      service_id: service.id,
      professional_id: prof.id,
      scheduled_at: '2030-03-05T17:00:00.000Z',
    });

  const res = await request(app)
    .get(`/api/appointments/availability?date=2030-03-05&professionalId=${prof.id}`)
    .set('Authorization', auth(token));

  assert.equal(res.status, 200);
  const slot14 = res.body.slots.find((s) => s.time === '14:00');
  assert.equal(slot14.available, false, '14:00 deve estar ocupado');
  const slot15 = res.body.slots.find((s) => s.time === '15:00');
  assert.equal(slot15.available, true, '15:00 deve estar livre');
});

test('cliente só enxerga os próprios agendamentos', async () => {
  const a = await createUser({ email: 'a@test.com', role: 'client' });
  const b = await createUser({ email: 'b@test.com', role: 'client' });
  const service = await createService();

  await request(app)
    .post('/api/appointments')
    .set('Authorization', auth(a.token))
    .send({ service_id: service.id, scheduled_at: '2030-04-01T13:00:00.000Z' });

  const resB = await request(app)
    .get('/api/appointments')
    .set('Authorization', auth(b.token));

  assert.equal(resB.status, 200);
  assert.equal(resB.body.length, 0, 'cliente B não vê agendamentos de A');
});

test('alterar status para valor inválido retorna 400', async () => {
  const { token, user } = await createUser({ email: 'staff@test.com', role: 'admin' });
  const service = await createService();
  const created = await request(app)
    .post('/api/appointments')
    .set('Authorization', auth(token))
    .send({ service_id: service.id, scheduled_at: '2030-05-01T13:00:00.000Z' });

  void user;
  const res = await request(app)
    .patch(`/api/appointments/${created.body.id}/status`)
    .set('Authorization', auth(token))
    .send({ status: 'invalido' });

  assert.equal(res.status, 400);
});
