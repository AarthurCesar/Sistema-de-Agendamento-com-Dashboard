import { test, before, beforeEach, after } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { app } from '../src/server/app.js';
import { migrate, truncate, closePool, createUser, auth } from './helpers.js';

before(migrate);
beforeEach(truncate);
after(closePool);

test('POST /api/auth/register cria usuário e retorna token', async () => {
  const res = await request(app)
    .post('/api/auth/register')
    .send({ name: 'Carla', email: 'carla@test.com', password: '123456' });

  assert.equal(res.status, 201);
  assert.ok(res.body.token, 'deve retornar token');
  assert.equal(res.body.user.email, 'carla@test.com');
  assert.equal(res.body.user.role, 'client');
});

test('register impede e-mail duplicado (409)', async () => {
  const payload = { name: 'A', email: 'dup@test.com', password: '123456' };
  await request(app).post('/api/auth/register').send(payload);
  const res = await request(app).post('/api/auth/register').send(payload);

  assert.equal(res.status, 409);
});

test('register sem campos obrigatórios retorna 400', async () => {
  const res = await request(app).post('/api/auth/register').send({ email: 'x@test.com' });
  assert.equal(res.status, 400);
});

test('login com senha errada retorna 401', async () => {
  await request(app)
    .post('/api/auth/register')
    .send({ name: 'B', email: 'b@test.com', password: 'certa123' });

  const res = await request(app)
    .post('/api/auth/login')
    .send({ email: 'b@test.com', password: 'errada' });

  assert.equal(res.status, 401);
});

test('login válido retorna token e usuário', async () => {
  await request(app)
    .post('/api/auth/register')
    .send({ name: 'C', email: 'c@test.com', password: 'senha123' });

  const res = await request(app)
    .post('/api/auth/login')
    .send({ email: 'c@test.com', password: 'senha123' });

  assert.equal(res.status, 200);
  assert.ok(res.body.token);
  assert.equal(res.body.user.email, 'c@test.com');
});

test('GET /api/auth/me sem token retorna 401', async () => {
  const res = await request(app).get('/api/auth/me');
  assert.equal(res.status, 401);
});

test('GET /api/auth/me com token retorna o usuário', async () => {
  const { token } = await createUser({ email: 'me@test.com', role: 'admin' });
  const res = await request(app).get('/api/auth/me').set('Authorization', auth(token));

  assert.equal(res.status, 200);
  assert.equal(res.body.user.email, 'me@test.com');
  assert.equal(res.body.user.role, 'admin');
});
