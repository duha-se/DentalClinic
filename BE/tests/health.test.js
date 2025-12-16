const request = require('supertest');
const app = require('../src/app');

describe('Backend required endpoints', () => {
  it('GET /health', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ status: 'healthy' });
  });

  it('GET /api/version', async () => {
    const res = await request(app).get('/api/version');
    expect(res.body).toHaveProperty('version');
  });
});