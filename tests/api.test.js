// Basic smoke tests. These deliberately only cover endpoints/paths that
// don't require a live PostgreSQL or Redis connection, so they can run
// in any environment (including CI) without needing docker-compose up.
//
// Run with: npm test

const test = require('node:test');
const assert = require('node:assert');
const request = require('supertest');
const app = require('../index');

test('GET /health returns 200 OK', async () => {
  const res = await request(app).get('/health');
  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.text, 'OK');
});

test('POST /tasks without a title returns 400', async () => {
  const res = await request(app).post('/tasks').send({});
  assert.strictEqual(res.status, 400);
  assert.strictEqual(res.body.error, 'title is required');
});
