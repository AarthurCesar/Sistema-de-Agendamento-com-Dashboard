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

// Pequena espera para o envio fire-and-forget concluir o registro.
const tick = () => new Promise((r) => setTimeout(r, 50));

test('criar agendamento gera notificação para o cliente', async () => {
  const { token } = await createUser({
    email: 'cli@test.com', role: 'client', phone: '+5511988887777',
  });
  const admin = await createUser({ email: 'adm@test.com', role: 'admin' });
  const service = await createService();

  await request(app)
    .post('/api/appointments')
    .set('Authorization', auth(token))
    .send({ service_id: service.id, scheduled_at: '2030-08-01T13:00:00.000Z' });

  await tick();

  const res = await request(app)
    .get('/api/notifications')
    .set('Authorization', auth(admin.token));

  assert.equal(res.status, 200);
  assert.equal(res.body.length, 1);
  assert.equal(res.body[0].recipient, '+5511988887777');
  assert.equal(res.body[0].status, 'sent');
  assert.match(res.body[0].message, /agendamento/i);
});

test('confirmar agendamento gera segunda notificação', async () => {
  const client = await createUser({ email: 'cli2@test.com', role: 'client', phone: '+5511966665555' });
  const admin = await createUser({ email: 'adm2@test.com', role: 'admin' });
  const service = await createService();

  const created = await request(app)
    .post('/api/appointments')
    .set('Authorization', auth(client.token))
    .send({ service_id: service.id, scheduled_at: '2030-09-01T13:00:00.000Z' });

  await request(app)
    .patch(`/api/appointments/${created.body.id}/status`)
    .set('Authorization', auth(admin.token))
    .send({ status: 'confirmed' });

  await tick();

  const res = await request(app)
    .get('/api/notifications')
    .set('Authorization', auth(admin.token));

  // 1 da criação + 1 da confirmação
  assert.equal(res.body.length, 2);
  assert.ok(res.body.some((n) => /confirmado/i.test(n.message)));
});

test('notificações são restritas a admin (professional recebe 403)', async () => {
  const prof = await createUser({ email: 'prof@test.com', role: 'professional' });
  const res = await request(app)
    .get('/api/notifications')
    .set('Authorization', auth(prof.token));

  assert.equal(res.status, 403);
});
