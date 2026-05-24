const request = require('supertest');
const { app, server } = require('../src/index');

afterAll(() => server.close());

describe('App endpoints', () => {
  test('GET / returns app info', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('app');
    expect(res.body).toHaveProperty('version');
  });

  test('GET /health returns ok', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  test('GET /ready returns ready', async () => {
    const res = await request(app).get('/ready');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ready');
  });
});
